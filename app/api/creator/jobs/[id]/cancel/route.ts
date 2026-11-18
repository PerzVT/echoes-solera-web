import type { NextRequest } from "next/server";
import { ok, withUser } from "@/lib/labs/store/http";
import { Bad, id } from "@/lib/labs/store/validate";
import { getJobStore } from "@/lib/labs/store/jobs";
import { cancelJob, view } from "@/lib/labs/ai/jobs";

type Ctx = { params: Promise<{ id: string }> };

/** Stops a queued or running job. A picture already being drawn may still be billed. */
export async function POST(request: NextRequest, { params }: Ctx) {
  return withUser(request, async (user) => {
    const jobId = id((await params).id, "The job");
    const found = await getJobStore().get(jobId);
    if (!found || found.owner !== user.email) throw new Bad("not_found", "That job is not there.", 404);
    return ok({ job: view(await cancelJob(found)) });
  });
}
