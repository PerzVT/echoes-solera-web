import type { NextRequest } from "next/server";
import { ok, withUser } from "@/lib/labs/store/http";

/** Which store the creator saves to. Nothing else. */
export async function GET(request: NextRequest) {
  return withUser(request, async () => ok({ store: process.env.DATABASE_URL ? "postgres" : "file" }));
}
