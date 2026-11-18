/**
 * The rules of the Tidebell Cove rooms, ported from the game's own server (FOMO Cove/room-server.mjs,
 * src/world-state.mjs, src/room-layouts.mjs, src/porch-layout.js and the id lists in src/world-data.js).
 * app/api/cove and lib/labs/store/cove.ts hold the rooms in Postgres; this file checks what a visitor sends.
 * Every value is a number, a boolean or an id from a fixed list: no free text is accepted or relayed.
 */

export const ROOMS = ["square", "beach", "porch", "bandstand", "hall"] as const;
export type RoomId = (typeof ROOMS)[number];
/** Visitors per room instance; a full instance opens the next, up to 16. */
export const CAPACITY = 20;
export const MAX_INSTANCES = 16;
/** The room server refuses sockets past 320. */
export const MAX_VISITORS = 320;
/** A visitor not heard from for this long leaves. */
export const DROP_MS = 6000;
export const PRINT_MS = 4100;
export const SEAT_MS = 30000;
export const TRACK_MS = 96000;
export const SAY_MS = 2000;
export const EMOTE_MS = 1200;
export const REPORT_MS = 30000;
export const DESIGNS = ["beacon", "silverfin"] as const;
export const FISH = ["idle", "cast", "bite", "catch"] as const;
export const GARMENTS = ["none", "knit", "spa", "dinosaur", "bear", "wizard", "shark"] as const;
export const REASONS = ["blocking", "spam", "name", "other"] as const;
export const EMOTES = ["wave", "dance", "cheer", "laugh", "heart", "sit", "clap", "sleepy"] as const;
const PHRASE_GROUPS: [string, number][] = [["hello", 7], ["questions", 7], ["answers", 7], ["fishing", 7], ["music", 6], ["goodbye", 6]];
export const PHRASES = new Set(
  PHRASE_GROUPS.flatMap(([group, n]) => Array.from({ length: n }, (_, i) => `${group}-${String(i + 1).padStart(2, "0")}`)),
);
/** The two public name lists (world-data.js words), so a report can record the reported visitor's name. */
export const ADJECTIVES = ["Amber", "Aqua", "Breezy", "Bright", "Brisk", "Bubbly", "Calm", "Cheerful", "Cloudy", "Coral", "Cosy", "Dappled", "Daring", "Dawn", "Dewy", "Dreamy", "Dusky", "Early", "Feathered", "Fizzy", "Floating", "Fluffy", "Foamy", "Gentle", "Giggly", "Glimmering", "Golden", "Happy", "Hazy", "Honey", "Indigo", "Jolly", "Kindly", "Lantern", "Lazy", "Little", "Lucky", "Merry", "Misty", "Moonlit", "Mossy", "Ocean", "Peachy", "Pearly", "Pebbled", "Plucky", "Quiet", "Rosy", "Round", "Rustling", "Sandy", "Shimmering", "Silver", "Sleepy", "Soft", "Starry", "Sunny", "Tidal", "Velvet", "Wavy"];
export const NOUNS = ["Anchor", "Apricot", "Beacon", "Bell", "Berry", "Biscuit", "Blossom", "Boat", "Breeze", "Bubble", "Buoy", "Button", "Captain", "Caramel", "Cloud", "Clover", "Coconut", "Comet", "Coral", "Cove", "Crescent", "Dandelion", "Dewdrop", "Driftwood", "Feather", "Fern", "Finch", "Firefly", "Flipper", "Fountain", "Gull", "Harbour", "Hazel", "Kite", "Lagoon", "Lantern", "Leaf", "Lemon", "Lighthouse", "Lily", "Maple", "Marigold", "Meadow", "Moon", "Noodle", "Otter", "Pebble", "Petal", "Pier", "Puddle", "Reed", "Ripple", "Sail", "Shell", "Skipper", "Sprout", "Starfish", "Sunbeam", "Willow", "Wren"];

/** Arrival spots per room; the first not within 0.7 m of someone is used. */
export const START: Record<RoomId, [number, number][]> = {
  square: [[-4.5, 7], [-2.7, 7], [-4.5, 8.5], [-2.7, 8.5]],
  beach: [[-4.5, 7], [-2.7, 7], [-4.5, 8.5], [-2.7, 8.5]],
  porch: [[2.65, 3], [3.4, 3], [2.65, 4], [3.4, 4]],
  bandstand: [[-1, 9], [1, 9], [-1, 10.5], [1, 10.5]],
  hall: [[-1, 9], [1, 9], [-1, 10.5], [1, 10.5]],
};
const BOUNDS: Record<RoomId, [number, number]> = { square: [16, 16], beach: [18, 18], porch: [18, 18], bandstand: [14, 14], hall: [12, 14] };

