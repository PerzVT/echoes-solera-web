"use client";

/**
 * Test mode's generators (components/labs/app/testMode.ts). Each answers in the same shape as its real counterpart
 * in generate.ts, after a short wait, with fixed art already in public/labs: frames and pages arrive one by one
 * and clips finish in turn, as they would for real. Nothing here calls the server's generators, so nothing is
 * charged. Everything made is marked `test` in its record, with the prompt it would have been made from.
 */
import type { Block, CastSheet as BuiltInSheet, Note, Take } from "@/lib/labs/maker";
import type { Frame, Made, MangaLetter, MangaPage } from "@/lib/labs/store/types";
import { releasedVideos } from "@/components/labs/gen/data";
import type { Element } from "./creator";
import { parseScript, type Gen } from "./script";
import { PROFILES, type FlowTool } from "./tools";

let n = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-t${++n}`;
const abortError = () => new DOMException("The generation was stopped.", "AbortError");

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

/** Who is signed in, for the record of test work (real work names its job's owner). Read once per visit. */
let me: Promise<string | undefined> | null = null;
const whoAmI = () =>
  (me ??= fetch("/api/auth/me")
    .then((r) => r.json())
    .then((d: { name?: string; email?: string }) => d.name ?? d.email)
    .catch(() => undefined));

/** The record of one piece of test work. */
export async function testMade(prompt: string): Promise<Made> {
  const by = await whoAmI();
  return { test: true, at: new Date().toISOString(), prompt, ...(by ? { by } : {}) };
}

/* ---------- Art ---------- */

const A = "/labs/anime";
const S = `${A}/catalyst-stills`;
const M = `${A}/montage`;
const G = "/labs/manga/golden-ticket";
const E = "/labs/mini-series/second-chance/episodes";

/** Stills a test storyboard is drawn with, each with the shot it shows. */
const STILLS: { image: string; shot: string }[] = [
  { image: `${S}/storefront-dusk.webp`, shot: "Wide" },
  { image: `${A}/catalyst-hero.webp`, shot: "Insert" },
  { image: `${A}/catalyst-shop.webp`, shot: "Medium" },
  { image: `${A}/catalyst-shop-v2.webp`, shot: "Close" },
  { image: `${S}/ticket-close.webp`, shot: "Extreme close" },
  { image: `${S}/nova-ticket-shop.webp`, shot: "Close" },
  { image: `${S}/nova-vr-case.webp`, shot: "Medium" },
  { image: `${A}/catalyst-rain.webp`, shot: "Wide" },
  { image: `${A}/catalyst.webp`, shot: "Wide" },
  { image: `${S}/nova-under-tree.webp`, shot: "Medium" },
  { image: `${M}/catalyst-aisle.webp`, shot: "Over the shoulder" },
  { image: `${M}/catalyst-night.webp`, shot: "Medium" },
];

/** The three Golden Ticket pages: wordless art, a redraw of each, and the lettering set over them. */
const PAGES: { image: string; redraw: string; alt: string; letters: MangaLetter[] }[] = [
  {
    image: `${G}/page-1.webp`,
    redraw: `${G}/page-1-v2.webp`,
    alt: "A small retro game shop. Nova flips through a bin of old cartridges, pulls out one with a worn label and looks at it.",
    letters: [
      { kind: "narration", text: "The game shop by the station. Nothing new in years.", x: 2.5, y: 2.4, w: 30 },
      { kind: "speech", text: "Played it. Played it. Never heard of it.", x: 3, y: 31.4, w: 34, tail: { at: 80, flip: true } },
      { kind: "sfx", text: "shff", x: 5, y: 52.5, rotate: -10 },
      { kind: "speech", text: "No label at all?", x: 51.5, y: 63.8, w: 24, tail: { at: 70, flip: true } },
    ],
  },
  {
    image: `${G}/page-2.webp`,
    redraw: `${G}/page-2-v2.webp`,
    alt: "She prises the cartridge open. A thin metal ticket slides out into her palm, and she holds it up to the shop light.",
    letters: [
      { kind: "speech", text: "It opens?", x: 2, y: 1.6, w: 17, tail: { at: 62 } },
      { kind: "sfx", text: "klik", x: 25, y: 30, rotate: -8, scale: 0.85 },
      { kind: "narration", text: "Inside, a metal ticket. No name. Just a code.", x: 2, y: 37.3, w: 34 },
      { kind: "speech", text: "Who hides a code inside a game?", x: 34, y: 64.4, w: 28, tail: { at: 75, flip: true } },
    ],
  },
  {
    image: `${G}/page-3.webp`,
    redraw: `${G}/page-3-v2.webp`,
    alt: "Outside in the rain, Nova scans the ticket with her phone. Light bursts and the shop front warps behind her.",
    letters: [
      { kind: "narration", text: "Outside, it had started to rain.", x: 64, y: 1.4, w: 33 },
      { kind: "speech", text: "One scan. Just to see.", x: 37, y: 1.6, w: 25, tail: { at: 15 } },
      { kind: "speech", text: "Wait! The shop!", x: 52, y: 66.5, w: 22, tail: { at: 10 } },
      { kind: "sfx", text: "VWOOOM", x: 50, y: 88, rotate: -12, scale: 1.4 },
    ],
  },
];

const clip = (base: string, name: string): Take => ({ name, src: `${base}.mp4`, poster: `${base}.webp` });
/** Clips a retake lands on, in turn, per tool. */
const RETAKES: Record<FlowTool, string[]> = {
  "mini-series": [`${E}/ep-03`, `${E}/ep-04`, `${E}/2`],
  anime: [`${A}/catalyst-rain-v2`, `${M}/catalyst-card`, `${M}/catalyst-tree`],
};

/* ---------- Words ---------- */

/** A scene's passages: actions and lines, or its sentences when it has no script layout. */
function passagesOf(source: string): string[] {
  const blocks = parseScript(source).filter((b): b is Extract<Block, { kind: "action" | "dialogue" }> => b.kind === "action" || b.kind === "dialogue");
  const lines = blocks.map((b) => (b.kind === "dialogue" ? `${b.cue}: ${b.text}` : b.text));
  if (lines.length >= 3) return lines;
  const sentences = source
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length > lines.length ? sentences : lines;
}

const DEMO_SCENE = [
  "The Restart sign glows under a darkening sky.",
  "A bargain bin of old handhelds. Nova leans in.",
  "She finds a VR case on the shelf and reads it.",
  "She lifts the case closer and frowns.",
  "A gold ticket slides out of the case.",
  "Nova holds the ticket up beside her face.",
  "She looks to the counter. Nine is watching her.",
  "Rain sheets across the empty lot. Nova runs for the tree.",
];

const words = (t: string, count: number) => {
  const w = t.split(/\s+/).filter(Boolean);
  return w.length > count ? `${w.slice(0, count).join(" ")}...` : w.join(" ");
};

const styleName = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

/* ---------- Episodes ---------- */

/** Screenplays made in test mode, kept in this browser by episode so a saved episode opens on them again. */
const SCREENPLAYS = "nine-lives:test-screenplays";
function keptScreenplays(): Record<string, Block[]> {
  try {
    return JSON.parse(localStorage.getItem(SCREENPLAYS) ?? "{}") as Record<string, Block[]>;
  } catch {
    return {};
  }
}
export function keptScreenplay(episodeId: string): Block[] | undefined {
  return keptScreenplays()[episodeId];
}
function keepScreenplay(episodeId: string | undefined, blocks: Block[]) {
  if (!episodeId) return;
  try {
    const all = keptScreenplays();
    all[episodeId] = blocks;
    localStorage.setItem(SCREENPLAYS, JSON.stringify(all));
  } catch {}
}

export async function screenplay(tool: FlowTool, source: string, episodeId: string | undefined, signal?: AbortSignal) {
  await wait(1100, signal);
  const read = source.trim() ? parseScript(source) : [];
  const blocks = read.some((b) => b.kind !== "heading") ? read : PROFILES[tool].demo;
  keepScreenplay(episodeId, blocks);
  return { blocks };
}

export async function revise(blocks: Block[], texts: Record<string, string>, notes: Note[], episodeId: string | undefined, signal?: AbortSignal) {
  await wait(1800, signal);
  const next: Record<string, string> = {};
  for (const b of blocks) if (b.kind === "action" || b.kind === "dialogue") next[b.id] = texts[b.id] ?? b.text;
  const changed = new Set<string>();
  for (const note of notes) {
    const was = next[note.block];
    if (was === undefined) continue;
    if (note.type === "suggestion") next[note.block] = was.includes(note.quote) && note.quote ? was.replace(note.quote, note.body) : note.body;
    else {
      const b = blocks.find((x) => x.id === note.block);
      if (b && (b.kind === "action" || b.kind === "dialogue") && b.rewrite !== was) next[note.block] = b.rewrite;
      else next[note.block] = was.replace(/\.?\s*$/, ". Played slower, with a pause before the next beat.");
    }
    changed.add(note.block);
  }
  keepScreenplay(
    episodeId,
    blocks.map((b) => (b.kind === "action" || b.kind === "dialogue" ? { ...b, text: next[b.id] ?? b.text } : b)),
  );
  return { texts: next, changed: [...changed] };
}

/** The screenplay's speakers and places, matched by name to the tool's cast library and its places. */
export async function matchCast(tool: FlowTool, blocks: Block[], sheets: BuiltInSheet[], signal?: AbortSignal): Promise<{ elements: Element[] }> {
  await wait(1200, signal);
  const p = PROFILES[tool];
  const out = new Map<string, Element>();
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  for (const b of blocks) {
    if (b.kind !== "dialogue") continue;
    const name = b.cue.replace(/\([^)]*\)/g, "").trim();
    const key = slug(name);
    if (!key || out.has(key)) continue;
    const pretty = name.charAt(0) + name.slice(1).toLowerCase();
    const sheet = sheets.find((s) => s.character.toLowerCase() === key);
    out.set(key, { id: `character-${key}`, kind: "character", name: pretty, tag: `@${key}`, ...(sheet ? { src: sheet.src, who: sheet.character, variant: sheet.variant } : {}) });
  }
  for (const b of blocks) {
    if (b.kind !== "heading") continue;
    const place = b.text.replace(/^(INT|EXT|I\/E)[./ ]+/i, "").replace(/\s+-\s+.*$/, "").trim();
    const key = slug(place);
    if (!key || key.startsWith("scene") || out.has(key)) continue;
    const match = p.places.find((x) => key.split("_").some((w) => w.length > 3 && x.name.toLowerCase().includes(w)));
    out.set(key, { id: `location-${key}`, kind: "location", name: place.charAt(0) + place.slice(1).toLowerCase(), tag: match?.tag ?? `@${key}`, ...(match ? { src: match.src } : {}) });
  }
  return { elements: out.size ? [...out.values()] : p.elements };
}

/** The generations a screenplay makes: one per shot, or per passage when it has no shots, at most eight. */
export async function clips(blocks: Block[], texts: Record<string, string> = {}, signal?: AbortSignal): Promise<{ gens: Gen[] }> {
  await wait(700, signal);
  const said = (b: Block) => (b.kind === "action" || b.kind === "dialogue" ? (texts[b.id] ?? b.text) : "");
  const shots = blocks.filter((b): b is Extract<Block, { kind: "camera" }> => b.kind === "camera");
  const empty: Take = { name: "Take 1", src: "", poster: "" };
  if (shots.length)
    return {
      gens: shots.slice(0, 8).map((s, i) => {
        const after = blocks.slice(blocks.indexOf(s) + 1).find((b) => b.kind === "action" || b.kind === "dialogue");
        const line = after ? (after.kind === "dialogue" ? `${after.cue}: ${words(said(after), 5)}` : words(said(after), 7)) : "";
        return { n: i + 1, block: s.id, summary: line ? `${s.text}. ${line}` : s.text, takes: [empty], prompt: [s.text, s.direction ?? s.prompt].filter(Boolean).join(". "), references: [] };
      }),
    };
  const passages = blocks.filter((b): b is Extract<Block, { kind: "action" | "dialogue" }> => b.kind === "action" || b.kind === "dialogue").slice(0, 8);
  return {
    gens: passages.map((b, i) => ({
      n: i + 1,
      block: b.id,
      summary: b.kind === "dialogue" ? `${b.cue}: ${words(said(b), 5)}` : words(said(b), 7),
      takes: [empty],
      prompt: b.kind === "dialogue" ? `${b.cue} says: ${said(b)}` : said(b),
      references: [],
    })),
  };
}

/** A generation's first take: the tool's clips in order, each finishing a little after the one before. */
export async function clipTake(tool: FlowTool, gen: Gen, index: number, style: string, signal?: AbortSignal): Promise<Take> {
  await wait(1600 + index * 900, signal);
  const pool = PROFILES[tool].clips;
  const t = pool[index % pool.length];
  const prompt = [gen.prompt ?? gen.summary, style ? `Style: ${styleName(style)}.` : ""].filter(Boolean).join("\n\n");
  return { name: "Take 1", src: t.src, poster: t.poster, made: await testMade(prompt) };
}

export async function retake(tool: FlowTool, gen: Gen, feedback: string, attempt: number, signal?: AbortSignal): Promise<Take> {
  await wait(2400, signal);
  const pool = RETAKES[tool];
  const t = clip(pool[attempt % pool.length], `Take ${gen.takes.filter((x) => x.src || x.poster).length + 1}`);
  return { ...t, made: await testMade(`${gen.prompt ?? gen.summary}\n\nChange for this take: ${feedback.trim()}`) };
}

/* ---------- Cooking ---------- */

export async function cookingTake(recipe: string, chef: string, style: { name: string }, take: number, feedback: string | undefined, signal?: AbortSignal) {
  await wait(2600, signal);
  const own = releasedVideos.find((v) => v.title.toLowerCase() === recipe.toLowerCase());
  const hash = [...`${recipe}${take}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const v = own && take === 0 ? own : releasedVideos[hash % releasedVideos.length];
  const prompt = [`A cooking video in the ${style.name} style. ${chef} cooks ${recipe} in a home kitchen, the dish and her hands in frame.`, feedback?.trim() ? `Change for this take: ${feedback.trim()}` : ""]
    .filter(Boolean)
    .join("\n\n");
  return { video: v.video, poster: v.poster, made: await testMade(prompt) };
}

