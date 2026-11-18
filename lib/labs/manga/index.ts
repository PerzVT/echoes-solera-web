import { goldenTicket, type MangaPage, type MangaSeries } from "./golden-ticket";
import { goldenTicketOutline, type ChapterOutline, type SeriesOutline } from "./outline";

export type { Letter, MangaChapter, MangaPage, MangaSeries } from "./golden-ticket";
export type { ChapterOutline, SeriesOutline } from "./outline";

export const mangaSeries: MangaSeries[] = [goldenTicket];
export const mangaBySlug = (slug: string) => mangaSeries.find((s) => s.slug === slug);

export const chapterOfSlug = (slug: string, n: number) => {
  const series = mangaBySlug(slug);
  const chapter = series?.chapters.find((c) => c.number === n);
  return series && chapter ? { series, chapter } : undefined;
};

const outlines: SeriesOutline[] = [goldenTicketOutline];
export const outlineBySlug = (slug: string) => outlines.find((s) => s.slug === slug);

// The outline repeats the chapter list for small client bundles. A difference is a bug: fail where it is made.
for (const s of mangaSeries) {
  const o = outlineBySlug(s.slug);
  const same =
    o?.title === s.title &&
    o.chapters.length === s.chapters.length &&
    s.chapters.every((c, i) => {
      const x = o.chapters[i];
      return x.number === c.number && x.title === c.title && x.releases === c.releases && x.status === c.status && x.cover === c.cover && x.thumb === c.thumb && x.pageCount === c.pages.length;
    });
  if (!same) throw new Error(`lib/labs/manga/outline.ts is out of step with the page data for ${s.slug}`);
}

/** A chapter with pages to read. An announced chapter has a cover and a date only, never a reader. */
export const hasPages = (c: Pick<ChapterOutline, "status" | "pageCount">) => c.status === "available" && c.pageCount > 0;

export const seriesHref = (s: Pick<SeriesOutline, "slug">) => `/manga/${s.slug}`;
export const chapterHref = (s: Pick<SeriesOutline, "slug">, n: number, page?: number | "end") =>
  `/manga/${s.slug}/${n}${page && page !== 1 ? `?p=${page}` : ""}`;

/** "01", "02": the chapter number as the cards and the chapter list show it. */
export const padded = (n: number) => String(n).padStart(2, "0");

/**
 * The views of a chapter in spread mode, as 0-based page indices. Page 1 stands alone, as the first right-hand
 * page of a book; then pages pair; an odd last page stands alone.
 */
export function spreads(count: number): number[][] {
  if (count <= 0) return [];
  const out: number[][] = [[0]];
  for (let i = 1; i < count; i += 2) out.push(i + 1 < count ? [i, i + 1] : [i]);
  return out;
}

/** The two sizes of a page for `srcset`, so the browser loads one of them. */
export const pageSrcSet = (p: Pick<MangaPage, "src" | "srcLarge">) => `${p.src} 1024w, ${p.srcLarge} 1536w`;