/** room-layouts.mjs: the fixed props the new rooms refuse to let a duck stand inside. */
type Box = { x: number; z: number; w: number; d: number };
const OBSTACLES: Record<"square" | "bandstand" | "hall", Box[]> = {
  square: [
    { x: 0, z: 0, w: 3.2, d: 3.2 },
    { x: -8, z: 7, w: 2.5, d: 2.5 },
    ...[[-6, -5], [6, -5], [5, 7]].map(([x, z]) => ({ x, z, w: 2.4, d: 0.8 })),
    ...[[-10, -10], [10, -10], [10, 10], [-10, 10]].flatMap(([x, z]) => [
      { x, z, w: 0.4, d: 0.4 },
      { x: x - 1, z: z - 1, w: 1.2, d: 1.2 },
    ]),
    ...[[-4, -10], [10, 4], [4, 10], [-10, -4]].map(([x, z]) => ({ x, z, w: 0.35, d: 0.35 })),
  ],
  bandstand: [
    { x: 0, z: -4, w: 1.5, d: 0.8 },
    { x: -2.5, z: -4, w: 0.8, d: 0.6 },
    { x: 2.5, z: -4, w: 0.8, d: 0.6 },
    ...[[8, -6], [8, -2], [8, 2], [8, 6]].map(([x, z]) => ({ x, z, w: 1.5, d: 0.9 })),
  ],
  hall: [{ x: 0, z: -8, w: 2.2, d: 1.7 }, ...[[-8, -8], [8, -8], [-8, 5], [8, 5]].map(([x, z]) => ({ x, z, w: 1, d: 1 }))],
};
function walkable(room: "square" | "bandstand" | "hall", x: number, z: number, radius = 0.32) {
  const b = { square: 15, bandstand: 13, hall: 11 }[room];
  if (Math.abs(x) > b - radius || Math.abs(z) > (room === "hall" ? 13 : b) - radius) return false;
  return !OBSTACLES[room].some((o) => Math.abs(x - o.x) < o.w / 2 + radius && Math.abs(z - o.z) < o.d / 2 + radius);
}
/** world-state.mjs move(): the rooms where a duck may stand at (x, z). */
export function roomsAllowing(x: number, z: number): RoomId[] {
  return ROOMS.filter((room) => {
    const [bx, bz] = BOUNDS[room];
    if (Math.abs(x) > bx || Math.abs(z) > bz) return false;
    return room === "beach" || room === "porch" ? true : walkable(room, x, z);
  });
}

/** The print bench, copied from porch-layout.js. */
const porch = { left: 2.15, right: 9.55, sea: -4.75, wall: -0.91, visitor: { x: 6.22, z: -3.72 } };
export const atPrintBench = (x: number, z: number) =>
  x >= porch.left && x <= porch.right && z >= porch.sea && z <= porch.wall && z < -2.95 &&
  Math.hypot(x - porch.visitor.x, z - porch.visitor.z) < 1.37;
/** The Tide Hall queue tile and how near a duck must stand to join the queue. */
export const QUEUE_TILE = { x: 4, z: -6, reach: 2.2 };

export type Name = [number, number];
export type Outfit = { color: "ivory"; hat: string; top: string; hatAlt: boolean; topAlt: boolean };
export type Move = {
  x: number; z: number; yaw: number; wave: number; fish: string; catchId: number; fishSeq: number; fishAge: number;
  name: Name | null; outfit: Outfit | null;
};
export type Action =
  | { type: "join"; room: RoomId; name: Name; outfit: Outfit }
  | { type: "print"; id: string; design: string }
  | { type: "say"; phrase: string }
  | { type: "emote"; emote: string }
  | { type: "emote-stop" }
  | { type: "vote"; track: number }
  | { type: "seat" }
  | { type: "leave-seat" }
  | { type: "report"; target: string; reason: string };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const count = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 1e9;
const onlyKeys = (v: Record<string, unknown>, keys: string[]) => Object.keys(v).every((k) => keys.includes(k));
const has = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === "string" && (list as readonly string[]).includes(v);

