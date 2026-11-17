import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession, sessionToken } from "@/lib/labs/auth";

/** Who is signed in, for the creator's header. */
export async function GET(request: NextRequest) {
  const session = await readSession(sessionToken(request.cookies));
  if (!session) return NextResponse.json({ signedIn: false }, { status: 200, headers: { "cache-control": "no-store" } });
  return NextResponse.json({ signedIn: true, email: session.email, name: session.name }, { headers: { "cache-control": "no-store" } });
}
