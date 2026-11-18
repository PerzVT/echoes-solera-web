import type { NextRequest } from "next/server";
import { ok, withUser } from "@/lib/labs/store/http";
import { Bad, text } from "@/lib/labs/store/validate";
import { notionId, requireNotion } from "@/lib/labs/notion/client";
import { listDatabase, search } from "@/lib/labs/notion/import";

/**
 * What the Notion connection can see: ?q=<words>&type=page|database&cursor=<next>. With ?in=<database id> it lists
 * that database's pages instead.
 */
export async function GET(request: NextRequest) {
  return withUser(request, async () => {
    requireNotion();
    const p = request.nextUrl.searchParams;
    const cursor = p.get("cursor");
    const inDb = p.get("in");
    if (inDb) return ok(await listDatabase(notionId(inDb, "The database"), cursor));
    const type = p.get("type");
    if (type && type !== "page" && type !== "database") throw new Bad("invalid", "The type is not valid.");
    const q = p.get("q") ? text(p.get("q"), "The search", 200) : "";
    return ok(await search(q, (type as "page" | "database" | null) ?? null, cursor));
  });
}
