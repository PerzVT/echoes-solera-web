import type { NextRequest } from "next/server";
import { createStoryboard, listStoryboards } from "@/lib/labs/store/creator";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { LIMITS, text } from "@/lib/labs/store/validate";

/** Every saved storyboard. */
export async function GET(request: NextRequest) {
  return withUser(request, async () => ok({ storyboards: await listStoryboards() }));
}

/** A new storyboard: { title, source }. */
export async function POST(request: NextRequest) {
  return withUser(request, async (user) => {
    const body = await readJson(request);
    const storyboard = await createStoryboard(user.email, {
      title: text(body.title, "The storyboard name", 120, { min: 1 }),
      source: text(body.source ?? "", "The scene", LIMITS.scriptText, { multiline: true }),
    });
    return ok({ storyboard }, 201);
  });
}
