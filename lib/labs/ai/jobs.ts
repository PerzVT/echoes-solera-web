/**
 * Generation jobs: created by POST /api/creator/jobs, run after the response with next/server `after()` inside the
 * route's `maxDuration`, and picked up again by GET /api/creator/jobs/[id].
 *
 * How a job survives on Vercel:
 * - Text jobs run as OpenAI background responses. The response id is saved as soon as OpenAI accepts it; the
 *   function then polls until RUN_BUDGET_MS runs out. Whatever is unfinished is finished by the next GET, which
 *   asks OpenAI once per poll. A response still pending after GIVE_UP_MS is cancelled and the job failed.
 * - Image jobs are one call. A job left "running" with no answer after STALE_MS (the function was stopped) is
 *   failed, and its estimate kept as its cost, since the call may have been billed.
 * - A job still "queued" after QUEUED_MS (its `after()` never ran) is started by the next GET. Starting claims the
 *   job with a conditional update, so two requests never run it twice.
 */
import { Bad } from "@/lib/labs/store/validate";
import { getJobStore, type Job } from "@/lib/labs/store/jobs";
import type { AiUsage, JobKind, JobView } from "./contract";
import { MAX_ACTIVE_JOBS, aiReady, dailyLimit, monthlyLimit } from "./config";
import { imageCost, textCost } from "./cost";
import { fakeImage, fakeText } from "./fake";
import { runImage, type ImageCall } from "./images";
import { finishText, instructionsFor, prepare, type ImageJobInput, type TextJobInput } from "./kinds";
import { ProviderError, cancelText, generateImage, pollText, safetyId, startText, type TextOutcome } from "./openai";
import { SCHEMAS, type TextKind } from "./schemas";

/** Route handlers that run jobs export `maxDuration = 300`; a job stops polling well before that. */
export const RUN_BUDGET_MS = 260_000;
const STALE_MS = 330_000;
const QUEUED_MS = 20_000;
const GIVE_UP_MS = 60 * 60_000;
const POLL_MS = 3000;

type Stored = (TextJobInput | ImageJobInput) & { fakeCostUsd?: number };

const store = () => getJobStore();
const now = () => new Date().toISOString();
const hex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, "0")).join("");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isText = (input: Stored): input is TextJobInput & { fakeCostUsd?: number } => input.type === "text";

export function view(job: Job): JobView {
  return {
    id: job.id,
    kind: job.kind as JobKind,
    status: job.status,
    episodeId: job.episodeId,
    result: job.status === "done" ? (job.result as JobView["result"]) : null,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    finishedAt: job.finishedAt,
  };
}

/* ---------- Limits ---------- */

const startOfDay = () => new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z").toISOString();
const startOfMonth = () => new Date(new Date().toISOString().slice(0, 7) + "-01T00:00:00.000Z").toISOString();

/** Refuses a new job that would pass a limit. The message never names an amount. */
async function guard(owner: string, estimate: number) {
  const active = await store().list({
    owner,
    status: ["queued", "running"],
    limit: MAX_ACTIVE_JOBS + 1,
  });
  if (active.length >= MAX_ACTIVE_JOBS) throw new Bad("busy", "Wait for the current generations to finish.", 429);
  const [today, month] = await Promise.all([store().spendSince(startOfDay()), store().spendSince(startOfMonth())]);
  const mine = today.find((s) => s.owner === owner)?.usd ?? 0;
  const everyone = month.reduce((sum, s) => sum + s.usd, 0);
  if (everyone + estimate > monthlyLimit()) throw new Bad("paused", "Generation is paused for this month.", 429);
  if (mine + estimate > dailyLimit()) throw new Bad("paused", "Generation is paused for today.", 429);
}

