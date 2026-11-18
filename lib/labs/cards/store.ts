"use client";

import { useSyncExternalStore } from "react";
import { buy, credit, has, numbered, secrets, goalId, type PackId, type SlotResult, type Owned } from "./rules";

/**
 * The visitor's collection, held in the browser: owned counts, feathers, which cards are still new, the order
 * cards arrived in, and the pack being opened. One object behind useSyncExternalStore, written to localStorage
 * inside try/catch, so the page works with storage blocked (the collection then lasts as long as the tab).
 *
 * A pack is committed the moment it is chosen: its five cards are drawn and credited at once, and the result is
 * kept as `pending` under a transaction id until the opening finishes. A reload, a skip or a cancelled animation
 * replays the same five cards and can never credit them twice.
 *
 * Demo states (?demo=...) swap in a separate in-memory collection that is never written, so a shown state
 * cannot overwrite a real one.
 */

export type Tally = { found: number; secrets: number; feathers: number };
export type Pending = {
  tx: string;
  pack: PackId;
  ids: string[];
  results: SlotResult[];
  before: Tally;
  after: Tally;
  completed: PackId[];
  goal: boolean;
  /** Cards turned so far, 0 to 5. */
  turned: number;
};
export type CardsState = {
  v: 1;
  owned: Record<string, number>;
  feathers: number;
  /** Owned cards the visitor has looked at; any other owned card is new. */
  seen: Record<string, 1>;
  /** Arrival order, for "Newest". */
  got: Record<string, number>;
  seq: number;
  opened: number;
  pending: Pending | null;
  muted: boolean;
};

const KEY = "nl-cards-flock-01";
export const emptyState = (): CardsState => ({ v: 1, owned: {}, feathers: 0, seen: {}, got: {}, seq: 0, opened: 0, pending: null, muted: false });
const SERVER = emptyState();

let state: CardsState | null = null;
let demo = false;
const subs = new Set<() => void>();

function load(): CardsState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<CardsState>;
      if (s && s.v === 1 && typeof s.owned === "object") return { ...emptyState(), ...s } as CardsState;
    }
  } catch {
    /* blocked or malformed: start empty */
  }
  return emptyState();
}

function get(): CardsState {
  if (!state) state = load();
  return state;
}

function set(next: CardsState) {
  state = next;
  if (!demo) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage full or blocked: keep it in memory */
    }
  }
  subs.forEach((f) => f());
}

function subscribe(f: () => void) {
  subs.add(f);
  // Another tab of the site changed the collection.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY && !demo) {
      state = load();
      f();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    subs.delete(f);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCards(): CardsState {
  return useSyncExternalStore(subscribe, get, () => SERVER);
}
export const readCards = get;

export const tally = (owned: Owned, feathers: number): Tally => ({
  found: numbered.filter((c) => has(owned, c.id)).length,
  secrets: secrets.filter((c) => has(owned, c.id)).length,
  feathers,
});

const stamp = (s: CardsState, ids: readonly string[], owned: Record<string, number>) => {
  const got = { ...s.got };
  let seq = s.seq;
  for (const id of ids) if (!has(s.owned, id) && has(owned, id) && got[id] === undefined) got[id] = ++seq;
  const seen = { ...s.seen };
  for (const id of ids) if (!has(s.owned, id)) delete seen[id];
  return { got, seq, seen };
};

/** Commits a pack: the five ids are credited now and kept as the pending opening. */
export function commitPack(pack: PackId, ids: string[]) {
  const s = get();
  const r = credit(s.owned, s.feathers, ids);
  const newIds = [...ids, ...(r.goal ? [goalId] : [])];
  const pending: Pending = {
    tx: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    pack,
    ids,
    results: r.results,
    before: tally(s.owned, s.feathers),
    after: tally(r.owned, r.feathers),
    completed: r.completed,
    goal: r.goal,
    turned: 0,
  };
  set({ ...s, ...stamp(s, newIds, r.owned), owned: r.owned, feathers: r.feathers, opened: s.opened + 1, pending });
  return pending;
}

export function setTurned(tx: string, turned: number) {
  const s = get();
  if (s.pending?.tx !== tx || s.pending.turned >= turned) return;
  set({ ...s, pending: { ...s.pending, turned } });
}

export function finishPack(tx: string) {
  const s = get();
  if (s.pending?.tx === tx) set({ ...s, pending: null });
}

export function buyCard(id: string) {
  const s = get();
  const r = buy(s.owned, s.feathers, id);
  if (!r.ok) return r;
  set({ ...s, ...stamp(s, r.goal ? [id, goalId] : [id], r.owned), owned: r.owned, feathers: r.feathers });
  return r;
}

export function markSeen(ids: readonly string[]) {
  const s = get();
  if (ids.every((id) => s.seen[id] || !has(s.owned, id))) return;
  const seen = { ...s.seen };
  for (const id of ids) if (has(s.owned, id)) seen[id] = 1;
  set({ ...s, seen });
}

export function setMuted(muted: boolean) {
  set({ ...get(), muted });
}

export function startOver() {
  set({ ...emptyState(), muted: get().muted });
}

/** Swaps in an in-memory collection for a demo link. Nothing is written while it is in use. */
export function enterDemo(next: CardsState) {
  demo = true;
  state = { ...next, muted: get().muted };
  subs.forEach((f) => f());
}

export const isNew = (s: CardsState, id: string) => has(s.owned, id) && !s.seen[id];
