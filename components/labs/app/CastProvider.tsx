"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { clips, screenplay, seriesCards, startingCast, type Block, type Note, type SeriesCard, type SeriesCast } from "@/lib/labs/maker";
import { api, type Episode, type Series, type Step } from "./api";
import { episodesOf, nextEpisodeName, startingElements, type Element, type EpisodeItem } from "./creator";
import { generationsFor, parseScript, type Gen } from "./script";

/**
 * One episode's own work: its script read into blocks, the comments and edits on it, its cast, style and clip
 * decisions. Held per episode, keyed "<series>/<episode>", so a new episode and an existing one never share it.
 * An episode with an `id` is saved: its screenplay, cast and style go to the server as they change.
 */
type EpisodeData = {
  /** The saved episode's id. Without it the episode lives only in this browser tab (the demo draft). */
  id?: string;
  /** The step the saved episode has reached. */
  step?: Step;
  series: string;
  episode: string;
  /** Not finished yet: Results ends on Finish, which adds it to the Library. A finished episode ends on Done. */
  isNew: boolean;
  /** The name of a series that Finish will create. */
  newSeries?: string;
  /** What was submitted: the typed text, or the text read from the file. */
  source: string;
  /** The name of the uploaded script file. */
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
  renamed: Record<string, string>;
  deletedSeries: string[];
  deletedEpisodes: string[];
};

type Remote = { series: Series[]; episodes: Episode[] };