/* ---------- Storyboard ---------- */

const framePrompt = (note: string, shot: string, style: string) => `${shot} shot, storyboard frame in the ${styleName(style)} style, landscape. ${note}`;

export async function storyboard(source: string, style: string, onFrames: ((f: Frame[]) => void) | undefined, signal?: AbortSignal) {
  await wait(1400, signal);
  const passages = source.trim() ? passagesOf(source).slice(0, STILLS.length) : DEMO_SCENE;
  let frames: Frame[] = passages.map((note, i) => ({ id: newId("f"), title: STILLS[i % STILLS.length].shot, note, image: "" }));
  onFrames?.(frames);
  for (let i = 0; i < frames.length; i++) {
    await wait(i === 0 ? 900 : 550, signal);
    const still = STILLS[i % STILLS.length];
    const made = await testMade(framePrompt(frames[i].note, still.shot, style));
    frames = frames.map((f, j) => (j === i ? { ...f, image: still.image, made } : f));
    onFrames?.(frames);
  }
  return { frames };
}

export async function redrawFrame(frame: Frame, style: string, signal?: AbortSignal) {
  await wait(1600, signal);
  const at = STILLS.findIndex((s) => s.image === frame.image);
  const still = STILLS[(at + 5 + STILLS.length) % STILLS.length];
  return { frame: { ...frame, image: still.image, made: await testMade(framePrompt(frame.note, frame.title || still.shot, style)) } };
}

