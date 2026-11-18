import type { NextRequest } from "next/server";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { id } from "@/lib/labs/store/validate";
import { notionId, requireNotion } from "@/lib/labs/notion/client";
import { importScript } from "@/lib/labs/notion/import";

export const maxDuration = 60;

/** A Notion page's text as an episode's script: { pageId, episodeId }. The pasted text is replaced; an uploaded file stays. */
export async function POST(request: NextRequest) {
  return withUser(request, async (user) => {
    requireNotion();
    const body = await readJson(request, 4096);
    return ok(await importScript(user.email, notionId(body.pageId), id(body.episodeId, "The episode")));
  });
}
