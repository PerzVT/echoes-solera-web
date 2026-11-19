/**
 * Each job kind: how its request is checked and turned into the stored job input (`prepare`), and how the
 * provider's answer becomes its result (`finishText`). Every size is capped here before anything is sent.
 */
import { Bad, id as checkId, list, text } from "@/lib/labs/store/validate";
import { getStore } from "@/lib/labs/store";
import { startingCast } from "@/lib/labs/maker";
import type { Tool } from "@/lib/labs/store/types";
import type {
  Aspect,
  CreateJobRequest,
  ImageInput,
  JobKind,
  MangaPagePlan,
  MatchCastResult,
  PromptsResult,
  ScreenplayBlock,
  ScreenplayNote,
  StoryboardFrame,
} from "./contract";
import { MAX_OUTPUT_TOKENS, imageModel, textModel } from "./config";
import { currentBlocks, finishedJob, loadEpisode, seriesSheets, styleText, type SheetRef } from "./context";
import { imageEstimate, textEstimate } from "./cost";
import { type TextKind } from "./schemas";
import { METHOD } from "./prompts/method";
import { SCREENPLAY } from "./prompts/screenplay";
import { REVISE } from "./prompts/revise";
import { MATCH_CAST } from "./prompts/match-cast";
import { STORYBOARD } from "./prompts/storyboard";
import { MANGA } from "./prompts/manga";
import { GENERATION_PROMPTS } from "./prompts/generation";
import { IMAGE_FRAMES } from "./prompts/images";

export const CAPS = {
  script: 200_000,
  source: 50_000,
  blocks: 2000,
  blockText: 4000,
  notes: 200,
  noteText: 4000,
  items: 60,
  styleGuide: 8000,
  prompt: 8000,
  references: 8,
};

/** What a text job stores: everything needed to start it again without reading the saved work a second time. */
export type TextJobInput = {
  type: "text";
  model: string;
  input: string;
  maxOutputTokens: number;
  /** Sheet ids the answer may name; anything else is dropped from the result. */
  sheetIds?: string[];
  aspect?: Aspect;
  readingDirection?: "rtl" | "ltr";
};

export type ImageJobInput = {
  type: "image";
  model: string;
  purpose: ImageInput["purpose"];
  prompt: string;
  size: string;
  width: number;
  height: number;
  quality: "low" | "medium" | "high";
  /** Where each reference picture is: an uploaded file's key, or a picture on this site. */
  references: { id: string; tag: string; file?: string; src?: string }[];
  skipped: string[];
  castSheet: { seriesId: string; character: string; variant: string | null; tag: string } | null;
};

export type Prepared = { kind: JobKind; episodeId: string | null; input: TextJobInput | ImageJobInput; estimateUsd: number };

export const INSTRUCTIONS: Record<TextKind, string> = {
  screenplay: SCREENPLAY,
  revise: REVISE,
  "match-cast": MATCH_CAST,
  storyboard: STORYBOARD,
  manga: MANGA,
  prompts: GENERATION_PROMPTS,
};
export const instructionsFor = (kind: TextKind) => `${METHOD}\n\n${INSTRUCTIONS[kind]}`;

/* ---------- Small checks ---------- */

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const opt = <T>(v: unknown, check: (x: unknown) => T): T | undefined => (v === undefined || v === null || v === "" ? undefined : check(v));
const oneOf =
  <T extends string>(field: string, values: readonly T[]) =>
  (v: unknown): T => {
    if (!values.includes(v as T)) throw new Bad("invalid", `${field} is not valid.`);
    return v as T;
  };
const aspect = oneOf<Aspect>("The aspect", ["square", "landscape", "portrait"]);
const count = (field: string, min: number, max: number) => (v: unknown) => {
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) throw new Bad("invalid", `${field} must be ${min} to ${max}.`);
  return v;
};
const longText = (v: unknown, field: string, max: number) => text(v, field, max, { min: 1, multiline: true });

export const ASPECT_SIZE: Record<Aspect, { size: string; width: number; height: number; label: string }> = {
  square: { size: "1024x1024", width: 1024, height: 1024, label: "square 1:1" },
  landscape: { size: "1536x1024", width: 1536, height: 1024, label: "landscape 3:2" },
  portrait: { size: "1024x1536", width: 1024, height: 1536, label: "vertical 2:3, for a 9:16 phone frame" },
};
const defaultAspect = (tool: Tool | undefined): Aspect => (tool === "anime" ? "landscape" : "portrait");