/* ---------- Manga ---------- */

const pagePrompt = (alt: string, style: string) => `A manga page in the ${styleName(style)} style, portrait, panels with no lettering. ${alt}`;

export async function mangaPages(pageCount: number, style: string, onPages: ((p: MangaPage[]) => void) | undefined, signal?: AbortSignal) {
  await wait(1400, signal);
  let pages: MangaPage[] = Array.from({ length: pageCount }, (_, i) => {
    const p = PAGES[i % PAGES.length];
    return { id: newId("pg"), image: "", alt: p.alt, letters: p.letters.map((l) => ({ ...l, tail: l.tail ? { ...l.tail } : undefined })) };
  });
  onPages?.(pages);
  for (let i = 0; i < pages.length; i++) {
    await wait(i === 0 ? 900 : 600, signal);
    const p = PAGES[i % PAGES.length];
    const image = Math.floor(i / PAGES.length) % 2 ? p.redraw : p.image;
    const made = await testMade(pagePrompt(p.alt, style));
    pages = pages.map((x, j) => (j === i ? { ...x, image, made } : x));
    onPages?.(pages);
  }
  return { pages };
}

export async function redrawPage(page: MangaPage, style: string, signal?: AbortSignal) {
  await wait(1800, signal);
  const p = PAGES.find((x) => x.image === page.image || x.redraw === page.image) ?? PAGES[0];
  const image = page.image === p.image ? p.redraw : p.image;
  return { page: { ...page, image, made: await testMade(pagePrompt(page.alt, style)) } };
}
