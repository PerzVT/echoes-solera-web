import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { ButtonLink } from "@/components/labs/Button";
import { GestureIcon } from "@/components/labs/fx/AnimatedIcon";
import { Nav } from "@/components/labs/Nav";
import { Reveal } from "@/components/labs/fx/Reveal";
import { LoopClip } from "./LoopClip";
import styles from "./lab.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Lab", ...og("Lab") };

const L = "/labs";
const SC = `${L}/mini-series/second-chance/episodes`;

/** The creator's own screens, in the order a series moves through them. */
const stages = [
  { name: "Series", text: "Every series and its episodes." },
  { name: "New series", text: "Name it and choose a style." },
  { name: "Cast", text: "Approved sheets for each character." },
  { name: "Script", text: "Drop in or paste the episode." },
  { name: "Screenplay", text: "Scenes, shots and lines to comment on." },
  { name: "References", text: "A sheet for every character, place and prop." },
  { name: "Confirm", text: "What will be made, before it starts." },
  { name: "Results", text: "Each shot: keep it, trim it or try again." },
];

/** Real sheets from the creator's cast screen, with the tag the screenplay uses to find each one. */
const sheets = [
  { tag: "@chloe_ep01", src: `${L}/app/sheets/chloe_ep01.webp`, alt: "Chloe in her episode 1 outfit: front, side, back and face" },
  { tag: "@chloe_ep06", src: `${L}/app/sheets/chloe_ep06.webp`, alt: "Chloe in her episode 6 outfit: front, side, back and face" },
  { tag: "@julian", src: `${L}/app/sheets/julian.webp`, alt: "Julian in a dark suit: front, side, back and face" },
  { tag: "@elena", src: `${L}/app/sheets/elena.webp`, alt: "Elena: front, side, back and face" },
];

type Format = {
  title: string;
  fact: string;
  href: string;
  concept?: boolean;
  clip?: string;
  art: string;
  focus?: string;
};

/** What the lab is testing, each with media from its own page. */
const formats: Format[] = [
  {
    title: "Anime shorts",
    fact: "Seven shorts with the Echoes of Solera cast.",
    href: "/anime/echoes-of-solera",
    clip: `${L}/anime/shorts/one-second-express.mp4`,
    art: `${L}/anime/shorts/one-second-express.webp`,
  },
  {
    title: "Mini-series",
    fact: "59 titles in the catalogue. Second Chance plays now.",
    href: "/mini-series",
    clip: `${SC}/3.mp4`,
    art: `${SC}/3.webp`,
  },
  {
    title: "Cooking",
    fact: "Thirteen recipe videos from nine chefs.",
    href: "/cooking/shoujo-supper",
    clip: `${L}/cooking/episodes/oyakodon.mp4`,
    art: `${L}/cooking/stills/oyakodon.webp`,
  },
  {
    title: "Game ads",
    fact: "Two vertical game ads.",
    href: "/game-ads",
    clip: `${L}/game-ads/sweet-rush.mp4`,
    art: `${L}/game-ads/sweet-rush.webp`,
  },
  {
    title: "Manga",
    fact: "Golden Ticket: three lettered pages.",
    href: "/manga/golden-ticket",
    concept: true,
    art: `${L}/manga/golden-ticket/page-1-v2.webp`,
    focus: "50% 62%",
  },
  {
    title: "Visual novel",
    fact: "After Hours: eleven scenes, three endings.",
    href: "/visual-novel/after-hours",
    concept: true,
    art: `${L}/visual-novel/cg/juri-rooftop.webp`,
    focus: "72% 30%",
  },
  {
    title: "Cards",
    fact: "Eleven cards. Open a pack of three.",
    href: "/cards",
    concept: true,
    art: `${L}/cards/art/nine-moonlight.webp`,
    focus: "50% 40%",
  },
  {
    title: "Virtual world",
    fact: "Tidebell Cove, an island of ducks.",
    href: "/worlds/tidebell-cove",
    concept: true,
    art: `${L}/worlds/pier-v2.webp`,
    focus: "62% 50%",
  },
];