function block(v: unknown): ScreenplayBlock {
  if (!isObj(v)) throw new Bad("invalid", "A screenplay passage is not valid.");
  const bid = text(v.id, "A passage id", 40, { min: 1 });
  const t = text(v.text ?? "", "A passage", CAPS.blockText, { multiline: true });
  switch (v.kind) {
    case "heading":
      return { id: bid, kind: "heading", number: typeof v.number === "number" ? Math.max(1, Math.floor(v.number)) : 1, text: t };
    case "camera":
      return {
        id: bid,
        kind: "camera",
        text: t,
        direction: typeof v.direction === "string" ? text(v.direction, "A direction", CAPS.blockText, { multiline: true }) : "",
        prompt: typeof v.prompt === "string" ? text(v.prompt, "A prompt", CAPS.prompt, { multiline: true }) : null,
      };
    case "action":
      return { id: bid, kind: "action", text: t };
    case "dialogue":
      return { id: bid, kind: "dialogue", cue: text(v.cue ?? "", "A cue", 120), text: t };
    default:
      throw new Bad("invalid", "A screenplay passage is not valid.");
  }
}
const blocksOf = (v: unknown) => list(v, "The screenplay", CAPS.blocks, block);

function note(v: unknown): ScreenplayNote {
  if (!isObj(v) || (v.type !== "comment" && v.type !== "suggestion")) throw new Bad("invalid", "A comment is not valid.");
  return {
    id: text(v.id, "A comment id", 40, { min: 1 }),
    block: text(v.block, "A passage id", 40, { min: 1 }),
    type: v.type,
    quote: text(v.quote ?? "", "A quote", CAPS.noteText, { multiline: true }),
    body: text(v.body, "A comment", CAPS.noteText, { min: 1, multiline: true }),
  };
}

/** The screenplay a job works on: the one sent, or the episode's current one. */
async function screenplayFor(episodeId: string, sent: unknown) {
  if (sent !== undefined) return blocksOf(sent);
  const blocks = await currentBlocks(episodeId);
  if (!blocks?.length) throw new Bad("invalid", "Make the screenplay first.");
  return blocks;
}

const json = (v: unknown) => JSON.stringify(v);

function textJob(kind: TextKind, episodeId: string | null, input: string, extra: Partial<TextJobInput> = {}): Prepared {
  const model = textModel();
  const maxOutputTokens = MAX_OUTPUT_TOKENS[kind];
  const chars = input.length + instructionsFor(kind).length;
  return { kind, episodeId, input: { type: "text", model, input, maxOutputTokens, ...extra }, estimateUsd: textEstimate(model, chars, maxOutputTokens) };
}

/** The source for a storyboard or manga plan: an episode's screenplay, a saved record's source, or sent text. */
async function planSource(v: Record<string, unknown>, recordTable: "storyboards" | "mangas", recordField: "storyboardId" | "mangaId") {
  if (v.episodeId !== undefined) {
    const episodeId = checkId(v.episodeId, "The episode");
    const blocks = await screenplayFor(episodeId, v.blocks);
    return { episodeId, source: `SCREENPLAY (JSON passages):\n${json(blocks)}` };
  }
  if (v[recordField] !== undefined) {
    const rec = await getStore().get(recordTable, checkId(v[recordField], "That record"));
    if (!rec) throw new Bad("not_found", "That is not there any more.", 404);
    return { episodeId: null, source: `SOURCE TEXT:\n<<<\n${rec.source.slice(0, CAPS.source)}\n>>>` };
  }
  return { episodeId: null, source: `SOURCE TEXT:\n<<<\n${longText(v.source, "The source", CAPS.source)}\n>>>` };
}

/* ---------- prepare ---------- */

