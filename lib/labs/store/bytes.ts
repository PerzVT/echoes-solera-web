import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { Bad } from "./validate";

/**
 * Where the bytes of uploaded files go: the site's Vercel Blob store, over its HTTP API, or on a developer machine
 * without Blob credentials, .data/uploads/. A production build without credentials refuses, because a deployment's
 * disk does not keep files. The record of each file (name, type, size, location) lives in the store; `location` is
 * what these functions return and take.
 *
 * Blob credentials, in this order:
 * 1. BLOB_READ_WRITE_TOKEN, the store's static token.
 * 2. BLOB_STORE_ID with a Vercel OIDC token. This is how a store connected to the project the newer way signs in:
 *    on Vercel each request carries a short-lived token in the x-vercel-oidc-token header (read here through the
 *    runtime's request context); on a developer machine `vercel env pull` writes VERCEL_OIDC_TOKEN, which lasts
 *    about 12 hours. Same API and headers as @vercel/blob 2.x (helpers.ts resolveBlobAuth, api.ts requestApi).
 *
 * Blob files are readable by anyone who has the address, so each one goes under a random path that is never
 * listed, and the creator only ever hands it out through /api/creator/files, behind the session check.
 */

const UPLOADS = path.join(process.cwd(), ".data", "uploads");
const BLOB_API = "https://vercel.com/api/blob";
const API_VERSION = "13";
/** The store is public: its files are served from <store id>.public.blob.vercel-storage.com. */
const ACCESS = "public";
const LOCAL = "local:";
const PATHNAME = /^creator\/[a-f0-9]{32}\/([a-f0-9]{24})$/;

const env = (name: string) => process.env[name]?.trim() || undefined;
const randomHex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, "0")).join("");

/** The OIDC token Vercel hands this request, or the one `vercel env pull` wrote for local development. */
function oidcToken(): string | undefined {
  const context = (globalThis as Record<symbol, { get?: () => { headers?: Record<string, string | undefined> } } | undefined>)[Symbol.for("@vercel/request-context")];
  const fromRequest = context?.get?.()?.headers?.["x-vercel-oidc-token"]?.trim();
  return fromRequest || env("VERCEL_OIDC_TOKEN");
}

/** Seconds since the epoch at which a JWT stops being valid, or null when it cannot be read. */
function expiry(jwt: string): number | null {
  try {
    const body = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: unknown };
    return typeof body.exp === "number" ? body.exp : null;
  } catch {
    return null;
  }
}

type Auth = { token: string; storeId: string };

/** The credentials to use, or null when none are set. An expired local OIDC token is refused with what to do. */
function blobAuth(): Auth | null {
  const readWrite = env("BLOB_READ_WRITE_TOKEN");
  if (readWrite) return { token: readWrite, storeId: readWrite.split("_")[3] ?? "" };
  const storeId = env("BLOB_STORE_ID")?.replace(/^store_/, "");
  const oidc = oidcToken();
  if (!storeId || !oidc) return null;
  const exp = expiry(oidc);
  if (exp !== null && exp * 1000 < Date.now()) {
    throw new Bad("uploads_unavailable", "The Blob sign-in token has expired. Run `vercel env pull` and try again.", 503);
  }
  return { token: oidc, storeId };
}

const authHeaders = (auth: Auth) => ({
  authorization: `Bearer ${auth.token}`,
  "x-api-version": API_VERSION,
  "x-vercel-blob-store-id": auth.storeId,
});

/** The Blob API's own error code and message, which carry no secrets, for the log. */
async function blobError(what: string, res: Response) {
  const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
  return new Error(`blob ${what} failed: ${res.status} ${body?.error?.code ?? ""} ${body?.error?.message ?? ""}`.trim());
}

const publicUrl = (auth: Auth, pathname: string) => `https://${auth.storeId.toLowerCase()}.${ACCESS}.blob.vercel-storage.com/${pathname}`;

export async function saveBytes(key: string, type: string, bytes: Uint8Array): Promise<string> {
  const auth = blobAuth();
  if (auth) {
    const pathname = `creator/${randomHex(16)}/${key}`;
    const res = await fetch(`${BLOB_API}/?pathname=${encodeURIComponent(pathname)}`, {
      method: "PUT",
      headers: {
        ...authHeaders(auth),
        "x-vercel-blob-access": ACCESS,
        "x-content-type": type,
        "x-add-random-suffix": "0",
        "x-allow-overwrite": "0",
        "x-cache-control-max-age": "31536000",
      },
      body: bytes as BodyInit,
      cache: "no-store",
    });
    if (!res.ok) throw await blobError("put", res);
    const { url } = (await res.json()) as { url?: string };
    if (!url || !url.startsWith("https://")) throw new Error("blob put returned no url");
    return url;
  }
  if (process.env.NODE_ENV === "production") throw new Bad("uploads_unavailable", "Uploads are not set up on this site yet.", 503);
  await mkdir(UPLOADS, { recursive: true });
  await writeFile(path.join(UPLOADS, key), bytes);
  return `${LOCAL}${key}`;
}

