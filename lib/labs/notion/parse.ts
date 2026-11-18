/**
 * Notion objects to what the creator needs. Shapes from developers.notion.com/reference (2026-03-11): page
 * properties (title, rich_text, select, status, checkbox, files...), data sources with a `title` rich-text array,
 * and image blocks. Unknown or partial objects give empty values, never an error.
 */
import type { NotionItem } from "@/lib/labs/ai/contract";

type Rich = { plain_text?: string }[];
type Prop = { type?: string; [k: string]: unknown };
export type NotionPage = { object: "page"; id: string; url?: string; last_edited_time?: string; parent?: Record<string, unknown>; properties?: Record<string, Prop>; in_trash?: boolean };
export type NotionDataSource = { object: "data_source"; id: string; url?: string; last_edited_time?: string; title?: Rich; parent?: Record<string, unknown> };
export type NotionFile = { name: string; url: string };

export const plain = (rich: unknown) => (Array.isArray(rich) ? (rich as Rich).map((r) => r.plain_text ?? "").join("") : "");

const short = (s: string, n = 120) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function pageTitle(page: NotionPage) {
  for (const p of Object.values(page.properties ?? {})) if (p.type === "title") return plain(p.title).trim();
  return "";
}

/** A property as a short readable string, or null for kinds that do not read as one line (files, relations). */
export function propText(p: Prop): string | null {
  const v = p[p.type ?? ""] as unknown;
  switch (p.type) {
    case "rich_text":
      return plain(v).trim() || null;
    case "select":
    case "status":
      return (v as { name?: string } | null)?.name ?? null;
    case "multi_select":
      return Array.isArray(v) ? (v as { name?: string }[]).map((o) => o.name).filter(Boolean).join(", ") || null : null;
    case "checkbox":
      return v ? "Yes" : "No";
    case "number":
      return typeof v === "number" ? String(v) : null;
    case "date":
      return (v as { start?: string } | null)?.start ?? null;
    case "url":
    case "email":
    case "phone_number":
      return typeof v === "string" ? v : null;
    default:
      return null;
  }
}

/** Up to 12 short property values, title and files left out. */
export function propSummary(page: NotionPage) {
  const out: Record<string, string> = {};
  for (const [name, p] of Object.entries(page.properties ?? {})) {
    if (Object.keys(out).length >= 12) break;
    if (p.type === "title") continue;
    const t = propText(p);
    if (t) out[short(name, 60)] = short(t);
  }
  return out;
}

/** The first property whose name matches, as text. */
export function propNamed(page: NotionPage, pattern: RegExp) {
  for (const [name, p] of Object.entries(page.properties ?? {})) if (pattern.test(name)) return propText(p);
  return null;
}

/** Files Notion hosts, from every files property. External links are left out: the site fetches only Notion's own files. */
export function propFiles(page: NotionPage): { files: NotionFile[]; external: number } {
  const files: NotionFile[] = [];
  let external = 0;
  for (const p of Object.values(page.properties ?? {})) {
    if (p.type !== "files" || !Array.isArray(p.files)) continue;
    for (const f of p.files as { name?: string; type?: string; file?: { url?: string } }[]) {
      if (f.type === "file" && f.file?.url?.startsWith("https://")) files.push({ name: f.name ?? "image", url: f.file.url });
      else external += 1;
    }
  }
  return { files, external };
}

type Block = { type?: string; id?: string; image?: { type?: string; file?: { url?: string }; external?: { url?: string }; caption?: Rich; name?: string } };

/** Notion-hosted images among a page's blocks. */
export function blockImages(blocks: Block[]): { files: NotionFile[]; external: number } {
  const files: NotionFile[] = [];
  let external = 0;
  for (const b of blocks) {
    if (b.type !== "image" || !b.image) continue;
    if (b.image.type === "file" && b.image.file?.url?.startsWith("https://")) files.push({ name: plain(b.image.caption).trim() || b.image.name || "image", url: b.image.file.url });
    else external += 1;
  }
  return { files, external };
}

export function toItem(o: NotionPage | NotionDataSource): NotionItem | null {
  const parentDb = (o.parent?.data_source_id ?? o.parent?.database_id ?? null) as string | null;
  if (o.object === "page") {
    if (o.in_trash) return null;
    return { id: o.id, type: "page", title: pageTitle(o) || "Untitled", url: o.url ?? "", parent: parentDb, lastEdited: o.last_edited_time ?? "", properties: propSummary(o) };
  }
  if (o.object === "data_source") {
    return { id: o.id, type: "database", title: plain(o.title).trim() || "Untitled", url: o.url ?? "", parent: null, lastEdited: o.last_edited_time ?? "", properties: {} };
  }
  return null;
}
