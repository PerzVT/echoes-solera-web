import type { NextRequest } from "next/server";
import { deleteCast, updateCast } from "@/lib/labs/store/creator";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { id, optionalText, text } from "@/lib/labs/store/validate";

type Ctx = { params: Promise<{ id: string }> };

/** Rename a cast sheet: { character?, variant?, tag? }. */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  return withUser(request, async (user) => {
    const sheetId = id((await params).id);
    const body = await readJson(request);
    const patch: { character?: string; variant?: string | null; tag?: string } = {};
    if (body.character !== undefined) patch.character = text(body.character, "The name", 80, { min: 1 });
    if (body.variant !== undefined) patch.variant = optionalText(body.variant, "The variant", 80);
    if (body.tag !== undefined) patch.tag = text(body.tag, "The tag", 80, { min: 1 });
    return ok({ sheet: await updateCast(user.email, sheetId, patch) });
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  return withUser(request, async () => {
    await deleteCast(id((await params).id));
    return ok({ deleted: true });
  });
}
