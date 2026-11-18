import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { ButtonLink } from "@/components/labs/Button";
import { Nav } from "@/components/labs/Nav";
import { SeriesWatch } from "@/components/labs/access/SeriesWatch";
import { asSheet } from "@/components/labs/access/sheets";
import { series, seriesBySlug } from "@/lib/labs/series";
import { og } from "@/lib/labs/og";
import t from "@/components/labs/Title.module.css";
import styles from "./series.module.css";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ ep?: string; state?: string; t?: string }> };

export function generateStaticParams() {
  return series.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = seriesBySlug((await params).slug);
  if (!s) return { title: "Page not found" };
  return { title: s.title, ...og(s.title, "mini-series") };
}

/**
 * A series page. With episodes it is the design's Watch frame: the player and its rail, and the side panel
 * with the series, the episode chips and what plays next. Without episodes it is the hero alone.
 * Deep links: `?ep=N` opens an episode (locked ones show the locked screen with its timer), `&t=S` starts at
 * S seconds, and `state=subscribe|manage|how` opens that early-access screen. The coin version's
 * `state=unlock|topup|wallet` land on subscribe, subscribe and manage.
 */
export default async function SeriesPage({ params, searchParams }: Props) {
  const s = seriesBySlug((await params).slug);
  if (!s) notFound();

  const base = `/mini-series/${s.slug}`;
  const query = await searchParams;

  if (s.episodes.length > 0) {
    const asked = Number(query.ep);
    const wanted = s.episodes.some((e) => e.number === asked) ? asked : undefined;
    const start = Number(query.t);
    return (
      <div className={styles.watchPage}>
        <div className={styles.navRow}>
          <Nav />
        </div>
        <main id="main" className={styles.watchMain}>
          <SeriesWatch
            slug={s.slug}
            title={s.title}
            genre={s.genre}
            cover={s.cover}
            episodes={s.episodes}
            wanted={wanted}
            sheet={asSheet(query.state)}
            t={Number.isFinite(start) && start > 0 ? start : undefined}
            now={Date.now()}
            base={base}
            seriesHref="/mini-series"
            backLabel="All mini-series"
            listLabel={s.listLabel ?? "Episodes"}
          />
        </main>
      </div>
    );
  }

  return (
    <div className={t.page}>
      <Nav />
      <main id="main" className={t.main}>
        <section className={styles.hero} data-art={!!s.art}>
          {s.art ? (
            <>
              <Image className={styles.art} src={s.art.bg} alt="" fill sizes="(max-width: 720px) 220vw, 100vw" priority />
              <Image bare className={styles.art} src={s.art.cast} alt="" fill sizes="(max-width: 720px) 220vw, 100vw" priority />
            </>
          ) : (
            <Image className={styles.backdrop} src={s.cover} alt="" fill sizes="40vw" priority />
          )}
          <div className={styles.shade} />
          <div className={styles.copy}>
            <h1 className={`display ${styles.title}`}>{s.title}</h1>
            {s.genre && <p className={styles.genre}>{s.genre}</p>}
            {s.hook && <p className={styles.hook}>{s.hook}</p>}
            <div className={styles.actions}>
              <ButtonLink href="/app">Create a mini-series</ButtonLink>
            </div>
          </div>
          {!s.art && (
            <div className={styles.poster}>
              <Image src={s.cover} alt={`${s.title} cover`} width={720} height={1080} sizes="(max-width: 720px) 60vw, 340px" priority />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
