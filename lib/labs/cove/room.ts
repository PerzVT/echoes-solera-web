/**
 * The rules of the Tidebell Cove room, ported from the game's own server (FOMO Cove/room-server.mjs and
 * src/porch-layout.js). app/api/cove and lib/labs/store/cove.ts hold the room in Postgres; this file only checks
 * what a visitor sends. Every value is a number or one of a fixed set of words: no free text is accepted.
 */

export const MAX_PLAYERS = 32;
/** A visitor not heard from for this long leaves the room. */
export const DROP_MS = 6000;
/** How long one print takes on the press (porch-layout.js printDuration). */
export const PRINT_MS = 4100;
export const DESIGNS = ["beacon", "silverfin"] as const;
export const FISH = ["idle", "cast", "bite", "catch"] as const;
export const BANDS = [0, 1, 2] as const;

/** The press bench, copied from porch-layout.js so the position check matches the game's. */
const porch = { left: 2.15, right: 9.55, sea: -4.75, wall: -0.91, visitor: { x: 6.22, z: -3.72 } };
const onPorch = (x: number, z: number) => x >= porch.left && x <= porch.right && z >= porch.sea && z <= porch.wall;
export const atPrintBench = (x: number, z: number) =>
  onPorch(x, z) && z < -2.95 && Math.hypot(x - porch.visitor.x, z - porch.visitor.z) < 1.37;

export type Duck = { x: number; z: number; yaw: number; band: number; wave: number; fish: string; catchId: number; fishSeq: number };
export type Move = { duck: Duck; fishAge: number };
export type Print = { id: string; design: string };

const STATE_KEYS = new Set(["x", "z", "yaw", "band", "wave", "fish", "catchId", "fishSeq", "fishAge"]);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const count = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 1e9;

/**
 * The duck state the game sends ten times a second: the room server's checks (finite numbers, |x| <= 18,
 * -16 <= z <= 18, band 0-2, fish one of four words), tightened so counters are whole numbers and yaw is an angle.
 * fishAge and fishSeq default to 0 as they do there. Any other key refuses the whole message.
 */
export function readMove(v: unknown): Move | null {
  if (!isObject(v)) return null;
  for (const key of Object.keys(v)) if (!STATE_KEYS.has(key)) return null;
  const { x, z, yaw, band, wave, fish, catchId, fishAge = 0, fishSeq = 0 } = v;
  if (!finite(x) || !finite(z) || !finite(yaw) || !finite(fishAge)) return null;
  if (Math.abs(x) > 18 || z < -16 || z > 18 || Math.abs(yaw) > 10) return null;
  if (!count(wave) || !count(catchId) || !count(fishSeq)) return null;
  if (!(BANDS as readonly unknown[]).includes(band) || !(FISH as readonly unknown[]).includes(fish)) return null;
  return {
    duck: { x, z, yaw, band: band as number, wave, fish: fish as string, catchId, fishSeq },
    fishAge: Math.min(60, Math.max(0, fishAge)),
  };
}

/** A print request: a 16-hex order id and one of the two designs. */
export function readPrint(v: unknown): Print | null {
  if (!isObject(v) || Object.keys(v).length !== 2) return null;
  const { id, design } = v;
  if (typeof id !== "string" || !/^[a-f0-9]{16}$/.test(id)) return null;
  if (typeof design !== "string" || !(DESIGNS as readonly string[]).includes(design)) return null;
  return { id, design };
}

/** A token the server issued: 32 hex characters. */
export const isToken = (v: unknown): v is string => typeof v === "string" && /^[a-f0-9]{32}$/.test(v);