type Store = {
  get: (series: string) => SeriesCast;
  /** The series in the Library, in order: saved ones first, newest first, then the built-in ones. */
  series: SeriesCard[];
  seriesTitle: (slug: string) => string;
  /** A saved series, as opposed to a built-in one. */
  isSaved: (slug: string) => boolean;
  /** A series' episodes, saved and built-in, without those deleted. */
  episodesIn: (slug: string) => EpisodeItem[];
  /** The episode the flow is working on: the one last submitted or opened. */
  current: string;
  setCurrent: (key: string) => void;
  /** An episode's work, or what it starts with if nothing has been done to it yet. */
  episodeOf: (key: string) => EpisodeData;
  start: (key: string, data: EpisodeData) => void;
  patch: (key: string, p: Partial<EpisodeData>) => void;
  /** Saves a new series, when given a title, and a new episode in it. */
  createEpisode: (target: { series: string } | { title: string }) => Promise<Episode>;
  /** Saves the script of a saved episode. */
  saveScript: (id: string, text: string, file: File | null, clearFile: boolean) => Promise<void>;
  /** Loads a saved episode from the server and makes it the current one. Returns the address of its step. */
  openSaved: (id: string) => Promise<string>;
  /** Records that a saved episode has reached a step. */
  reach: (key: string, step: Step) => void;
  /** Sends every change still waiting. Rejects with the first failure; the change stays queued. */
  flush: () => Promise<void>;
  /** Marks the episode finished, and gives a new series its cover. */
  finish: (key: string, poster: string) => Promise<void>;
  renameSeries: (slug: string, title: string) => Promise<void>;
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
export const REACHED = "flow:reached";
export const episodeKey = (series: string, episode: string) => `${series}/${episode}`;

const ORDER: Step[] = ["script", "screenplay", "cast", "style", "results", "done"];
const HREF: Record<Step, string> = {
  script: "/app",
  screenplay: "/app/episode/screenplay",
  cast: "/app/episode/cast",
  style: "/app/episode/style",
  results: "/app/episode/results",
  done: "/app/episode/results",
};
/** A deleted series or episode can be undone for this long before it is deleted on the server. */
const UNDO_MS = 6500;
const SAVE_MS = 700;

const blank: Saved = { current: null, episodes: {}, added: {}, renamed: {}, deletedSeries: [], deletedEpisodes: [] };
const numberOf = (name: string) => Number(/(\d+)$/.exec(name)?.[1] ?? 0);

type Job = { run: () => Promise<unknown>; body: string };

export function CastProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Saved>(blank);
  const savedRef = useRef<Saved>(blank);
  const [remote, setRemote] = useState<Remote>({ series: [], episodes: [] });
  const remoteRef = useRef(remote);
  // The session is read back from sessionStorage before anything is drawn, so a reload lands on the same work.
  const [ready, setReady] = useState(false);
  const memo = useRef(new Map<string, unknown>());

  /* Changes waiting to be sent, one queue per saved thing ("<id>:screenplay"), each run after the last. */
  const jobs = useRef(new Map<string, Job>());
  const timers = useRef(new Map<string, number>());
  const chains = useRef(new Map<string, Promise<unknown>>());
  const inflight = useRef(new Set<Promise<unknown>>());
  const lastSent = useRef(new Map<string, string>());
  const deletions = useRef(new Map<string, { timer: number; run: (keepalive: boolean) => Promise<unknown> }>());

  const edit = useCallback((fn: (s: Saved) => Saved) => {
    savedRef.current = fn(savedRef.current);
    setSaved(savedRef.current);
  }, []);
  const editRemote = useCallback((fn: (r: Remote) => Remote) => {
    remoteRef.current = fn(remoteRef.current);
    setRemote(remoteRef.current);
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE);
      if (raw) {
        savedRef.current = { ...blank, ...JSON.parse(raw) };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSaved(savedRef.current);
      }
    } catch {}
    setReady(true);
    let alive = true;
    // Saved work comes from the server. If it cannot be reached, the built-in series still show.
    api
      .listAll()
      .then((r) => alive && editRemote(() => r))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [editRemote]);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(STORAGE, JSON.stringify(saved));
    } catch {}
  }, [saved, ready]);

  const run = useCallback((name: string) => {
    clearTimeout(timers.current.get(name));
    timers.current.delete(name);
    const job = jobs.current.get(name);
    if (!job) return;
    jobs.current.delete(name);
    const prev = chains.current.get(name) ?? Promise.resolve();
    const p = prev
      .catch(() => {})
      .then(job.run)
      .then(
        () => void lastSent.current.set(name, job.body),
        (e) => {
          // A failed change waits for the next try, unless a newer one has replaced it.
          if (!jobs.current.has(name)) jobs.current.set(name, job);
          throw e;
        },
      );
    chains.current.set(name, p);
    inflight.current.add(p);
    p.then(
      () => inflight.current.delete(p),
      () => inflight.current.delete(p),
    );
    return p;
  }, []);

  const schedule = useCallback(
    (name: string, body: unknown, send: () => Promise<unknown>, wait = SAVE_MS) => {
      const text = JSON.stringify(body);
      if (lastSent.current.get(name) === text && !jobs.current.has(name)) return;
      jobs.current.set(name, { run: send, body: text });
      clearTimeout(timers.current.get(name));
      timers.current.set(
        name,
        window.setTimeout(() => void run(name)?.catch(() => {}), wait),
      );
    },
    [run],
  );

  const flush = useCallback(async () => {
    [...jobs.current.keys()].forEach((n) => void run(n)?.catch(() => {}));
    const results = await Promise.allSettled([...inflight.current]);
    const bad = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
    if (bad) throw bad.reason;
  }, [run]);

  // Leaving the page sends what is waiting, and carries out deletions whose undo time has not run out.
  useEffect(() => {
    const leave = () => {
      [...jobs.current.keys()].forEach((n) => void run(n)?.catch(() => {}));
      for (const [k, d] of deletions.current) {
        clearTimeout(d.timer);
        void d.run(true).catch(() => {});
        deletions.current.delete(k);
      }
    };
    window.addEventListener("pagehide", leave);
    return () => window.removeEventListener("pagehide", leave);
  }, [run]);

  const store = useMemo<Store>(() => {
    const savedSeries = remote.series.filter((s) => s.tool === "mini-series");
    const isSaved = (slug: string) => savedSeries.some((s) => s.id === slug);
    const savedCards: SeriesCard[] = [...savedSeries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((s) => ({ slug: s.id, title: s.title, cover: s.cover ?? "" }));
    const all = [...savedCards, ...seriesCards];
    const series = all.filter((c) => !saved.deletedSeries.includes(c.slug)).map((c) => ({ ...c, title: saved.renamed[c.slug] ?? c.title }));
    const seriesTitle = (slug: string) => saved.renamed[slug] ?? all.find((c) => c.slug === slug)?.title ?? slug;

    const episodesIn = (slug: string) => {
      const savedEps: EpisodeItem[] = remote.episodes
        .filter((e) => e.seriesId === slug)
        .map((e) => ({ name: e.title, id: e.id, step: e.step, poster: e.step === "done" ? clips[0].poster : undefined }));
      const base = isSaved(slug) ? [] : episodesOf(slug, saved.added[slug]);
      const merged = [...base.filter((b) => !savedEps.some((s) => s.name === b.name)), ...savedEps].sort((a, b) => numberOf(a.name) - numberOf(b.name));
      return merged.filter((e) => !saved.deletedEpisodes.includes(episodeKey(slug, e.name)));
    };

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
    const latest = (key: string) => savedRef.current.episodes[key] ?? episodeOf(key);

    const savedEpisodeId = (key: string) => remoteRef.current.episodes.find((e) => episodeKey(e.seriesId, e.title) === key)?.id;

    /** Sends the parts of a saved episode that a change touched. */
    const sendChanges = (next: EpisodeData, p: Partial<EpisodeData>) => {
      const id = next.id;
      if (!id) return;
      if ("texts" in p || "notes" in p || "changed" in p) {
        const body = { texts: next.texts ?? {}, notes: next.notes ?? [], changed: next.changed ?? [] };
        schedule(`${id}:screenplay`, body, () => api.saveScreenplay(id, body));
      }
      if ("elements" in p || "style" in p) {
        const body = { cast: next.elements, style: next.style ?? null };
        schedule(`${id}:choices`, body, () => api.saveChoices(id, body));
      }
    };

    const putEpisode = (e: Episode) => editRemote((r) => ({ ...r, episodes: [...r.episodes.filter((x) => x.id !== e.id), e] }));
    const putSeries = (s: Series) => editRemote((r) => ({ ...r, series: [...r.series.filter((x) => x.id !== s.id), s] }));

    return {
      get: (s) => startingCast[s] ?? empty,
      series,
      seriesTitle,
      isSaved,
      episodesIn,
      current: saved.current ?? DRAFT,
      setCurrent: (key) => edit((s) => (s.current === key ? s : { ...s, current: key })),
      episodeOf,
      start: (key, data) => edit((s) => ({ ...s, current: key, episodes: { ...s.episodes, [key]: data } })),
      patch: (key, p) => {
        const next = { ...latest(key), ...p };
        edit((s) => ({ ...s, episodes: { ...s.episodes, [key]: next } }));
        sendChanges(next, p);
      },

      createEpisode: async (target) => {
        let slug: string;
        if ("title" in target) {
          const s = await api.createSeries(target.title);
          putSeries(s);
          slug = s.id;
        } else slug = target.series;
        const ep = await api.createEpisode(slug, numberOf(nextEpisodeName(episodesIn(slug))));
        putEpisode(ep);
        return ep;
      },

      saveScript: async (id, text, file, clearFile) => {
        await api.saveScript(id, text, file, clearFile);
      },

      openSaved: async (id) => {
        const d = await api.getEpisode(id);
        const e = d.episode;
        putEpisode(e);
        const source = d.script?.text ?? "";
        const key = episodeKey(e.seriesId, e.title);
        const data: EpisodeData = {
          id,
          step: e.step,
          series: e.seriesId,
          episode: e.title,
          isNew: e.step !== "done",
          source,
          file: d.script?.fileName ?? undefined,
          blocks: source.trim() ? parseScript(source) : screenplay,
          texts: d.screenplay?.texts,
          notes: d.screenplay?.notes,
          changed: d.screenplay?.changed,
          elements: d.choices?.cast ?? undefined,
          style: d.choices?.style ?? undefined,
        };
        // What came from the server is not sent straight back.
        if (d.screenplay) lastSent.current.set(`${id}:screenplay`, JSON.stringify({ texts: data.texts, notes: data.notes, changed: data.changed }));
        if (d.choices) lastSent.current.set(`${id}:choices`, JSON.stringify({ cast: data.elements, style: data.style ?? null }));
        edit((s) => ({ ...s, current: key, episodes: { ...s.episodes, [key]: data } }));
        memo.current.set(REACHED, Math.min(ORDER.indexOf(e.step), ORDER.indexOf("results")));
        return HREF[e.step];
      },

      reach: (key, step) => {
        const ep = latest(key);
        if (!ep.id || ORDER.indexOf(step) <= ORDER.indexOf(ep.step ?? "script")) return;
        const id = ep.id;
        edit((s) => ({ ...s, episodes: { ...s.episodes, [key]: { ...latest(key), step } } }));
        schedule(`${id}:step`, step, () => api.patchEpisode(id, step).then(putEpisode), 0);
      },

      flush,

      finish: async (key, poster) => {
        const ep = latest(key);
        const slug = ep.series;
        const done = episodeKey(slug, ep.episode);
        if (ep.id) {
          await flush();
          putEpisode(await api.patchEpisode(ep.id, "done"));
          const s = remoteRef.current.series.find((x) => x.id === slug);
          if (s && !s.cover) putSeries(await api.patchSeries(slug, { cover: poster }));
        }
        edit((s) => {
          // The demo draft has no saved record: it joins its series for this visit only.
          const list = s.added[slug] ?? [];
          const added = ep.id || list.some((x) => x.name === ep.episode) ? s.added : { ...s.added, [slug]: [...list, { name: ep.episode, poster }] };
          // The finished episode keeps its work under its own key; the draft is free again.
          const episodes = { ...s.episodes, [done]: { ...(s.episodes[key] ?? ep), isNew: false, newSeries: undefined, step: "done" as Step } };
          if (key !== done) delete episodes[key];
          return { ...s, added, episodes, current: done };
        });
      },

      renameSeries: async (slug, title) => {
        if (!isSaved(slug)) return edit((s) => ({ ...s, renamed: { ...s.renamed, [slug]: title } }));
        const before = remoteRef.current.series.find((x) => x.id === slug);
        if (!before) return;
        putSeries({ ...before, title });
        try {
          putSeries(await api.patchSeries(slug, { title }));
        } catch (e) {
          putSeries(before);
          throw e;
        }
      },

      deleteSeries: (slug, back) => {
        edit((s) => ({ ...s, deletedSeries: back ? s.deletedSeries.filter((x) => x !== slug) : [...s.deletedSeries, slug] }));
        if (!isSaved(slug)) return;
        const name = `series:${slug}`;
        clearTimeout(deletions.current.get(name)?.timer);
        deletions.current.delete(name);
        if (back) return;
        const go = (keepalive: boolean) =>
          api.deleteSeries(slug, keepalive).then(() => {
            editRemote((r) => ({ series: r.series.filter((x) => x.id !== slug), episodes: r.episodes.filter((x) => x.seriesId !== slug) }));
            edit((s) => ({ ...s, deletedSeries: s.deletedSeries.filter((x) => x !== slug) }));
          });
        deletions.current.set(name, {
          run: go,
          timer: window.setTimeout(() => {
            deletions.current.delete(name);
            // If the delete does not go through, the series comes back.
            go(false).catch(() => edit((s) => ({ ...s, deletedSeries: s.deletedSeries.filter((x) => x !== slug) })));
          }, UNDO_MS),
        });
      },

      deleteEpisode: (key, back) => {
        edit((s) => ({ ...s, deletedEpisodes: back ? s.deletedEpisodes.filter((x) => x !== key) : [...s.deletedEpisodes, key] }));
        const id = savedEpisodeId(key);
        if (!id) return;
        const name = `episode:${id}`;
        clearTimeout(deletions.current.get(name)?.timer);
        deletions.current.delete(name);
        if (back) return;
        const go = (keepalive: boolean) =>
          api.deleteEpisode(id, keepalive).then(() => {
            editRemote((r) => ({ ...r, episodes: r.episodes.filter((x) => x.id !== id) }));
            edit((s) => {
              const episodes = { ...s.episodes };
              delete episodes[key];
              return { ...s, episodes, current: s.current === key ? null : s.current, deletedEpisodes: s.deletedEpisodes.filter((x) => x !== key) };
            });
          });
        deletions.current.set(name, {
          run: go,
          timer: window.setTimeout(() => {
            deletions.current.delete(name);
            go(false).catch(() => edit((s) => ({ ...s, deletedEpisodes: s.deletedEpisodes.filter((x) => x !== key) })));
          }, UNDO_MS),
        });
      },

      kept: <T,>(key: string) => memo.current.get(key) as T | undefined,
      keep: (key, value) => void memo.current.set(key, value),
    };
  }, [saved, remote, edit, editRemote, schedule, flush]);

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
