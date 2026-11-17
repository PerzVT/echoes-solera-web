"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { screenplay, seriesCards, startingCast, type Block, type Note, type SeriesCard, type SeriesCast } from "@/lib/labs/maker";
import { episodesOf, nextEpisodeName, startingElements, type Element, type EpisodeItem } from "./creator";
import { generationsFor, type Gen } from "./script";

/**
 * One episode's own work: its script read into blocks, the comments and edits on it, its cast, style and clip
 * decisions. Held per episode, keyed "<series>/<episode>", so a new episode and an existing one never share it.
 */
type EpisodeData = {
  series: string;
  episode: string;
  /** Not finished yet: Results ends on Finish, which adds it to the Library. A finished episode ends on Done. */
  isNew: boolean;
  /** The name of a series that Finish will create. */
  newSeries?: string;
  /** What was submitted: the typed text, or the name of the file it came from. */
  source: string;
  file?: string;
  blocks: Block[];
  texts?: Record<string, string>;
  notes?: Note[];
  changed?: string[];
  elements?: Element[];
  style?: string;
  gens?: Gen[];
};

type Saved = {
  current: string | null;
  episodes: Record<string, EpisodeData>;
  added: Record<string, EpisodeItem[]>;
  created: SeriesCard[];
  renamed: Record<string, string>;
  deletedSeries: string[];
  deletedEpisodes: string[];
};

type Store = {
  get: (series: string) => SeriesCast;
  /** The series in the Library, in order, with renames applied and deletions left out. */
  series: SeriesCard[];
  seriesTitle: (slug: string) => string;
  /** A series' episodes, with those finished here and without those deleted. */
  episodesIn: (slug: string) => EpisodeItem[];
  /** The episode the flow is working on: the one last submitted or opened. */
  current: string;
  setCurrent: (key: string) => void;
  /** An episode's work, or what it starts with if nothing has been done to it yet. */
  episodeOf: (key: string) => EpisodeData;
  start: (key: string, data: EpisodeData) => void;
  patch: (key: string, p: Partial<EpisodeData>) => void;
  /** Adds the episode to its series, and a card for the series when it is new. */
  finish: (key: string, poster: string) => void;
  renameSeries: (slug: string, title: string) => void;
  deleteSeries: (slug: string, back: boolean) => void;
  deleteEpisode: (key: string, back: boolean) => void;
  /** State a step keeps when the person leaves it and comes back. */
  kept: <T>(key: string) => T | undefined;
  keep: (key: string, value: unknown) => void;
};

const Ctx = createContext<Store | null>(null);
const empty: SeriesCast = { characters: [], sheets: [] };
const STORAGE = "nine-lives:mini-series";
/** The episode a step shows when it is opened directly with nothing submitted: the demo script, not yet finished. */
export const DRAFT = "draft";
export const episodeKey = (series: string, episode: string) => `${series}/${episode}`;

const blank: Saved = { current: null, episodes: {}, added: {}, created: [], renamed: {}, deletedSeries: [], deletedEpisodes: [] };

export function CastProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Saved>(blank);
  // The session is read back from sessionStorage before anything is drawn, so a reload lands on the same work.
  const [ready, setReady] = useState(false);
  const memo = useRef(new Map<string, unknown>());

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSaved({ ...blank, ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(STORAGE, JSON.stringify(saved));
    } catch {}
  }, [saved, ready]);

  const edit = useCallback((fn: (s: Saved) => Saved) => setSaved(fn), []);

  const store = useMemo<Store>(() => {
    const all = [...seriesCards, ...saved.created];
    const series = all.filter((c) => !saved.deletedSeries.includes(c.slug)).map((c) => ({ ...c, title: saved.renamed[c.slug] ?? c.title }));
    const seriesTitle = (slug: string) => saved.renamed[slug] ?? all.find((c) => c.slug === slug)?.title ?? slug;
    const episodesIn = (slug: string) => episodesOf(slug, saved.added[slug]).filter((e) => !saved.deletedEpisodes.includes(episodeKey(slug, e.name)));

    const episodeOf = (key: string): EpisodeData => {
      const had = saved.episodes[key];
      if (had) return had;
      if (key === DRAFT) {
        const s = series[0]?.slug ?? "second-chance";
        return { series: s, episode: nextEpisodeName(episodesIn(s)), isNew: true, source: "", blocks: screenplay };
      }
      // A finished episode from the Library: the demo script, the default cast, every clip approved.
      const at = key.indexOf("/");
      return { series: key.slice(0, at), episode: key.slice(at + 1), isNew: false, source: "", blocks: screenplay, elements: startingElements, gens: generationsFor(screenplay, true) };
    };

    return {
      get: (s) => startingCast[s] ?? empty,
      series,
      seriesTitle,
      episodesIn,
      current: saved.current ?? DRAFT,
      setCurrent: (key) => edit((s) => (s.current === key ? s : { ...s, current: key })),
      episodeOf,
      start: (key, data) => edit((s) => ({ ...s, current: key, episodes: { ...s.episodes, [key]: data } })),
      patch: (key, p) =>
        edit((s) => {
          const base = s.episodes[key] ?? episodeOf(key);
          return { ...s, episodes: { ...s.episodes, [key]: { ...base, ...p } } };
        }),
      finish: (key, poster) => {
        const ep = episodeOf(key);
        const slug = ep.series;
        const done = episodeKey(slug, ep.episode);
        edit((s) => {
          const exists = [...seriesCards, ...s.created].some((c) => c.slug === slug);
          const created = ep.newSeries && !exists ? [...s.created, { slug, title: ep.newSeries, cover: poster }] : s.created;
          const list = s.added[slug] ?? [];
          const added = list.some((x) => x.name === ep.episode) ? s.added : { ...s.added, [slug]: [...list, { name: ep.episode, poster }] };
          // The finished episode keeps its work under its own key; the draft is free again.
          const episodes = { ...s.episodes, [done]: { ...(s.episodes[key] ?? ep), isNew: false, newSeries: undefined } };
          if (key !== done) delete episodes[key];
          return { ...s, created, added, episodes, current: done };
        });
      },
      renameSeries: (slug, title) => edit((s) => ({ ...s, renamed: { ...s.renamed, [slug]: title } })),
      deleteSeries: (slug, back) => edit((s) => ({ ...s, deletedSeries: back ? s.deletedSeries.filter((x) => x !== slug) : [...s.deletedSeries, slug] })),
      deleteEpisode: (key, back) => edit((s) => ({ ...s, deletedEpisodes: back ? s.deletedEpisodes.filter((x) => x !== key) : [...s.deletedEpisodes, key] })),
      kept: <T,>(key: string) => memo.current.get(key) as T | undefined,
      keep: (key, value) => void memo.current.set(key, value),
    };
  }, [saved, edit]);

  return <Ctx.Provider value={store}>{ready ? children : null}</Ctx.Provider>;
}

export function useCast() {
  const store = useContext(Ctx);
  if (!store) throw new Error("useCast needs the CastProvider from app/(labs)/app/layout.tsx");
  return store;
}

/** The episode the flow is on, and a way to change its work. */
export function useEpisode() {
  const store = useCast();
  const key = store.current;
  return { key, ep: store.episodeOf(key), patch: (p: Partial<EpisodeData>) => store.patch(key, p) };
}
