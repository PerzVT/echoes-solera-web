import { flockCards, type FlockCard } from "./flock";
import { credit, drawPack, packById, seeded, type Pack } from "./rules";
import { emptyState, type CardsState } from "./store";

/**
 * States for showing the loop without playing it: ?demo=empty|half|complete on /cards, ?demo=sr on
 * /cards/packs, and ?stress=500 for the collection at size. Demo collections live in memory only.
 */

export type DemoName = "empty" | "half" | "complete";

/** Plays seeded packs until about half the set is found, so counts, duplicates and feathers are real. */
function half(): CardsState {
  const rnd = seeded(60);
  let owned: Record<string, number> = {};
  let feathers = 0;
  const order: string[] = [];
  const street = packById("street")!;
  const work = packById("work")!;
  for (let i = 0; i < 14; i++) {
    const p: Pack = i < 9 ? street : work;
    const r = credit(owned, feathers, drawPack(p, owned, rnd));
    for (const x of r.results) if (x.isNew) order.push(x.id);
    owned = r.owned;
    feathers = r.feathers;
  }
  // One secret found, so the six secret slots show.
  owned.f061 = 1;
  order.push("f061");
  const got: Record<string, number> = {};
  order.forEach((id, i) => (got[id] = i + 1));
  const seen: Record<string, 1> = {};
  // The last five arrivals stay new.
  order.slice(0, -5).forEach((id) => (seen[id] = 1));
  return { ...emptyState(), owned, feathers, got, seq: order.length, seen, opened: 14 };
}

function complete(): CardsState {
  const owned: Record<string, number> = {};
  const got: Record<string, number> = {};
  const seen: Record<string, 1> = {};
  flockCards.forEach((c, i) => {
    owned[c.id] = c.rarity === "C" ? 3 : c.rarity === "U" ? 2 : 1;
    got[c.id] = i + 1;
    seen[c.id] = 1;
  });
  return { ...emptyState(), owned, feathers: 212, got, seq: flockCards.length, seen, opened: 41 };
}

export function demoState(name: string | null): CardsState | null {
  if (name === "empty") return emptyState();
  if (name === "half") return half();
  if (name === "complete") return complete();
  return null;
}

/** ?demo=sr|s|r on the packs page: a Holiday pack, four cards turned, its fifth card of that rarity to come. */
export function demoLastCard(rarity: "R" | "SR" | "S") {
  const state = half();
  const p = packById("holiday")!;
  const last = flockCards.find((c) => c.pack === "holiday" && c.rarity === rarity)!;
  const ids = drawPack(p, state.owned, seeded(7));
  ids[4] = last.id;
  return { state, pack: p.id, ids };
}

/** A numbered placeholder for the stress view: a silhouette borrowed from the set, no art. */
export type Stub = { id: string; no: number; rarity: FlockCard["rarity"]; cutout: string; range: number };
const PATTERN: FlockCard["rarity"][] = flockCards.slice(0, 20).map((c) => (c.rarity === "S" ? "SR" : c.rarity));

export function stressStubs(n: number): Stub[] {
  const shapes = flockCards.slice(0, 60);
  return Array.from({ length: n }, (_, i) => ({
    id: `x${i + 1}`,
    no: i + 1,
    rarity: PATTERN[i % 20],
    cutout: shapes[i % 60].cutout,
    range: Math.floor(i / 50),
  }));
}