const tileSizes = "(max-width: 720px) 50vw, (max-width: 1100px) 33vw, 320px";

export default function Lab() {
  return (
    <div className={styles.page}>
      <Nav current="/lab" />
      <main id="main" className={styles.main}>
        <section className={styles.intro} aria-labelledby="title">
          <h1 id="title" className="display">
            Lab
          </h1>
          <div className={styles.introSide}>
            <p className={styles.lede}>What we are testing now, and what each test has made so far.</p>
            <div className={styles.actions}>
              <ButtonLink href="/app">Open creator preview</ButtonLink>
              <ButtonLink href="/pipeline" variant="secondary">
                How a scene is made
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className={styles.creator} aria-labelledby="creator">
          <Link href="/pipeline" className={styles.creatorClip}>
            <LoopClip src={`${SC}/6.mp4`} poster={`${SC}/6.webp`} sizes="(max-width: 860px) 100vw, 380px" />
            <span className={styles.clipCaption}>Second Chance at Your Heart, production clip</span>
          </Link>
          <div className={styles.creatorCopy}>
            <h2 id="creator" className="h2">
              The creator
            </h2>
            <p className="muted">
              The tool that turns a script into an episode, in eight screens. The preview runs on one episode of Second Chance at
              Your Heart.
            </p>
            <Reveal as="ol" stagger className={styles.stages}>
              {stages.map((s, i) => (
                <li key={s.name}>
                  <span className={styles.node} aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className={styles.stageCopy}>
                    <span className={styles.stageName}>{s.name}</span>
                    <span className="small muted">{s.text}</span>
                  </span>
                </li>
              ))}
            </Reveal>
            <div className={styles.links}>
              <Link href="/app" className={styles.textLink}>
                Open creator preview
                <GestureIcon name="arrow" />
              </Link>
              <Link href="/pipeline" className={styles.textLink}>
                How a scene is made
                <GestureIcon name="arrow" />
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="sheets">
          <div className={styles.head}>
            <div>
              <h2 id="sheets" className="h2">
                Character sheets
              </h2>
              <p className="muted">One sheet per outfit. The screenplay finds each sheet by its tag.</p>
            </div>
            <div className={styles.links}>
              <Link href="/app/cast" className={styles.textLink}>
                Open the cast
                <GestureIcon name="arrow" />
              </Link>
              <Link href="/app/styles" className={styles.textLink}>
                Open the style library
                <GestureIcon name="arrow" />
              </Link>
            </div>
          </div>
          <Reveal as="ul" stagger className={styles.sheets}>
            {sheets.map((s) => (
              <li key={s.tag}>
                <Link href="/app/cast" className={styles.sheet}>
                  <span className={styles.sheetArt}>
                    <Image src={s.src} alt={s.alt} fill sizes="(max-width: 720px) 80vw, (max-width: 1100px) 45vw, 320px" />
                  </span>
                  <code className={styles.tag}>{s.tag}</code>
                </Link>
              </li>
            ))}
          </Reveal>
        </section>

        <section aria-labelledby="formats">
          <div className={styles.head}>
            <div>
              <h2 id="formats" className="h2">
                Formats in testing
              </h2>
              <p className="muted">Each one opens where it lives on the site.</p>
            </div>
          </div>
          <Reveal as="ul" stagger className={styles.formats}>
            {formats.map((f) => (
              <li key={f.href}>
                <Link href={f.href} className={styles.format}>
                  <span className={styles.tile}>
                    {f.clip ? (
                      <LoopClip src={f.clip} poster={f.art} sizes={tileSizes} focus={f.focus} />
                    ) : (
                      <Image
                        className={styles.tileMedia}
                        src={f.art}
                        alt=""
                        fill
                        sizes={tileSizes}
                        style={f.focus ? { objectPosition: f.focus } : undefined}
                      />
                    )}
                  </span>
                  <span className={styles.formatTitle}>
                    {f.title}
                    <GestureIcon name="arrow" />
                  </span>
                  <span className="small muted">{f.fact}</span>
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
