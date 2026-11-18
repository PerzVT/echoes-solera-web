/**
 * What a job reads from the creator's saved work: the episode, its script and screenplay, the series' cast
 * sheets and style. Read when the job is created, so the job's input holds exactly what was sent.
 */
import { startingCast } from "@/lib/labs/maker";
import { getStyle, ruleFields } from "@/lib/labs/styles";
import { getStore } from "@/lib/labs/store";
import { getJobStore } from "@/lib/labs/store/jobs";
import { Bad } from "@/lib/labs/store/validate";
import type { ScreenplayBlock } from "./contract";

const gone = (what: string) => new Bad("not_found", `That ${what} is not there any more.`, 404);

export async function loadEpisode(id: string) {
  const store = getStore();
  const episode = await store.get("episodes", id);
  if (!episode) throw gone("episode");
  const [script, screenplay, choices, series] = await Promise.all([
    store.get("scripts", id),
    store.get("screenplays", id),
    store.get("choices", id),
    store.get("series", episode.seriesId),
  ]);
  return { episode, script, screenplay, choices, series };
}

/**
 * The episode's current screenplay: the latest finished screenplay or revise job, with the person's saved edits
 * (Screenplay.texts) laid over it. Null when nothing has been generated yet.
 */
export async function currentBlocks(episodeId: string): Promise<ScreenplayBlock[] | null> {
  const [last] = await getJobStore().list({ episodeId, kinds: ["screenplay", "revise"], status: ["done"], limit: 1 });
  const blocks = (last?.result as { blocks?: ScreenplayBlock[] } | null)?.blocks;
  if (!blocks) return null;
  const saved = await getStore().get("screenplays", episodeId);
  const texts = saved?.texts ?? {};
  return blocks.map((b) => (typeof texts[b.id] === "string" ? { ...b, text: texts[b.id] } : b));
}

export type SheetRef = { id: string; character: string; variant: string | null; tag: string; builtIn: boolean };

/** A series' cast sheets: the ones uploaded to it, then the ones a built-in series starts with. */
export async function seriesSheets(seriesId: string): Promise<SheetRef[]> {
  const uploaded = (await getStore().list("cast_sheets", seriesId)).map((s) => ({ id: s.id, character: s.character, variant: s.variant, tag: s.tag, builtIn: false }));
  const builtIn = (startingCast[seriesId]?.sheets ?? []).map((s) => ({ id: s.id, character: s.character, variant: s.variant ?? null, tag: s.tag, builtIn: true }));
  return [...uploaded, ...builtIn];
}

/** A style from the Style hub as tagged rules, e.g. "RENDERING: ...". Empty when the style is unknown. */
export function styleText(slug: string | null | undefined) {
  if (!slug) return "";
  const style = getStyle(slug);
  if (!style) return "";
  const rules = ruleFields.map((f) => (style.rules[f.key] ? `${f.tag}: ${style.rules[f.key]}` : "")).filter(Boolean);
  return [`STYLE: ${style.name} (${style.medium})`, ...rules].join("\n");
}

/** The latest finished job of a kind for an episode, or a named one that must be finished and of that kind. */
export async function finishedJob(kind: string, episodeId: string | undefined, jobId: string | undefined, owner: string) {
  const jobs = getJobStore();
  if (jobId) {
    const job = await jobs.get(jobId);
    if (!job || job.kind !== kind || job.status !== "done") throw new Bad("invalid", "That earlier step has not finished.");
    // Jobs are private to their maker, but a team member may build on an episode's shared results.
    if (job.owner !== owner && !job.episodeId) throw gone("job");
    return job;
  }
  if (!episodeId) return null;
  const [last] = await jobs.list({ episodeId, kinds: [kind], status: ["done"], limit: 1 });
  return last ?? null;
}
