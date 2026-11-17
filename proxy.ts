import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { openInDevelopment, readSession, sessionToken } from "@/lib/labs/auth";

/** The creator app is for signed-in team accounts. Everything else on the site is public. */
export async function proxy(request: NextRequest) {
  if (openInDevelopment()) return NextResponse.next();

  const session = await readSession(sessionToken(request.cookies));
  if (session) return NextResponse.next();

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/app", "/app/:path*"],
};
