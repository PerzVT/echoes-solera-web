import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { ButtonLink } from "@/components/labs/Button";
import { Icon } from "@/components/labs/Icon";
import { BackLink } from "@/components/labs/BackLink";
import { Nav } from "@/components/labs/Nav";
import { Reveal } from "@/components/labs/fx/Reveal";
import { Library, type Title } from "@/components/labs/Library";
import catalogue from "@/lib/labs/catalogue.json";
import { series } from "@/lib/labs/series";
import t from "@/components/labs/Title.module.css";
import styles from "./library.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Mini-series", ...og("Mini-series", "mini-series") };

const genresOf = (g: string | null) =>
  (g ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/**
 * Second Chance (clips on this site) first, then the series whose episodes are finished, then the
 * other series with pages, then everything else prepared in the story catalogue.
 */
const rank = { clips: 0, finished: 1, planned: 2 } as const;
const titles: Title[] = catalogue.map((c) => {
  const live = series.find((s) => s.slug === c.slug);
  return {
    slug: c.slug,
    title: c.title,
    genres: genresOf(c.genre ?? live?.genre ?? null),
    cover: c.cover,
    state: live?.state ?? "planned",
    href: live ? `/mini-series/${live.slug}` : undefined,
  };
});
titles.sort((a, b) => rank[a.state] - rank[b.state] || Number(!!b.href) - Number(!!a.href));

const genres = [...new Set(titles.flatMap((x) => x.genres))].sort(
  (a, b) => titles.filter((x) => x.genres.includes(b)).length - titles.filter((x) => x.genres.includes(a)).length,
);

type Props = { searchParams: Promise<{ genre?: string }> };

export default async function LibraryPage({ searchParams }: Props) {
  // The owner's settled lead for mini-series: the Moonflower couple. Second Chance keeps its clips link.
  const feature = series.find((s) => s.slug === "moonflower")!;
  const clips = series.find((s) => s.state === "clips")!;
  const genre = (await searchParams).genre;

  return (
    <div className={t.page}>
      <Nav />
      <BackLink row href="/?p=mini-series">
        Mini-series
      </BackLink>
      <main id="main" className={t.main}>
        <section className={styles.feature}>
          {feature.art && (
            <>
              <Image className={styles.art} src={feature.art.bg} alt="" fill sizes="(max-width: 720px) 220vw, 100vw" priority />
              <Image bare className={styles.art} src={feature.art.cast} alt="" fill sizes="(max-width: 720px) 220vw, 100vw" priority />
            </>
          )}
          <div className={styles.shade} />
          <div className={styles.featureCopy}>
            <h1 className="display">{feature.title}</h1>
            {feature.hook && <p className={styles.hook}>{feature.hook}</p>}
            {feature.awaiting && <p className={styles.hook}>{feature.awaiting}</p>}
            <div className={styles.actions}>
              <ButtonLink href={`/mini-series/${feature.slug}`}>See the series</ButtonLink>
              <ButtonLink href={`/mini-series/${clips.slug}`} variant="secondary" icon={<Icon name="play" size={18} />}>
                Watch the Second Chance clips
              </ButtonLink>
            </div>
          </div>
        </section>

        <Library titles={titles} genres={genres} initial={genre} />

        <Reveal as="section" className="nl-made">
          <div>
            <p className="h3">{clips.title} is made with the Nine Lives mini-series tool.</p>
            <p className="small muted">Bring a script and produce your own.</p>
          </div>
          <ButtonLink href="/app" variant="secondary">
            Create a mini-series
          </ButtonLink>
        </Reveal>
      </main>
    </div>
  );
}
