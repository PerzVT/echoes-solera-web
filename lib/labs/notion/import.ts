/**
 * Notion into the creator: status, search, a script page into an episode's Script, and character pages into a
 * series' cast. Read-only towards Notion.
 */
import { addCast, saveScript } from "@/lib/labs/store/creator";
import { Bad, LIMITS, fileName, imageType } from "@/lib/labs/store/validate";
import type { NotionImportCastResult, NotionImportScriptResult, NotionSearchResult, NotionStatus } from "@/lib/labs/ai/contract";
import { notion, notionToken } from "./client";
import { blockImages, pageTitle, propFiles, propNamed, toItem, type NotionDataSource, type NotionFile, type NotionPage } from "./parse";

type List<T> = { results?: T[]; next_cursor?: string | null; has_more?: boolean };

export async function status(): Promise<NotionStatus> {
  if (!notionToken()) return { linked: false };
  try {
    const me = await notion<{ bot?: { workspace_name?: string | null } }>({ method: "GET", path: "/users/me" });
    return { linked: true, workspace: me.bot?.workspace_name ?? null };
  } catch (e) {
    if (e instanceof Bad && e.code === "not_linked") return { linked: false };
    return { linked: true, workspace: null };
  }
}

const cursorOk = (c: string | null) => (c && /^[\w-]{1,200}$/.test(c) ? c : undefined);

export async function search(query: string, type: "page" | "database" | null, cursor: string | null): Promise<NotionSearchResult> {
  const body: Record<string, unknown> = { page_size: 25, sort: { timestamp: "last_edited_time", direction: "descending" } };
  if (query) body.query = query;
  if (type) body.filter = { property: "object", value: type === "database" ? "data_source" : "page" };
  const start = cursorOk(cursor);
  if (start) body.start_cursor = start;
  const data = await notion<List<NotionPage | NotionDataSource>>({ method: "POST", path: "/search", body });
  return { items: (data.results ?? []).map(toItem).filter((x) => x !== null), next: data.has_more ? (data.next_cursor ?? null) : null };
}

/** The pages in one database (a data source), newest edits first. */
export async function listDatabase(dataSourceId: string, cursor: string | null): Promise<NotionSearchResult> {
  const body: Record<string, unknown> = { page_size: 25, sorts: [{ timestamp: "last_edited_time", direction: "descending" }] };
  const start = cursorOk(cursor);
  if (start) body.start_cursor = start;
  const data = await notion<List<NotionPage>>({ method: "POST", path: `/data_sources/${dataSourceId}/query`, body });
  return { items: (data.results ?? []).map(toItem).filter((x) => x !== null), next: data.has_more ? (data.next_cursor ?? null) : null };
}

/** The page as text: Notion's markdown of it, with its title as the first line, cut to the script limit. */
export async function pageText(pageId: string): Promise<{ text: string; title: string; truncated: boolean }> {
  const [page, md] = await Promise.all([
    notion<NotionPage>({ method: "GET", path: `/pages/${pageId}` }),
    notion<{ markdown?: string; truncated?: boolean }>({ method: "GET", path: `/pages/${pageId}/markdown` }),
  ]);
  const title = pageTitle(page);
  let text = [title, (md.markdown ?? "").trim()].filter(Boolean).join("\n\n");
  let truncated = !!md.truncated;
  if (text.length > LIMITS.scriptText) {
    text = text.slice(0, LIMITS.scriptText);
    truncated = true;
  }
  if (!text.trim()) throw new Bad("invalid", "That page has no text.");
  return { text, title, truncated };
}

/** The page's text as an episode's script. */
export async function importScript(by: string, pageId: string, episodeId: string): Promise<NotionImportScriptResult> {
  const { text, truncated } = await pageText(pageId);
  const script = await saveScript(by, episodeId, { text });
  return { script, truncated };
}

const MAX_PAGES = 20;
const MAX_IMAGES = 40;

/** Downloads one Notion-hosted file, up to the upload cap, and returns it only if it is a picture the cast accepts. */
async function download(file: NotionFile) {
  let res: Response;
  try {
    res = await fetch(file.url, { cache: "no-store", signal: AbortSignal.timeout(30_000) });
  } catch {
    return null;
  }
  if (!res.ok || !res.body) return null;
  const told = Number(res.headers.get("content-length"));
  if (told > LIMITS.upload) return null;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > LIMITS.upload) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.byteLength;
  }
  const type = imageType(bytes);
  return type ? { bytes, type } : null;
}

const tagFor = (name: string) => `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "sheet"}`;

/**
 * Each page is one character or place: its title is the name, a property named like Tag or Element ID gives the tag,
 * one named like Variant, Outfit or Episode the variant. Every Notion-hosted image in its files properties and its
 * top-level blocks becomes a sheet.
 */
export async function importCast(by: string, seriesId: string, pageIds: string[]): Promise<NotionImportCastResult> {
  if (pageIds.length > MAX_PAGES) throw new Bad("too_large", `Import at most ${MAX_PAGES} pages at a time.`, 413);
  const sheets: NotionImportCastResult["sheets"] = [];
  const skipped: NotionImportCastResult["skipped"] = [];
  let images = 0;
  for (const pageId of pageIds) {
    const page = await notion<NotionPage>({ method: "GET", path: `/pages/${pageId}` });
    const character = pageTitle(page).slice(0, 80).trim();
    if (!character) {
      skipped.push({ pageId, reason: "The page has no title." });
      continue;
    }
    const blocks = await notion<List<Parameters<typeof blockImages>[0][number]>>({ method: "GET", path: `/blocks/${pageId}/children?page_size=100` });
    const fromProps = propFiles(page);
    const fromBody = blockImages(blocks.results ?? []);
    const files = [...fromProps.files, ...fromBody.files];
    if (fromProps.external + fromBody.external) skipped.push({ pageId, reason: "Linked images from other sites were left out." });
    if (!files.length) {
      skipped.push({ pageId, reason: "The page has no images." });
      continue;
    }
    const tag = (propNamed(page, /^(tag|element ?id)$/i) ?? tagFor(character)).slice(0, 80);
    const variant = propNamed(page, /^(variant|outfit|episode)s?$/i)?.slice(0, 80) ?? null;
    for (const [i, file] of files.entries()) {
      if (images >= MAX_IMAGES) {
        skipped.push({ pageId, reason: `Only ${MAX_IMAGES} images are imported at a time.` });
        break;
      }
      const got = await download(file);
      if (!got) {
        skipped.push({ pageId, reason: "An image could not be read." });
        continue;
      }
      images += 1;
      const name = fileName(file.name);
      const sheetVariant = files.length > 1 ? (variant ? `${variant}, ${i + 1}` : name.replace(/\.[a-z0-9]+$/i, "").slice(0, 80)) : variant;
      sheets.push(await addCast(by, { seriesId, character, variant: sheetVariant, tag, image: { name, type: got.type, bytes: got.bytes } }));
    }
  }
  return { sheets, skipped };
}
