import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { ButtonLink } from "@/components/labs/Button";
import { GestureIcon } from "@/components/labs/fx/AnimatedIcon";
import { Nav } from "@/components/labs/Nav";
import { Reveal } from "@/components/labs/fx/Reveal";
import styles from "./lab.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Lab", ...og("Lab") };

const L = "/labs";

/** The creator's own screens, in the order a series moves through them. */
const stages = [
  { name: "Series", text: "Every series you are making, and its episodes." },
  { name: "New series", text: "Name a series and choose its style." },
  { name: "Cast", text: "The characters, each with their approved sheets." },
  { name: "Script", text: "Write or paste the episode." },
  { name: "Screenplay", text: "The script as scenes, shots and lines, to read and comment on." },
  { name: "References", text: "A sheet for every character, place and prop, and answers to what does not match." },
  { name: "Confirm", text: "See what will be made before it starts." },
  { name: "Results", text: "Each shot as it is made. Try one again, or keep a frame for the next." },
];

const references = [
  { name: "Import a style guide", text: "Bring in the palette, line and lighting rules for a project." },
  { name: "Attach character sheets", text: "Link each character to the sheets you approved." },
  { name: "Pick outfits", text: "Choose what each character wears, scene by scene." },
  { name: "Review continuity questions", text: "Answer what does not match between scenes before production." },
];

const sheets = [
  { name: "Nova", src: `${L}/anime/cast/nova.webp` },
  { name: "Damion", src: `${L}/anime/cast/damion.webp` },
  { name: "Or-en", src: `${L}/anime/cast/or-en.webp` },
];

const experiments = [
  {
    kind: "Visual novel",
    title: "After Hours",
    line: "A short story with choices, played scene by scene.",
    href: "/visual-novel/after-hours",
    art: `${L}/visual-novel/cg/rooftop.webp`,
    focus: "72% 30%",
    size: "wide",
  },
  {
    kind: "Manga",
    title: "Golden Ticket",
    line: "Pages and panels drawn from a script.",
    href: "/manga/golden-ticket",
    art: `${L}/manga/golden-ticket/page-1.webp`,
    focus: "50% 45%",
    size: "slim",
  },
  {
    kind: "Cards",
    title: "Character cards",
    line: "Open a pack and turn over three concept cards.",
    href: "/cards",
    art: `${L}/cards/art/nova-sunset.webp`,
    focus: "40% 30%",
    size: "slim",
  },
] as const;

export default function Lab() {
  return (
    <div className={styles.page}>
      <Nav current="/lab" />
      <main id="main" className={styles.main}>
        <section className={styles.intro} aria-labelledby="title">
          <h1 id="title" className="display">
            Tools for making the next scene.
          </h1>
          <div className={styles.introSide}>
            <p className={styles.lede}>
              Develop a script, choose the cast and visual style, and carry those decisions through production.
            </p>
            <div className={styles.actions}>
              <ButtonLink href="/app">Open creator preview</ButtonLink>
              <ButtonLink href="#experiments" variant="secondary">
                Explore experiments
              </ButtonLink>
            </div>
          </div>
        </section>

        <section aria-labelledby="creator">
          <div className={styles.head}>
            <div>
              <h2 id="creator" className="h2">
                Creator
              </h2>
              <p className="muted">A series moves through eight screens, and each keeps what the last one decided. Styles have their own library beside them.</p>
            </div>
            <div className={styles.links}>
              <Link href="/pipeline" className={styles.textLink}>
                How a scene is made
                <GestureIcon name="arrow" />
              </Link>
              <Link href="/app" className={styles.textLink}>
                Open creator preview
                <GestureIcon name="arrow" />
              </Link>
            </div>
          </div>
          <Reveal as="ol" stagger className={styles.stages}>
            {stages.map((s, i) => (
              <li key={s.name}>
                <span className={styles.node} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="h3">{s.name}</h3>
                <p className="small muted">{s.text}</p>
              </li>
            ))}
          </Reveal>
        </section>

        <Reveal as="section" className={styles.style} aria-labelledby="style">
          <div className={styles.board}>
            {sheets.map((s) => (
              <figure key={s.name} className={styles.sheet}>
                <div className={styles.sheetArt}>
                  <Image src={s.src} alt={`${s.name}, concept art`} fill sizes="(max-width: 900px) 30vw, 16vw" />
                </div>
                <figcaption className="small">{s.name}</figcaption>
              </figure>
            ))}
          </div>
          <div className={styles.styleCopy}>
            <h2 id="style" className="h2">
              Style and references
            </h2>
            <p className="muted">Set the look once, then every scene uses it.</p>
            <ul className={styles.refs}>
              {references.map((r) => (
                <li key={r.name}>
                  <h3 className={styles.refName}>{r.name}</h3>
                  <p className="small muted">{r.text}</p>
                </li>
              ))}
            </ul>
            <ButtonLink href="/app/styles" variant="secondary">
              Open the style library
            </ButtonLink>
          </div>
        </Reveal>

        <section id="experiments" className={styles.experimentsSection} aria-labelledby="experiments-title">
          <h2 id="experiments-title" className="h2">
            Experiments
          </h2>
          <p className={styles.note}>Formats we are testing. Each one is a concept, not a finished product.</p>
          <Reveal as="ul" stagger className={styles.experiments}>
            {experiments.map((e) => (
              <li key={e.href} className={styles[e.size]}>
                <Link href={e.href} className={styles.card}>
                  <Image
                    className={styles.cardArt}
                    src={e.art}
                    alt=""
                    fill
                    sizes={e.size === "wide" ? "(max-width: 900px) 100vw, 50vw" : "(max-width: 900px) 100vw, 25vw"}
                    style={{ objectPosition: e.focus }}
                  />
                  <span className={styles.cardShade} />
                  <span className={`label ${styles.tag}`}>Concept</span>
                  <span className={styles.cardCopy}>
                    <span className={styles.cardTitle}>{e.title}</span>
                    <span className={styles.cardLine}>{e.line}</span>
                  </span>
                </Link>
              </li>
            ))}
          </Reveal>
        </section>

        <Link href="/pipeline" className={styles.pipeline}>
          <span className={styles.pipelineText}>How a scene is made, step by step</span>
          <span className={styles.pipelineArrow}>
            <GestureIcon name="arrow" />
          </span>
        </Link>
      </main>
    </div>
  );
}