export async function prepare(body: Record<string, unknown>, owner: string): Promise<Prepared> {
  const kind = body.kind as CreateJobRequest["kind"];
  const v = body.input;
  if (!isObj(v)) throw new Bad("invalid", "Say what to generate.");
  switch (kind) {
    case "screenplay": {
      const episodeId = checkId(v.episodeId, "The episode");
      const ep = await loadEpisode(episodeId);
      const script = v.script !== undefined ? longText(v.script, "The script", CAPS.script) : ep.script?.text?.trim();
      if (!script) throw new Bad("invalid", "Add the script first.");
      if (script.length > CAPS.script) throw new Bad("too_large", "The script is too long to adapt in one go. Split it into parts.", 413);
      const a = opt(v.aspect, aspect) ?? defaultAspect(ep.series?.tool);
      const head = [`ASPECT: ${ASPECT_SIZE[a].label}`, ep.series ? `SERIES: ${ep.series.title} (${ep.series.tool})` : `SERIES: ${ep.episode.seriesId}`, `EPISODE: ${ep.episode.number}`];
      return textJob("screenplay", episodeId, `${head.join("\n")}\n\nSCRIPT:\n<<<\n${script}\n>>>`, { aspect: a });
    }
    case "revise": {
      const episodeId = checkId(v.episodeId, "The episode");
      const ep = await loadEpisode(episodeId);
      const blocks = await screenplayFor(episodeId, v.blocks);
      const notes = v.notes !== undefined ? list(v.notes, "The comments", CAPS.notes, note) : (ep.screenplay?.notes ?? []);
      if (!notes.length) throw new Bad("invalid", "Add a comment first.");
      return textJob("revise", episodeId, `SCREENPLAY (JSON passages):\n${json(blocks)}\n\nNOTES (JSON):\n${json(notes)}`);
    }
    case "match-cast": {
      const episodeId = checkId(v.episodeId, "The episode");
      const ep = await loadEpisode(episodeId);
      const seriesId = v.seriesId !== undefined ? checkId(v.seriesId, "The series") : ep.episode.seriesId;
      const blocks = await screenplayFor(episodeId, v.blocks);
      const sheets = await seriesSheets(seriesId);
      const listed = sheets.map(({ id, character, variant, tag }) => ({ id, character, variant, tag }));
      return textJob("match-cast", episodeId, `EPISODE: ${ep.episode.number}\n\nCAST SHEETS (JSON):\n${json(listed)}\n\nSCREENPLAY (JSON passages):\n${json(blocks)}`, {
        sheetIds: sheets.map((s) => s.id),
      });
    }
    case "storyboard": {
      const { episodeId, source } = await planSource(v, "storyboards", "storyboardId");
      const max = opt(v.maxFrames, count("The number of frames", 1, 60)) ?? 24;
      const a = opt(v.aspect, aspect) ?? "landscape";
      return textJob("storyboard", episodeId, `MAXIMUM FRAMES: ${max}\nASPECT: ${ASPECT_SIZE[a].label}\n\n${source}`, { aspect: a });
    }
    case "manga": {
      const { episodeId, source } = await planSource(v, "mangas", "mangaId");
      const max = opt(v.maxPages, count("The number of pages", 1, 24)) ?? 12;
      const dir = opt(v.readingDirection, oneOf("The reading direction", ["rtl", "ltr"] as const)) ?? "rtl";
      return textJob("manga", episodeId, `MAXIMUM PAGES: ${max}\nREADING DIRECTION: ${dir}\n\n${source}`, { readingDirection: dir });
    }
    case "prompts":
      return preparePrompts(v, owner);
    case "image":
      return prepareImage(v);
    case "clip":
      throw new Bad("not_available", "Video generation is not available.", 501);
    default:
      throw new Bad("invalid", "That kind of generation is not known.");
  }
}

