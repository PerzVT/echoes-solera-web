/**
 * The Tidebell Cove rooms in Postgres (tables nl_cove_*, lib/labs/store/schema.sql). The game's own server keeps
 * its rooms in memory and runs timers; on Vercel each request may land on a different function instance, so the
 * rooms live in these tables and every timer is worked out from stored times when a request arrives:
 *   - the six-second drop: a visitor counts only while `seen` is within DROP_MS;
 *   - the Tide Hall seat: `seat_since` plus SEAT_MS, then the earliest `queued_at` takes the seat;
 *   - the Bandstand music clock: `started_at` moves on in whole TRACK_MS steps, and votes count only while their
 *     `vote_period` equals the period that ended;
 *   - the press, phrase, emote and report cooldowns: stored start times compared with now.
 * A plain tick is one statement (charge the buckets, write the duck, read the room). A room whose seat or music
 * clock is due to move on adds one compare-and-set update. The game's one-off messages (join, chat, print...) add a
 * statement each. Rules and checks live in lib/labs/cove/room.ts.
 */
import { createHash, createHmac, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  ADJECTIVES, CAPACITY, DROP_MS, EMOTE_MS, MAX_INSTANCES, MAX_VISITORS, NOUNS, PRINT_MS, QUEUE_TILE, REPORT_MS, ROOMS,
  SAY_MS, SEAT_MS, START, TRACK_MS, atPrintBench, roomsAllowing, type Action, type Move, type Outfit, type RoomId,
} from "@/lib/labs/cove/room";
import { sql as query } from "./postgres";

/**
 * postgres.ts applies schema.sql once per process. A process that started before the nl_cove_ tables changed
 * would never see them, so the cove statements run once more here; they are all idempotent.
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
type Row = Record<string, unknown>;
const sql = async (text: string, params: unknown[]): Promise<Row[]> => {
  await ensureCove();
  return query(text, params);
};

/** Per visitor: 20 requests banked, 10 a second back. The shim sends about 7 a second. */
const PLAYER_CAP = 20;
const PLAYER_RATE = 10;
/** Per address: room for a few visitors behind one office network. A new session costs 20. */
const ADDR_CAP = 160;
const ADDR_RATE = 60;
const JOIN_COST = 20;
/** Live visitors one address may hold, so one machine cannot fill the rooms. */
const ADDR_PLAYERS = 8;
/** One-off messages taken from one request; the shim sends at most this many. */
export const MAX_ACTIONS = 4;

const LIVE = (now: string, alias: string) => `${alias}.seen > ${now} - ${DROP_MS}`;
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
/**
 * The client address, keyed with the site's secret so the tables never hold an IP and the stored value cannot be
 * turned back into one by hashing every address.
 */
export const addressKey = (address: string) =>
  "a:" + createHmac("sha256", process.env.AUTH_SECRET || "nl-cove").update(address).digest("hex").slice(0, 32);
/** Reports kept at most, and for how long: the table is public-writable, so it has a ceiling. */
const REPORT_ROWS = 2000;
const REPORT_KEEP_MS = 30 * 24 * 60 * 60 * 1000;
const num = (v: unknown) => Number(v);

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

export type Porch = { id: string; design: string; started: number; owner: string } | null;
type Duck = { x: number; z: number; yaw: number; wave: number; fish: string; catchId: number; fishSeq: number };
type Player = {
  id: string; joined: number; name: [number, number]; outfit: Outfit; duck: Duck; fishStarted: number;
  vote: number | null; votePeriod: number | null; queuedAt: number | null;
};
export type Reply = Record<string, unknown>;
export type Snapshot = Record<string, unknown>;
export type Tick = { kind: "ok"; replies: Reply[]; snapshot: Snapshot | null } | { kind: "unknown" } | { kind: "limited" };
export type Session = { kind: "ok"; token: string } | { kind: "full" } | { kind: "limited" };

const toPlayer = (r: Row): Player => {
  const d = (r.duck ?? {}) as Row;
  return {
    id: String(r.id),
    joined: num(r.joined),
    name: [num(r.name0), num(r.name1)],
    outfit: r.outfit as Outfit,
    duck: {
      x: num(d.x), z: num(d.z), yaw: num(d.yaw), wave: num(d.wave), fish: String(d.fish ?? "idle"),
      catchId: num(d.catchId), fishSeq: num(d.fishSeq),
    },
    fishStarted: num(r.fish_started),
    vote: r.vote == null ? null : num(r.vote),
    votePeriod: r.vote_period == null ? null : num(r.vote_period),
    queuedAt: r.queued_at == null ? null : num(r.queued_at),
  };
};
const toPorch = (v: unknown): Porch => {
  if (!v || typeof v !== "object") return null;
  const p = v as Row;
  return { id: String(p.id), design: String(p.design), started: num(p.started), owner: String(p.owner) };
};

