/**
 * Sign-in for the creator app. Google accounts on an allowed domain only.
 * No auth library: Google's authorization-code flow, then a signed, http-only session cookie.
 * Everything here runs on Web Crypto so the proxy and the route handlers can share it.
 */

export const SESSION_COOKIE = "nl_session";
/** On https the session cookie carries the __Host- prefix: the browser then refuses it unless it is Secure, host-only and on path "/". */
export const HOST_SESSION_COOKIE = "__Host-nl_session";
export const sessionCookieName = (secure: boolean) => (secure ? HOST_SESSION_COOKIE : SESSION_COOKIE);
/** The session token from a request's cookies, under either name. */
export const sessionToken = (cookies: { get: (name: string) => { value: string } | undefined }) => cookies.get(HOST_SESSION_COOKIE)?.value ?? cookies.get(SESSION_COOKIE)?.value;
export const STATE_COOKIE = "nl_oauth_state";
export const SESSION_DAYS = 1;

export type Session = { email: string; name: string; picture?: string; exp: number };

export const allowedDomains = () =>
  (process.env.AUTH_ALLOWED_DOMAINS ?? "highstreet.market")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

/** The domain is whatever follows the last "@", so "a@allowed@evil.com" is evil.com. */
export const isAllowedEmail = (email: string) => {
  const at = email.lastIndexOf("@");
  const domain = at > 0 ? email.slice(at + 1).toLowerCase() : "";
  return !!domain && allowedDomains().includes(domain);
};

export const isAllowedDomain = (domain: string | undefined) => !!domain && allowedDomains().includes(domain.toLowerCase());

/**
 * A weak secret could be guessed and used to mint sessions. It counts only with at least 32 characters that are not
 * blank and not one character repeated: at least 8 different ones. `openssl rand -base64 32` gives 44 that pass.
 */
export const secretStrong = (secret: string) => secret.trim().length >= 32 && new Set(secret).size >= 8;
const secretOk = () => secretStrong(process.env.AUTH_SECRET ?? "");

/** Sign-in works only when all three are set and the secret is long enough. Otherwise the app stays closed outside local development. */
export const authConfigured = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && secretOk());

/** Local development with nothing configured lets the creator open, so the mock can be worked on. */
export const openInDevelopment = () => process.env.NODE_ENV === "development" && !authConfigured();

const encoder = new TextEncoder();

const b64url = (bytes: Uint8Array) => {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(process.env.AUTH_SECRET ?? ""), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

export async function sealSession(session: Session) {
  const body = b64url(encoder.encode(JSON.stringify(session)));
  return `${body}.${b64url(await hmac(body))}`;
}

export async function readSession(token: string | undefined): Promise<Session | null> {
  if (!token || !secretOk()) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  // Everything that can throw on a malformed cookie stays inside the try: a bad cookie means "not signed in", never an error page.
  try {
    const expected = await hmac(body);
    const given = fromB64url(mac);
    if (given.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < given.length; i++) diff |= given[i] ^ expected[i];
    if (diff !== 0) return null;
    const session = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Session;
    if (typeof session.exp !== "number" || session.exp * 1000 < Date.now()) return null;
    if (typeof session.email !== "string" || !isAllowedEmail(session.email)) return null;
    return session;
  } catch {
    return null;
  }
}

export const randomToken = () => b64url(crypto.getRandomValues(new Uint8Array(24)));

/** PKCE: a random verifier kept in the state cookie, and its SHA-256 sent to Google as the challenge. */
export const pkceVerifier = () => b64url(crypto.getRandomValues(new Uint8Array(32)));
export const pkceChallenge = async (verifier: string) => b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(verifier))));

/** The state cookie holds the state, the PKCE verifier and where to return, in that order. The path may hold "|", so it is last. */
export const packState = (state: string, verifier: string, next: string) => `${state}|${verifier}|${next}`;
export const unpackState = (value: string | undefined) => {
  const [state = "", verifier = "", ...rest] = (value ?? "").split("|");
  return { state, verifier, next: rest.join("|") };
};

/** Only paths inside the creator are valid places to return to after sign-in. */
export const safeNext = (next: string | null | undefined) => (next && /^\/app(\/|$|\?)/.test(next) && !next.includes("//") ? next : "/app");

/**
 * The site's own address for the Google redirect, from AUTH_URL. Set it to the stable staging address:
 * Google only accepts redirect URIs that were registered, and every preview deployment has a different host.
 * A value that is not a full http or https address (a bare "staging.example.com") is treated as unset.
 */
export function authUrl(): URL | undefined {
  const raw = process.env.AUTH_URL?.trim();
  if (!raw || !/^https?:\/\//i.test(raw)) return undefined;
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}

/** Set but unusable: shown on the sign-in page in development, so the mistake is seen before it reaches staging. */
export const authUrlProblem = () =>
  process.env.AUTH_URL?.trim() && !authUrl() ? `AUTH_URL is set to "${process.env.AUTH_URL.trim()}", which is not a full address starting with https://, so it is ignored.` : undefined;

/**
 * With AUTH_URL set, Google always returns to that host, and the state cookie set on any other host never reaches it.
 * A sign-in begun elsewhere would fail on arrival, so it is refused at the start with the address to use.
 */
export const wrongHost = (host: string) => {
  const home = authUrl();
  return home && host.toLowerCase() !== home.host.toLowerCase() ? home.origin : undefined;
};

/** The host the browser asked for, which is the host its cookies belong to. Behind a proxy that is the forwarded host. */
export const requestHost = (request: { url: string; headers: Headers }) =>
  request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host") || new URL(request.url).host;

export const callbackUrl = (requestUrl: string) => new URL("/api/auth/callback", authUrl() ?? requestUrl).toString();