export async function usage(owner: string): Promise<AiUsage> {
  const day = startOfDay();
  const month = startOfMonth();
  const [today, thisMonth] = await Promise.all([store().spendSince(day), store().spendSince(month)]);
  const r = (n: number) => Math.round(n * 100) / 100;
  return {
    limits: { dailyPerPersonUsd: dailyLimit(), monthlyAllUsd: monthlyLimit() },
    today: {
      since: day,
      mine: r(today.find((s) => s.owner === owner)?.usd ?? 0),
      everyone: r(today.reduce((s, x) => s + x.usd, 0)),
    },
    month: {
      since: month,
      everyone: r(thisMonth.reduce((s, x) => s + x.usd, 0)),
      byPerson: thisMonth.map((s) => ({ ...s, usd: r(s.usd) })).sort((a, b) => b.usd - a.usd),
    },
  };
}

/* ---------- Create ---------- */

/**
 * The limit check and the insert run one at a time in this process, so a burst of requests cannot all pass the
 * check before any is stored. Separate server instances can still overlap by a job or two; the estimates err high.
 */
let admitting: Promise<unknown> = Promise.resolve();
function admit<T>(fn: () => Promise<T>): Promise<T> {
  const run = admitting.then(fn, fn);
  admitting = run.catch(() => {});
  return run;
}

/**
 * Checks the request, the limits, and stores the job as queued. `fakeCostUsd` is set only in development, when
 * the request asked for the stand-in provider; the caller starts the job with `after(() => runJob(id))`.
 */
export async function createJob(owner: string, body: Record<string, unknown>, fakeCostUsd: number | null): Promise<Job> {
  if (body.kind === "clip") throw new Bad("not_available", "Video generation is not available.", 501);
  if (fakeCostUsd === null && !aiReady()) throw new Bad("not_set_up", "API token not set up.", 503);
  const prepared = await prepare(body, owner);
  const estimateUsd = fakeCostUsd ?? prepared.estimateUsd;
  return admit(async () => {
    await guard(owner, estimateUsd);
    const at = now();
    const job: Job = {
      id: `j-${hex(8)}`,
      owner,
      kind: prepared.kind,
      status: "queued",
      episodeId: prepared.episodeId,
      input: fakeCostUsd === null ? prepared.input : { ...prepared.input, fakeCostUsd },
      result: null,
      error: null,
      provider: fakeCostUsd === null ? "openai" : "fake",
      providerId: null,
      estimateUsd,
      costUsd: null,
      attempts: 0,
      createdAt: at,
      updatedAt: at,
      startedAt: null,
      finishedAt: null,
    };
    await store().put(job);
    return job;
  });
}

/* ---------- Run ---------- */

async function settle(job: Job, outcome: { result: unknown } | { error: string }, costUsd: number | null) {
  const done = "result" in outcome;
  const finished = await store().update(
    job.id,
    {
      status: done ? "done" : "failed",
      result: done ? outcome.result : null,
      error: done ? null : outcome.error,
      costUsd,
      finishedAt: now(),
    },
    ["running"],
  );
  if (!done) console.error(`ai job ${job.id} (${job.kind}) failed`);
  return finished;
}

/** The cost the fake provider was told to report, or the cost of the real usage. */
const costOf = (input: Stored, real: () => number) => (typeof input.fakeCostUsd === "number" ? input.fakeCostUsd : real());

async function settleText(job: Job, outcome: TextOutcome) {
  const input = job.input as Stored & TextJobInput;
  if (outcome.state === "pending") return null;
  const cost = outcome.usage ? costOf(input, () => textCost(input.model, outcome.usage!)) : costOf(input, () => 0);
  if (outcome.state === "failed") return settle(job, { error: outcome.plain }, cost);
  try {
    return await settle(job, { result: finishText(job.kind as TextKind, outcome.text, input) }, cost);
  } catch {
    return settle(job, { error: "The generator's answer could not be read. Try again." }, cost);
  }
}

const poll = (job: Job): Promise<TextOutcome> => (job.provider === "fake" ? Promise.resolve(fakeText(job.kind as TextKind)) : pollText(job.providerId!));