/** Two indices into the 60-word lists. */
export function readName(v: unknown): Name | null {
  if (!Array.isArray(v) || v.length !== 2 || !v.every((n) => Number.isInteger(n) && n >= 0 && n < 60)) return null;
  return [v[0], v[1]];
}
/** A hat, a top and two fabric switches; colour is always ivory, as the room server stores it. */
export function readOutfit(v: unknown): Outfit | null {
  if (!isObject(v) || !onlyKeys(v, ["color", "hat", "top", "hatAlt", "topAlt"])) return null;
  if (v.color !== undefined && v.color !== "ivory") return null;
  if (!has(GARMENTS, v.hat) || !has(GARMENTS, v.top) || typeof v.hatAlt !== "boolean" || typeof v.topAlt !== "boolean") return null;
  return { color: "ivory", hat: v.hat, top: v.top, hatAlt: v.hatAlt, topAlt: v.topAlt };
}

/**
 * The move the game sends ten times a second: the room server's checks (finite numbers, fish one of four words),
 * tightened so counters are whole numbers and yaw is an angle. Name and outfit ride along and must be valid.
 */
export function readMove(v: unknown): Move | null {
  if (!isObject(v) || v.type !== "move") return null;
  if (!onlyKeys(v, ["type", "name", "outfit", "x", "z", "yaw", "band", "wave", "fish", "catchId", "fishSeq", "fishAge"])) return null;
  const { x, z, yaw, wave = 0, fish = "idle", catchId = 0, fishAge = 0, fishSeq = 0, band = 0 } = v;
  if (!finite(x) || !finite(z) || !finite(yaw) || !finite(fishAge) || Math.abs(yaw) > 10) return null;
  if (Math.abs(x) > 18 || Math.abs(z) > 18) return null;
  if (!count(wave) || !count(catchId) || !count(fishSeq) || !has(FISH, fish) || ![0, 1, 2].includes(band as number)) return null;
  const name = v.name === undefined ? null : readName(v.name);
  const outfit = v.outfit === undefined ? null : readOutfit(v.outfit);
  if ((v.name !== undefined && !name) || (v.outfit !== undefined && !outfit)) return null;
  return { x, z, yaw, wave, fish, catchId, fishSeq, fishAge: Math.min(60, Math.max(0, fishAge)), name, outfit };
}

/** A visitor id as the server issues them: 12 hex characters. */
export const isVisitorId = (v: unknown): v is string => typeof v === "string" && /^[a-f0-9]{12}$/.test(v);

/** One of the game's one-off messages. Anything else, or any extra key, is refused. */
export function readAction(v: unknown): Action | null {
  if (!isObject(v) || typeof v.type !== "string") return null;
  switch (v.type) {
    case "join": {
      if (!onlyKeys(v, ["type", "room", "name", "outfit"]) || !has(ROOMS, v.room)) return null;
      const name = readName(v.name);
      const outfit = readOutfit(v.outfit);
      return name && outfit ? { type: "join", room: v.room, name, outfit } : null;
    }
    case "print":
      if (!onlyKeys(v, ["type", "id", "design"]) || typeof v.id !== "string" || !/^[a-f0-9]{16}$/.test(v.id) || !has(DESIGNS, v.design)) return null;
      return { type: "print", id: v.id, design: v.design };
    case "say":
      return onlyKeys(v, ["type", "phrase"]) && typeof v.phrase === "string" && PHRASES.has(v.phrase) ? { type: "say", phrase: v.phrase } : null;
    case "emote":
      return onlyKeys(v, ["type", "emote"]) && has(EMOTES, v.emote) ? { type: "emote", emote: v.emote } : null;
    case "emote-stop":
    case "seat":
    case "leave-seat":
      return onlyKeys(v, ["type"]) ? { type: v.type } : null;
    case "vote":
      return onlyKeys(v, ["type", "track"]) && [0, 1, 2].includes(v.track as number) ? { type: "vote", track: v.track as number } : null;
    case "report":
      return onlyKeys(v, ["type", "target", "reason"]) && isVisitorId(v.target) && has(REASONS, v.reason)
        ? { type: "report", target: v.target, reason: v.reason }
        : null;
    default:
      return null;
  }
}

/** A token the server issued: 32 hex characters. */
export const isToken = (v: unknown): v is string => typeof v === "string" && /^[a-f0-9]{32}$/.test(v);
