import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { ButtonLink } from "@/components/labs/Button";
import { BackLink } from "@/components/labs/BackLink";
import { Nav } from "@/components/labs/Nav";
import { ReadingProgress } from "@/components/labs/ReadingProgress";
import t from "@/components/labs/Title.module.css";
import { Lettering, type Letter } from "./Lettering";
import styles from "./reader.module.css";
import { og } from "@/lib/labs/og";

const title = "Catalyst: Golden Ticket";

export const metadata: Metadata = { title, ...og(title, "manga") };

const L = "/labs/manga/golden-ticket";

/** The art is drawn without words; every balloon, caption and sound below is live text over it. */
const pages: { n: number; alt: string; letters: Letter[] }[] = [
  {
    n: 1,
    alt: "A small retro game shop. Nova flips through a bin of old cartridges, pulls out one with a torn blank label and looks at it.",
    letters: [
      { kind: "narration", text: "The game shop by the station. Nothing new in years.", x: 2.5, y: 2.6, w: 34 },
      { kind: "speech", text: "Played it. Played it. Never heard of it.", x: 3.5, y: 32, w: 30, tail: { at: 78 } },
      { kind: "sfx", text: "shff", x: 6, y: 70.5, rotate: -10 },
      { kind: "inset", text: "No label at all?", x: 49, y: 67.6, w: 25 },
    ],
  },
  {
    n: 2,
    alt: "She prises the cartridge open. It is hollow, and a thin metal ticket slides out into her palm. The ticket has an ornate border and a square code. She holds it up to the shop light.",
    letters: [
      { kind: "speech", text: "It opens?", x: 2, y: 1.6, w: 17, tail: { at: 62 } },
      { kind: "sfx", text: "klik", x: 3, y: 29.5, rotate: -8, scale: 0.85 },
      { kind: "sfx", text: "tink", x: 82, y: 23, rotate: 10, scale: 0.85 },
      { kind: "narration", text: "Inside, a metal ticket. No name. Just a code.", x: 2, y: 37.6, w: 26 },
      { kind: "speech", text: "Who hides a code inside a game?", x: 56, y: 65.6, w: 28, tail: { at: 22 } },
    ],
  },
  {
    n: 3,
    alt: "Outside in the rain, Nova points her phone at the ticket. The camera frames the code, then the screen goes black. Light bursts, the shop front warps behind her and she spins round, reaching for it.",
    letters: [
      { kind: "narration", text: "Outside, it had started to rain.", x: 2, y: 1.6, w: 17 },
      { kind: "speech", text: "One scan. Just to see.", x: 37, y: 1.6, w: 19, tail: { at: 12, flip: true } },
      { kind: "sfx", text: "beep", x: 30, y: 36.5, rotate: -6, scale: 0.75 },
      { kind: "speech", text: "Huh?", x: 82, y: 36.6, w: 13, tail: { at: 30 } },
      { kind: "sfx", text: "VWOOOM", x: 47, y: 80, rotate: -12, scale: 1.5 },
      { kind: "speech", text: "Wait! The shop!", x: 34, y: 65, w: 22, tail: { at: 10, flip: true } },
    ],
  },
];

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
          <Image className={`${t.art} ${styles.heroArt}`} src="/labs/manga/panels/nova-searching-v2.webp" alt="" fill sizes="100vw" priority />
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
              <li key={p.n} className={styles.sheet}>
                <Image
                  className={styles.img}
                  src={`${L}/page-${p.n}-v2.webp`}
                  alt={`Page ${p.n} of ${pages.length}. ${p.alt}`}
                  width={1600}
                  height={2400}
                  sizes="(max-width: 800px) 100vw, 760px"
                  priority={p.n === 1}
                />
                <Lettering letters={p.letters} />
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
