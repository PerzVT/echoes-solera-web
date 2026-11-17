"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FAILS_ONCE, catalystCast, catalystScenes, initialCanvases, parseScript, screenplayOf, unmade, type Canvas, type CastItem, type Episode, type Passage, type Shot } from "./data";
import { patchShot } from "./ops";

/** Where an episode lives: one of the canvases in the list, or the new anime being made. */
export type Target = { kind: "canvas"; id: string; ep: number } | { kind: "draft" };

export type Note = { id: string; passage: string; text: string };

export type Draft = {
  script: string;
  file: string;
  /** True from Submit until the processing view has run once. */
  processing: boolean;
  notes: Note[];
  /** The screenplay as read from the script. */
  passages: Passage[];
  /** The Cast step's cards, in order. */
  cast: CastItem[];
  /** The name the finished canvas gets. */
  title: string;
  style: string;
  episode: Episode;
  /** True once Generate has been pressed and the shots have started filling in. */
  started: boolean;
  /** The furthest step reached, so earlier and reached steps can be reopened from the bar. */
  reached: number;
};

/** With nothing submitted (a step opened straight from the address bar) the new anime is the Catalyst demo. */
const freshDraft = (): Draft => ({
  script: "",
  file: "",
  processing: false,
  notes: [],
  passages: screenplayOf(catalystScenes()),
  cast: catalystCast(),
  title: "",
  style: "solera-anime",
  episode: { scenes: unmade(catalystScenes()) },
  started: false,
  reached: 0,
});

type Store = {
  canvases: Canvas[];
  draft: Draft;
  setDraft: (p: Partial<Draft> | ((d: Draft) => Partial<Draft>)) => void;
  resetDraft: () => void;
  /** Reads the submitted script into the screenplay, cast and shots. */
  submitDraft: () => void;
  episodeOf: (t: Target) => Episode | null;
  castOf: (t: Target) => CastItem[];
  update: (t: Target, f: (e: Episode) => Episode) => void;
  /** Makes one shot: generating now, ready (or failed) after `ms`. */
  make: (t: Target, id: string, ms: number, opts?: { fail?: boolean; delay?: number }) => void;
  /** Starts the new anime's shots filling in, one after another. */
  startDraft: (reduced: boolean) => void;
  /** Saves the new anime as a canvas and returns its id. */
  finishDraft: () => string;
  renameCanvas: (id: string, name: string) => void;
  /** Removes a canvas and returns what puts it back. */
  removeCanvas: (id: string) => () => void;
};

const Ctx = createContext<Store | null>(null);

export function useAnime() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useAnime outside AnimeProvider");
  return s;
}

const GAP = 1500;
const MAKE = 2600;
const KEY = "nine-lives-anime";

/** A shot's next take, from the art it draws on. */
function nextTake(s: Shot): Partial<Shot> {
  const pool = s.next.length ? s.next : s.takes;
  const art = pool[s.takes.length % Math.max(1, pool.length)];
  if (!art) return { status: "failed" };
  return { status: "ready", takes: [...s.takes, art], take: s.takes.length };
}

/** After a reload no timer is left to finish a shot that was being made, so it comes back made. */
const settle = (e: Episode): Episode => ({ scenes: e.scenes.map((sc) => ({ ...sc, shots: sc.shots.map((s) => (s.status === "generating" ? { ...s, ...nextTake(s) } : s)) })) });

const baseName = (file: string) => file.replace(/\.[^.]+$/, "");