/** Only addresses this module made are read: a local key, or the Blob store's own https host. */
export async function loadBytes(location: string): Promise<Uint8Array | null> {
  if (location.startsWith(LOCAL)) {
    const key = location.slice(LOCAL.length);
    if (!/^[a-f0-9]{24}$/.test(key)) return null;
    try {
      return new Uint8Array(await readFile(path.join(UPLOADS, key)));
    } catch {
      return null;
    }
  }
  let url: URL;
  try {
    url = new URL(location);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !url.hostname.endsWith(".blob.vercel-storage.com")) return null;
  const res = await fetch(url, { cache: "no-store" });
  return res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
}

export async function dropBytes(locations: string[]) {
  const urls = locations.filter((l) => l.startsWith("https://"));
  for (const l of locations.filter((x) => x.startsWith(LOCAL))) {
    const key = l.slice(LOCAL.length);
    if (/^[a-f0-9]{24}$/.test(key)) await rm(path.join(UPLOADS, key), { force: true });
  }
  if (!urls.length) return;
  let auth: Auth | null;
  try {
    auth = blobAuth();
  } catch (e) {
    console.error("blob delete skipped:", e instanceof Error ? e.message : "no credentials");
    return;
  }
  if (!auth) return;
  const res = await fetch(`${BLOB_API}/delete`, {
    method: "POST",
    headers: { ...authHeaders(auth), "content-type": "application/json" },
    body: JSON.stringify({ urls }),
    cache: "no-store",
  });
  if (!res.ok) console.error((await blobError("delete", res)).message);
}

/* ---------- Uploads straight from the browser ---------- */

/*
 * A Vercel function refuses request bodies over about 4.5 MB, so larger files go from the browser to the store on
 * a presigned URL (the method of @vercel/blob's issueSignedToken and presignUrl, signed-token.ts and
 * presign-query-params.ts). The server asks the Blob API for a delegation scoped to one random pathname, one
 * content type, a size cap and 15 minutes, and signs a PUT URL for it. The browser sends the file there, then hands
 * the pathname to the route that saves the record, which reads the file back and checks it like any other upload.
 */

export type DirectUpload = { pathname: string; url: string; headers: Record<string, string> };

const b64url = (bytes: Uint8Array) => {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

async function hmacB64url(key: string, data: string) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(data))));
}

/** A presigned PUT for one new file, or null when there is no Blob store to send it to (the form takes the file). */
export async function startDirectUpload(type: string, maxBytes: number): Promise<DirectUpload | null> {
  const auth = blobAuth();
  if (!auth) return null;
  const pathname = `creator/${randomHex(16)}/${randomHex(12)}`;
  const res = await fetch(`${BLOB_API}/signed-token`, {
    method: "POST",
    headers: { ...authHeaders(auth), "content-type": "application/json" },
    body: JSON.stringify({ pathname, operations: ["put"], validUntil: Date.now() + 15 * 60 * 1000, maximumSizeInBytes: maxBytes, allowedContentTypes: [type] }),
    cache: "no-store",
  });
  if (!res.ok) throw await blobError("signed-token", res);
  const { delegationToken, clientSigningToken } = (await res.json()) as { delegationToken?: string; clientSigningToken?: string };
  if (!delegationToken || !clientSigningToken) throw new Error("blob signed-token returned no token");

  const params: [string, string][] = [
    ["vercel-blob-add-random-suffix", "false"],
    ["vercel-blob-allow-overwrite", "false"],
    ["vercel-blob-allowed-content-types", type],
    ["vercel-blob-cache-control-max-age", "31536000"],
    ["vercel-blob-maximum-size-in-bytes", String(maxBytes)],
  ];
  // The signed string: operation, pathname and each constraint as key=value, sorted, one per line. All ASCII here,
  // so code-unit order is the UTF-8 byte order the API expects.
  const canonical = ["operation=put", `pathname=${pathname}`, ...params.map(([k, v]) => `${k}=${v}`)].sort().join("\n");
  const url = new URL(`${BLOB_API}/`);
  url.searchParams.set("pathname", pathname);
  for (const [k, v] of params) url.searchParams.set(k, v);
  url.searchParams.set("vercel-blob-delegation", delegationToken);
  url.searchParams.set("vercel-blob-signature", await hmacB64url(clientSigningToken, canonical));
  return {
    pathname,
    url: url.toString(),
    headers: { "x-api-version": API_VERSION, "x-vercel-blob-store-id": auth.storeId, "x-vercel-blob-access": ACCESS, "x-content-type": type },
  };
}

/**
 * A file the browser sent on a presigned URL: its key, location and bytes, read back up to `maxBytes`. Only
 * pathnames of the shape startDirectUpload makes are read, and only from this store's own host.
 */
export async function readDirectUpload(pathname: string, maxBytes: number): Promise<{ key: string; location: string; bytes: Uint8Array }> {
  const match = PATHNAME.exec(pathname);
  if (!match) throw new Bad("invalid", "That upload is not valid.");
  const auth = blobAuth();
  if (!auth) throw new Bad("uploads_unavailable", "Uploads are not set up on this site yet.", 503);
  const location = publicUrl(auth, pathname);
  const res = await fetch(location, { cache: "no-store" });
  if (res.status === 404) throw new Bad("not_found", "That upload did not arrive. Try again.", 404);
  if (!res.ok || !res.body) throw new Error(`blob read failed: ${res.status}`);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      await dropBytes([location]);
      throw new Bad("too_large", "The file is over 15 MB.", 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.byteLength;
  }
  return { key: match[1], location, bytes };
}
