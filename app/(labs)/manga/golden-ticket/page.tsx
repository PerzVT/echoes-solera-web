import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
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
    alt: "A small retro game shop. Nova flips through a bin of old cartridges, pulls out one with a worn VR label and looks at it.",
    letters: [
      { kind: "narration", text: "The game shop by the station. Nothing new in years.", x: 2.5, y: 2.4, w: 30 },
      { kind: "speech", text: "Played it. Played it. Never heard of it.", x: 3, y: 31.4, w: 34, tail: { at: 80, flip: true } },
      { kind: "sfx", text: "shff", x: 5, y: 52.5, rotate: -10 },
      { kind: "speech", text: "No label at all?", x: 51.5, y: 63.8, w: 24, tail: { at: 70, flip: true } },
    ],
  },
  {
    n: 2,
    alt: "She prises the cartridge open. It is hollow, and a thin metal ticket slides out into her palm. The ticket has an ornate border and a square code. She holds it up to the shop light.",
    letters: [
      { kind: "speech", text: "It opens?", x: 2, y: 1.6, w: 17, tail: { at: 62 } },
      { kind: "sfx", text: "klik", x: 25, y: 30, rotate: -8, scale: 0.85 },
      { kind: "sfx", text: "tink", x: 82, y: 22, rotate: 10, scale: 0.85 },
      { kind: "narration", text: "Inside, a metal ticket. No name. Just a code.", x: 2, y: 37.3, w: 34 },
      { kind: "speech", text: "Who hides a code inside a game?", x: 34, y: 64.4, w: 28, tail: { at: 75, flip: true } },
    ],
  },
  {
    n: 3,
    alt: "Outside in the rain, Nova points her phone at the ticket. The camera frames the code, then the screen goes black. Light bursts, the shop front warps behind her and she spins round, reaching for it.",
    letters: [
      { kind: "narration", text: "Outside, it had started to rain.", x: 64, y: 1.4, w: 33 },
      { kind: "speech", text: "One scan. Just to see.", x: 37, y: 1.6, w: 25, tail: { at: 15 } },
      { kind: "sfx", text: "beep", x: 35, y: 37.5, rotate: -6, scale: 0.75 },
      { kind: "speech", text: "Huh?", x: 83, y: 37, w: 13, tail: { at: 30 } },
      { kind: "speech", text: "Wait! The shop!", x: 52, y: 66.5, w: 22, tail: { at: 10 } },
      { kind: "sfx", text: "VWOOOM", x: 50, y: 88, rotate: -12, scale: 1.4 },
    ],
  },
];

export default function GoldenTicket() {
  return (
    <div className={styles.page}>
      <ReadingProgress />
      <Nav />
      <main id="main" className={t.main}>
        {/* The shared title hero, drawn from a panel of page 1. */}
        <section className={t.hero}>
          <Image className={`${t.art} ${styles.heroArt}`} src="/labs/manga/panels/nova-searching.webp" alt="" fill sizes="100vw" priority />
          <div className={styles.heroShade} />
          <div className={t.heroCopy}>
            <h1 className="display">{title}</h1>
            <p className={t.hook}>Adapted from the first scene of Echoes of Solera.</p>
          </div>
        </section>

        {/* An open book on wide screens, left page and right page; one page under another on a phone. */}
        <div className={styles.reader}>
          <ol className={styles.pages} aria-label="Pages">
            {pages.map((p) => (
              <li key={p.n} className={styles.sheet}>
                <Image
                  className={styles.img}
                  src={`${L}/page-${p.n}.webp`}
                  alt={`Page ${p.n} of ${pages.length}. ${p.alt}`}
                  width={1024}
                  height={1536}
                  sizes="(max-width: 800px) 100vw, 50vw"
                  priority={p.n <= 2}
                />
                <Lettering letters={p.letters} />
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}
