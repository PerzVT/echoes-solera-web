import type { NextRequest } from "next/server";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { notionId, requireNotion } from "@/lib/labs/notion/client";
import { pageText } from "@/lib/labs/notion/import";

export const maxDuration = 60;

/** A Notion page's text for the storyboard, manga and cooking boxes: { pageId }. Nothing is saved. */
export async function POST(request: NextRequest) {
  return withUser(request, async () => {
    requireNotion();
    const body = await readJson(request, 4096);
    return ok(await pageText(notionId(body.pageId)));
  });
}
