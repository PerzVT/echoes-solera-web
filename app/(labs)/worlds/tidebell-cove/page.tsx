import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { ButtonLink } from "@/components/labs/Button";
import { Nav } from "@/components/labs/Nav";
import { Reveal } from "@/components/labs/fx/Reveal";
import { tidebell as w } from "@/lib/labs/worlds";
import t from "@/components/labs/Title.module.css";
import { Wardrobe } from "./Wardrobe";
import styles from "./world.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: w.title, ...og(w.title, "worlds") };

export default function TidebellCove() {
  return (
    <div className={t.page}>
      <Nav />
      <main id="main" className={t.main}>
        <section className={styles.hero} aria-labelledby="world-title">
          <div className={styles.stage}>
            <Image className={styles.plate} src={w.heroPlate} alt="" fill sizes="(max-width: 1392px) 100vw, 1344px" priority />
            <div className={styles.shade} />
            <div className={styles.cast}>
              {w.heroCast.map((c) => (
                <Image bare key={c.src} className={styles.castImg} src={c.src} alt={c.alt} width={720} height={960} sizes="240px" priority />
              ))}
            </div>
          </div>
          <div className={styles.heroCopy}>
            <h1 id="world-title" className="display">
              {w.title}
            </h1>
            <p className={styles.lede}>A small 3D cove you walk around as FOMO, a duck.</p>
            <ButtonLink href="#outfits">Try the outfits</ButtonLink>
          </div>
        </section>

        <section id="outfits" className={styles.anchor} aria-labelledby="outfits-title">
          <h2 id="outfits-title" className="h2">
            Outfits
          </h2>
          <Wardrobe sheet={w.outfits.src} outfits={w.outfits.items} />
        </section>

        <section aria-labelledby="build">
          <h2 id="build" className="h2">
            From an earlier build
          </h2>
          <p className="nl-note">Captures from an earlier build of the cove, with its own interface. The ducks have changed since.</p>
          <Reveal as="div" stagger className={styles.captures}>
            {w.captures.map((c) => (
              <figure key={c.src} className={styles.figure}>
                <Image className={styles.frame} src={c.src} alt={c.alt} width={c.width} height={c.height} sizes="(max-width: 900px) 100vw, 660px" />
                <figcaption className="small muted">{c.caption}</figcaption>
              </figure>
            ))}
          </Reveal>
        </section>

        <section aria-labelledby="residents">
          <h2 id="residents" className="h2">
            Residents
          </h2>
          <Reveal as="ul" stagger className={styles.residents}>
            {w.residents.map((r) => (
              <li key={r.src}>
                <div className={styles.portrait}>
                  <Image bare className={styles.cutout} src={r.src} alt={r.alt} width={720} height={658} sizes="(max-width: 720px) 90vw, 420px" />
                </div>
                <h3 className="h3">{r.role}</h3>
              </li>
            ))}
          </Reveal>
        </section>

        <section aria-labelledby="places">
          <h2 id="places" className="h2">
            Places
          </h2>
          <Reveal as="ul" stagger className={styles.places}>
            {w.places.map((p) => (
              <li key={p.src}>
                {/* Codex's postcard fronts (worlds/postcards), built here: the plate on cream with the cove's name. */}
                <figure className={styles.postcard}>
                  <span className={styles.postcardArt}>
                    <Image src={p.src} alt={`Postcard of the ${p.caption.toLowerCase()}`} fill sizes="(max-width: 900px) 100vw, 440px" />
                  </span>
                  <figcaption className={styles.postcardFoot}>
                    <span>{w.title}</span>
                    <span>{p.caption}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </Reveal>
        </section>

        <Reveal as="section" className="nl-made">
          <p className="h3">FOMO is also on cards and objects.</p>
          <div className={styles.madeActions}>
            <ButtonLink href="/cards" variant="secondary">
              See the cards
            </ButtonLink>
            <ButtonLink href="/shop" variant="secondary">
              See the objects
            </ButtonLink>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
