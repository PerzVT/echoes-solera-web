/**
 * The Tidebell Cove room in Postgres (tables nl_cove_*, lib/labs/store/schema.sql). The game's own server keeps
 * the room in memory; on Vercel each request may land on a different function instance, so every tick here is one
 * statement that refills the request buckets, writes this visitor's duck and reads everyone else's. A print order
 * adds a second statement. Rules and checks live in lib/labs/cove/room.ts.
 */
import { createHash, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { DROP_MS, MAX_PLAYERS, PRINT_MS, atPrintBench, type Duck, type Move, type Print } from "@/lib/labs/cove/room";
import { sql as query } from "./postgres";

/**
 * postgres.ts applies schema.sql once per process. A process that started before the nl_cove_ tables were added
 * would never see them, so the cove statements run once more here; they are all `if not exists`.
 */
let ready: Promise<void> | undefined;
function ensureCove() {
  ready ??= (async () => {
    const text = await readFile(path.join(process.cwd(), "lib/labs/store/schema.sql"), "utf8");
    const statements = text
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .split(/;\s*(?:\n|$)/)
      .map((s) => s.trim())
      .filter((s) => s.includes("nl_cove_"));
    for (const statement of statements) await query(statement);
  })().catch((e) => {
    ready = undefined;
    throw e;
  });
  return ready;
}
const sql = async (text: string, params: unknown[]) => {
  await ensureCove();
  return query(text, params);
};

const ROOM = "cove";
/** Per visitor: 20 requests banked, 10 a second back. The shim sends about 7 a second. */
const PLAYER_CAP = 20;
const PLAYER_RATE = 10;
/** Per address: room for a few visitors behind one office network. A join costs 20. */
const ADDR_CAP = 160;
const ADDR_RATE = 60;
const JOIN_COST = 20;
/** Live visitors one address may hold, so one machine cannot fill the room. */
const ADDR_PLAYERS = 8;

export type Porch = { id: string; design: string; started: number; owner: string } | null;
export type RoomDuck = Duck & { id: string; fishStarted: number };
export type Room = { self: string; ducks: RoomDuck[]; clock: number; porch: Porch };
export type Tick =
  | { kind: "ok"; room: Room; denied?: { printDenied: string; reason: "busy" | "position" } }
  | { kind: "unknown" }
  | { kind: "limited" };
export type Join = { kind: "ok"; token: string; room: Room } | { kind: "full" } | { kind: "limited" };

const hash = (s: string) => createHash("sha256").update(s).digest("hex");
/** The client address, hashed so the table never holds an IP. */
export const addressKey = (address: string) => "a:" + hash("nl-cove:" + address).slice(0, 32);

const num = (v: unknown) => Number(v);
const toPorch = (v: unknown): Porch => {
  if (!v || typeof v !== "object") return null;
  const p = v as Record<string, unknown>;
  return { id: String(p.id), design: String(p.design), started: num(p.started), owner: String(p.owner) };
};
const toDucks = (v: unknown): RoomDuck[] =>
  (Array.isArray(v) ? v : []).map((d: Record<string, unknown>) => ({
    id: String(d.id),
    x: num(d.x),
    z: num(d.z),
    yaw: num(d.yaw),
    band: num(d.band),
    wave: num(d.wave),
    fish: String(d.fish),
    catchId: num(d.catchId),
    fishSeq: num(d.fishSeq),
    fishStarted: num(d.fishStarted),
  }));

/**
 * The address bucket as a CTE: $1 key, $2 now, $3 cost. Returns the tokens left; below 0 means refused. A refused
 * request still spends, down to minus one full bucket, so an address that keeps hammering stays refused.
 */
const ADDR_BUCKET = `lim as (
  insert into nl_cove_limits (key, tokens, at) values ($1, ${ADDR_CAP} - $3::float8, $2::bigint)
  on conflict (key) do update set
    tokens = greatest(-${ADDR_CAP},
      least(${ADDR_CAP}, nl_cove_limits.tokens + greatest(0, $2::bigint - nl_cove_limits.at) / 1000.0 * ${ADDR_RATE}) - $3::float8),
    at = $2::bigint
  returning tokens
)`;

/** Everyone live in the room except `$except`, as the room server's duck objects, and the press. */
const OTHERS = (now: string, except: string) => `
  coalesce((select json_agg(o.state || jsonb_build_object('id', o.id, 'fishStarted', o.fish_started))
    from nl_cove_players o
    where o.room = '${ROOM}' and o.seen > ${now} - ${DROP_MS} and o.state is not null and o.id <> ${except}), '[]'::json) as others,
  (select row_to_json(c) from (select id, design, started, owner from nl_cove_porch where room = '${ROOM}') c) as porch`;

/**
 * A new visitor: refused when the address is over its bucket or its share, or the room holds 32. Visitors gone
 * longer than DROP_MS, address buckets idle for a minute and a print order finished a minute ago are cleared here,
 * so the tables stay small. A finished order looks the same to the game as no order.
 */
export async function join(address: string): Promise<Join> {
  const now = Date.now();
  const id = randomBytes(4).toString("hex");
  const token = randomBytes(16).toString("hex");
  const key = addressKey(address);
  const [row] = await sql(
    `with gone as (delete from nl_cove_players where seen < $2::bigint - ${DROP_MS}),
      idle as (delete from nl_cove_limits where at < $2::bigint - 60000 and key <> $1),
      spent as (delete from nl_cove_porch where started < $2::bigint - 60000),
      ${ADDR_BUCKET},
      ins as (
        insert into nl_cove_players (id, room, token_hash, addr, state, fish_started, tokens, at, seen)
        select $4, '${ROOM}', $5, $1, null, 0, ${PLAYER_CAP}, $2::bigint, $2::bigint
        where (select tokens from lim) >= 0
          and (select count(*) from nl_cove_players where room = '${ROOM}' and seen > $2::bigint - ${DROP_MS}) < ${MAX_PLAYERS}
          and (select count(*) from nl_cove_players where addr = $1 and seen > $2::bigint - ${DROP_MS}) < ${ADDR_PLAYERS}
        returning id
      )
    select (select tokens from lim) as lim, (select id from ins) as id, ${OTHERS("$2::bigint", "''")}`,
    [key, now, JOIN_COST, id, hash(token)],
  );
  if (num(row.lim) < 0) return { kind: "limited" };
  if (!row.id) return { kind: "full" };
  return { kind: "ok", token, room: { self: id, ducks: toDucks(row.others), clock: now, porch: toPorch(row.porch) } };
}

/**
 * One tick: charge both buckets, write the duck when one was sent, and read the room. fish_started follows the
 * room server: kept while the fish state and its sequence are unchanged, otherwise now minus the age the game sent.
 * A print order then goes to the press if this duck stands at the bench and no print is still running.
 */
export async function tick(address: string, token: string, move: Move | null, print: Print | null): Promise<Tick> {
  const now = Date.now();
  const params: unknown[] = [
    addressKey(address),
    now,
    1,
    hash(token),
    move ? JSON.stringify(move.duck) : null,
    move?.duck.fish ?? null,
    move?.duck.fishSeq ?? null,
    move ? now - Math.round(move.fishAge * 1000) : null,
  ];
  const [row] = await sql(
    `with ${ADDR_BUCKET},
      me as (
        update nl_cove_players p set
          tokens = least(${PLAYER_CAP}, p.tokens + greatest(0, $2::bigint - p.at) / 1000.0 * ${PLAYER_RATE}) - 1,
          at = $2::bigint,
          seen = $2::bigint,
          state = coalesce($5::jsonb, p.state),
          fish_started = case
            when $5::jsonb is null then p.fish_started
            when p.state->>'fish' = $6::text and (p.state->>'fishSeq')::float8 = $7::float8 then p.fish_started
            else $8::bigint end
        where p.token_hash = $4 and p.room = '${ROOM}' and p.seen > $2::bigint - ${DROP_MS}
          and (select tokens from lim) >= 0
          and least(${PLAYER_CAP}, p.tokens + greatest(0, $2::bigint - p.at) / 1000.0 * ${PLAYER_RATE}) >= 1
        returning p.id, p.state, p.fish_started
      )
    select (select tokens from lim) as lim,
      exists (select 1 from nl_cove_players where token_hash = $4 and room = '${ROOM}' and seen > $2::bigint - ${DROP_MS}) as known,
      (select row_to_json(m) from me m) as me,
      ${OTHERS("$2::bigint", "coalesce((select id from me), '')")}`,
    params,
  );
  if (!row.known) return { kind: "unknown" };
  if (num(row.lim) < 0 || !row.me) return { kind: "limited" };

  const me = row.me as { id: string; state: Duck | null; fish_started: unknown };
  const ducks = toDucks(row.others);
  if (me.state) ducks.push(...toDucks([{ ...me.state, id: me.id, fishStarted: me.fish_started }]));
  let porch = toPorch(row.porch);
  let denied: { printDenied: string; reason: "busy" | "position" } | undefined;

  if (print && !(porch?.id === print.id && porch.owner === me.id)) {
    const here = !!me.state && atPrintBench(num(me.state.x), num(me.state.z));
    if (!here || (porch && now - porch.started < PRINT_MS)) {
      denied = { printDenied: print.id, reason: here ? "busy" : "position" };
    } else {
      const [won] = await sql(
        `insert into nl_cove_porch (room, id, design, started, owner) values ('${ROOM}', $1, $2, $3::bigint, $4)
        on conflict (room) do update set id = excluded.id, design = excluded.design, started = excluded.started, owner = excluded.owner
          where nl_cove_porch.started <= $3::bigint - ${PRINT_MS}
        returning id, design, started, owner`,
        [print.id, print.design, now, me.id],
      );
      // Another visitor's order reached the press between the two statements.
      if (won) porch = toPorch(won);
      else denied = { printDenied: print.id, reason: "busy" };
    }
  }
  return { kind: "ok", room: { self: me.id, ducks, clock: now, porch }, denied };
}

/**
 * A visitor closing the game leaves at once instead of after DROP_MS. The address bucket goes too when no other
 * visitor from that address is still in the cove.
 */
export async function leave(address: string, token: string): Promise<void> {
  const key = addressKey(address);
  await sql(
    `with gone as (delete from nl_cove_players where token_hash = $2 returning id)
    delete from nl_cove_limits where key = $1
      and not exists (select 1 from nl_cove_players where addr = $1 and token_hash <> $2 and seen > $3::bigint - ${DROP_MS})`,
    [key, hash(token), Date.now()],
  );
}
