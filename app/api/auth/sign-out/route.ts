import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { HOST_SESSION_COOKIE, SESSION_COOKIE } from "@/lib/labs/auth";

/** End the session. A form post, so a link or an image cannot sign someone out. */
export async function POST(request: NextRequest) {
  // Only this site's own form may sign someone out.
  const site = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  if ((site && site !== "same-origin") || (origin && origin !== request.nextUrl.origin)) {
    return new NextResponse(null, { status: 403 });
  }
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete({ name: SESSION_COOKIE, path: "/" });
  // A __Host- cookie is replaced only by one that is Secure on path "/", so it is cleared by setting it empty and expired.
  if (request.nextUrl.protocol === "https:") response.cookies.set(HOST_SESSION_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