/**
 * A new visitor session, not yet in a room: the game sends its join once the socket opens. Refused when the address
 * is over its bucket or its share, or 320 visitors are live. Visitors gone longer than DROP_MS, address buckets idle
 * for a minute and room instances empty and untouched for a minute are cleared here, so the tables stay small.
 */
export async function session(address: string): Promise<Session> {
  const now = Date.now();
  const key = addressKey(address);
  const token = randomBytes(16).toString("hex");
  const [row] = await sql(
    `with gone as (delete from nl_cove_visitors where seen < $2::bigint - ${DROP_MS}),
      idle as (delete from nl_cove_limits where at < $2::bigint - 60000 and key <> $1),
      empty as (
        delete from nl_cove_rooms r where r.touched < $2::bigint - 60000
          and not exists (select 1 from nl_cove_visitors w where w.room = r.room and w.inst = r.inst and ${LIVE("$2::bigint", "w")})
      ),
      ${ADDR_BUCKET},
      ins as (
        insert into nl_cove_visitors (id, token_hash, addr, tokens, at, seen)
        select $4, $5, $1, ${PLAYER_CAP}, $2::bigint, $2::bigint
        where (select tokens from lim) >= 0
          and (select count(*) from nl_cove_visitors w where ${LIVE("$2::bigint", "w")}) < ${MAX_VISITORS}
          and (select count(*) from nl_cove_visitors w where w.addr = $1 and ${LIVE("$2::bigint", "w")}) < ${ADDR_PLAYERS}
        returning id
      )
    select (select tokens from lim) as lim, (select id from ins) as id`,
    [key, now, JOIN_COST, randomBytes(6).toString("hex"), hash(token)],
  );
  if (num(row.lim) < 0) return { kind: "limited" };
  if (!row.id) return { kind: "full" };
  return { kind: "ok", token };
}

/** room-server.mjs enter(): the first instance with room (or the visitor's own), then a free arrival spot. */
async function join(tokenHash: string, action: Extract<Action, { type: "join" }>, now: number): Promise<Reply | null> {
  const [me] = await sql(
    `select v.id, v.room, v.inst,
      (select coalesce(json_agg(json_build_object('inst', o.inst, 'x', (o.duck->>'x')::float8, 'z', (o.duck->>'z')::float8)), '[]'::json)
        from nl_cove_visitors o where o.room = $2 and o.id <> v.id and ${LIVE("$3::bigint", "o")}) as others
    from nl_cove_visitors v where v.token_hash = $1 and ${LIVE("$3::bigint", "v")}`,
    [tokenHash, action.room, now],
  );
  if (!me) return null;
  const others = me.others as { inst: number; x: number; z: number }[];
  let candidate = 0;
  for (let i = 1; i <= MAX_INSTANCES; i++) {
    const own = me.room === action.room && num(me.inst) === i;
    if (own || others.filter((o) => o.inst === i).length < CAPACITY) {
      candidate = i;
      break;
    }
  }
  if (!candidate) return { type: "denied", reason: "join" };
  const here = others.filter((o) => o.inst === candidate);
  const slots = START[action.room];
  const [x, z] = slots.find(([x, z]) => here.every((p) => Math.hypot(p.x - x, p.z - z) > 0.7)) ?? slots[here.length % slots.length];
  const duck: Duck = { x, z, yaw: 0, wave: 0, fish: "idle", catchId: 0, fishSeq: 0 };
  await sql(
    `with r as (
        insert into nl_cove_rooms (room, inst, started_at, touched) values ($2, $3, $4::bigint, $4::bigint)
        on conflict (room, inst) do update set touched = excluded.touched returning 1
      ),
      seat as (update nl_cove_rooms set seat_id = null, seat_since = null, version = version + 1, touched = $4::bigint where seat_id = $9)
    update nl_cove_visitors set room = $2, inst = $3, joined = $4::bigint, name0 = $5, name1 = $6, outfit = $7::jsonb,
      duck = $8::jsonb, fish_started = $4::bigint, last_say = 0, last_emote = 0, last_report = 0,
      vote = null, vote_period = null, queued_at = null
    where token_hash = $1`,
    [tokenHash, action.room, candidate, now, action.name[0], action.name[1], JSON.stringify(action.outfit), JSON.stringify(duck), me.id],
  );
  return { type: "joined", room: action.room, instance: candidate, x, z };
}

