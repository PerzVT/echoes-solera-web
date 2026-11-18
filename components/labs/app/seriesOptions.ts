"use client";

/**
 * Every series a storyboard or manga can belong to: the saved ones (newest first) and the built-in mini-series and
 * anime, read once per visit. A new series made from the storyboard or manga start is saved here too.
 */
import { useEffect, useState } from "react";
import { animeSeriesCards, seriesCards } from "@/lib/labs/maker";
import type { Tool } from "@/lib/labs/store/types";
import { api } from "./api";

export type SeriesOption = { id: string; title: string; tool: Tool };

const builtIn: SeriesOption[] = [...seriesCards.map((c) => ({ id: c.slug, title: c.title, tool: "mini-series" as Tool })), ...animeSeriesCards.map((c) => ({ id: c.slug, title: c.title, tool: "anime" as Tool }))];

let saved: SeriesOption[] | null = null;
let reading: Promise<SeriesOption[]> | null = null;
const listeners = new Set<(all: SeriesOption[]) => void>();

const all = () => [...(saved ?? []), ...builtIn];

function read() {
  reading ??= api
    .listAll()
    .then((r) =>
      [...r.series]
        .filter((s) => s.tool !== "cooking")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((s) => ({ id: s.id, title: s.title, tool: s.tool })),
    )
    .catch(() => [] as SeriesOption[])
    .then((list) => {
      saved = list;
      listeners.forEach((l) => l(all()));
      return list;
    });
  return reading;
}

/** The series list; built-in ones at once, saved ones once the server answers. */
export function useSeriesOptions() {
  const [list, setList] = useState<SeriesOption[]>(all);
  useEffect(() => {
    listeners.add(setList);
    void read();
    return () => void listeners.delete(setList);
  }, []);
  return list;
}

/** A series' name by id, or null when it is not known. */
export const seriesTitle = (list: SeriesOption[], id: string | null | undefined) => (id ? (list.find((s) => s.id === id)?.title ?? null) : null);

/** Saves a new series and adds it to the list. Storyboards are kept beside mini-series, mangas beside anime. */
export async function createSeriesOption(title: string, tool: Tool): Promise<SeriesOption> {
  const s = await api.createSeries(title, tool);
  const opt = { id: s.id, title: s.title, tool: s.tool };
  saved = [opt, ...(saved ?? [])];
  listeners.forEach((l) => l(all()));
  return opt;
}
