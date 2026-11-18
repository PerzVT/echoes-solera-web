import type { NextRequest } from "next/server";
import { saveChoices } from "@/lib/labs/store/creator";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { castChoice, id, list, slug, text } from "@/lib/labs/store/validate";

type Ctx = { params: Promise<{ id: string }> };

/** What was chosen on the cast, style and references steps: { cast?, style?, references? }. Fields left out stay. */
export async function PUT(request: NextRequest, { params }: Ctx) {
  return withUser(request, async (user) => {
    const episodeId = id((await params).id);
    const body = await readJson(request);
    const choices = await saveChoices(user.email, episodeId, {
      cast: body.cast === undefined ? undefined : list(body.cast, "The cast", 200, castChoice),
      style: body.style === undefined ? undefined : body.style === null ? null : slug(body.style, "The style"),
      references: body.references === undefined ? undefined : list(body.references, "The references", 50, (x) => text(x, "A reference", 400, { min: 1 })),
    });
    return ok({ choices });
  });
}
