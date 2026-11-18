import { after, type NextRequest } from "next/server";
import { ok, withUser } from "@/lib/labs/store/http";
import { Bad, id } from "@/lib/labs/store/validate";
import { getJobStore } from "@/lib/labs/store/jobs";
import { record, refresh, runJob, view } from "@/lib/labs/ai/jobs";

/** A job left queued is started from here, inside this limit. */
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string }> };

/**
 * One job and its record (prompt, model, cost, times). The owner polls this until status is done or failed, and
 * their request also brings the job up to date. Anyone else signed in gets it as it stands: the whole team sees
 * every saved record, so the Library's record view works for work a teammate made.
 */
export async function GET(request: NextRequest, { params }: Ctx) {
  return withUser(request, async (user) => {
    const jobId = id((await params).id, "The job");
    const found = await getJobStore().get(jobId);
    if (!found) throw new Bad("not_found", "That job is not there.", 404);
    if (found.owner !== user.email) return ok({ job: view(found), record: record(found) });
    const { job, start } = await refresh(found);
    if (start) after(() => runJob(job.id));
    return ok({ job: view(job), record: record(job) });
  });
}
