import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { Bad } from "./validate";

/**
 * Where the bytes of uploaded files go. With BLOB_READ_WRITE_TOKEN set they go to the site's Vercel Blob store,
 * over its HTTP API. Without it a developer machine keeps them under .data/uploads/; a production build refuses,
 * because a deployment's disk does not keep files. The record of each file (name, type, size, location) lives in
 * the store; `location` is what these functions return and take.
 *
 * Blob files are readable by anyone who has the address, so each one goes under a random path that is never
 * listed, and the creator only ever hands it out through /api/creator/files, behind the session check.
 */

const UPLOADS = path.join(process.cwd(), ".data", "uploads");
const BLOB_API = "https://blob.vercel-storage.com";
const LOCAL = "local:";

const token = () => process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
const randomHex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, "0")).join("");

export async function saveBytes(key: string, type: string, bytes: Uint8Array): Promise<string> {
  const blob = token();
  if (blob) {
    const pathname = `creator/${randomHex(16)}/${key}`;
    const res = await fetch(`${BLOB_API}/?pathname=${encodeURIComponent(pathname)}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${blob}`,
        "x-api-version": "7",
        "x-content-type": type,
        "x-add-random-suffix": "0",
        "x-cache-control-max-age": "31536000",
      },
      body: bytes as BodyInit,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`blob put failed: ${res.status}`);
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
  const blob = token();
  if (urls.length && blob) {
    const res = await fetch(`${BLOB_API}/delete`, {
      method: "POST",
      headers: { authorization: `Bearer ${blob}`, "x-api-version": "7", "content-type": "application/json" },
      body: JSON.stringify({ urls }),
      cache: "no-store",
    });
    if (!res.ok) console.error("blob delete failed:", res.status);
  }
}
