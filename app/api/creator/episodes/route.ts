import type { NextRequest } from "next/server";
import { createEpisode } from "@/lib/labs/store/creator";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { Bad, id } from "@/lib/labs/store/validate";

/** A new episode: { seriesId, number? }. The number is a wish; the server never repeats a saved one. */
export async function POST(request: NextRequest) {
  return withUser(request, async (user) => {
    const body = await readJson(request);
    const wanted = body.number === undefined ? 1 : Number(body.number);
    if (!Number.isInteger(wanted) || wanted < 1 || wanted > 9999) throw new Bad("invalid", "The episode number is not valid.");
    const episode = await createEpisode(user.email, id(body.seriesId, "The series"), wanted);
    return ok({ episode }, 201);
  });
}