/** Starts a queued job and runs it until it ends or the budget runs out. Safe to call twice: only one claims it. */
export async function runJob(id: string) {
  const before = await store().get(id);
  if (!before || before.status !== "queued") return;
  const job = await store().update(id, { status: "running", startedAt: now(), attempts: before.attempts + 1 }, ["queued"]);
  if (!job) return;
  const started = Date.now();
  const input = job.input as Stored;
  try {
    if (isText(input)) {
      const kind = job.kind as TextKind;
      const providerId =
        job.provider === "fake"
          ? `fake-${job.id}`
          : await startText({
              model: input.model,
              instructions: instructionsFor(kind),
              input: input.input,
              schemaName: kind.replace(/-/g, "_"),
              schema: SCHEMAS[kind],
              maxOutputTokens: input.maxOutputTokens,
              user: await safetyId(job.owner),
            });
      const running = await store().update(id, { providerId }, ["running"]);
      if (!running) {
        // Cancelled while it was being sent.
        if (job.provider !== "fake") await cancelText(providerId);
        return;
      }
      while (Date.now() - started < RUN_BUDGET_MS) {
        const outcome = await poll(running);
        if (outcome.state !== "pending") {
          await settleText(running, outcome);
          return;
        }
        await sleep(POLL_MS);
      }
      // Left running with its provider id: the next GET finishes it.
      return;
    }
    const user = await safetyId(job.owner);
    const call: ImageCall =
      job.provider === "fake"
        ? () => fakeImage()
        : (prompt, references) =>
            generateImage({
              model: input.model,
              prompt,
              size: input.size,
              quality: input.quality,
              references,
              user,
            });
    const { result, usage } = await runImage(job.id, job.owner, input, call);
    await settle(
      job,
      { result },
      costOf(input, () => imageCost(usage)),
    );
  } catch (e) {
    const plain = e instanceof ProviderError ? e.plain : e instanceof Bad ? e.message : "That did not work. Try again.";
    // A text job that never reached OpenAI cost nothing; an image call that failed part way may have been billed.
    const billed = e instanceof ProviderError && e.status < 500 ? 0 : isText(input) ? 0 : job.estimateUsd;
    if (!(e instanceof ProviderError)) console.error(`ai job ${job.id}:`, e instanceof Error ? e.name : "unknown error");
    await settle(
      job,
      { error: plain },
      costOf(input, () => billed),
    );
  }
}

/**
 * Brings a job up to date for a GET. Returns the job as it now stands and whether it still needs starting (the
 * caller then starts it with `after()`).
 */
export async function refresh(job: Job): Promise<{ job: Job; start: boolean }> {
  const age = (t: string | null) => (t ? Date.now() - Date.parse(t) : 0);
  if (job.status === "queued") return { job, start: age(job.createdAt) > QUEUED_MS };
  if (job.status !== "running") return { job, start: false };

  if (job.providerId) {
    try {
      const outcome = await poll(job);
      if (outcome.state !== "pending")
        return {
          job: (await settleText(job, outcome)) ?? ((await store().get(job.id)) as Job),
          start: false,
        };
    } catch (e) {
      if (!(e instanceof ProviderError)) throw e;
      // A passing provider error leaves the job running; the next poll tries again.
    }
    if (age(job.startedAt) > GIVE_UP_MS) {
      if (job.provider !== "fake") await cancelText(job.providerId);
      return {
        job: (await settle(job, { error: "That took too long. Try again." }, job.estimateUsd)) ?? job,
        start: false,
      };
    }
    return { job, start: false };
  }

  if (age(job.startedAt) > STALE_MS) {
    const billed = (job.input as Stored).type === "image" ? job.estimateUsd : 0;
    return {
      job: (await settle(job, { error: "That took too long. Try again." }, billed)) ?? job,
      start: false,
    };
  }
  return { job, start: false };
}

export async function cancelJob(job: Job) {
  const stopped = await store().update(
    job.id,
    {
      status: "failed",
      error: "Stopped.",
      costUsd: job.status === "running" ? job.estimateUsd : 0,
      finishedAt: now(),
    },
    ["queued", "running"],
  );
  if (stopped && job.providerId && job.provider !== "fake") await cancelText(job.providerId);
  return stopped ?? job;
}
