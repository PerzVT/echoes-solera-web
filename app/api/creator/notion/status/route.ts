import type { NextRequest } from "next/server";
import { ok, withUser } from "@/lib/labs/store/http";
import { status } from "@/lib/labs/notion/import";

/** Whether the site's Notion connection is set up, and the workspace it belongs to. */
export async function GET(request: NextRequest) {
  return withUser(request, async () => ok(await status()));
}
