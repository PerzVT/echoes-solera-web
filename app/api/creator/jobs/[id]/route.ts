import { after, type NextRequest } from "next/server";
import { ok, withUser } from "@/lib/labs/store/http";
import { Bad, id } from "@/lib/labs/store/validate";
import { getJobStore } from "@/lib/labs/store/jobs";
import { refresh, runJob, view } from "@/lib/labs/ai/jobs";

/** A job left queued is started from here, inside this limit. */
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string }> };

/** One of the signed-in person's jobs, brought up to date: poll this until status is done or failed. */
export async function GET(request: NextRequest, { params }: Ctx) {
  return withUser(request, async (user) => {
    const jobId = id((await params).id, "The job");
    const found = await getJobStore().get(jobId);
    if (!found || found.owner !== user.email) throw new Bad("not_found", "That job is not there.", 404);
    const { job, start } = await refresh(found);
    if (start) after(() => runJob(job.id));
    return ok({ job: view(job) });
  });
}
