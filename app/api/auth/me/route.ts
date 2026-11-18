import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { currentUser } from "@/lib/labs/auth";

/** Who is signed in, for the creator's header. On a developer machine without sign-in set up, that is the local developer. */
export async function GET(request: NextRequest) {
  const user = await currentUser(request.cookies);
  const headers = { "cache-control": "no-store" };
  if (!user) return NextResponse.json({ signedIn: false }, { headers });
  return NextResponse.json({ signedIn: true, email: user.email, name: user.name }, { headers });
}
