/**
 * The creator's rules on top of the store: ids, who made and changed what, episode numbers, and what goes when a
 * series or episode is deleted. Route handlers under app/api/creator call these after checking the session and
 * the input.
 */
import { animeSeriesCards, seriesCards } from "@/lib/labs/maker";
import { dropBytes, loadBytes, saveBytes } from "./bytes";
import { getStore } from "./index";
import { Bad } from "./validate";
import type { CastChoice, CastSheet, Choices, Episode, Manga, Meta, Note, Screenplay, Script, Series, Step, StoredFile, Storyboard, Tool } from "./types";

const BUILT_IN = new Set([...seriesCards, ...animeSeriesCards].map((c) => c.slug));

const hex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, "0")).join("");
const newId = (prefix: string) => `${prefix}-${hex(6)}`;

/** The stamp on a new record, or on a change to an old one: the maker and creation time stay. */
function stamp(by: string, id: string, before?: Meta | null): Meta {
  const now = new Date().toISOString();
  return before ? { id, owner: before.owner, createdAt: before.createdAt, updatedBy: by, updatedAt: now } : { id, owner: by, createdAt: now, updatedBy: by, updatedAt: now };
}

const notFound = (what: string) => new Bad("not_found", `That ${what} is not there any more.`, 404);

/* ---------- Series ---------- */

export async function listAll() {
  const store = getStore();
  const [series, episodes] = await Promise.all([store.list("series"), store.list("episodes")]);
  return { series, episodes };
}

export async function createSeries(by: string, input: { title: string; tool: Tool }) {
  const series: Series = { ...stamp(by, newId("s")), title: input.title, tool: input.tool, style: null, cover: null };
  await getStore().put("series", series);
  return series;
}

export async function updateSeries(by: string, id: string, patch: Partial<Pick<Series, "title" | "style" | "cover">>) {
  const store = getStore();
  const before = await store.get("series", id);
  if (!before) throw notFound("series");
  const series: Series = { ...before, ...patch, ...stamp(by, id, before) };
  await store.put("series", series);
  return series;
}

export async function deleteSeries(id: string) {
  const store = getStore();
  if (!(await store.get("series", id))) throw notFound("series");
  for (const ep of await store.list("episodes", id)) await deleteEpisode(ep.id);
  const sheets = await store.list("cast_sheets", id);
  await removeFiles(sheets.map((s) => s.image));
  await store.remove("cast_sheets", sheets.map((s) => s.id));
  await store.remove("series", [id]);
}

/** A built-in series' slug, or a saved series. Anything else is refused. */
async function assertSeries(id: string) {
  if (BUILT_IN.has(id)) return;
  if (!(await getStore().get("series", id))) throw notFound("series");
}

/* ---------- Episodes ---------- */

/**
 * The next episode of a series. The client says which number it would show (built-in series start past their
 * own episodes); the server never gives a number already saved.
 */
export async function createEpisode(by: string, seriesId: string, wanted: number) {
  await assertSeries(seriesId);
  const store = getStore();
  const taken = (await store.list("episodes", seriesId)).map((e) => e.number);
  const number = Math.max(wanted, ...taken.map((n) => n + 1), 1);
  const episode: Episode = { ...stamp(by, newId("e")), seriesId, number, title: `Episode ${number}`, step: "script" };
  await store.put("episodes", episode);
  return episode;
}

export async function getEpisode(id: string) {
  const store = getStore();
  const episode = await store.get("episodes", id);
  if (!episode) throw notFound("episode");
  const [script, screenplay, choices] = await Promise.all([store.get("scripts", id), store.get("screenplays", id), store.get("choices", id)]);
  return { episode, script, screenplay, choices };
}

export async function updateEpisode(by: string, id: string, patch: { step?: Step }) {
  const store = getStore();
  const before = await store.get("episodes", id);
  if (!before) throw notFound("episode");
  const episode: Episode = { ...before, ...patch, ...stamp(by, id, before) };
  await store.put("episodes", episode);
  return episode;
}

export async function deleteEpisode(id: string) {
  const store = getStore();
  const script = await store.get("scripts", id);
  if (script?.file) await removeFiles([script.file]);
  await store.remove("scripts", [id]);
  await store.remove("screenplays", [id]);
  await store.remove("choices", [id]);
  await store.remove("episodes", [id]);
}

async function episodeOrThrow(id: string) {
  const episode = await getStore().get("episodes", id);
  if (!episode) throw notFound("episode");
  return episode;
}

/* ---------- Files ---------- */

export type Upload = { name: string; type: string; bytes: Uint8Array };

async function storeFile(by: string, upload: Upload) {
  const key = hex(12);
  const location = await saveBytes(key, upload.type, upload.bytes);
  const file: StoredFile = { key, name: upload.name, type: upload.type, size: upload.bytes.byteLength, location, owner: by, createdAt: new Date().toISOString() };
  await getStore().putFile(file);
  return file;
}

export async function getFile(key: string) {
  const file = await getStore().getFile(key);
  if (!file) return null;
  const bytes = await loadBytes(file.location);
  return bytes ? { file, bytes } : null;
}

/** Drops the records first, then the bytes they pointed at. */
async function removeFiles(keys: string[]) {
  const gone = await getStore().removeFiles(keys.filter(Boolean));
  await dropBytes(gone.map((f) => f.location));
}

