import { flockCards, flockRules, type FlockCard } from "./flock";

/**
 * The rules of Flock 01, as pure functions over a plain collection (owned counts by card id), following the
 * package's INTEGRATION.md: five slots drawn independently with replacement from the pack's rarity pools,
 * duplicates paid in feathers in slot order, the completion pull on slot five, and the goal card awarded once
 * all 66 are owned. Nothing here touches storage, so the store, the demo states and the odds check share it.
 */

export type Rarity = FlockCard["rarity"];
export type PackId = "street" | "work" | "holiday";
export type Pack = (typeof flockRules.packs)[number];
export type Owned = Readonly<Record<string, number>>;

export const packs = flockRules.packs;
export const packById = (id: string) => packs.find((p) => p.id === id);
export const cardById = new Map(flockCards.map((c) => [c.id, c]));
export const goalId = flockRules.goalId;
export const numbered = flockCards.filter((c) => !c.secret && c.rarity !== "G");
export const secrets = flockCards.filter((c) => c.secret);

export const rarityName: Record<Rarity, string> = { C: "Common", U: "Uncommon", R: "Rare", SR: "Super rare", S: "Secret", G: "Goal" };
export const rarityRank: Record<Rarity, number> = { C: 0, U: 1, R: 2, SR: 3, S: 4, G: 5 };
/** Feathers a duplicate pays. Secrets pay none in this preview (INTEGRATION.md). */
export const duplicateFeathers: Record<Rarity, number> = flockRules.duplicateFeathers;
/** Feathers to buy a missing numbered card; secrets and the goal cannot be bought. */
export const priceOf = (c: FlockCard): number | null => (c.secret || c.rarity === "G" ? null : flockRules.missingCardPrices[c.rarity as "C" | "U" | "R" | "SR"]);

export const no3 = (n: number) => String(n).padStart(3, "0");
/** "017/060": the collector number as printed. */
export const cardNumber = (c: { no: number }) => `${no3(c.no)}/060`;

/** The numbered cards a pack holds, in number order. */
export const numberedIn = (p: Pack) => numbered.filter((c) => c.no >= p.range[0] && c.no <= p.range[1]);
const pool = (p: Pack, r: Rarity) => numberedIn(p).filter((c) => c.rarity === r);
export const has = (owned: Owned, id: string) => (owned[id] ?? 0) > 0;
export const rangeComplete = (owned: Owned, p: Pack) => numberedIn(p).every((c) => has(owned, c.id));
export const missingSecrets = (owned: Owned, p: Pack) => p.secrets.filter((id) => !has(owned, id));
/** The completion pull is on when the range is full and a secret of the pack is still missing. */
export const guaranteeActive = (owned: Owned, p: Pack) => rangeComplete(owned, p) && missingSecrets(owned, p).length > 0;

export const slotWeights = flockRules.slotWeights as readonly Partial<Record<Rarity, number>>[];

function pickWeighted(w: Partial<Record<Rarity, number>>, rnd: () => number): Rarity {
  const entries = Object.entries(w) as [Rarity, number][];
  const total = entries.reduce((s, [, v]) => s + v, 0);
  let x = rnd() * total;
  for (const [r, v] of entries) {
    x -= v;
    if (x < 0) return r;
  }
  return entries[entries.length - 1][0];
}

/** Five card ids in slot order. The guarantee is read before the draw, from the collection as it stands. */
export function drawPack(p: Pack, owned: Owned, rnd: () => number = Math.random): string[] {
  const out: string[] = [];
  for (let slot = 0; slot < 5; slot++) {
    const r = pickWeighted(slotWeights[slot], rnd);
    const ids = r === "S" ? p.secrets.map((id) => cardById.get(id)!) : pool(p, r);
    out.push(ids[Math.floor(rnd() * ids.length)].id);
  }
  const missing = missingSecrets(owned, p);
  if (rangeComplete(owned, p) && missing.length) out[4] = missing[Math.floor(rnd() * missing.length)];
  return out;
}

export type SlotResult = { id: string; isNew: boolean; feathers: number };
export type Credit = {
  owned: Record<string, number>;
  feathers: number;
  results: SlotResult[];
  /** Pack ranges this credit completed, and whether it awarded the goal card. */
  completed: PackId[];
  goal: boolean;
};

/** All 66 owned and the goal not yet: award it. */
const goalDue = (owned: Owned) => !has(owned, goalId) && flockCards.every((c) => c.id === goalId || has(owned, c.id));

/** Adds cards in slot order against a running collection, so two copies of a missing card make one new and one duplicate. */
export function credit(owned: Owned, feathers: number, ids: readonly string[]): Credit {
  const next: Record<string, number> = { ...owned };
  const before = packs.filter((p) => rangeComplete(owned, p)).map((p) => p.id);
  let f = feathers;
  const results = ids.map((id) => {
    const isNew = !has(next, id);
    const pay = isNew ? 0 : duplicateFeathers[cardById.get(id)!.rarity];
    next[id] = (next[id] ?? 0) + 1;
    f += pay;
    return { id, isNew, feathers: pay };
  });
  const goal = goalDue(next);
  if (goal) next[goalId] = 1;
  const completed = packs.filter((p) => !before.includes(p.id) && rangeComplete(next, p)).map((p) => p.id as PackId);
  return { owned: next, feathers: f, results, completed, goal };
}

export type Buy = { ok: true; owned: Record<string, number>; feathers: number; completed: PackId[]; goal: boolean } | { ok: false; reason: "owned" | "price" | "feathers" };

/** Buys one missing numbered card with feathers, all or nothing. */
export function buy(owned: Owned, feathers: number, id: string): Buy {
  const c = cardById.get(id);
  const price = c ? priceOf(c) : null;
  if (!c || price === null) return { ok: false, reason: "price" };
  if (has(owned, id)) return { ok: false, reason: "owned" };
  if (feathers < price) return { ok: false, reason: "feathers" };
  const r = credit(owned, feathers - price, [id]);
  return { ok: true, owned: r.owned, feathers: r.feathers, completed: r.completed, goal: r.goal };
}

/** Odds per pack, from the slot table with independent slots: at least one R or better, at least one SR or S. */
export function packOdds() {
  let noRare = 1;
  let noSuper = 1;
  for (const w of slotWeights) {
    const total = Object.values(w).reduce((s, v) => s + (v ?? 0), 0);
    noRare *= 1 - ((w.R ?? 0) + (w.SR ?? 0) + (w.S ?? 0)) / total;
    noSuper *= 1 - ((w.SR ?? 0) + (w.S ?? 0)) / total;
  }
  return { rare: 1 - noRare, superRare: 1 - noSuper };
}

/** A small seeded generator (mulberry32), for demo draws and the odds check. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
