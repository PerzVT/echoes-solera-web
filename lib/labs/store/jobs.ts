import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Generation jobs (lib/labs/ai/jobs.ts runs them). Kept beside the main store rather than in it: a job is not a
 * saved piece of work, it is a record of one paid call and what came of it. Postgres when DATABASE_URL is set
 * (table nl_jobs in schema.sql), otherwise .data/jobs.json in development, the same rule as lib/labs/store/index.ts.
 */

export type JobStatus = "queued" | "running" | "done" | "failed";

/**
 * One generation. `input` and `result` are JSON whose shape depends on `kind` (lib/labs/ai/contract.ts).
 * `providerId` is the provider's own id for work that runs on their side (an OpenAI background response), so a
 * later request can pick the job up again. `estimateUsd` is held against the limits while the job is queued or
 * running; `costUsd` is what the provider's reported usage came to.
 */
export type Job = {
  id: string;
  owner: string;
  kind: string;
  status: JobStatus;
  episodeId: string | null;
  input: unknown;
  result: unknown;
  error: string | null;
  provider: string;
  providerId: string | null;
  estimateUsd: number;
  costUsd: number | null;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export type JobPatch = Partial<Pick<Job, "status" | "result" | "error" | "providerId" | "costUsd" | "attempts" | "startedAt" | "finishedAt">>;
export type JobQuery = { owner?: string; episodeId?: string; kinds?: string[]; status?: JobStatus[]; limit: number };
/** Spending by one person since a time: settled cost plus the estimate of their jobs still queued or running. */
export type Spend = { owner: string; usd: number; jobs: number };

export interface JobStore {
  put(job: Job): Promise<void>;
  get(id: string): Promise<Job | null>;
  /** Newest first. */
  list(query: JobQuery): Promise<Job[]>;
  /** Applies the patch only while the job's status is one of `onlyIf`; the changed job, or null when it was not. */
  update(id: string, patch: JobPatch, onlyIf: JobStatus[]): Promise<Job | null>;
  spendSince(since: string): Promise<Spend[]>;
}

/** What a job counts for against the limits. */
export const jobSpend = (j: Pick<Job, "status" | "costUsd" | "estimateUsd">) =>
  j.costUsd ?? (j.status === "queued" || j.status === "running" ? j.estimateUsd : 0);

/* ---------- Files, for development ---------- */

const FILE = path.join(process.cwd(), ".data", "jobs.json");
/** The file keeps the newest jobs only; development never needs more. */
const KEEP = 2000;

let queue: Promise<unknown> = Promise.resolve();
const serial = <T>(fn: () => Promise<T>) => {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
};

async function readAll(): Promise<Job[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Job[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

async function writeAll(jobs: Job[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(jobs.slice(-KEEP), null, 1));
  await rename(tmp, FILE);
}

const matches = (j: Job, q: JobQuery) =>
  (!q.owner || j.owner === q.owner) &&
  (!q.episodeId || j.episodeId === q.episodeId) &&
  (!q.kinds || q.kinds.includes(j.kind)) &&
  (!q.status || q.status.includes(j.status));

const fileJobs: JobStore = {
  put: (job) => serial(async () => writeAll([...(await readAll()).filter((j) => j.id !== job.id), job])),
  async get(id) {
    return (await readAll()).find((j) => j.id === id) ?? null;
  },
  async list(q) {
    return (await readAll())
      .filter((j) => matches(j, q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, q.limit);
  },
  update: (id, patch, onlyIf) =>
    serial(async () => {
      const all = await readAll();
      const at = all.findIndex((j) => j.id === id);
      if (at < 0 || !onlyIf.includes(all[at].status)) return null;
      const job = { ...all[at], ...patch, updatedAt: new Date().toISOString() };
      all[at] = job;
      await writeAll(all);
      return job;
    }),
  async spendSince(since) {
    const by = new Map<string, Spend>();
    for (const j of await readAll()) {
      if (j.createdAt < since) continue;
      const s = by.get(j.owner) ?? { owner: j.owner, usd: 0, jobs: 0 };
      s.usd += jobSpend(j);
      s.jobs += 1;
      by.set(j.owner, s);
    }
    return [...by.values()];
  },
};

/* ---------- Postgres ---------- */

type Row = Record<string, unknown>;

/** Field to column, in a fixed order. Every name is fixed here, never taken from a request. */
const COLUMNS: [keyof Job, string][] = [
  ["id", "id"],
  ["owner", "owner"],
  ["kind", "kind"],
  ["status", "status"],
  ["episodeId", "episode_id"],
  ["input", "input"],
  ["result", "result"],
  ["error", "error"],
  ["provider", "provider"],
  ["providerId", "provider_id"],
  ["estimateUsd", "estimate_usd"],
  ["costUsd", "cost_usd"],
  ["attempts", "attempts"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
  ["startedAt", "started_at"],
  ["finishedAt", "finished_at"],
];
const JSON_COLUMNS = new Set<keyof Job>(["input", "result"]);
const col = new Map(COLUMNS);
const SELECT = `select ${COLUMNS.map(([, c]) => c).join(", ")} from nl_jobs`;

const value = (field: keyof Job, v: unknown) => (JSON_COLUMNS.has(field) ? (v === null || v === undefined ? null : JSON.stringify(v)) : (v ?? null));

function toJob(row: Row): Job {
  const out: Row = {};
  for (const [field, c] of COLUMNS) {
    const v = row[c];
    out[field] = v instanceof Date ? v.toISOString() : (v ?? null);
  }
  out.estimateUsd = Number(out.estimateUsd ?? 0);
  out.costUsd = out.costUsd === null ? null : Number(out.costUsd);
  out.attempts = Number(out.attempts ?? 0);
  return out as Job;
}

// Imported lazily so a machine without DATABASE_URL never loads the driver for jobs.
const sql = async (query: string, params: unknown[] = []) => (await import("./postgres")).sql(query, params);

const postgresJobs: JobStore = {
  async put(job) {
    await sql(
      `insert into nl_jobs (${COLUMNS.map(([, c]) => c).join(", ")}) values (${COLUMNS.map((_, i) => `$${i + 1}`).join(", ")})`,
      COLUMNS.map(([f]) => value(f, job[f])),
    );
  },
  async get(id) {
    const [row] = await sql(`${SELECT} where id = $1`, [id]);
    return row ? toJob(row) : null;
  },
  async list(q) {
    const where: string[] = [];
    const params: unknown[] = [];
    const add = (clause: string, v: unknown) => {
      params.push(v);
      where.push(clause.replace("?", `$${params.length}`));
    };
    if (q.owner) add("owner = ?", q.owner);
    if (q.episodeId) add("episode_id = ?", q.episodeId);
    if (q.kinds) add("kind = any(?)", q.kinds);
    if (q.status) add("status = any(?)", q.status);
    params.push(Math.max(1, Math.min(q.limit, 500)));
    const rows = await sql(`${SELECT}${where.length ? ` where ${where.join(" and ")}` : ""} order by created_at desc limit $${params.length}`, params);
    return rows.map(toJob);
  },
  async update(id, patch, onlyIf) {
    const fields = (Object.keys(patch) as (keyof JobPatch)[]).filter((f) => col.has(f));
    const params: unknown[] = [id, onlyIf, new Date().toISOString()];
    const sets = ["updated_at = $3"];
    for (const f of fields) {
      params.push(value(f, patch[f]));
      sets.push(`${col.get(f)} = $${params.length}`);
    }
    const [row] = await sql(`update nl_jobs set ${sets.join(", ")} where id = $1 and status = any($2) returning ${COLUMNS.map(([, c]) => c).join(", ")}`, params);
    return row ? toJob(row) : null;
  },
  async spendSince(since) {
    const rows = await sql(
      `select owner, count(*)::int as jobs, coalesce(sum(coalesce(cost_usd, case when status in ('queued', 'running') then estimate_usd else 0 end)), 0) as usd
       from nl_jobs where created_at >= $1 group by owner`,
      [since],
    );
    return rows.map((r) => ({ owner: String(r.owner), jobs: Number(r.jobs), usd: Number(r.usd) }));
  },
};

export function getJobStore(): JobStore {
  return process.env.DATABASE_URL ? postgresJobs : fileJobs;
}
