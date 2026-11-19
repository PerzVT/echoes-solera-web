import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sameOrigin } from "@/lib/labs/auth";
import { isToken, readAction, readMove, type Action } from "@/lib/labs/cove/room";
import { MAX_ACTIONS, leave, session, tick } from "@/lib/labs/store/cove";

/**
 * The Tidebell Cove rooms over plain HTTP, for the WebSocket shim that app/walk/route.ts puts in front of the game.
 * Signed out and public, so it takes only this page's own requests, a small JSON body of numbers, booleans and ids
 * from the game's fixed lists, and answers with JSON alone. Bodies:
 *   {join: true}                                  a new visitor session: {token}
 *   {t, s?: the game's move, a?: one-off messages} one tick: {replies, snapshot}. replies are the room server's
 *                                                 direct answers (joined, denied, reported, printDenied); snapshot
 *                                                 is its broadcast, or null before the game has joined a room
 *   {t, leave: true}                              the visitor closed the game
 * COVE_MULTIPLAYER=off turns it off along with the shim.
 */
export const dynamic = "force-dynamic";

const MAX_BODY = 2048;
const HEADERS = { "cache-control": "no-store" };
const answer = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: HEADERS });
const fail = (code: string, status: number) => answer({ error: code }, status);

const KEYS = new Set(["join", "t", "s", "a", "leave"]);

/** The calling address as Vercel reports it. Only used, hashed, as a rate limit key. */
function address(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || request.headers.get("x-real-ip") || "local").slice(0, 64);
}

async function readBody(request: NextRequest): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > MAX_BODY) return undefined;
  if (!request.body) return undefined;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  if (process.env.COVE_MULTIPLAYER === "off") return fail("off", 404);
  // The shim always sends Origin; a request without one is not from the game page.
  if (!request.headers.get("origin") || !sameOrigin(request)) return fail("forbidden", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return fail("bad_request", 415);

  const body = await readBody(request);
  if (typeof body !== "object" || body === null || Array.isArray(body)) return fail("bad_request", 400);
  const fields = body as Record<string, unknown>;
  for (const key of Object.keys(fields)) if (!KEYS.has(key)) return fail("bad_request", 400);

  try {
    if (fields.join === true) {
      if (Object.keys(fields).length !== 1) return fail("bad_request", 400);
      const result = await session(address(request));
      if (result.kind === "limited") return fail("slow_down", 429);
      if (result.kind === "full") return fail("full", 503);
      return answer({ token: result.token });
    }

    if (!isToken(fields.t)) return fail("bad_request", 400);
    if (fields.leave === true) {
      if (Object.keys(fields).length !== 2) return fail("bad_request", 400);
      await leave(fields.t);
      return answer({ left: true });
    }
    if (fields.leave !== undefined || fields.join !== undefined) return fail("bad_request", 400);

    const move = fields.s === undefined ? null : readMove(fields.s);
    if (fields.s !== undefined && !move) return fail("bad_request", 400);
    const actions: Action[] = [];
    if (fields.a !== undefined) {
      if (!Array.isArray(fields.a) || fields.a.length > MAX_ACTIONS) return fail("bad_request", 400);
      for (const raw of fields.a) {
        const action = readAction(raw);
        if (!action) return fail("bad_request", 400);
        actions.push(action);
      }
    }

    const result = await tick(address(request), fields.t, move, actions);
    if (result.kind === "unknown") return fail("unknown", 401);
    if (result.kind === "limited") return fail("slow_down", 429);
    return answer({ replies: result.replies, snapshot: result.snapshot });
  } catch (e) {
    // The message only: a driver error can carry connection details.
    console.error("cove api:", e instanceof Error ? `${e.name}: ${e.message}` : "unknown error");
    return fail("server", 500);
  }
}
