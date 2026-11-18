"use client";

import { isEarly } from "@/lib/labs/series";
import type { ChapterOutline, SeriesOutline } from "@/lib/labs/manga/outline";
import { episodeKey, saveProgress, type AccessState } from "../access/store";

/*
 * Reading progress for the manga, kept in the same browser store as mini-series watch progress, so one
 * subscription and one history cover both. Keys are `manga/<slug>:<chapter>`; a mini-series key is
 * `<slug>:<episode>`, so neither reads the other's. `t` is the last page the reader had on screen and `d`
 * the chapter's page count: a chapter is read once its last page has been shown.
 * Imports only the outline, never the page data, so the home page can use it.
 */

const base = (slug: string) => `manga/${slug}`;
export const chapterKey = (slug: string, n: number) => episodeKey(base(slug), n);

const hasPages = (c: Pick<ChapterOutline, "status" | "pageCount">) => c.status === "available" && c.pageCount > 0;
const href = (slug: string, n: number, page?: number) => `/manga/${slug}/${n}${page && page > 1 ? `?p=${page}` : ""}`;

export type ChapterProgress = { page: number; pages: number; done: boolean };

export function chapterProgress(a: AccessState, slug: string, n: number): ChapterProgress | undefined {
  const p = a.progress[chapterKey(slug, n)];
  if (!p || !Number.isFinite(p.t) || !Number.isFinite(p.d) || p.d <= 0) return undefined;
  const page = Math.min(Math.max(1, Math.round(p.t)), p.d);
  return { page, pages: p.d, done: page >= p.d };
}

/** Records the last page on screen. Every turn is written at once: turns are few, and a closed tab keeps its place. */
export const savePage = (slug: string, n: number, page: number, pages: number) => saveProgress(chapterKey(slug, n), page, pages, true);

/** The chapter of this series the reader was last in, if any. */
export function lastChapter(a: AccessState, slug: string) {
  const prefix = `${base(slug)}:`;
  const key = [...a.history].reverse().find((k) => k.startsWith(prefix));
  return key ? Number(key.slice(prefix.length)) : undefined;
}

/** Open to this visitor: it has pages, and it is released or they subscribe. */
export const isOpen = (c: ChapterOutline, a: AccessState, now: number) => hasPages(c) && (a.subscribed || !isEarly(c, now));

export type ChapterState = "read" | "reading" | "new" | "locked" | "coming";

export function chapterState(c: ChapterOutline, a: AccessState, slug: string, now: number): ChapterState {
  if (!hasPages(c)) return "coming";
  if (!isOpen(c, a, now)) return "locked";
  const p = chapterProgress(a, slug, c.number);
  if (!p) return "new";
  return p.done ? "read" : "reading";
}

/**
 * The series' one main action: chapter 1 for a new reader, the page they stopped on, or the next chapter once
 * theirs is read. A locked next chapter still gets the link; its page shows the timer and Subscribe.
 */
export function continueTarget(a: AccessState, s: SeriesOutline): { label: string; href: string } {
  const first = s.chapters.find(hasPages) ?? s.chapters[0];
  const fresh = { label: `Read chapter ${first.number}`, href: href(s.slug, first.number) };
  const n = lastChapter(a, s.slug);
  const c = n === undefined ? undefined : s.chapters.find((x) => x.number === n && hasPages(x));
  if (!c) return fresh;
  const p = chapterProgress(a, s.slug, c.number);
  if (p && !p.done) {
    return p.page > 1
      ? { label: `Continue chapter ${c.number}, page ${p.page}`, href: href(s.slug, c.number, p.page) }
      : { label: `Continue chapter ${c.number}`, href: href(s.slug, c.number) };
  }
  const next = s.chapters.find((x) => x.number === c.number + 1 && hasPages(x));
  if (next) return { label: `Read chapter ${next.number}`, href: href(s.slug, next.number) };
  return { label: `Read chapter ${c.number} again`, href: href(s.slug, c.number) };
}
