import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { ButtonLink } from "@/components/labs/Button";
import { Icon } from "@/components/labs/Icon";
import { BackLink } from "@/components/labs/BackLink";
import { Nav } from "@/components/labs/Nav";
import { Reveal } from "@/components/labs/fx/Reveal";
import { Library, type Title } from "@/components/labs/Library";
import { EarlyAccessBanner } from "@/components/labs/access/Banner";
import { genres, series, seriesBySlug } from "@/lib/labs/series";
import t from "@/components/labs/Title.module.css";
import styles from "./library.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Mini-series", ...og("Mini-series", "mini-series") };

const titles: Title[] = series.map((s) => ({
  slug: s.slug,
  title: s.title,
  genres: s.genres,
  cover: s.cover,
  href: `/mini-series/${s.slug}`,
}));

type Props = { searchParams: Promise<{ genre?: string }> };

export default async function LibraryPage({ searchParams }: Props) {
  // The owner's settled lead for mini-series: the Moonflower couple. Second Chance keeps its clips link.
  const feature = seriesBySlug("moonflower")!;
  const clips = seriesBySlug("second-chance")!;
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
            <h1 className={`display ${styles.title}`}>{feature.title}</h1>
            {feature.hook && <p className={styles.hook}>{feature.hook}</p>}
            <div className={styles.actions}>
              <ButtonLink href={`/mini-series/${feature.slug}`}>See the series</ButtonLink>
              <ButtonLink href={`/mini-series/${clips.slug}`} variant="secondary" icon={<Icon name="play" size={18} />}>
                Watch Second Chance
              </ButtonLink>
            </div>
          </div>
        </section>

        <EarlyAccessBanner layout="wide" />

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
