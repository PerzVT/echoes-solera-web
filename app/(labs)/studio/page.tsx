import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { ButtonLink } from "@/components/labs/Button";
import { GestureIcon } from "@/components/labs/fx/AnimatedIcon";
import { Nav } from "@/components/labs/Nav";
import { AnimatedMark, LIGHT_MATERIALS } from "@/components/labs/fx";
import { Reveal } from "@/components/labs/fx/Reveal";
import { RequestForm } from "@/components/labs/RequestForm";
import styles from "./studio.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Studio", ...og("Studio") };

const L = "/labs";

type Work = {
  kind: string;
  title: string;
  line: string;
  href: string;
  art: string;
  /** A transparent layer registered to the art. */
  cast?: string;
  focus: string;
  size: "wide" | "tall" | "mid" | "narrow" | "full";
};

const work: Work[] = [
  {
    kind: "Anime",
    title: "Echoes of Solera",
    line: "Nova finds a golden ticket into an invite-only virtual world.",
    href: "/anime/echoes-of-solera",
    art: `${L}/anime/hero-bg.webp`,
    cast: `${L}/anime/hero-cast.webp`,
    focus: "70% 40%",
    size: "wide",
  },
  {
    kind: "Mini-series",
    title: "Vertical series",
    line: "Romance and drama, one episode at a time.",
    href: "/mini-series",
    art: `${L}/mini-series/moonflower/hero-bg.webp`,
    cast: `${L}/mini-series/moonflower/hero-cast.webp`,
    focus: "84% 30%",
    size: "tall",
  },
  {
    kind: "Cooking videos",
    title: "Shoujo Supper",
    line: "Recipes cooked by an anime cast.",
    href: "/cooking/shoujo-supper",
    art: `${L}/cooking/hero-akane.webp`,
    focus: "75% 30%",
    size: "full",
  },
];

const services = [
  { name: "Anime production", text: "Short anime from your script, with characters designed for the story." },
  { name: "Mini-series", text: "A vertical series written and produced one episode at a time." },
  { name: "Recipe videos", text: "Your recipe made into a short video, cooked by an anime character." },
  { name: "Game advertising", text: "Short vertical ads made from your build, in your game's art style." },
  { name: "Visual novel concepts", text: "A short branching story with scenes, characters and choices." },
];

const steps = [
  { name: "Brief and references", text: "You send the idea, who it is for and any art you already have." },
  { name: "Script and screenplay", text: "We write the script, then break it into scenes and shots." },
  { name: "Production", text: "We design the characters and produce each scene in one style." },
  { name: "Review and delivery", text: "You mark changes on each cut, then get the final files." },
];

export default function Studio() {
  return (
    <div className={styles.page}>
      <Nav current="/studio" />
      <main id="main" className={styles.main}>
        <section className={styles.intro} aria-labelledby="title">
          <div>
            <AnimatedMark variant="cycle" material={LIGHT_MATERIALS} size={48} style={{ display: "block", marginBottom: 24 }} />
            <h1 id="title" className="display">
              Stories, characters and worlds.
            </h1>
          </div>
          <div className={styles.introSide}>
            <p className={styles.lede}>
              We create anime, episodic stories and campaign films, from script and character design through production and
              editing.
            </p>
            <div className={styles.actions}>
              <ButtonLink href="#discuss">Discuss a project</ButtonLink>
              <ButtonLink href="/" variant="secondary">
                Explore projects
              </ButtonLink>
            </div>
          </div>
        </section>

        <section aria-labelledby="work">
          <h2 id="work" className="h2">
            Selected work
          </h2>
          <Reveal as="ul" stagger className={styles.work}>
            {work.map((w, i) => (
              <li key={w.href} className={styles[w.size]}>
                <Link href={w.href} className={styles.card}>
                  <Image
                    className={styles.cardArt}
                    src={w.art}
                    alt=""
                    fill
                    sizes={w.size === "wide" ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 900px) 100vw, 40vw"}
                    style={{ objectPosition: w.focus }}
                    priority={i < 2}
                  />
                  {w.cast ? (
                    <Image bare
                      className={styles.cardArt}
                      src={w.cast}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 100vw, 60vw"
                      style={{ objectPosition: w.focus }}
                      priority
                    />
                  ) : null}
                  <span className={styles.cardShade} />
                  <span className={styles.cardCopy}>
                    <span className={styles.cardTitle}>{w.title}</span>
                    <span className={styles.cardLine}>{w.line}</span>
                  </span>
                  <span className={styles.cardArrow}>
                    <GestureIcon name="arrow" />
                  </span>
                </Link>
              </li>
            ))}
          </Reveal>
        </section>

        <section className={styles.services} aria-labelledby="services">
          <h2 id="services" className="h2">
            Services
          </h2>
          <Reveal as="dl" stagger className={styles.serviceList}>
            {services.map((s) => (
              <div key={s.name}>
                <dt className="h3">{s.name}</dt>
                <dd className="muted">{s.text}</dd>
              </div>
            ))}
          </Reveal>
        </section>

        <section aria-labelledby="process">
          <h2 id="process" className="h2">
            Process
          </h2>
          <Reveal as="ol" stagger className={styles.steps}>
            {steps.map((s, i) => (
              <li key={s.name}>
                <span className={styles.num} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="h3">{s.name}</h3>
                <p className="muted">{s.text}</p>
              </li>
            ))}
          </Reveal>
        </section>

        <Reveal as="section" id="discuss" className={styles.discuss} aria-labelledby="discuss-title">
          <div className={styles.discussCopy}>
            <h2 id="discuss-title" className="h2">
              Discuss a project
            </h2>
            <p className="muted">Tell us what you want to make and who it is for.</p>
          </div>
          <RequestForm kind="project" />
        </Reveal>
      </main>
    </div>
  );
}