/** say, emote and emote-stop: a cooldown, then the next event number in the room log, which keeps twenty. */
async function logEvent(tokenHash: string, type: string, arg: string | null, cooldown: "last_say" | "last_emote" | null, wait: number, now: number) {
  const [row] = await sql(
    `with me as (
        update nl_cove_visitors v set ${cooldown ? `${cooldown} = $4::bigint` : "seen = v.seen"}
        where v.token_hash = $1 and v.room is not null and ${LIVE("$4::bigint", "v")}
          ${cooldown ? `and v.${cooldown} <= $4::bigint - ${wait}` : ""}
        returning v.id, v.room, v.inst
      ),
      r as (
        update nl_cove_rooms r set seq = r.seq + 1, touched = $4::bigint from me
        where r.room = me.room and r.inst = me.inst returning r.room, r.inst, r.seq
      ),
      ev as (
        insert into nl_cove_events (room, inst, seq, type, player, arg, at)
        select r.room, r.inst, r.seq, $2, me.id, $3, $4::bigint from r, me returning seq
      ),
      old as (delete from nl_cove_events e using r where e.room = r.room and e.inst = r.inst and e.seq <= r.seq - 20)
    select (select seq from ev) as seq`,
    [tokenHash, type, arg, now],
  );
  return row?.seq != null;
}

/** Whether the visitor is in a room at all; the room server ignores every message but join until then. */
async function inRoom(tokenHash: string, now: number) {
  const rows = await sql(`select 1 from nl_cove_visitors v where v.token_hash = $1 and v.room is not null and ${LIVE("$2::bigint", "v")}`, [tokenHash, now]);
  return rows.length > 0;
}