async function preparePrompts(v: Record<string, unknown>, owner: string): Promise<Prepared> {
  const medium = oneOf("The medium", ["storyboard", "manga", "clip"] as const)(v.medium);
  const episodeId = opt(v.episodeId, (x) => checkId(x, "The episode")) ?? null;
  const ep = episodeId ? await loadEpisode(episodeId) : null;
  const seriesId = opt(v.seriesId, (x) => checkId(x, "The series")) ?? ep?.episode.seriesId ?? null;

  let items: unknown[];
  if (medium === "clip") {
    if (!episodeId) throw new Bad("invalid", "Say which episode.");
    const blocks = await screenplayFor(episodeId, v.blocks);
    // Each shot with the passages it covers, up to the next shot or scene.
    const shots: { itemId: string; scene: string; shot: ScreenplayBlock; covers: ScreenplayBlock[] }[] = [];
    let scene = "";
    for (const b of blocks) {
      if (b.kind === "heading") scene = b.text;
      else if (b.kind === "camera") shots.push({ itemId: b.id, scene, shot: b, covers: [] });
      else shots.at(-1)?.covers.push(b);
    }
    items = shots;
  } else {
    const field = medium === "storyboard" ? "frames" : "pages";
    if (v[field] !== undefined) {
      items = list(v[field], `The ${field}`, CAPS.items, (x) => {
        if (!isObj(x)) throw new Bad("invalid", `The ${field} are not valid.`);
        return x;
      });
      if (json(items).length > 400_000) throw new Bad("too_large", `The ${field} are too long.`, 413);
    } else {
      const plan = await finishedJob(medium, episodeId ?? undefined, opt(v.planJobId, (x) => checkId(x, "The plan")), owner);
      if (!plan) throw new Bad("invalid", medium === "storyboard" ? "Plan the storyboard first." : "Plan the pages first.");
      const result = plan.result as { frames?: StoryboardFrame[]; pages?: MangaPagePlan[] };
      items = (medium === "storyboard" ? result.frames : result.pages) ?? [];
    }
    items = items.map((x, i) => ({ itemId: `${medium === "storyboard" ? "frame" : "page"}-${(x as { number?: number }).number ?? i + 1}`, ...(x as object) }));
  }
  if (!items.length) throw new Bad("invalid", "There is nothing to write prompts for.");
  if (items.length > CAPS.items) throw new Bad("too_large", `Write prompts for at most ${CAPS.items} at a time.`, 413);

  const match = await finishedJob("match-cast", episodeId ?? undefined, opt(v.matchJobId, (x) => checkId(x, "The cast match")), owner);
  const sheets: SheetRef[] = seriesId ? await seriesSheets(seriesId) : [];
  const style = [styleText(opt(v.styleSlug, (x) => text(x, "The style", 80)) ?? ep?.choices?.style ?? ep?.series?.style), opt(v.styleGuide, (x) => longText(x, "The style guide", CAPS.styleGuide)) ?? ""]
    .filter(Boolean)
    .join("\n\n");
  const a = opt(v.aspect, aspect) ?? (medium === "storyboard" ? "landscape" : medium === "manga" ? "portrait" : defaultAspect(ep?.series?.tool));

  const input = [
    `MEDIUM: ${medium === "clip" ? "video clips" : medium === "manga" ? "manga pages" : "storyboard frames"}`,
    `ASPECT: ${ASPECT_SIZE[a].label}`,
    `STYLE GUIDE:\n${style || "(none chosen: keep rendering neutral and say so in issues)"}`,
    `CAST SHEETS (JSON):\n${json(sheets.map(({ id, character, variant, tag }) => ({ id, character, variant, tag })))}`,
    `CAST MATCHES (JSON):\n${match ? json((match.result as MatchCastResult).matches) : "(none yet)"}`,
    `ITEMS (JSON):\n${json(items)}`,
  ].join("\n\n");
  return textJob("prompts", episodeId, input, { sheetIds: sheets.map((s) => s.id), aspect: a });
}

const QUALITIES = ["low", "medium", "high"] as const;
const PURPOSES = ["storyboard-frame", "manga-page", "cast-sheet"] as const;

