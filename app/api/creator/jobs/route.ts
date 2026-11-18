import { after, type NextRequest } from "next/server";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { Bad, id } from "@/lib/labs/store/validate";
import { getJobStore } from "@/lib/labs/store/jobs";
import { createJob, runJob, view } from "@/lib/labs/ai/jobs";
import { fakeCost } from "@/lib/labs/ai/http";

/** The job runs after the response, inside this limit (lib/labs/ai/jobs.ts says how longer work is picked up). */
export const maxDuration = 300;

const KINDS = new Set(["screenplay", "revise", "match-cast", "storyboard", "manga", "prompts", "image", "clip"]);

/** The signed-in person's recent jobs, newest first: ?episode=<id>&kind=<kind>&limit=<1-100>. */
export async function GET(request: NextRequest) {
  return withUser(request, async (user) => {
    const q = request.nextUrl.searchParams;
    const episode = q.get("episode");
    const kind = q.get("kind");
    if (kind && !KINDS.has(kind)) throw new Bad("invalid", "That kind is not known.");
    const limit = Math.max(1, Math.min(100, Number(q.get("limit")) || 30));
    const jobs = await getJobStore().list({ owner: user.email, episodeId: episode ? id(episode, "The episode") : undefined, kinds: kind ? [kind] : undefined, limit });
    return ok({ jobs: jobs.map(view) });
  });
}

/** A new job: { kind, input } as in lib/labs/ai/contract.ts CreateJobRequest. Answers at once with the queued job. */
export async function POST(request: NextRequest) {
  return withUser(request, async (user) => {
    const body = await readJson(request);
    if (typeof body.kind !== "string" || !KINDS.has(body.kind)) throw new Bad("invalid", "That kind of generation is not known.");
    const job = await createJob(user.email, body, fakeCost(request));
    after(() => runJob(job.id));
    return ok({ job: view(job) }, 201);
  });
}
