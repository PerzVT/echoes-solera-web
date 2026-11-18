import type { NextRequest } from "next/server";
import { deleteSeries, updateSeries } from "@/lib/labs/store/creator";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { id, sitePath, slug, text } from "@/lib/labs/store/validate";

type Ctx = { params: Promise<{ id: string }> };

/** Rename, set the style or set the cover: { title?, style?, cover? }. */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  return withUser(request, async (user) => {
    const seriesId = id((await params).id);
    const body = await readJson(request);
    const patch: { title?: string; style?: string | null; cover?: string | null } = {};
    if (body.title !== undefined) patch.title = text(body.title, "The series name", 120, { min: 1 });
    if (body.style !== undefined) patch.style = body.style === null ? null : slug(body.style, "The style");
    if (body.cover !== undefined) patch.cover = body.cover === null ? null : sitePath(body.cover, "The cover");
    return ok({ series: await updateSeries(user.email, seriesId, patch) });
  });
}

/** Deletes the series with its episodes, their work and its uploaded cast sheets. */
export async function DELETE(request: NextRequest, { params }: Ctx) {
  return withUser(request, async () => {
    await deleteSeries(id((await params).id));
    return ok({ deleted: true });
  });
}
