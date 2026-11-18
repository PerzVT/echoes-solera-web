import type { NextRequest } from "next/server";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { id, list } from "@/lib/labs/store/validate";
import { notionId, requireNotion } from "@/lib/labs/notion/client";
import { importCast } from "@/lib/labs/notion/import";

/** Downloading up to 40 images can take a while. */
export const maxDuration = 300;

/** Character or place pages into a series' cast: { seriesId, pageIds } (up to 20). Each image becomes a cast sheet. */
export async function POST(request: NextRequest) {
  return withUser(request, async (user) => {
    requireNotion();
    const body = await readJson(request, 8192);
    const pageIds = [...new Set(list(body.pageIds, "The pages", 20, (v) => notionId(v)))];
    return ok(await importCast(user.email, id(body.seriesId, "The series"), pageIds), 201);
  });
}