async function act(tokenHash: string, action: Action, move: Move | null, now: number): Promise<Reply | null> {
  if (action.type === "join") return join(tokenHash, action, now);
  if (!(await inRoom(tokenHash, now))) return null;
  const denied = { type: "denied", reason: action.type };
  switch (action.type) {
    case "say":
      return (await logEvent(tokenHash, "say", action.phrase, "last_say", SAY_MS, now)) ? null : denied;
    case "emote":
      return (await logEvent(tokenHash, "emote", action.emote, "last_emote", EMOTE_MS, now)) ? null : denied;
    case "emote-stop":
      return (await logEvent(tokenHash, "emote-stop", null, null, 0, now)) ? null : denied;
    case "vote": {
      const rows = await sql(
        `update nl_cove_visitors v set vote = $2, vote_period = r.started_at + floor(($3::bigint - r.started_at) / ${TRACK_MS}.0)::bigint * ${TRACK_MS}
        from nl_cove_rooms r
        where v.token_hash = $1 and v.room = 'bandstand' and r.room = v.room and r.inst = v.inst and ${LIVE("$3::bigint", "v")}
        returning v.id`,
        [tokenHash, action.track, now],
      );
      return rows.length ? null : denied;
    }
    case "seat": {
      const rows = await sql(
        `update nl_cove_visitors v set queued_at = $2::bigint
        where v.token_hash = $1 and v.room = 'hall' and v.queued_at is null and ${LIVE("$2::bigint", "v")}
          and sqrt(power((v.duck->>'x')::float8 - ${QUEUE_TILE.x}, 2) + power((v.duck->>'z')::float8 - (${QUEUE_TILE.z}), 2)) <= ${QUEUE_TILE.reach}
          and not exists (select 1 from nl_cove_rooms r where r.room = v.room and r.inst = v.inst and r.seat_id = v.id and r.seat_since > $2::bigint - ${SEAT_MS})
        returning v.id`,
        [tokenHash, now],
      );
      return rows.length ? null : denied;
    }
    case "leave-seat":
      await sql(
        `with me as (update nl_cove_visitors set queued_at = null where token_hash = $1 returning id, room, inst)
        update nl_cove_rooms r set seat_id = null, seat_since = null, version = r.version + 1, touched = $2::bigint
        from me where r.room = me.room and r.inst = me.inst and r.seat_id = me.id`,
        [tokenHash, now],
      );
      return null;
    case "report":
      try {
        const [row] = await sql(
          `with old as (delete from nl_cove_reports where at < $4::bigint - ${REPORT_KEEP_MS}),
            tgt as (
              select t.id, t.token_hash, t.name0, t.name1, t.room, t.inst from nl_cove_visitors t
              where t.id = $2 and ${LIVE("$4::bigint", "t")}
            ),
            me as (
              update nl_cove_visitors v set last_report = $4::bigint from tgt
              where v.token_hash = $1 and ${LIVE("$4::bigint", "v")} and v.room = tgt.room and v.inst = tgt.inst
                and v.id <> tgt.id and v.last_report <= $4::bigint - ${REPORT_MS}
              returning v.room, v.inst, v.token_hash
            ),
            ins as (
              insert into nl_cove_reports (at, room, inst, reporter_hash, target_id, target_hash, target_name, reason, events)
              select $4::bigint, me.room, me.inst, me.token_hash, tgt.id, tgt.token_hash,
                coalesce(($5::text[])[tgt.name0 + 1] || ' ' || ($6::text[])[tgt.name1 + 1], 'Visitor'), $3,
                (select coalesce(json_agg(json_build_object('seq', e.seq, 'type', e.type, 'player', e.player, 'arg', e.arg, 'at', e.at) order by e.seq), '[]'::json)
                  from nl_cove_events e where e.room = me.room and e.inst = me.inst)
              from me, tgt where (select count(*) from nl_cove_reports) < ${REPORT_ROWS} returning id
            )
          select (select id from ins) as id`,
          [tokenHash, action.target, action.reason, now, ADJECTIVES, NOUNS],
        );
        // The game is told the report was saved only once the row is written.
        return row?.id != null ? { type: "reported", reason: "saved" } : { type: "denied", reason: "report" };
      } catch (e) {
        console.error("cove report:", e instanceof Error ? `${e.name}: ${e.message}` : "unknown error");
        return { type: "denied", reason: "report-storage" };
      }
    case "print": {
      const [me] = await sql(
        `select v.id, v.room, v.inst, v.duck, r.porch from nl_cove_visitors v
        left join nl_cove_rooms r on r.room = v.room and r.inst = v.inst where v.token_hash = $1`,
        [tokenHash],
      );
      if (!me?.room) return null;
      const porch = toPorch(me.porch);
      if (porch?.id === action.id && porch.owner === me.id) return null;
      // The game sends a fresh move just before its print order; that move rides in the same request.
      const duck = me.duck as Row;
      const [x, z] = move && me.room === "porch" ? [move.x, move.z] : [num(duck?.x), num(duck?.z)];
      const here = me.room === "porch" && atPrintBench(x, z);
      if (!here || (porch && now - porch.started < PRINT_MS)) return { printDenied: action.id, reason: here ? "busy" : "position" };
      const won = await sql(
        `update nl_cove_rooms set porch = $3::jsonb, touched = $4::bigint
        where room = $1 and inst = $2 and (porch is null or (porch->>'started')::bigint <= $4::bigint - ${PRINT_MS})
        returning 1`,
        [me.room, me.inst, JSON.stringify({ id: action.id, design: action.design, started: now, owner: me.id }), now],
      );
      return won.length ? null : { printDenied: action.id, reason: "busy" };
    }
  }
}

/**
 * One tick: the one-off messages in order, then one statement that charges both buckets, writes the duck when the
 * move is allowed in the visitor's room (inside its bounds and props, not while seated) and reads the room, its log
 * and the presence of every room. The seat and music clock are then moved on from their stored times.
 */
