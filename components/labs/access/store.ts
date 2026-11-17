"use client";

import { useSyncExternalStore } from "react";

/**
 * Early access, coins and watch progress for the mini-series pages.
 * Everything lives in this browser behind these few calls, so a real account backend can replace
 * the store without touching the components: swap `read`, `write` and the action bodies.
 */

export type Receipt = {
  id: string;
  kind: "unlock" | "coins";
  title: string;
  coins: number;
  /** Milliseconds since the epoch. */
  at: number;
};

export type Progress = { t: number; d: number; at: number };

export type AccessState = {
  balance: number;
  /** Episode keys, `${slug}:${number}`. */
  unlocked: string[];
  progress: Record<string, Progress>;
  /** Episode keys, most recent last. */
  history: string[];
  receipts: Receipt[];
};

const KEY = "nl-access-v1";
const EMPTY: AccessState = { balance: 0, unlocked: [], progress: {}, history: [], receipts: [] };

export const episodeKey = (slug: string, number: number) => `${slug}:${number}`;

let state: AccessState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): AccessState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const s = JSON.parse(raw) as Partial<AccessState>;
    return {
      balance: Number.isFinite(s.balance) ? Number(s.balance) : 0,
      unlocked: Array.isArray(s.unlocked) ? s.unlocked : [],
      progress: s.progress && typeof s.progress === "object" ? s.progress : {},
      history: Array.isArray(s.history) ? s.history : [],
      receipts: Array.isArray(s.receipts) ? s.receipts : [],
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

function subscribe(l: () => void) {
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
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

const id = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random()));

/** Adds coins to the balance. No payment is taken. */
export function addCoins(coins: number) {
  ensure();
  set({
    ...state,
    balance: state.balance + coins,
    receipts: [...state.receipts, { id: id(), kind: "coins", title: `${coins} ${coins === 1 ? "coin" : "coins"} added`, coins, at: Date.now() }],
  });
}

/**
 * Unlocks an early episode. When the balance is short, the missing coins are added first,
 * the way the earlier mock's checkout added exactly the shortfall.
 */
export function unlock(key: string, price: number, title: string) {
  ensure();
  if (state.unlocked.includes(key)) return;
  const short = Math.max(0, price - state.balance);
  if (short) addCoins(short);
  set({
    ...state,
    balance: state.balance - price,
    unlocked: [...state.unlocked, key],
    receipts: [...state.receipts, { id: id(), kind: "unlock", title, coins: price, at: Date.now() }],
  });
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
