/**
 * What every creator API route shares: the session check, body size caps, and errors that say only a safe code
 * and a plain message. Nothing here trusts the request's own size or type headers.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { currentUser, sameOrigin, type Session } from "@/lib/labs/auth";
import { Bad, LIMITS } from "./validate";

const NO_STORE = { "cache-control": "no-store" };

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: NO_STORE });
const fail = (code: string, message: string, status: number) => NextResponse.json({ error: code, message }, { status, headers: NO_STORE });

/**
 * Runs a route with the signed-in user. No session: 401. A change sent from another site: 403. A Bad from the
 * checks becomes its own status; anything else is logged and answered with a plain 500, never the error itself.
 */
export async function withUser(request: NextRequest, run: (user: Session) => Promise<Response>) {
  const user = await currentUser(request.cookies);
  if (!user) return fail("unauthorized", "Sign in to continue.", 401);
  if (request.method !== "GET" && request.method !== "HEAD" && !sameOrigin(request)) return fail("forbidden", "That request came from another site.", 403);
  try {
    return await run(user);
  } catch (e) {
    if (e instanceof Bad) return fail(e.code, e.message, e.status);
    // The message only: a driver error object can carry connection details.
    console.error("creator api:", e instanceof Error ? `${e.name}: ${e.message}` : "unknown error");
    return fail("server", "That did not save. Try again.", 500);
  }
}

/** The body, read up to `max` bytes. A longer one is refused as soon as it passes the cap. */
async function readBody(request: NextRequest, max: number): Promise<Uint8Array> {
  const told = Number(request.headers.get("content-length"));
  if (told > max) throw new Bad("too_large", "That is too large to save.", 413);
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new Bad("too_large", "That is too large to save.", 413);
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.byteLength;
  }
  return out;
}

export async function readJson(request: NextRequest, max = LIMITS.json): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Bad("invalid", "Send JSON.", 415);
  const bytes = await readBody(request, max);
  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Bad("invalid", "That was not valid JSON.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Bad("invalid", "That was not valid JSON.");
  return data as Record<string, unknown>;
}

/** A multipart form, capped at `max` bytes in all. The form is parsed from the capped bytes, never from the stream. */
export async function readForm(request: NextRequest, max: number): Promise<FormData> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("multipart/form-data")) throw new Bad("invalid", "Send a form.", 415);
  const bytes = await readBody(request, max);
  try {
    return await new Response(bytes as BodyInit, { headers: { "content-type": type } }).formData();
  } catch {
    throw new Bad("invalid", "That form could not be read.");
  }
}

/** A file field of a form, or null when the field is empty. */
export async function formFile(form: FormData, field: string) {
  const f = form.get(field);
  if (!f || typeof f === "string" || f.size === 0) return null;
  return { name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) };
}
