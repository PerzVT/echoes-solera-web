import type { Metadata } from "next";
import { getImageProps } from "next/image";
import { notFound } from "next/navigation";
import { Nav } from "@/components/labs/Nav";
import { asSheet } from "@/components/labs/access/sheets";
import { ChapterCards } from "@/components/labs/manga/ChapterCards";
import { MangaContinue } from "@/components/labs/manga/MangaContinue";
import { SeriesAccess } from "@/components/labs/manga/SeriesAccess";
import styles from "@/components/labs/manga/series.module.css";
import t from "@/components/labs/Title.module.css";
import { mangaBySlug, outlineBySlug } from "@/lib/labs/manga";
import { og } from "@/lib/labs/og";

const SLUG = "golden-ticket";
const title = "Golden Ticket";

export const metadata: Metadata = { title, ...og(title, "manga") };

type Props = { searchParams: Promise<{ state?: string }> };

/**
 * The series page: the cover, the hook, one action (Read chapter 1, or Continue chapter N, page M) and the
 * chapters. Deep link: `?state=subscribe|manage|how` opens that early-access screen.
 */
export default async function GoldenTicketSeries({ searchParams }: Props) {
  const series = mangaBySlug(SLUG);
  const outline = outlineBySlug(SLUG);
  if (!series || !outline) notFound();
  const { state } = await searchParams;

  // The wide hero on a desktop, the portrait cover on a phone: one picture, so only one file loads.
  const common = { alt: "", priority: true, quality: 80 } as const;
  const wide = getImageProps({ ...common, src: series.hero, width: 2560, height: 1440, sizes: "(max-width: 1440px) 100vw, 1344px" }).props;
  const tall = getImageProps({ ...common, src: series.cover, width: 720, height: 1080, sizes: "100vw" }).props;

  return (
    <div className={t.page}>
      <Nav />
      <main id="main" className={styles.main}>
        <section className={styles.hero}>
          <picture>
            <source media="(max-width: 720px)" srcSet={tall.srcSet} sizes={tall.sizes} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...wide} className={styles.heroArt} />
          </picture>
          <div className={styles.heroShade} />
          <div className={styles.heroCopy}>
            <h1 className={`display ${styles.heroTitle}`}>{series.title}</h1>
            <p className={styles.genre}>{series.genre.replace(" / ", ", ")}</p>
            <p className={styles.hook}>{series.hook}</p>
            <MangaContinue series={outline} />
          </div>
        </section>

        <SeriesAccess sheet={asSheet(state)} />

        <section className={styles.chapters} aria-labelledby="chapters">
          <h2 id="chapters" className="h2">
            Chapters
          </h2>
          <ChapterCards series={outline} now={Date.now()} />
        </section>
      </main>
    </div>
  );
}
