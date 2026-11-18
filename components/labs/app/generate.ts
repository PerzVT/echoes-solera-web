/**
 * Every generation the creator starts goes through this module. Screens build the inputs and use the outputs, and
 * hold no generation logic of their own.
 *
 * On first use it reads GET /api/creator/ai/status once. When generation is not set up (no key on the server) every
 * function fails at once with "API token not set up.", the same words the server uses, so the whole flow can be
 * walked and each screen shows its error. When it is set up each function creates the matching job
 * (lib/labs/ai/contract.ts), polls it until it is done or failed, and maps the result to the shapes the screens
 * already use. Contract shapes are mapped to screen shapes here and nowhere else. Clips need a video provider
 * (status.video); until there is one a clip fails with the same message.
 *
 * Every function takes an optional AbortSignal as its last argument: aborting stops the polling and cancels the job.
 */
import type { CastSheet as BuiltInSheet, Block, Note, SeriesCast, Take } from "@/lib/labs/maker";
import type {
  AiStatus,
  Aspect,
  CreateJobRequest,
  ImageInput,
  JobKind,
  JobResultFor,
  JobView,
  MangaPagePlan,
  MangaPanel,
  MatchCastResult,
  PromptsResult,
  ScreenplayBlock,
  StoryboardFrame,
} from "@/lib/labs/ai/contract";
import type { CastChoice, CastSheet as Upload, Frame, MangaLetter, MangaPage } from "@/lib/labs/store/types";
import type { Element } from "./creator";
import { generationsFor, type Gen } from "./script";
import { PROFILES, type FlowTool } from "./tools";

