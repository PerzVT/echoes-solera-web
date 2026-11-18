import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/labs/Nav";
import { asSheet } from "@/components/labs/access/sheets";
import { MangaReader, type ReaderSettings } from "@/components/labs/manga/MangaReader";
import styles from "@/components/labs/manga/reader.module.css";
import { chapterOfSlug, outlineBySlug } from "@/lib/labs/manga";
import { og } from "@/lib/labs/og";

const SLUG = "golden-ticket";

type Search = { p?: string; mode?: string; dir?: string; fit?: string; state?: string };
type Props = { params: Promise<{ chapter: string }>; searchParams: Promise<Search> };

export function generateStaticParams() {
  return (outlineBySlug(SLUG)?.chapters ?? []).map((c) => ({ chapter: String(c.number) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = chapterOfSlug(SLUG, Number((await params).chapter));
  if (!found) return { title: "Page not found" };
  const title = `${found.series.title}, chapter ${found.chapter.number}`;
  return { title, ...og(title, "manga") };
}

const pick = <T extends string>(v: string | undefined, all: readonly T[]) => (all.includes(v as T) ? (v as T) : undefined);

/**
 * A chapter: the reader, or the lock screen for an early-access chapter, or the announcement for one with no
 * pages yet. Deep links: `?p=N` opens page N, `?p=end` the chapter's end; `mode=spread|single|scroll`,
 * `dir=ltr|rtl` and `fit=width|height` set the reader for this visit; `state=subscribe|manage|how` opens that
 * early-access screen.
 */
export default async function ChapterPage({ params, searchParams }: Props) {
  const n = Number((await params).chapter);
  const found = chapterOfSlug(SLUG, n);
  const outline = outlineBySlug(SLUG);
  if (!found || !outline) notFound();
  const { series, chapter } = found;
  const q = await searchParams;

  const count = chapter.pages.length;
  const asked = q.p === "end" ? "end" : Math.round(Number(q.p));
  const start: number | "end" = asked === "end" ? (count ? "end" : 1) : Number.isFinite(asked) && asked >= 1 ? Math.min(asked, Math.max(1, count)) : 1;
  const url: Partial<ReaderSettings> = {
    mode: pick(q.mode, ["spread", "single", "scroll"] as const),
    dir: pick(q.dir, ["ltr", "rtl"] as const),
    fit: pick(q.fit, ["width", "height"] as const),
  };

  return (
    <div className={styles.page}>
      <Nav />
      <main id="main" className={styles.main}>
        <MangaReader
          key={chapter.number}
          slug={series.slug}
          seriesTitle={series.title}
          direction={series.direction}
          chapter={{ number: chapter.number, title: chapter.title, cover: chapter.cover, pages: chapter.pages }}
          outline={outline}
          start={start}
          url={url}
          sheet={asSheet(q.state)}
          now={Date.now()}
        />
      </main>
    </div>
  );
}
