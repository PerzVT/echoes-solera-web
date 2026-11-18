import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STATE_COOKIE, allowedDomains, authConfigured, callbackUrl, packState, pkceChallenge, pkceVerifier, randomToken, requestHost, safeNext, wrongHost } from "@/lib/labs/auth";

/** Start Google sign-in. The state cookie ties the answer to this browser and carries where to return. */
export async function GET(request: NextRequest) {
  if (!authConfigured()) return NextResponse.redirect(new URL("/sign-in?error=setup", request.url));
  // Google returns to the AUTH_URL host only; begun anywhere else, the sign-in could never finish. The page names the address.
  if (wrongHost(requestHost(request))) return NextResponse.redirect(new URL("/sign-in?error=host", request.url));

  const state = randomToken();
  const verifier = pkceVerifier();
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const domains = allowedDomains();

  const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  google.searchParams.set("redirect_uri", callbackUrl(request.url));
  google.searchParams.set("response_type", "code");
  google.searchParams.set("scope", "openid email profile");
  google.searchParams.set("state", state);
  google.searchParams.set("code_challenge", await pkceChallenge(verifier));
  google.searchParams.set("code_challenge_method", "S256");
  google.searchParams.set("prompt", "select_account");
  // A hint only: Google shows accounts from this domain first. The callback enforces it.
  if (domains.length === 1) google.searchParams.set("hd", domains[0]);

  const response = NextResponse.redirect(google);
  response.cookies.set(STATE_COOKIE, packState(state, verifier, next), {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 600,
  });
  return response;
}