let n = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${++n}`;
const abortError = () => new DOMException("The generation was stopped.", "AbortError");

/** Waits, or stops early with an AbortError when the signal fires. */
function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((done, fail) => {
    if (signal?.aborted) return fail(abortError());
    const t = setTimeout(done, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        fail(abortError());
      },
      { once: true },
    );
  });
}

/* ======================================================================================================
 * The server: status, jobs and their errors
 * ==================================================================================================== */

/**
 * Development only: with localStorage "nine-lives:fake-ai" set to "1", jobs run on the server's stand-in provider
 * (header x-nl-fake-ai, lib/labs/ai/http.ts), so the whole wiring can be tried without a key and without spending.
 * The check is compiled out of production builds, and the server ignores the header there too.
 */
const FAKE_KEY = "nine-lives:fake-ai";
function fakeAi() {
  if (process.env.NODE_ENV === "production") return false;
  try {
    return localStorage.getItem(FAKE_KEY) === "1";
  } catch {
    return false;
  }
}

let statusRead: Promise<AiStatus> | null = null;

/** Whether generation is set up, read once per page load. */
export function aiStatus(): Promise<AiStatus> {
  if (fakeAi()) return Promise.resolve({ ready: true, video: false });
  statusRead ??= fetch("/api/creator/ai/status", { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<AiStatus>) : ({ ready: false } as const)))
    .catch(() => ({ ready: false }) as const);
  return statusRead;
}

/** A generation that did not work. `message` is a plain sentence fit to show as it is; `code` is the API's error code. */
export class GenerationError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

const OFFLINE = "offline";

/** What every generation says while the server has no API key, or a clip says while there is no video provider. */
export const NOT_SET_UP = "API token not set up.";
const notSetUp = () => new GenerationError(NOT_SET_UP, "not_set_up");

/** The status, or the not-set-up failure when generation is not set up. */
async function ready() {
  const status = await aiStatus();
  if (!status.ready) throw notSetUp();
  return status;
}

const needEpisode = (episodeId: string | undefined): string => {
  if (!episodeId) throw new GenerationError("Save the episode first.");
  return episodeId;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", ...init });
  } catch {
    if (init?.signal?.aborted) throw abortError();
    throw new GenerationError("The connection dropped. Check it and try again.", OFFLINE);
  }
  const data = (await res.json().catch(() => null)) as (T & { error?: string; message?: string }) | null;
  if (!res.ok || !data) {
    if (res.status === 401) throw new GenerationError("You are signed out. Sign in again.", "unauthorized");
    throw new GenerationError(data?.message ?? "That did not work. Try again.", data?.error);
  }
  return data;
}

const jobHeaders = (): Record<string, string> => {
  const h: Record<string, string> = { "content-type": "application/json" };
  if (process.env.NODE_ENV !== "production" && fakeAi()) h["x-nl-fake-ai"] = "0.001";
  return h;
};

const POLL_FIRST = 1000;
const POLL_MAX = 4000;
const GIVE_UP = 6 * 60_000;
const later = (ms: number) => Math.min(POLL_MAX, Math.round(ms * 1.5));

type InputOf<K extends JobKind> = Extract<CreateJobRequest, { kind: K }>["input"];

/**
 * Creates a job and polls it until it is done or failed: every 1 s at first, backing off to every 4 s, for at most
 * six minutes. While the person already has as many generations running as the server allows, the create waits
 * its turn. Aborting cancels the job on the server.
 */
async function runJob<K extends Exclude<JobKind, "clip">>(kind: K, input: InputOf<K>, signal?: AbortSignal): Promise<JobResultFor[K]> {
  const deadline = Date.now() + GIVE_UP;
  let job: JobView<K> | undefined;
  for (let ms = POLL_FIRST; !job; ms = later(ms)) {
    if (signal?.aborted) throw abortError();
    try {
      job = (await request<{ job: JobView<K> }>("/api/creator/jobs", { method: "POST", headers: jobHeaders(), body: JSON.stringify({ kind, input }), signal })).job;
    } catch (e) {
      if (e instanceof GenerationError && e.code === "busy" && Date.now() + ms < deadline) await wait(ms, signal);
      else throw e;
    }
  }
  const id = job.id;
  const cancel = () => void fetch(`/api/creator/jobs/${id}/cancel`, { method: "POST", keepalive: true }).catch(() => {});
  try {
    for (let ms = POLL_FIRST; ; ms = later(ms)) {
      if (job.status === "done" && job.result) return job.result;
      if (job.status === "failed") throw new GenerationError(job.error ?? "That did not work. Try again.");
      if (Date.now() + ms > deadline) {
        cancel();
        throw new GenerationError("That took too long. Try again.");
      }
      await wait(ms, signal);
      try {
        job = (await request<{ job: JobView<K> }>(`/api/creator/jobs/${id}`, { signal })).job;
      } catch (e) {
        // A dropped connection while polling is tried again on the next tick; the job keeps running on the server.
        if (!(e instanceof GenerationError && e.code === OFFLINE)) throw e;
      }
    }
  } catch (e) {
    if (signal?.aborted) cancel();
    throw e;
  }
}

/** A finished image job's picture, at the address the creator serves it from. */
async function drawImage(input: ImageInput, signal?: AbortSignal) {
  const r = await runJob("image", input, signal);
  return r.url;
}

/**
 * Runs `fn` over the items, a few at a time (the server lets one person run four jobs at once). The first failure
 * stops the rest and is thrown.
 */
async function eachLimited<T>(items: T[], limit: number, signal: AbortSignal | undefined, fn: (item: T, i: number, signal: AbortSignal) => Promise<void>) {
  const stop = new AbortController();
  const onAbort = () => stop.abort();
  signal?.addEventListener("abort", onAbort, { once: true });
  let at = 0;
  let failed: unknown;
  const worker = async () => {
    while (at < items.length && !stop.signal.aborted) {
      const i = at++;
      try {
        await fn(items[i], i, stop.signal);
      } catch (e) {
        if (failed === undefined) failed = e;
        stop.abort();
      }
    }
  };
  try {
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
  if (signal?.aborted) throw abortError();
  if (failed !== undefined) throw failed;
}

/** The prompt each picture was drawn from, kept for this page load so drawing one again does not ask for a new prompt. */
const drawn = new Map<string, { prompt: string; references: string[] }>();

const IMAGE_SLOTS = 3;

/* ======================================================================================================
 * Shapes: contract to screen and back
 * ==================================================================================================== */

/** A contract passage as the screens' Block. A shot shows its prompt once one is written, else its direction. */
function toBlock(b: ScreenplayBlock): Block {
  switch (b.kind) {
    case "heading":
      return { id: b.id, kind: "heading", number: b.number, text: b.text };
    case "camera":
      return { id: b.id, kind: "camera", text: b.text, prompt: b.prompt ?? b.direction, direction: b.direction };
    case "dialogue":
      return { id: b.id, kind: "dialogue", cue: b.cue, text: b.text, rewrite: b.text };
    default:
      return { id: b.id, kind: "action", text: b.text, rewrite: b.text };
  }
}

/** The screens' blocks, with the person's edited text laid over them, as contract passages. */
function toPassages(blocks: Block[], texts: Record<string, string> = {}): ScreenplayBlock[] {
  return blocks.map((b): ScreenplayBlock => {
    const text = typeof texts[b.id] === "string" ? texts[b.id] : b.text;
    switch (b.kind) {
      case "heading":
        return { id: b.id, kind: "heading", number: b.number, text: b.text };
      case "camera":
        return { id: b.id, kind: "camera", text: b.text, direction: b.direction ?? "", prompt: b.direction !== undefined && b.prompt === b.direction ? null : b.prompt };
      case "dialogue":
        return { id: b.id, kind: "dialogue", cue: b.cue, text };
      default:
        return { id: b.id, kind: "action", text };
    }
  });
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

/** The first words of a passage, as a generation's summary. */
function firstWords(text: string, count = 7) {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length > count ? `${words.slice(0, count).join(" ")}...` : words.join(" ");
}

const clipAspect = (tool: FlowTool): Aspect => (tool === "anime" ? "landscape" : "portrait");

/* ======================================================================================================
 * Episodes (mini-series and anime)
 * ==================================================================================================== */

/** The generations a built-in episode shows, each with its own clip; `approved` marks them all approved. */
export function plannedClips(tool: FlowTool, blocks: Block[], approved: boolean): Gen[] {
  return generationsFor(blocks, approved, PROFILES[tool].clips);
}

export type MakeScreenplayInput = { tool: FlowTool; source: string; /** The saved episode. Generation needs one. */ episodeId?: string };
export type MakeScreenplayOutput = { blocks: Block[] };

/** Adapts a submitted script into screenplay blocks with shots. Without typed text the server reads the episode's saved script. */
export async function makeScreenplay({ source, episodeId }: MakeScreenplayInput, signal?: AbortSignal): Promise<MakeScreenplayOutput> {
  await ready();
  const r = await runJob("screenplay", { episodeId: needEpisode(episodeId), script: source.trim() ? source : undefined }, signal);
  return { blocks: r.blocks.map(toBlock) };
}

export type LoadScreenplayInput = { tool: FlowTool; episodeId: string };

/**
 * A saved episode's screenplay blocks when it is opened again: the latest finished screenplay or rewrite, so the
 * saved edits (keyed by passage id) land on the passages they were made on. None when nothing was generated.
 */
export async function loadScreenplay({ episodeId }: LoadScreenplayInput, signal?: AbortSignal): Promise<MakeScreenplayOutput> {
  try {
    const q = (kind: string) => request<{ jobs: JobView[] }>(`/api/creator/jobs?episode=${encodeURIComponent(episodeId)}&kind=${kind}&limit=5`, { signal }).then((d) => d.jobs);
    const [made, revised] = await Promise.all([q("screenplay"), q("revise")]);
    const last = [...made, ...revised].filter((j) => j.status === "done" && j.result).sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""))[0];
    const blocks = (last?.result as { blocks?: ScreenplayBlock[] } | null)?.blocks;
    return { blocks: blocks?.map(toBlock) ?? [] };
  } catch (e) {
    if (signal?.aborted) throw e;
    return { blocks: [] };
  }
}

export type ReviseScreenplayInput = { tool: FlowTool; blocks: Block[]; texts: Record<string, string>; notes: Note[]; episodeId?: string };
/**
 * Every passage's text, changed or not. `blocks` comes back when the rewrite may have added or removed passages,
 * and `changed` names the passages it changed; without them the passages commented on count as changed.
 */
export type ReviseScreenplayOutput = { texts: Record<string, string>; blocks?: Block[]; changed?: string[] };

/** Rewrites the passages the comments and suggestions are on. */
export async function reviseScreenplay({ blocks, texts, notes, episodeId }: ReviseScreenplayInput, signal?: AbortSignal): Promise<ReviseScreenplayOutput> {
  await ready();
  const r = await runJob("revise", { episodeId: needEpisode(episodeId), blocks: toPassages(blocks, texts), notes }, signal);
  return { texts: r.texts, blocks: r.blocks.map(toBlock), changed: r.changed };
}

/* ---------- Cast ---------- */

export type MatchCastInput = {
  tool: FlowTool;
  episodeId?: string;
  seriesId: string;
  blocks: Block[];
  texts?: Record<string, string>;
  /** The sheets the Cast step can show: the built-in library and the series' uploads. */
  library: SeriesCast;
  uploads: Upload[];
};
/** The characters and places the screenplay needs. */
export type MatchCastOutput = { elements: Element[] };

const fileSrc = (key: string) => `/api/creator/files/${key}`;

/**
 * Matches the screenplay against the series' cast sheets. Matched names come back with their sheet, unmatched ones
 * as cards that need a picture, and a conflict as a card with the question a person has to answer.
 */
export async function matchCast({ episodeId, seriesId, blocks, texts, library, uploads }: MatchCastInput, signal?: AbortSignal): Promise<MatchCastOutput> {
  await ready();
  const r: MatchCastResult = await runJob("match-cast", { episodeId: needEpisode(episodeId), seriesId, blocks: toPassages(blocks, texts) }, signal);
  const byName = new Map<string, Element>();
  const kindOf = (k: string): Element["kind"] | null => (k === "character" ? "character" : k === "location" ? "location" : null);
  const sheetFor = (ids: string[]): Partial<Element> => {
    for (const id of ids) {
      const up = uploads.find((s) => s.id === id);
      if (up) return { src: fileSrc(up.image), sheet: up.id, variant: up.variant ?? undefined };
      const built: BuiltInSheet | undefined = library.sheets.find((s) => s.id === id);
      if (built) return { src: built.src, who: built.character, variant: built.variant };
    }
    return {};
  };
  for (const m of r.matches) {
    const kind = kindOf(m.kind);
    if (!kind) continue;
    byName.set(m.name.toLowerCase(), { id: `${kind}-${slug(m.name)}`, kind, name: m.name, tag: m.tag || `@${slug(m.name)}`, ...sheetFor(m.sheetIds) });
  }
  for (const u of r.unmatched) {
    const kind = kindOf(u.kind);
    if (!kind || byName.has(u.name.toLowerCase())) continue;
    byName.set(u.name.toLowerCase(), { id: `${kind}-${slug(u.name)}`, kind, name: u.name, tag: `@${slug(u.name)}` });
  }
  for (const c of r.conflicts) {
    const had = byName.get(c.name.toLowerCase());
    if (had) had.question = c.question;
    else byName.set(c.name.toLowerCase(), { id: `character-${slug(c.name)}`, kind: "character", name: c.name, tag: `@${slug(c.name)}`, question: c.question });
  }
  return { elements: [...byName.values()] };
}

/* ---------- Clips ---------- */

export type MakeClipsInput = { tool: FlowTool; blocks: Block[]; texts?: Record<string, string>; cast: CastChoice[]; style: string; episodeId?: string };
export type MakeClipsOutput = { gens: Gen[] };

/** A take with nothing in it yet: the slot a generation shows while its first take is made. */
const emptyTake: Take = { name: "Take 1", src: "", poster: "" };

/**
 * Splits the screenplay into the generations to make, none decided, each with the prompt it is made from. Each is
 * then made with makeClip.
 */
export async function makeClips({ tool, blocks, texts, style, episodeId }: MakeClipsInput, signal?: AbortSignal): Promise<MakeClipsOutput> {
  await ready();
  needEpisode(episodeId);
  const passages = toPassages(blocks, texts);
  const shots = passages.filter((b): b is Extract<ScreenplayBlock, { kind: "camera" }> => b.kind === "camera");
  if (!shots.length) {
    // A screenplay with no shots: one generation per passage, drawn from its own words.
    const said = passages.filter((b): b is Extract<ScreenplayBlock, { kind: "action" | "dialogue" }> => b.kind === "action" || b.kind === "dialogue");
    return {
      gens: said.map((b, i) => ({
        n: i + 1,
        block: b.id,
        summary: b.kind === "dialogue" ? `${b.cue}: ${firstWords(b.text, 5)}` : firstWords(b.text),
        takes: [emptyTake],
        prompt: b.kind === "dialogue" ? `${b.cue} says: ${b.text}` : b.text,
        references: [],
      })),
    };
  }
  const { prompts }: PromptsResult = await runJob("prompts", { medium: "clip", episodeId, blocks: passages, styleSlug: style, aspect: clipAspect(tool) }, signal);
  const byItem = new Map(prompts.map((p) => [p.itemId, p]));
  return {
    gens: shots.map((shot, i) => {
      const at = passages.indexOf(shot);
      const after = passages.slice(at + 1).find((b) => b.kind === "action" || b.kind === "dialogue");
      const words = after ? (after.kind === "dialogue" ? `${after.cue}: ${firstWords(after.text, 5)}` : firstWords(after.text)) : "";
      const p = byItem.get(shot.id);
      return {
        n: i + 1,
        block: shot.id,
        summary: words ? `${shot.text}. ${words}` : shot.text,
        takes: [emptyTake],
        prompt: p?.prompt ?? [shot.text, shot.direction].filter(Boolean).join(". "),
        references: p?.references ?? [],
      };
    }),
  };
}

export type MakeClipInput = { tool: FlowTool; gen: Gen; style: string; /** The generation's place in the episode; the demo finishes them in order. */ index: number; episodeId?: string };
export type MakeClipOutput = { take: Take };

/** One take of a generation, made as a clip. Until there is a video provider it fails with the not-set-up message. */
async function clipTake(tool: FlowTool, prompt: string, references: string[], signal?: AbortSignal): Promise<Take> {
  const status = await ready();
  if (!status.video) throw notSetUp();
  const made = await request<{ job: JobView }>("/api/creator/jobs", {
    method: "POST",
    headers: jobHeaders(),
    body: JSON.stringify({ kind: "clip", input: { prompt, references: references.slice(0, 8), aspect: clipAspect(tool) } }),
    signal,
  });
  // The clip job's result shape is not set yet (the video provider is not built), so a clip never gets this far.
  throw new GenerationError(made.job.error ?? NOT_SET_UP);
}

/** Makes one generation's first take. */
export async function makeClip({ tool, gen }: MakeClipInput, signal?: AbortSignal): Promise<MakeClipOutput> {
  return { take: await clipTake(tool, gen.prompt ?? gen.summary, gen.references ?? [], signal) };
}

export type RetakeClipInput = { tool: FlowTool; gen: Gen; style: string; feedback: string; /** How many retries this episode has asked for so far. */ attempt: number; episodeId?: string };
export type RetakeClipOutput = { take: Take };

/** A new take of one generation, made with the person's feedback. */
export async function retakeClip({ tool, gen, feedback }: RetakeClipInput, signal?: AbortSignal): Promise<RetakeClipOutput> {
  const prompt = `${gen.prompt ?? gen.summary}\n\nChange for this take: ${feedback.trim()}`;
  return { take: await clipTake(tool, prompt, gen.references ?? [], signal) };
}

/* ======================================================================================================
 * Cooking videos
 * ==================================================================================================== */

export type MakeCookingTakeInput = {
  recipe: string;
  chef: string;
  style: { slug: string; name: string };
  /** The take number, from 0. */
  take: number;
  feedback?: string;
};
export type MakeCookingTakeOutput = { video: string; poster: string };

/** One cooking video take, made as a clip. */
export async function makeCookingTake({ recipe, chef, style, take, feedback }: MakeCookingTakeInput, signal?: AbortSignal): Promise<MakeCookingTakeOutput> {
  const prompt = [`A cooking video in the ${style.name} style. ${chef} cooks ${recipe} in a home kitchen, the dish and her hands in frame.`, feedback?.trim() ? `Change for this take: ${feedback.trim()}` : ""]
    .filter(Boolean)
    .join("\n\n");
  const t = await clipTake("mini-series", prompt, [], signal);
  return { video: t.src, poster: t.poster };
}

/* ======================================================================================================
 * Storyboard
 * ==================================================================================================== */

export type MakeStoryboardInput = {
  source: string;
  style: string;
  /** Called as the frames come in: first the plan with no pictures (`image` empty), then each picture as it is drawn. */
  onFrames?: (frames: Frame[]) => void;
};
export type MakeStoryboardOutput = { frames: Frame[] };

/** A planned frame's words as the screens' shot note: what happens, the line said, then the artist's note. */
const frameNote = (f: StoryboardFrame) => [f.action, f.dialogue ? `"${f.dialogue}"` : "", f.note].filter(Boolean).join(" ");

/** At most this many frames per board, which also bounds the pictures drawn for it. */
const MAX_FRAMES = 12;

/** Splits a scene into numbered frames, each with a picture and a shot note. */
export async function makeStoryboard({ source, style, onFrames }: MakeStoryboardInput, signal?: AbortSignal): Promise<MakeStoryboardOutput> {
  await ready();
  const plan = await runJob("storyboard", { source, maxFrames: MAX_FRAMES, aspect: "landscape" }, signal);
  let frames: Frame[] = plan.frames.map((f) => ({ id: newId("f"), title: f.shot || f.title, note: frameNote(f), image: "" }));
  onFrames?.(frames);
  const { prompts }: PromptsResult = await runJob("prompts", { medium: "storyboard", frames: plan.frames, styleSlug: style, aspect: "landscape" }, signal);
  const byItem = new Map(prompts.map((p) => [p.itemId, p]));
  await eachLimited(plan.frames, IMAGE_SLOTS, signal, async (f, i, s) => {
    const p = byItem.get(`frame-${f.number}`);
    const prompt = p?.prompt ?? frameNote(f);
    const references = p?.references ?? [];
    const image = await drawImage({ purpose: "storyboard-frame", prompt, references, aspect: "landscape" }, s);
    const id = frames[i].id;
    drawn.set(id, { prompt, references });
    frames = frames.map((x) => (x.id === id ? { ...x, image } : x));
    onFrames?.(frames);
  });
  return { frames };
}

export type RegenerateFrameInput = { frame: Frame; style: string; source: string };
export type RegenerateFrameOutput = { frame: Frame };

/** Draws one frame again from its note. Its title and note stay; the picture changes. */
export async function regenerateFrame({ frame, style }: RegenerateFrameInput, signal?: AbortSignal): Promise<RegenerateFrameOutput> {
  await ready();
  let made = drawn.get(frame.id);
  if (!made) {
    const one: StoryboardFrame = { number: 1, title: frame.title, shot: frame.title, camera: "", action: frame.note, characters: [], location: "", dialogue: null, note: frame.note, blocks: [] };
    const { prompts } = await runJob("prompts", { medium: "storyboard", frames: [one], styleSlug: style, aspect: "landscape" }, signal);
    made = { prompt: prompts[0]?.prompt ?? `${frame.title}. ${frame.note}`, references: prompts[0]?.references ?? [] };
    drawn.set(frame.id, made);
  }
  const image = await drawImage({ purpose: "storyboard-frame", prompt: made.prompt, references: made.references, aspect: "landscape" }, signal);
  return { frame: { ...frame, image } };
}

/* ======================================================================================================
 * Manga
 * ==================================================================================================== */

export type MakeMangaPagesInput = {
  source: string;
  style: string;
  pageCount: number;
  /** Called as the pages come in: first the plan with its lettering and no art (`image` empty), then each page's art as it is drawn. */
  onPages?: (pages: MangaPage[]) => void;
};
export type MakeMangaPagesOutput = { pages: MangaPage[] };

const round = (v: number) => Math.round(v * 10) / 10;

/**
 * A page plan's words as lettering over the art. The art is drawn with no lettering and the plan says nothing of
 * where each panel lands, so each panel gets a band of the page in reading order: narration at the band's top
 * corner, balloons along it from the reading side, sound effects low in it.
 */
function letteringFor(page: MangaPagePlan, direction: "rtl" | "ltr"): MangaLetter[] {
  const letters: MangaLetter[] = [];
  const band = 100 / Math.max(1, page.panels.length);
  const fromRight = direction === "rtl";
  page.panels.forEach((panel: MangaPanel, i) => {
    const top = i * band;
    const bottom = top + band;
    let y = top + 2;
    for (const text of panel.narration) {
      letters.push({ kind: "narration", text, x: fromRight ? 64 : 2.5, y: round(y), w: 33 });
      y += Math.min(10, band * 0.22);
    }
    panel.speech.forEach((s, k) => {
      const right = (k % 2 === 0) === fromRight;
      const w = s.text.length > 40 ? 34 : s.text.length > 18 ? 28 : 22;
      const at = Math.min(bottom - 12, y + Math.floor(k / 2) * Math.min(12, band * 0.3));
      letters.push({ kind: "speech", text: s.style === "shout" ? s.text.toUpperCase() : s.text, x: right ? 96 - w : 4, y: round(Math.max(top + 1, at)), w, tail: { at: right ? 25 : 75, flip: !right } });
    });
    panel.sfx.forEach((fx, k) => {
      letters.push({ kind: "sfx", text: fx.text, x: 30 + ((k * 22) % 40), y: round(Math.max(top + 2, bottom - Math.min(14, band * 0.35))), rotate: -10, scale: panel.size === "full" || panel.size === "large" ? 1.2 : 0.9 });
    });
  });
  return letters;
}

const pageAlt = (page: MangaPagePlan) =>
  page.panels
    .map((p) => p.art)
    .join(" ")
    .slice(0, 400);

/** Draws the pages of a manga with their lettering, as live text over wordless art. */
export async function makeMangaPages({ source, style, pageCount, onPages }: MakeMangaPagesInput, signal?: AbortSignal): Promise<MakeMangaPagesOutput> {
  await ready();
  const plan = await runJob("manga", { source, maxPages: Math.max(1, Math.min(24, pageCount)) }, signal);
  let pages: MangaPage[] = plan.pages.map((p) => ({ id: newId("pg"), image: "", alt: pageAlt(p), letters: letteringFor(p, plan.readingDirection) }));
  onPages?.(pages);
  const { prompts }: PromptsResult = await runJob("prompts", { medium: "manga", pages: plan.pages, styleSlug: style, aspect: "portrait" }, signal);
  const byItem = new Map(prompts.map((p) => [p.itemId, p]));
  await eachLimited(plan.pages, IMAGE_SLOTS, signal, async (p, i, s) => {
    const made = byItem.get(`page-${p.number}`);
    const prompt = made?.prompt ?? pageAlt(p);
    const references = made?.references ?? [];
    const image = await drawImage({ purpose: "manga-page", prompt, references, aspect: "portrait" }, s);
    const id = pages[i].id;
    drawn.set(id, { prompt, references });
    pages = pages.map((x) => (x.id === id ? { ...x, image } : x));
    onPages?.(pages);
  });
  return { pages };
}

export type RegeneratePageInput = { page: MangaPage; style: string; source: string };
export type RegeneratePageOutput = { page: MangaPage };

/** Draws one page again. The lettering stays where it was. */
export async function regeneratePage({ page, style }: RegeneratePageInput, signal?: AbortSignal): Promise<RegeneratePageOutput> {
  await ready();
  let made = drawn.get(page.id);
  if (!made) {
    const one: MangaPagePlan = { number: 1, layout: "As drawn before", panels: [{ number: 1, size: "full", shot: "", art: page.alt, characters: [], speech: [], narration: [], sfx: [] }] };
    const { prompts } = await runJob("prompts", { medium: "manga", pages: [one], styleSlug: style, aspect: "portrait" }, signal);
    made = { prompt: prompts[0]?.prompt ?? page.alt, references: prompts[0]?.references ?? [] };
    drawn.set(page.id, made);
  }
  const image = await drawImage({ purpose: "manga-page", prompt: made.prompt, references: made.references, aspect: "portrait" }, signal);
  return { page: { ...page, image } };
}