export function AnimeProvider({ children }: { children: ReactNode }) {
  const [canvases, setCanvases] = useState<Canvas[]>(initialCanvases);
  const [draft, setDraftState] = useState<Draft>(freshDraft);
  const [loaded, setLoaded] = useState(false);
  const timers = useRef<number[]>([]);
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // The session's canvases and new anime come back after a reload.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { canvases?: Canvas[]; draft?: Draft };
        if (Array.isArray(saved.canvases)) setCanvases(saved.canvases.map((c) => ({ ...c, episodes: c.episodes.map(settle) })));
        if (saved.draft) {
          const d = { ...freshDraft(), ...saved.draft, processing: false };
          d.episode = settle(d.episode);
          draftRef.current = d;
          setDraftState(d);
        }
      }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ canvases, draft }));
    } catch {}
  }, [loaded, canvases, draft]);

  const setDraft = useCallback((p: Partial<Draft> | ((d: Draft) => Partial<Draft>)) => setDraftState((d) => ({ ...d, ...(typeof p === "function" ? p(d) : p) })), []);

  const update = useCallback((t: Target, f: (e: Episode) => Episode) => {
    if (t.kind === "draft") setDraftState((d) => ({ ...d, episode: f(d.episode) }));
    else setCanvases((all) => all.map((c) => (c.id === t.id ? { ...c, episodes: c.episodes.map((e, i) => (i === t.ep ? f(e) : e)) } : c)));
  }, []);

  const make = useCallback(
    (t: Target, id: string, ms: number, opts?: { fail?: boolean; delay?: number }) => {
      const begin = () => update(t, (e) => patchShot(e, id, { status: "generating", review: undefined }));
      const end = () => update(t, (e) => patchShot(e, id, (s: Shot) => (opts?.fail ? { status: "failed" } : nextTake(s))));
      const d = opts?.delay ?? 0;
      if (d) timers.current.push(window.setTimeout(begin, d));
      else begin();
      timers.current.push(window.setTimeout(end, d + ms));
    },
    [update],
  );

  const submitDraft = useCallback(() => {
    const d = draftRef.current;
    const parsed = d.script.trim() ? parseScript(d.script) : null;
    const next: Partial<Draft> =
      parsed && parsed.scenes.some((s) => s.shots.length)
        ? { passages: parsed.passages, cast: parsed.cast, episode: { scenes: parsed.scenes }, title: d.file ? baseName(d.file) : parsed.title }
        : { ...freshDraft(), script: d.script, file: d.file, title: d.file ? baseName(d.file) : "Catalyst" };
    const n: Draft = { ...d, ...next, notes: [], started: false, processing: true, reached: 1 };
    draftRef.current = n;
    setDraftState(n);
  }, []);

  const startDraft = useCallback(
    (reduced: boolean) => {
      const d = draftRef.current;
      if (d.started) return;
      draftRef.current = { ...d, started: true };
      setDraftState((x) => ({ ...x, started: true }));
      const ids = d.episode.scenes.flatMap((s) => s.shots.map((x) => x.id));
      // One shot fails the first time, so Try again has something to do.
      const fails = ids.includes(FAILS_ONCE) ? FAILS_ONCE : ids.length >= 3 ? ids[ids.length - 1] : "";
      ids.forEach((id, i) => make({ kind: "draft" }, id, reduced ? 1 : MAKE, { fail: id === fails, delay: reduced ? 1 : 200 + i * GAP }));
    },
    [make],
  );

  const finishDraft = useCallback(() => {
    const id = `new-${Date.now().toString(36)}`;
    const d = draftRef.current;
    const first = d.episode.scenes.flatMap((s) => s.shots).find((s) => s.review === "approved" && s.takes.length);
    const canvas: Canvas = {
      id,
      name: d.title || "Catalyst",
      cover: first?.takes[first.take].still ?? "/labs/anime/catalyst.webp",
      style: d.style,
      cast: d.cast,
      episodes: [{ scenes: d.episode.scenes.map((sc) => ({ ...sc, shots: sc.shots.filter((s) => s.review !== "denied") })) }],
    };
    setCanvases((all) => [canvas, ...all]);
    draftRef.current = freshDraft();
    setDraftState(draftRef.current);
    return id;
  }, []);

  const renameCanvas = useCallback((id: string, name: string) => setCanvases((all) => all.map((c) => (c.id === id ? { ...c, name } : c))), []);
  const removeCanvas = useCallback(
    (id: string) => {
      const i = canvases.findIndex((c) => c.id === id);
      const gone = canvases[i];
      setCanvases((all) => all.filter((c) => c.id !== id));
      return () => {
        if (gone) setCanvases((all) => (all.some((c) => c.id === id) ? all : [...all.slice(0, i), gone, ...all.slice(i)]));
      };
    },
    [canvases],
  );

  const value = useMemo<Store>(
    () => ({
      canvases,
      draft,
      setDraft,
      resetDraft: () => {
        draftRef.current = freshDraft();
        setDraftState(draftRef.current);
      },
      submitDraft,
      episodeOf: (t) => (t.kind === "draft" ? draft.episode : (canvases.find((c) => c.id === t.id)?.episodes[t.ep] ?? null)),
      castOf: (t) => (t.kind === "draft" ? draft.cast : (canvases.find((c) => c.id === t.id)?.cast ?? [])),
      update,
      make,
      startDraft,
      finishDraft,
      renameCanvas,
      removeCanvas,
    }),
    [canvases, draft, setDraft, submitDraft, update, make, startDraft, finishDraft, renameCanvas, removeCanvas],
  );

  // Nothing renders until the saved session is read, so a reload never flashes the starting state or leaves a new canvas for the list.
  return <Ctx.Provider value={value}>{loaded ? children : null}</Ctx.Provider>;
}
