import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { AdSamples, type Sample } from "@/components/labs/AdSamples";
import { ButtonLink } from "@/components/labs/Button";
import { Icon } from "@/components/labs/Icon";
import { BackLink } from "@/components/labs/BackLink";
import { Nav } from "@/components/labs/Nav";
import { Reveal } from "@/components/labs/fx/Reveal";
import { RequestForm } from "@/components/labs/RequestForm";
import t from "@/components/labs/Title.module.css";
import styles from "./game-ads.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Game ads", ...og("Game ads", "game-ads") };

const L = "/labs/game-ads";

const samples: Sample[] = [
  { title: "Sweet Rush", detail: "12 seconds, with sound", video: `${L}/sweet-rush.mp4`, poster: `${L}/sweet-rush.webp`, sound: true },
  { title: "Decorate and Serve", detail: "15 seconds, with sound", video: `${L}/decorate-and-serve.mp4`, poster: `${L}/decorate-and-serve.webp`, sound: true },
];

const steps = [
  { name: "Send your build", text: "A playable build or screen recordings, plus the characters and art you want shown." },
  { name: "We write the ad", text: "A shot list built on your real gameplay: what the player does, then who they meet." },
  { name: "We produce it", text: "Vertical video in your game's own art style, 6 to 15 seconds long." },
  { name: "You review", text: "You mark what to change on the cut and get a new one." },
];

export default function GameAds() {
  return (
    <div className={t.page}>
      <Nav />
      <BackLink row href="/?p=game-ads">
        Game ads
      </BackLink>
      <main id="main" className={t.main}>
        <section className={styles.hero}>
          <Image className={styles.heroArt} src={`${L}/hero-bg.webp`} alt="" fill sizes="100vw" priority />
          <div className={styles.heroShade} />
          <div className={styles.heroCopy}>
            <h1 className="display">Video ads for your game</h1>
            <p className={styles.lede}>We make short vertical ads from your build, in your game&apos;s art style, for game studios.</p>
            <ButtonLink href="#request">Request an ad</ButtonLink>
          </div>
        </section>

        <section aria-labelledby="samples">
          <h2 id="samples" className="h2">
            Samples
          </h2>
          <p className="nl-note">Two ads from two game concepts of our own. None was made for a client.</p>
          <Reveal as="div" className={styles.samples}>
            <AdSamples samples={samples} />
            <dl className={styles.spec}>
              <div>
                <dt>Format</dt>
                <dd>Vertical, 9:16</dd>
              </div>
              <div>
                <dt>Lengths</dt>
                <dd>6 to 15 seconds</dd>
              </div>
              <div>
                <dt>Structure</dt>
                <dd>Gameplay first, or the character first</dd>
              </div>
              <div>
                <dt>Sound</dt>
                <dd>Music and effects, readable with sound off</dd>
              </div>
            </dl>
          </Reveal>
        </section>

        <section aria-labelledby="how">
          <h2 id="how" className="h2">
            How it works
          </h2>
          <Reveal as="ol" stagger className={styles.steps}>
            {steps.map((s, i) => (
              <li key={s.name}>
                <span className={styles.num}>{i + 1}</span>
                <h3 className="h3">{s.name}</h3>
                <p className="muted">{s.text}</p>
              </li>
            ))}
          </Reveal>
        </section>

        <Reveal as="section" id="request" className={styles.request} aria-labelledby="request-title">
          <div>
            <h2 id="request-title" className="h2">
              Request an ad
            </h2>
            <p className="nl-note">Tell us about the game.</p>
            <p className="small muted">This form is a preview. Nothing is sent yet.</p>
          </div>
          <RequestForm />
        </Reveal>
      </main>
    </div>
  );
}
