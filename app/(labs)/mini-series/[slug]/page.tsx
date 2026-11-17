import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { ButtonLink } from "@/components/labs/Button";
import { Nav } from "@/components/labs/Nav";
import { ContinueLink } from "@/components/labs/access/ContinueLink";
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
 * A series page: the hero, the hook, the actions, the episodes where there are any, and the other images.
 * Deep links: `?ep=N` opens an episode (locked ones show the locked screen), `&t=S` starts at S seconds,
 * and `state=unlock|wallet|topup|how` opens that early-access screen.
 */
export default async function SeriesPage({ params, searchParams }: Props) {
  const s = seriesBySlug((await params).slug);
  if (!s) notFound();

  const base = `/mini-series/${s.slug}`;
  const query = await searchParams;
  const asked = Number(query.ep);
  const wanted = s.episodes.some((e) => e.number === asked) ? asked : undefined;
  const start = Number(query.t);
  const item = s.episodes[0];
  const listLabel = s.listLabel ?? "Episodes";

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
              {item ? (
                <ContinueLink slug={s.slug} base={base} episodes={s.episodes} />
              ) : null}
              {s.stills.length > 0 && (
                <ButtonLink href={`${base}#images`} variant={item ? "secondary" : "primary"}>
                  See the images
                </ButtonLink>
              )}
              {!(item && s.stills.length > 0) && (
                <ButtonLink href="/app" variant={item || s.stills.length > 0 ? "secondary" : "primary"}>
                  Create a mini-series
                </ButtonLink>
              )}
            </div>
          </div>
          {!s.art && (
            <div className={styles.poster}>
              <Image src={s.cover} alt={`${s.title} cover`} width={720} height={1080} sizes="(max-width: 720px) 60vw, 340px" priority />
            </div>
          )}
        </section>

        {item && (
          <section id="watch" className={styles.watch} aria-labelledby="watch-heading">
            <h2 id="watch-heading" className="h2">
              {listLabel}
            </h2>
            <SeriesWatch
              slug={s.slug}
              title={s.title}
              episodes={s.episodes}
              wanted={wanted}
              sheet={asSheet(query.state)}
              t={Number.isFinite(start) && start > 0 ? start : undefined}
              base={base}
              seriesHref={s.stills.length ? `${base}#images` : "/app"}
              backLabel={s.stills.length ? "See the images" : "Create a mini-series"}
              listLabel={listLabel}
            />
          </section>
        )}

        {s.stills.length > 0 && (
          <section id="images" aria-labelledby="images-heading">
            <h2 id="images-heading" className="h2">
              Images
            </h2>
            <ul className={styles.stills}>
              {s.stills.map((x) => (
                <li key={x.src} data-wide={x.width > x.height}>
                  <a href={x.src} target="_blank" rel="noreferrer">
                    <Image src={x.src} alt={x.alt} width={x.width} height={x.height} sizes="(max-width: 720px) 90vw, 440px" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
