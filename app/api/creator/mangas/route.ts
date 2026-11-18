import type { NextRequest } from "next/server";
import { createManga, listMangas } from "@/lib/labs/store/creator";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { LIMITS, text } from "@/lib/labs/store/validate";

/** Every saved manga. */
export async function GET(request: NextRequest) {
  return withUser(request, async () => ok({ mangas: await listMangas() }));
}

/** A new manga: { title, source }. */
export async function POST(request: NextRequest) {
  return withUser(request, async (user) => {
    const body = await readJson(request);
    const manga = await createManga(user.email, {
      title: text(body.title, "The manga name", 120, { min: 1 }),
      source: text(body.source ?? "", "The story", LIMITS.scriptText, { multiline: true }),
    });
    return ok({ manga }, 201);
  });
}