export async function tick(address: string, token: string, move: Move | null, actions: Action[]): Promise<Tick> {
  const tokenHash = hash(token);
  const replies: Reply[] = [];
  // The address pays for its one-off messages before any of them runs.
  if (actions.length) {
    const [paid] = await sql(`with ${ADDR_BUCKET} select tokens from lim`, [addressKey(address), Date.now(), actions.length]);
    if (num(paid?.tokens) < 0) return { kind: "limited" };
  }
  for (const action of actions) {
    const reply = await act(tokenHash, action, move, Date.now());
    if (reply) replies.push(reply);
  }

  const now = Date.now();
  const wire = move ? { x: move.x, z: move.z, yaw: move.yaw, wave: move.wave, catchId: move.catchId, fishSeq: move.fishSeq } : null;
  const [row] = await sql(
    `with ${ADDR_BUCKET},
      cur as (
        select v.id,
          ($5::jsonb is not null and v.room = any($6::text[])
            and not exists (select 1 from nl_cove_rooms r where r.room = v.room and r.inst = v.inst and r.seat_id = v.id)) as moved,
          case when v.room = 'beach' then $7::text else 'idle' end as fish
        from nl_cove_visitors v where v.token_hash = $4 and ${LIVE("$2::bigint", "v")}
      ),
      me as (
        update nl_cove_visitors v set
          tokens = least(${PLAYER_CAP}, v.tokens + greatest(0, $2::bigint - v.at) / 1000.0 * ${PLAYER_RATE}) - 1,
          at = $2::bigint,
          seen = $2::bigint,
          duck = case when cur.moved then $5::jsonb || jsonb_build_object('fish', cur.fish) else v.duck end,
          fish_started = case
            when not cur.moved then v.fish_started
            when v.duck->>'fish' = cur.fish and (v.duck->>'fishSeq')::float8 = $8::float8 then v.fish_started
            else $9::bigint end,
          name0 = case when cur.moved and $10::int is not null then $10::int else v.name0 end,
          name1 = case when cur.moved and $11::int is not null then $11::int else v.name1 end,
          outfit = case when cur.moved and $12::jsonb is not null then $12::jsonb else v.outfit end
        from cur
        where v.id = cur.id and (select tokens from lim) >= 0
          and least(${PLAYER_CAP}, v.tokens + greatest(0, $2::bigint - v.at) / 1000.0 * ${PLAYER_RATE}) >= 1
        returning v.id, v.room, v.inst, v.joined, v.name0, v.name1, v.outfit, v.duck, v.fish_started, v.vote, v.vote_period, v.queued_at
      )
    select (select tokens from lim) as lim,
      exists (select 1 from cur) as known,
      (select row_to_json(m) from me m) as me,
      (select row_to_json(r) from nl_cove_rooms r, me where r.room = me.room and r.inst = me.inst) as room,
      coalesce((select json_agg(json_build_object('id', o.id, 'joined', o.joined, 'name0', o.name0, 'name1', o.name1,
          'outfit', o.outfit, 'duck', o.duck, 'fish_started', o.fish_started, 'vote', o.vote, 'vote_period', o.vote_period,
          'queued_at', o.queued_at) order by o.joined, o.id)
        from nl_cove_visitors o, me where o.room = me.room and o.inst = me.inst and o.id <> me.id and ${LIVE("$2::bigint", "o")}), '[]'::json) as others,
      coalesce((select json_agg(json_build_object('seq', e.seq, 'type', e.type, 'player', e.player, 'arg', e.arg, 'at', e.at) order by e.seq)
        from nl_cove_events e, me where e.room = me.room and e.inst = me.inst), '[]'::json) as events,
      coalesce((select json_agg(json_build_object('room', r.room, 'instance', r.inst,
          'heads', coalesce((select json_agg(h.outfit) from (
            select w.outfit from nl_cove_visitors w where w.room = r.room and w.inst = r.inst and ${LIVE("$2::bigint", "w")}
            order by w.joined, w.id limit 5) h), '[]'::json),
          'count', (select count(*) from nl_cove_visitors w where w.room = r.room and w.inst = r.inst and ${LIVE("$2::bigint", "w")}))
          order by r.room, r.inst)
        from nl_cove_rooms r), '[]'::json) as presence`,
    [
      addressKey(address), now, 1, tokenHash,
      wire ? JSON.stringify(wire) : null,
      move ? roomsAllowing(move.x, move.z) : [],
      move?.fish ?? "idle",
      move?.fishSeq ?? null,
      move ? now - Math.round(move.fishAge * 1000) : null,
      move?.name?.[0] ?? null,
      move?.name?.[1] ?? null,
      move?.outfit ? JSON.stringify(move.outfit) : null,
    ],
  );
  if (!row.known) return { kind: "unknown" };
  if (num(row.lim) < 0 || !row.me) return { kind: "limited" };
  const meRow = row.me as Row;
  if (!meRow.room || !row.room) return { kind: "ok", replies, snapshot: null };

  const me = toPlayer(meRow);
  const players = [me, ...(row.others as Row[]).map(toPlayer)].sort((a, b) => a.joined - b.joined || a.id.localeCompare(b.id));
  const room = row.room as Row;
  const roomId = String(room.room) as RoomId;
  const inst = num(room.inst);
  const state = await advance(roomId, inst, room, players, now);

  const presence: Record<string, { instance: number; heads: unknown[]; full: boolean }[]> = Object.fromEntries(ROOMS.map((id) => [id, []]));
  for (const p of row.presence as Row[]) presence[String(p.room)]?.push({ instance: num(p.instance), heads: p.heads as unknown[], full: num(p.count) >= CAPACITY });

  const ducks = players.map((p) => ({
    id: p.id, x: p.duck.x, z: p.duck.z, yaw: p.duck.yaw, band: 0, wave: p.duck.wave, fish: p.duck.fish, catchId: p.duck.catchId,
    fishStarted: p.fishStarted, fishSeq: p.duck.fishSeq, name: p.name, outfit: p.outfit,
    ...(state.seat?.id === p.id ? { x: 0, z: -8, seated: true } : {}),
  }));
  const events = (row.events as Row[]).map((e) => ({
    type: String(e.type), player: String(e.player),
    ...(e.type === "say" ? { phrase: e.arg } : e.type === "emote" ? { emote: e.arg } : {}),
    seq: num(e.seq), at: num(e.at),
  }));
  const snapshot: Snapshot = {
    room: roomId, clock: now, events, track: state.track, startedAt: state.startedAt, seat: state.seat, queue: state.queue,
    votes: state.votes, self: me.id, instance: inst, ducks, porch: toPorch(room.porch), presence,
  };
  return { kind: "ok", replies, snapshot };
}

