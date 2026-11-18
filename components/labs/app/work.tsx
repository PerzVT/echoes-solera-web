"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, type Manga, type MangaPatch, type Storyboard, type StoryboardPatch } from "./api";

/**
 * Saved work for the one-record tools, storyboard and manga. The record being worked on is held here and saved
 * whole-field to the creator's API as it changes (a short wait, then one PUT with every field that changed). Its id
 * is kept in sessionStorage, so a reload reopens the same record from the server.
 */

type Adapter<T, P> = {
  list: () => Promise<T[]>;
  create: (title: string, source: string) => Promise<T>;
  get: (id: string) => Promise<T>;
  save: (id: string, patch: P) => Promise<T>;
  remove: (id: string) => Promise<unknown>;
};

export type WorkStore<T, P> = {
  /** Saved records, newest first. */
  list: T[];
  /** The list has come back from the server (or failed to). */
  listed: boolean;
  /** The record being worked on, once loaded. */
  current: T | null;
  /** A record is being read back after a reload. */
  opening: boolean;
  /** Why the current record could not be read, if it could not. */
  openError: string;
  create: (title: string, source: string) => Promise<T>;
  open: (id: string) => Promise<T>;
  /** Changes the current record here at once and saves it shortly after. */
  patch: (p: P) => void;
  /** Sends what is waiting. Rejects with the failure; the change stays queued. */
  flush: () => Promise<void>;
  /** Forgets the current record, so the start screen opens blank. */
  clear: () => void;
  remove: (id: string) => Promise<void>;
};

const SAVE_MS = 700;

function createWork<T extends { id: string; createdAt: string }, P extends object>(kind: string, a: Adapter<T, P>) {
  const Ctx = createContext<WorkStore<T, P> | null>(null);
  const KEY = `nine-lives:${kind}:current`;

  function Provider({ children }: { children: ReactNode }) {
    const [list, setList] = useState<T[]>([]);
    const [listed, setListed] = useState(false);
    const [current, setCurrent] = useState<T | null>(null);
    const currentRef = useRef<T | null>(null);
    const [opening, setOpening] = useState(true);
    const [openError, setOpenError] = useState("");
    const pending = useRef<P | null>(null);
    const timer = useRef<number | undefined>(undefined);
    const chain = useRef<Promise<unknown>>(Promise.resolve());

    const put = useCallback((t: T | null) => {
      currentRef.current = t;
      setCurrent(t);
      try {
        if (t) sessionStorage.setItem(KEY, t.id);
        else sessionStorage.removeItem(KEY);
      } catch {}
      if (t) setList((all) => [t, ...all.filter((x) => x.id !== t.id)].sort((x, y) => y.createdAt.localeCompare(x.createdAt)));
    }, []);

    useEffect(() => {
      let alive = true;
      a.list()
        .then((l) => alive && setList([...l].sort((x, y) => y.createdAt.localeCompare(x.createdAt))))
        .catch(() => {})
        .finally(() => alive && setListed(true));
      let id: string | null = null;
      try {
        id = sessionStorage.getItem(KEY);
      } catch {}
      if (!id) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOpening(false);
      } else
        a.get(id)
          .then((t) => alive && put(t))
          .catch((e: unknown) => alive && setOpenError(e instanceof Error ? e.message : "That did not open."))
          .finally(() => alive && setOpening(false));
      return () => {
        alive = false;
      };
    }, [put]);

    const send = useCallback(() => {
      clearTimeout(timer.current);
      const body = pending.current;
      const t = currentRef.current;
      if (!body || !t) return chain.current;
      pending.current = null;
      const id = t.id;
      const p = chain.current
        .catch(() => {})
        .then(() => a.save(id, body))
        .then(
          (saved) => {
            // What came back is kept, unless a newer change is already waiting.
            if (currentRef.current?.id === id && !pending.current) setList((all) => all.map((x) => (x.id === id ? saved : x)));
          },
          (e) => {
            pending.current = { ...body, ...(pending.current ?? {}) } as P;
            throw e;
          },
        );
      chain.current = p;
      return p;
    }, []);

    useEffect(() => {
      const leave = () => void send()?.catch(() => {});
      window.addEventListener("pagehide", leave);
      return () => window.removeEventListener("pagehide", leave);
    }, [send]);

    const store = useMemo<WorkStore<T, P>>(
      () => ({
        list,
        listed,
        current,
        opening,
        openError,
        create: async (title, source) => {
          await send()?.catch(() => {});
          const t = await a.create(title, source);
          put(t);
          return t;
        },
        open: async (id) => {
          await send()?.catch(() => {});
          const t = await a.get(id);
          setOpenError("");
          put(t);
          return t;
        },
        patch: (p) => {
          const t = currentRef.current;
          if (!t) return;
          const next = { ...t, ...p } as T;
          currentRef.current = next;
          setCurrent(next);
          setList((all) => all.map((x) => (x.id === next.id ? next : x)));
          pending.current = { ...(pending.current ?? {}), ...p } as P;
          clearTimeout(timer.current);
          timer.current = window.setTimeout(() => void send()?.catch(() => {}), SAVE_MS);
        },
        flush: async () => {
          await send();
        },
        clear: () => {
          void send()?.catch(() => {});
          put(null);
        },
        remove: async (id) => {
          await a.remove(id);
          setList((all) => all.filter((x) => x.id !== id));
          if (currentRef.current?.id === id) put(null);
        },
      }),
      [list, listed, current, opening, openError, send, put],
    );

    return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
  }

  function useWork() {
    const s = useContext(Ctx);
    if (!s) throw new Error(`use${kind} needs its provider from app/(labs)/app/${kind}/layout.tsx`);
    return s;
  }

  return { Provider, useWork };
}

const boards = createWork<Storyboard, StoryboardPatch>("storyboard", {
  list: api.listStoryboards,
  create: api.createStoryboard,
  get: api.getStoryboard,
  save: api.saveStoryboard,
  remove: (id) => api.deleteStoryboard(id),
});
export const StoryboardProvider = boards.Provider;
export const useStoryboards = boards.useWork;

const mangas = createWork<Manga, MangaPatch>("manga", {
  list: api.listMangas,
  create: api.createManga,
  get: api.getManga,
  save: api.saveManga,
  remove: (id) => api.deleteManga(id),
});
export const MangaProvider = mangas.Provider;
export const useMangas = mangas.useWork;

/** A name for new work from what was brought: the first line, cut short. */
export function titleOf(source: string, fallback: string) {
  const line = source.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
  const t = line.replace(/^(INT\.?\/EXT\.?|EXT\.?\/INT\.?|INT\.|EXT\.)\s*/i, "").replace(/[.:;,]+$/, "");
  if (!t) return fallback;
  const short = t.length > 60 ? `${t.slice(0, 57).trimEnd()}...` : t;
  return short.charAt(0).toUpperCase() + short.slice(1).toLowerCase();
}
