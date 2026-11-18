import type { NextRequest } from "next/server";
import { deleteEpisode, getEpisode, updateEpisode } from "@/lib/labs/store/creator";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { id, step } from "@/lib/labs/store/validate";

type Ctx = { params: Promise<{ id: string }> };

/** The episode with its script, screenplay and choices. */
export async function GET(request: NextRequest, { params }: Ctx) {
  return withUser(request, async () => ok(await getEpisode(id((await params).id))));
}

/** The step reached: { step }. */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  return withUser(request, async (user) => {
    const episodeId = id((await params).id);
    const body = await readJson(request);
    return ok({ episode: await updateEpisode(user.email, episodeId, { step: step(body.step) }) });
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  return withUser(request, async () => {
    await deleteEpisode(id((await params).id));
    return ok({ deleted: true });
  });
}