async function prepareImage(v: Record<string, unknown>): Promise<Prepared> {
  const purpose = oneOf("The purpose", PURPOSES)(v.purpose);
  const prompt = longText(v.prompt, "The prompt", CAPS.prompt);
  const quality = opt(v.quality, oneOf("The quality", QUALITIES)) ?? "medium";
  const a = opt(v.aspect, aspect) ?? (purpose === "storyboard-frame" ? "landscape" : purpose === "manga-page" ? "portrait" : "landscape");
  const episodeId = opt(v.episodeId, (x) => checkId(x, "The episode")) ?? null;
  const seriesId = opt(v.seriesId, (x) => checkId(x, "The series")) ?? (episodeId ? (await loadEpisode(episodeId)).episode.seriesId : null);
  const wanted = v.references === undefined ? [] : list(v.references, "The references", CAPS.references, (x) => text(x, "A reference", 80, { min: 1 }));

  // Each reference must be a sheet of this series, or an uploaded sheet found by its id.
  const store = getStore();
  const builtIn = new Map((seriesId ? await seriesSheets(seriesId) : []).map((s) => [s.id, s]));
  const references: ImageJobInput["references"] = [];
  const skipped: string[] = [];
  for (const ref of [...new Set(wanted)]) {
    const uploaded = await store.get("cast_sheets", ref).catch(() => null);
    if (uploaded) {
      references.push({ id: ref, tag: uploaded.tag, file: uploaded.image });
      continue;
    }
    const sheet = builtIn.get(ref);
    const src = sheet?.builtIn ? startingCast[seriesId!]?.sheets.find((s) => s.id === ref)?.src : undefined;
    if (sheet && src) references.push({ id: ref, tag: sheet.tag, src });
    else skipped.push(ref);
  }

  let castSheet: ImageJobInput["castSheet"] = null;
  if (v.castSheet !== undefined) {
    if (purpose !== "cast-sheet" || !isObj(v.castSheet)) throw new Bad("invalid", "Only a cast sheet can be saved to the cast.");
    const character = text(v.castSheet.character, "The name", 80, { min: 1 });
    const tag = opt(v.castSheet.tag, (x) => text(x, "The tag", 80)) ?? `@${character.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
    castSheet = { seriesId: checkId(v.castSheet.seriesId, "The series"), character, variant: opt(v.castSheet.variant, (x) => text(x, "The variant", 80)) ?? null, tag };
  }

  const frame = IMAGE_FRAMES[purpose];
  const dims = ASPECT_SIZE[a];
  const full = `${frame.before}\n\n${prompt}\n\n${frame.after}`;
  const model = imageModel();
  return {
    kind: "image",
    episodeId,
    input: { type: "image", model, purpose, prompt: full, size: dims.size, width: dims.width, height: dims.height, quality, references, skipped, castSheet },
    estimateUsd: imageEstimate(quality, dims.width * dims.height, references.length),
  };
}

/* ---------- finish ---------- */

type Flat = { id: string; kind: string; number: number | null; cue: string | null; text: string; direction: string | null };

function toBlocks(flat: Flat[]): ScreenplayBlock[] {
  return flat.map((b): ScreenplayBlock => {
    switch (b.kind) {
      case "heading":
        return { id: b.id, kind: "heading", number: b.number ?? 1, text: b.text };
      case "camera":
        return { id: b.id, kind: "camera", text: b.text, direction: b.direction ?? "", prompt: null };
      case "dialogue":
        return { id: b.id, kind: "dialogue", cue: b.cue ?? "", text: b.text };
      default:
        return { id: b.id, kind: "action", text: b.text };
    }
  });
}
const textsOf = (blocks: ScreenplayBlock[]) => Object.fromEntries(blocks.map((b) => [b.id, b.text]));

/** The provider's JSON as the kind's result. Sheet ids not offered to the model are dropped, never passed on. */
export function finishText(kind: TextKind, raw: string, input: TextJobInput): unknown {
  const data = JSON.parse(raw);
  const allowed = new Set(input.sheetIds ?? []);
  const keep = (ids: string[]) => ids.filter((x) => allowed.has(x));
  switch (kind) {
    case "screenplay": {
      const blocks = toBlocks(data.blocks);
      return { title: data.title, blocks, texts: textsOf(blocks), issues: data.issues };
    }
    case "revise": {
      const blocks = toBlocks(data.blocks);
      const ids = new Set(blocks.map((b) => b.id));
      return { blocks, texts: textsOf(blocks), changed: (data.changed as string[]).filter((x) => ids.has(x)), removed: data.removed, answered: data.answered };
    }
    case "match-cast": {
      const r = data as MatchCastResult;
      return { ...r, matches: r.matches.map((m) => ({ ...m, sheetIds: keep(m.sheetIds) })) };
    }
    case "storyboard":
      return data;
    case "manga":
      return { readingDirection: input.readingDirection ?? "rtl", ...data };
    case "prompts": {
      const r = data as PromptsResult;
      return { prompts: r.prompts.map((p) => ({ ...p, references: keep(p.references).slice(0, CAPS.references) })) };
    }
  }
}
