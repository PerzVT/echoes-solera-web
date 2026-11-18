/** The creator's calls to its own API (app/api/creator). Every failure becomes a SaveError with a plain message. */
import type { CastChoice, CastSheet, Choices, Episode, Note, Screenplay, Script, Series, Step } from "@/lib/labs/store/types";

export type { CastChoice, CastSheet, Episode, Series, Step };
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
  createSeries: (title: string) => call<{ series: Series }>("/api/creator/series", json("POST", { title, tool: "mini-series" })).then((d) => d.series),
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
};
