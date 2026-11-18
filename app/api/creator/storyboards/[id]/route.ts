import type { NextRequest } from "next/server";
import { deleteStoryboard, getStoryboard, updateStoryboard, type StoryboardPatch } from "@/lib/labs/store/creator";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { LIMITS, frame, id, list, slug, seriesRef, storyboardStep, text } from "@/lib/labs/store/validate";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  return withUser(request, async () => ok({ storyboard: await getStoryboard(id((await params).id)) }));
}

/** Saves what changed: { title?, source?, style?, seriesId?, frames?, step? }. Fields left out stay. */
export async function PUT(request: NextRequest, { params }: Ctx) {
  return withUser(request, async (user) => {
    const boardId = id((await params).id);
    const body = await readJson(request);
    const patch: StoryboardPatch = {};
    if (body.title !== undefined) patch.title = text(body.title, "The storyboard name", 120, { min: 1 });
    if (body.source !== undefined) patch.source = text(body.source, "The scene", LIMITS.scriptText, { multiline: true });
    if (body.style !== undefined) patch.style = body.style === null ? null : slug(body.style, "The style");
    if (body.seriesId !== undefined) patch.seriesId = seriesRef(body.seriesId);
    if (body.frames !== undefined) patch.frames = list(body.frames, "The frames", 200, frame);
    if (body.step !== undefined) patch.step = storyboardStep(body.step);
    return ok({ storyboard: await updateStoryboard(user.email, boardId, patch) });
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  return withUser(request, async () => {
    await deleteStoryboard(id((await params).id));
    return ok({ deleted: true });
  });
}
