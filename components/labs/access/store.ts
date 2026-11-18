"use client";

import { useSyncExternalStore } from "react";

/**
 * The early-access subscription and watch progress for the mini-series pages.
 * A mock: everything lives in this browser and subscribing is instant, with no payment taken.
 * A real billing backend replaces `read`, `write`, `subscribe` and `cancel`; the components only
 * call `useAccess`, `subscribe`, `cancel` and the progress helpers.
 */

export type Progress = { t: number; d: number; at: number };

export type AccessState = {
  subscribed: boolean;
  /** When the subscription started, in milliseconds since the epoch. Null when not subscribed. */
  since: number | null;
  /** Keyed by episode, `${slug}:${number}`. */
  progress: Record<string, Progress>;
  /** Episode keys, most recent last. */
  history: string[];
};

const KEY = "nl-access-v1";
const EMPTY: AccessState = { subscribed: false, since: null, progress: {}, history: [] };

export const episodeKey = (slug: string, number: number) => `${slug}:${number}`;

let state: AccessState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

// The coin fields an earlier version kept under the same key are dropped on the next write.
function read(): AccessState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const s = JSON.parse(raw) as Partial<AccessState>;
    const subscribed = s.subscribed === true;
    return {
      subscribed,
      since: subscribed && Number.isFinite(s.since) ? Number(s.since) : null,
      progress: s.progress && typeof s.progress === "object" ? s.progress : {},
      history: Array.isArray(s.history) ? s.history : [],
    };
  } catch {
    return EMPTY;
  }
}

function write() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage is blocked or full: the page keeps working for this visit.
  }
}

function ensure() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = read();
}

function set(next: AccessState, persist = true) {
  state = next;
  if (persist) write();
  listeners.forEach((l) => l());
}

function listen(l: () => void) {
  ensure();
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) set(read(), false);
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

const snapshot = () => {
  ensure();
  return state;
};
const serverSnapshot = () => EMPTY;

/** The current access state. Renders the empty state on the server and on the first client pass. */
export function useAccess() {
  return useSyncExternalStore(listen, snapshot, serverSnapshot);
}

const noop = () => () => {};
/** False on the server and the first client pass, true once the browser state has been read. */
export function useAccessReady() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** Starts the subscription. Instant in the mock: no payment is taken. */
export function subscribe() {
  ensure();
  if (state.subscribed) return;
  set({ ...state, subscribed: true, since: Date.now() });
}

/** Ends the subscription at once. Early episodes lock again until their release dates. */
export function cancel() {
  ensure();
  set({ ...state, subscribed: false, since: null });
}

let lastWrite = 0;
/** Records where the visitor is in an episode. Written to storage at most every few seconds. */
export function saveProgress(key: string, t: number, d: number, force = false) {
  ensure();
  if (!Number.isFinite(t) || !Number.isFinite(d) || d <= 0) return;
  const history = state.history.at(-1) === key ? state.history : [...state.history.filter((h) => h !== key), key];
  state = { ...state, progress: { ...state.progress, [key]: { t, d, at: Date.now() } }, history };
  const now = Date.now();
  if (force || now - lastWrite > 4000) {
    lastWrite = now;
    set(state);
  }
}

/** Where to start an episode: the saved position, unless it was finished or barely begun. */
export function resumeAt(p: Progress | undefined) {
  if (!p || p.t < 3 || p.t > p.d - 5) return 0;
  return p.t;
}

export const watched = (p: Progress | undefined) => !!p && p.t >= p.d - 5;