/* ---------- Script, screenplay, choices ---------- */

/** The pasted text, and the uploaded file stored as it came. Without a new file the old one stays, unless `clearFile`. */
export async function saveScript(by: string, episodeId: string, input: { text: string; file?: Upload; clearFile?: boolean }) {
  await episodeOrThrow(episodeId);
  const store = getStore();
  const before = await store.get("scripts", episodeId);
  let file = before?.file ?? null;
  let fileName = before?.fileName ?? null;
  if (input.file || input.clearFile) {
    if (file) await removeFiles([file]);
    file = null;
    fileName = null;
  }
  if (input.file) {
    const stored = await storeFile(by, input.file);
    file = stored.key;
    fileName = stored.name;
  }
  const script: Script = { ...stamp(by, episodeId, before), episodeId, text: input.text, fileName, file };
  await store.put("scripts", script);
  return script;
}

export async function saveScreenplay(by: string, episodeId: string, input: { texts: Record<string, string>; notes: Note[]; changed: string[] }) {
  await episodeOrThrow(episodeId);
  const store = getStore();
  const before = await store.get("screenplays", episodeId);
  const screenplay: Screenplay = { ...stamp(by, episodeId, before), episodeId, ...input };
  await store.put("screenplays", screenplay);
  return screenplay;
}

/** Fields left out keep what was saved before. */
export async function saveChoices(by: string, episodeId: string, input: { cast?: CastChoice[]; style?: string | null; references?: string[] }) {
  await episodeOrThrow(episodeId);
  const store = getStore();
  const before = await store.get("choices", episodeId);
  const choices: Choices = {
    ...stamp(by, episodeId, before),
    episodeId,
    cast: input.cast ?? before?.cast ?? null,
    style: input.style !== undefined ? input.style : (before?.style ?? null),
    references: input.references ?? before?.references ?? [],
  };
  await store.put("choices", choices);
  return choices;
}

/* ---------- Cast sheets ---------- */

export async function listCast(seriesId: string) {
  return getStore().list("cast_sheets", seriesId);
}

export async function addCast(by: string, input: { seriesId: string; character: string; variant: string | null; tag: string; image: Upload }) {
  await assertSeries(input.seriesId);
  const file = await storeFile(by, input.image);
  const sheet: CastSheet = { ...stamp(by, newId("c")), seriesId: input.seriesId, character: input.character, variant: input.variant, tag: input.tag, image: file.key };
  await getStore().put("cast_sheets", sheet);
  return sheet;
}

export async function updateCast(by: string, id: string, patch: Partial<Pick<CastSheet, "character" | "variant" | "tag">>) {
  const store = getStore();
  const before = await store.get("cast_sheets", id);
  if (!before) throw notFound("cast sheet");
  const sheet: CastSheet = { ...before, ...patch, ...stamp(by, id, before) };
  await store.put("cast_sheets", sheet);
  return sheet;
}

export async function deleteCast(id: string) {
  const store = getStore();
  const before = await store.get("cast_sheets", id);
  if (!before) throw notFound("cast sheet");
  await removeFiles([before.image]);
  await store.remove("cast_sheets", [id]);
}

/* ---------- Storyboards and mangas ---------- */

/** Fields a storyboard save may change. Fields left out keep what was saved. */
export type StoryboardPatch = Partial<Pick<Storyboard, "title" | "source" | "style" | "frames" | "step">>;
export type MangaPatch = Partial<Pick<Manga, "title" | "source" | "style" | "pageCount" | "pages" | "step">>;

export const listStoryboards = () => getStore().list("storyboards");

export async function createStoryboard(by: string, input: { title: string; source: string }) {
  const board: Storyboard = { ...stamp(by, newId("b")), title: input.title, source: input.source, style: null, frames: [], step: "scene" };
  await getStore().put("storyboards", board);
  return board;
}

export async function getStoryboard(id: string) {
  const board = await getStore().get("storyboards", id);
  if (!board) throw notFound("storyboard");
  return board;
}

export async function updateStoryboard(by: string, id: string, patch: StoryboardPatch) {
  const before = await getStoryboard(id);
  const board: Storyboard = { ...before, ...patch, ...stamp(by, id, before) };
  await getStore().put("storyboards", board);
  return board;
}

export async function deleteStoryboard(id: string) {
  await getStoryboard(id);
  await getStore().remove("storyboards", [id]);
}

export const listMangas = () => getStore().list("mangas");

export async function createManga(by: string, input: { title: string; source: string }) {
  const manga: Manga = { ...stamp(by, newId("m")), title: input.title, source: input.source, style: null, pageCount: 4, pages: [], step: "story" };
  await getStore().put("mangas", manga);
  return manga;
}

export async function getManga(id: string) {
  const manga = await getStore().get("mangas", id);
  if (!manga) throw notFound("manga");
  return manga;
}

export async function updateManga(by: string, id: string, patch: MangaPatch) {
  const before = await getManga(id);
  const manga: Manga = { ...before, ...patch, ...stamp(by, id, before) };
  await getStore().put("mangas", manga);
  return manga;
}

export async function deleteManga(id: string) {
  await getManga(id);
  await getStore().remove("mangas", [id]);
}
