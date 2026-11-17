import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { ButtonLink } from "@/components/labs/Button";
import { Icon } from "@/components/labs/Icon";
import { BackLink } from "@/components/labs/BackLink";
import { Nav } from "@/components/labs/Nav";
import { ReadingProgress } from "@/components/labs/ReadingProgress";
import t from "@/components/labs/Title.module.css";
import styles from "./reader.module.css";
import { og } from "@/lib/labs/og";

const title = "Catalyst: Golden Ticket";

export const metadata: Metadata = { title, ...og(title, "manga") };

const L = "/labs/manga/golden-ticket";
const pages = [1, 2, 3].map((n) => ({ n, src: `${L}/page-${n}.webp` }));

export default function GoldenTicket() {
  return (
    <div className={styles.page}>
      <ReadingProgress />
      <Nav />
      <BackLink row href="/?p=manga">
        Manga
      </BackLink>
      <main id="main" className={t.main}>
        {/* The shared title hero, drawn from a panel of page 1. */}
        <section className={t.hero}>
          <Image className={`${t.art} ${styles.heroArt}`} src="/labs/manga/panels/nova-searching.webp" alt="" fill sizes="100vw" priority />
          <div className={styles.heroShade} />
          <div className={t.heroCopy}>
            <h1 className="display">{title}</h1>
            <p className={t.hook}>Adapted from the first scene of Echoes of Solera.</p>
            <p className="nl-note">Concept pages.</p>
          </div>
        </section>

        <div className={styles.reader}>
        <ol className={styles.pages} aria-label="Pages">
          {pages.map((p) => (
            <li key={p.n}>
              <Image
                className={styles.img}
                src={p.src}
                alt={`Page ${p.n} of ${pages.length}`}
                width={1024}
                height={1536}
                sizes="(max-width: 800px) 100vw, 760px"
                priority={p.n === 1}
              />
            </li>
          ))}
        </ol>

        <section className={styles.end} aria-labelledby="end-title">
          <h2 id="end-title" className="h3">
            End of the sample
          </h2>
          <div className={styles.actions}>
            <ButtonLink href="/?p=manga" variant="secondary">
              Back to manga
            </ButtonLink>
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}
