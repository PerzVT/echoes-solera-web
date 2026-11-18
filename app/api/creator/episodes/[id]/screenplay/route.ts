import type { NextRequest } from "next/server";
import { saveScreenplay } from "@/lib/labs/store/creator";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { id, list, note, text, texts } from "@/lib/labs/store/validate";

type Ctx = { params: Promise<{ id: string }> };

/** The screenplay's edited passages, open comments and changed passages: { texts, notes, changed }. */
export async function PUT(request: NextRequest, { params }: Ctx) {
  return withUser(request, async (user) => {
    const episodeId = id((await params).id);
    const body = await readJson(request);
    const screenplay = await saveScreenplay(user.email, episodeId, {
      texts: texts(body.texts),
      notes: list(body.notes ?? [], "The comments", 500, note),
      changed: list(body.changed ?? [], "The changed passages", 5000, (x) => text(x, "A passage id", 40, { min: 1 })),
    });
    return ok({ screenplay });
  });
}
