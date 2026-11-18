import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_DAYS, STATE_COOKIE, authConfigured, callbackUrl, isAllowedDomain, isAllowedEmail, safeNext, sealSession, sessionCookieName, requestHost, unpackState, wrongHost } from "@/lib/labs/auth";

type IdToken = { iss?: string; aud?: string; exp?: number; email?: string; email_verified?: boolean; hd?: string; name?: string; picture?: string };

const fail = (request: NextRequest, error: string) => {
  const response = NextResponse.redirect(new URL(`/sign-in?error=${error}`, request.url));
  response.cookies.delete({ name: STATE_COOKIE, path: "/api/auth" });
  response.headers.set("cache-control", "no-store");
  return response;
};

/** Google sends the person back here. Exchange the code, check the account, start the session. */
export async function GET(request: NextRequest) {
  if (!authConfigured()) return fail(request, "setup");
  if (wrongHost(requestHost(request))) return fail(request, "host");

  const params = request.nextUrl.searchParams;
  const { state, verifier, next } = unpackState(request.cookies.get(STATE_COOKIE)?.value);
  if (params.get("error")) return fail(request, "cancelled");
  if (!state || !verifier || state !== params.get("state") || !params.get("code")) return fail(request, "state");

  // The ID token comes straight from Google over TLS in this exchange, so its claims are read without a signature check.
  let claims: IdToken;
  try {
    const token = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: params.get("code")!,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: callbackUrl(request.url),
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      cache: "no-store",
    });
    if (!token.ok) return fail(request, "google");
    const { id_token } = (await token.json()) as { id_token?: string };
    claims = JSON.parse(Buffer.from(id_token!.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return fail(request, "google");
  }

  const issuerOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  if (!issuerOk || claims.aud !== process.env.GOOGLE_CLIENT_ID || !claims.exp || claims.exp * 1000 < Date.now()) return fail(request, "google");
  // "hd" is set only for Google Workspace accounts. Requiring it keeps out a personal Google account made on a work address,
  // which would outlive the mailbox.
  if (!claims.email || claims.email_verified !== true || !isAllowedEmail(claims.email) || !isAllowedDomain(claims.hd)) return fail(request, "domain");

  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const session = await sealSession({ email: claims.email, name: claims.name ?? claims.email, picture: claims.picture, exp });

  const response = NextResponse.redirect(new URL(safeNext(next), request.url));
  const secure = request.nextUrl.protocol === "https:";
  // On https a session left under the old name, from before the __Host- prefix, is cleared.
  if (secure) response.cookies.delete({ name: SESSION_COOKIE, path: "/" });
  response.cookies.set(sessionCookieName(secure), session, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  response.cookies.delete({ name: STATE_COOKIE, path: "/api/auth" });
  // The answer carries the session cookie: no cache may keep it.
  response.headers.set("cache-control", "no-store");
  return response;
}
