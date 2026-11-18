import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { currentUser } from "@/lib/labs/auth";

/**
 * The creator's pages are for signed-in team accounts. Everything else on the site is public.
 * The creator's API routes check the session themselves (lib/labs/store/http.ts) and answer 401, so they are
 * left out here: a proxy match would also cap upload bodies at the proxy's buffer size.
 */
export async function proxy(request: NextRequest) {
  if (await currentUser(request.cookies)) return NextResponse.next();

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/app", "/app/:path*"],
};
