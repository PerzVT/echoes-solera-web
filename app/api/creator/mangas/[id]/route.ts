import type { NextRequest } from "next/server";
import { deleteManga, getManga, updateManga, type MangaPatch } from "@/lib/labs/store/creator";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { Bad, LIMITS, id, list, mangaPage, mangaStep, seriesRef, slug, text } from "@/lib/labs/store/validate";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  return withUser(request, async () => ok({ manga: await getManga(id((await params).id)) }));
}

/** Saves what changed: { title?, source?, style?, seriesId?, pageCount?, pages?, step? }. Fields left out stay. */
export async function PUT(request: NextRequest, { params }: Ctx) {
  return withUser(request, async (user) => {
    const mangaId = id((await params).id);
    const body = await readJson(request);
    const patch: MangaPatch = {};
    if (body.title !== undefined) patch.title = text(body.title, "The manga name", 120, { min: 1 });
    if (body.source !== undefined) patch.source = text(body.source, "The story", LIMITS.scriptText, { multiline: true });
    if (body.style !== undefined) patch.style = body.style === null ? null : slug(body.style, "The style");
    if (body.seriesId !== undefined) patch.seriesId = seriesRef(body.seriesId);
    if (body.pageCount !== undefined) {
      if (typeof body.pageCount !== "number" || !Number.isInteger(body.pageCount) || body.pageCount < 1 || body.pageCount > 24) throw new Bad("invalid", "The page count is not valid.");
      patch.pageCount = body.pageCount;
    }
    if (body.pages !== undefined) patch.pages = list(body.pages, "The pages", 24, mangaPage);
    if (body.step !== undefined) patch.step = mangaStep(body.step);
    return ok({ manga: await updateManga(user.email, mangaId, patch) });
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  return withUser(request, async () => {
    await deleteManga(id((await params).id));
    return ok({ deleted: true });
  });
}
