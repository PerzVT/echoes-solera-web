/**
 * The Notion API, read-only, with the site's shared internal-integration token (env NOTION_TOKEN). The owner shares
 * the studio's databases with that integration; the site sees exactly what it was shared, and never writes.
 * Version 2026-03-11 (developers.notion.com/reference/versioning, checked 2026-11-18): databases come back from
 * search as `data_source` objects, pages are read whole with GET /v1/pages/{id}/markdown.
 */
import { Bad } from "@/lib/labs/store/validate";

const API = "https://api.notion.com/v1";
export const NOTION_VERSION = "2026-03-11";

export const notionToken = () => process.env.NOTION_TOKEN?.trim() || null;

export function requireNotion() {
  const token = notionToken();
  if (!token) throw new Bad("not_linked", "Notion is not linked.", 503);
  return token;
}

/** Only GET, and POST to the read endpoints (search and query). Nothing that changes Notion is ever sent. */
type ReadPath = { method: "GET"; path: string } | { method: "POST"; path: `/search` | `/data_sources/${string}/query`; body: unknown };

export async function notion<T>(req: ReadPath): Promise<T> {
  const token = requireNotion();
  let res: Response;
  try {
    res = await fetch(`${API}${req.path}`, {
      method: req.method,
      headers: {
        authorization: `Bearer ${token}`,
        "notion-version": NOTION_VERSION,
        ...(req.method === "POST" ? { "content-type": "application/json" } : {}),
      },
      body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new Bad("notion_unreachable", "Notion could not be reached. Try again.", 502);
  }
  if (res.ok) return (await res.json()) as T;
  const code = ((await res.json().catch(() => null)) as { code?: string } | null)?.code ?? "";
  if (res.status === 401) throw new Bad("not_linked", "Notion is not linked.", 503);
  if (res.status === 403 || res.status === 404 || code === "object_not_found") throw new Bad("not_found", "That page is not shared with the site's Notion connection.", 404);
  if (res.status === 429) throw new Bad("busy", "Notion is busy. Try again in a minute.", 429);
  throw new Bad("notion_error", "Notion had a problem. Try again.", 502);
}

/** A Notion id from an id or a page address, as the 32 hex digits Notion accepts. */
export function notionId(v: unknown, field = "The Notion page"): string {
  if (typeof v !== "string") throw new Bad("invalid", `${field} is missing.`);
  const hex = v.split(/[?#]/)[0].replace(/-/g, "").match(/[0-9a-f]{32}(?=[^0-9a-f]*$)/i)?.[0];
  if (!hex) throw new Bad("invalid", `${field} is not valid.`);
  return hex.toLowerCase();
}