/**
 * world-state.mjs advance(), from stored times. A seat held 30 s, or by someone who left, frees; the first visitor
 * in the queue takes it. Past the 96 s boundary the most-voted track plays next (or the next track with no votes)
 * and the clock moves on in whole steps. A change is written with compare-and-set on the room's version; if another
 * instance wrote first, its result stands and this answer still shows the same transition.
 */
async function advance(roomId: RoomId, inst: number, room: Row, players: Player[], now: number) {
  const present = new Set(players.map((p) => p.id));
  let seat = room.seat_id ? { id: String(room.seat_id), since: num(room.seat_since) } : null;
  let track = num(room.track);
  let startedAt = num(room.started_at);
  let changed = false;
  let seated: string | null = null;
  if (seat && (now - seat.since >= SEAT_MS || !present.has(seat.id))) {
    seat = null;
    changed = true;
  }
  const queue = players.filter((p) => p.queuedAt != null).sort((a, b) => a.queuedAt! - b.queuedAt! || a.id.localeCompare(b.id));
  if (!seat && queue.length) {
    const next = queue.shift()!;
    seat = { id: next.id, since: now };
    seated = next.id;
    changed = true;
  }
  if (now - startedAt >= TRACK_MS) {
    const steps = Math.floor((now - startedAt) / TRACK_MS);
    const scores = [0, 0, 0];
    for (const p of players) if (p.vote != null && p.votePeriod === startedAt) scores[p.vote]++;
    const high = Math.max(...scores);
    track = high ? scores.indexOf(high) : (track + 1) % 3;
    startedAt += steps * TRACK_MS;
    changed = true;
  }
  if (changed) {
    await sql(
      `with r as (
          update nl_cove_rooms set seat_id = $3, seat_since = $4, track = $5, started_at = $6::bigint, version = version + 1, touched = $7::bigint
          where room = $1 and inst = $2 and version = $8 returning 1
        )
      update nl_cove_visitors set queued_at = null where id = $9 and exists (select 1 from r)`,
      [roomId, inst, seat?.id ?? null, seat?.since ?? null, track, startedAt, now, num(room.version), seated],
    );
  }
  const votes = Object.fromEntries(players.filter((p) => p.vote != null && p.votePeriod === startedAt).map((p) => [p.id, p.vote]));
  return { seat, track, startedAt, queue: queue.map((p) => p.id), votes };
}

/**
 * A visitor closing the game leaves at once instead of after DROP_MS. A seat it held frees on the next tick, as
 * the room server's leave() does. The address bucket stays, so leaving never refunds what the address has spent.
 */
export async function leave(token: string): Promise<void> {
  await sql(`delete from nl_cove_visitors where token_hash = $1`, [hash(token)]);
}
