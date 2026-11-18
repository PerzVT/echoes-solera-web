/** The creator's calls to its own API (app/api/creator). Every failure becomes a SaveError with a plain message. */
import type { NotionImportCastResult, NotionImportScriptResult, NotionSearchResult, NotionStatus } from "@/lib/labs/ai/contract";
import type { CastChoice, CastSheet, Choices, Episode, Frame, Manga, MangaLetter, MangaPage, MangaStep, Note, Screenplay, Script, Series, Step, Storyboard, StoryboardStep, Tool } from "@/lib/labs/store/types";

export type { CastChoice, CastSheet, Episode, Frame, Manga, MangaLetter, MangaPage, MangaStep, Series, Step, Storyboard, StoryboardStep };
export type StoryboardPatch = Partial<Pick<Storyboard, "title" | "source" | "style" | "frames" | "step">>;
export type MangaPatch = Partial<Pick<Manga, "title" | "source" | "style" | "pageCount" | "pages" | "step">>;
export type EpisodeDetail = { episode: Episode; script: Script | null; screenplay: Screenplay | null; choices: Choices | null };

export class SaveError extends Error {}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", ...init });
  } catch {
    throw new SaveError("That did not save. Check the connection and try again.");
  }
  const data = (await res.json().catch(() => null)) as (T & { message?: string }) | null;
  if (!res.ok || !data) {
    if (res.status === 401) throw new SaveError("You are signed out. Sign in again to save.");
    throw new SaveError(data?.message ?? "That did not save. Try again.");
  }
  return data;
}

const json = (method: string, body: unknown): RequestInit => ({ method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export const fileUrl = (key: string) => `/api/creator/files/${key}`;

export const api = {
  listAll: () => call<{ series: Series[]; episodes: Episode[] }>("/api/creator/series"),
  createSeries: (title: string, tool: Tool = "mini-series") => call<{ series: Series }>("/api/creator/series", json("POST", { title, tool })).then((d) => d.series),
  patchSeries: (id: string, patch: { title?: string; style?: string | null; cover?: string | null }) =>
    call<{ series: Series }>(`/api/creator/series/${id}`, json("PATCH", patch)).then((d) => d.series),
  deleteSeries: (id: string, keepalive = false) => call(`/api/creator/series/${id}`, { method: "DELETE", keepalive }),

  createEpisode: (seriesId: string, number: number) => call<{ episode: Episode }>("/api/creator/episodes", json("POST", { seriesId, number })).then((d) => d.episode),
  getEpisode: (id: string) => call<EpisodeDetail>(`/api/creator/episodes/${id}`),
  patchEpisode: (id: string, step: Step) => call<{ episode: Episode }>(`/api/creator/episodes/${id}`, json("PATCH", { step })).then((d) => d.episode),
  deleteEpisode: (id: string, keepalive = false) => call(`/api/creator/episodes/${id}`, { method: "DELETE", keepalive }),

  saveScript: (id: string, text: string, file: File | null, clearFile: boolean) => {
    const form = new FormData();
    form.set("text", text);
    if (file) form.set("file", file);
    if (clearFile) form.set("clearFile", "1");
    return call<{ script: Script }>(`/api/creator/episodes/${id}/script`, { method: "PUT", body: form }).then((d) => d.script);
  },
  saveScreenplay: (id: string, body: { texts: Record<string, string>; notes: Note[]; changed: string[] }) =>
    call<{ screenplay: Screenplay }>(`/api/creator/episodes/${id}/screenplay`, json("PUT", body)),
  saveChoices: (id: string, body: { cast?: CastChoice[]; style?: string | null; references?: string[] }) => call<{ choices: Choices }>(`/api/creator/episodes/${id}/choices`, json("PUT", body)),

  listCast: (seriesId: string) => call<{ sheets: CastSheet[] }>(`/api/creator/cast?series=${encodeURIComponent(seriesId)}`).then((d) => d.sheets),
  addCast: (seriesId: string, character: string, tag: string, image: File) => {
    const form = new FormData();
    form.set("seriesId", seriesId);
    form.set("character", character);
    if (tag) form.set("tag", tag);
    form.set("image", image);
    return call<{ sheet: CastSheet }>("/api/creator/cast", { method: "POST", body: form }).then((d) => d.sheet);
  },
  patchCast: (id: string, patch: { character?: string; tag?: string }) => call<{ sheet: CastSheet }>(`/api/creator/cast/${id}`, json("PATCH", patch)).then((d) => d.sheet),
  deleteCast: (id: string) => call(`/api/creator/cast/${id}`, { method: "DELETE" }),

  listStoryboards: () => call<{ storyboards: Storyboard[] }>("/api/creator/storyboards").then((d) => d.storyboards),
  createStoryboard: (title: string, source: string) => call<{ storyboard: Storyboard }>("/api/creator/storyboards", json("POST", { title, source })).then((d) => d.storyboard),
  getStoryboard: (id: string) => call<{ storyboard: Storyboard }>(`/api/creator/storyboards/${id}`).then((d) => d.storyboard),
  saveStoryboard: (id: string, patch: StoryboardPatch) => call<{ storyboard: Storyboard }>(`/api/creator/storyboards/${id}`, json("PUT", patch)).then((d) => d.storyboard),
  deleteStoryboard: (id: string, keepalive = false) => call(`/api/creator/storyboards/${id}`, { method: "DELETE", keepalive }),

  listMangas: () => call<{ mangas: Manga[] }>("/api/creator/mangas").then((d) => d.mangas),
  createManga: (title: string, source: string) => call<{ manga: Manga }>("/api/creator/mangas", json("POST", { title, source })).then((d) => d.manga),
  getManga: (id: string) => call<{ manga: Manga }>(`/api/creator/mangas/${id}`).then((d) => d.manga),
  saveManga: (id: string, patch: MangaPatch) => call<{ manga: Manga }>(`/api/creator/mangas/${id}`, json("PUT", patch)).then((d) => d.manga),
  deleteManga: (id: string, keepalive = false) => call(`/api/creator/mangas/${id}`, { method: "DELETE", keepalive }),

  notionStatus: () => {
    notionRead ??= call<NotionStatus>("/api/creator/notion/status").catch((e) => {
      notionRead = null;
      throw e;
    });
    return notionRead;
  },
  /** What the Notion connection can see: a search, or the pages of one database (`inDb`). */
  notionSearch: (q: string, inDb: string | null, cursor: string | null) => {
    const p = new URLSearchParams();
    if (inDb) p.set("in", inDb);
    else if (q.trim()) p.set("q", q.trim());
    if (cursor) p.set("cursor", cursor);
    return call<NotionSearchResult>(`/api/creator/notion/search?${p}`);
  },
  notionImportScript: (pageId: string, episodeId: string) => call<NotionImportScriptResult>("/api/creator/notion/import/script", json("POST", { pageId, episodeId })),
  notionImportCast: (seriesId: string, pageIds: string[]) => call<NotionImportCastResult>("/api/creator/notion/import/cast", json("POST", { seriesId, pageIds })),
};

/** The Notion connection's state, read once per visit: it changes only when the site's settings do. */
let notionRead: Promise<NotionStatus> | null = null;
