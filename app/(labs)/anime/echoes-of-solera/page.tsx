import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { ButtonLink } from "@/components/labs/Button";
import { Icon } from "@/components/labs/Icon";
import { Nav } from "@/components/labs/Nav";
import { Reveal } from "@/components/labs/fx/Reveal";
import { LandscapePlayer } from "@/components/labs/LandscapePlayer";
import { catalyst, dances, shorts, solera } from "@/lib/labs/solera";
import styles from "@/components/labs/Title.module.css";
import { og } from "@/lib/labs/og";
import { Loop } from "./Loop";
import loop from "./Loop.module.css";

export const metadata: Metadata = { title: solera.title, ...og(solera.title, "anime") };

const watch = "/anime/echoes-of-solera/watch";

export default function EchoesOfSolera() {
  return (
    <div className={styles.page}>
      <Nav />
      <main id="main" className={styles.main}>
        <section className={styles.hero}>
          <Loop className={loop.hero} src={solera.hero.video} poster={solera.hero.poster} label={solera.hero.label} />
          <div className={styles.shade} />
          <div className={styles.heroCopy}>
            <h1 className="display">{solera.title}</h1>
            <p className={styles.hook}>{solera.hook}</p>
            <ButtonLink href="#catalyst" icon={<Icon name="play" size={18} />}>
              Watch Catalyst
            </ButtonLink>
          </div>
        </section>

        <section id="catalyst" aria-labelledby="catalyst-title">
          <h2 id="catalyst-title" className="h2">
            {catalyst.title}
          </h2>
          <LandscapePlayer items={[catalyst]} priority />
        </section>

        <Reveal as="section" className={styles.story} aria-labelledby="story">
          <div>
            <h2 id="story" className="h2">
              The story
            </h2>
            <div className={loop.frame}>
              <Loop src={solera.storyLoop.video} poster={solera.storyLoop.poster} label={solera.storyLoop.label} />
            </div>
          </div>
          <div className={styles.storyText}>
            {solera.story.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </Reveal>

        <section aria-labelledby="dances">
          <h2 id="dances" className="h2">
            Dances
          </h2>
          <p className="nl-note">Nova and Ya, two dance clips.</p>
          <LandscapePlayer items={dances} />
        </section>

        <section aria-labelledby="shorts">
          <h2 id="shorts" className="h2">
            Shorts
          </h2>
          <Reveal as="ul" stagger className={styles.shorts}>
            {shorts.map((s) => (
              <li key={s.number}>
                <Link href={`${watch}?ep=${s.number}`} className={styles.short}>
                  <span className={styles.poster}>
                    <Image src={s.poster} alt="" width={270} height={480} sizes="(max-width: 720px) 42vw, 200px" />
                  </span>
                  <span className={styles.name}>{s.title}</span>
                </Link>
              </li>
            ))}
          </Reveal>
        </section>

        <section aria-labelledby="cast">
          <h2 id="cast" className="h2">
            Cast
          </h2>
          <Reveal as="ul" stagger className={styles.cast}>
            {solera.cast.map((c) => (
              <li key={c.name}>
                <span className={styles.figure}>
                  <Image bare src={c.src} alt="" width={720} height={960} sizes="(max-width: 720px) 45vw, 250px" />
                </span>
                <span className={styles.name}>{c.name}</span>
              </li>
            ))}
          </Reveal>
        </section>

        <section aria-labelledby="places">
          <h2 id="places" className="h2">
            Places
          </h2>
          <Reveal as="ul" stagger className={styles.places}>
            {solera.places.map((p) => (
              <li key={p.name}>
                <span className={styles.plate}>
                  <Image src={p.src} alt="" width={1344} height={752} sizes="(max-width: 720px) 92vw, 430px" />
                </span>
                <span className={styles.name}>{p.name}</span>
              </li>
            ))}
          </Reveal>
        </section>

        <Reveal as="section" className="nl-made">
          <div>
            <p className="h3">Echoes of Solera is made with the Nine Lives anime tool.</p>
            <p className="small muted">Bring an idea and produce your own.</p>
          </div>
          <ButtonLink href="/app" variant="secondary">
            Create an anime
          </ButtonLink>
        </Reveal>
      </main>
    </div>
  );
}
