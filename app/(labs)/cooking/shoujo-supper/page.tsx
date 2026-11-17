import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { ButtonLink } from "@/components/labs/Button";
import { Icon } from "@/components/labs/Icon";
import { BackLink } from "@/components/labs/BackLink";
import { Nav } from "@/components/labs/Nav";
import { Reveal } from "@/components/labs/fx/Reveal";
import recipes from "@/lib/labs/recipes.json";
import { releases, supper } from "@/lib/labs/supper";
import styles from "@/components/labs/Title.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: supper.title, ...og(supper.title, "cooking") };

const watch = "/cooking/shoujo-supper/watch";
const chefNames = new Set(supper.chefs.map((c) => c.name));

export default function ShoujoSupper() {
  return (
    <div className={styles.page}>
      <Nav />
      <BackLink row href="/?p=cooking">
        Cooking videos
      </BackLink>
      <main id="main" className={styles.main}>
        <section className={`${styles.hero} ${styles.heroLight}`} data-theme="light">
          <Image className={styles.art} src={supper.art} alt="Concept art of Akane cooking at the stove" fill sizes="100vw" priority />
          <div className={styles.heroCopy}>
            <h1 className="display">{supper.title}</h1>
            <p className={styles.hook}>{supper.hook}</p>
            <ButtonLink href={watch} icon={<Icon name="play" size={18} />}>
              Watch from the start
            </ButtonLink>
          </div>
        </section>

        <section aria-labelledby="episodes">
          <h2 id="episodes" className="h2">
            Episodes
          </h2>
          <Reveal as="ul" stagger className={styles.shorts}>
            {releases.map((r) => (
              <li key={r.number}>
                <Link href={`${watch}?ep=${r.number}`} className={styles.short}>
                  <span className={styles.poster}>
                    <Image src={r.poster} alt="" width={270} height={480} sizes="(max-width: 720px) 42vw, 200px" />
                    <Image className={styles.dish} src={r.dish} alt="" width={96} height={96} sizes="64px" />
                  </span>
                  <span className={styles.name}>{r.title}</span>
                  <span className="small muted">with {r.chef}</span>
                </Link>
              </li>
            ))}
          </Reveal>
        </section>

        <section aria-labelledby="coming">
          <h2 id="coming" className="h2">
            Coming soon
          </h2>
          <Reveal as="ul" className={styles.soonList}>
            {recipes.map((r) => (
              <li key={`${r.title}-${r.chef}`}>
                <span className={styles.name}>{r.title}</span>
                {r.chef && chefNames.has(r.chef) && <span className="small muted">with {r.chef}</span>}
              </li>
            ))}
          </Reveal>
        </section>

        <section aria-labelledby="chefs">
          <h2 id="chefs" className="h2">
            Chefs
          </h2>
          <Reveal as="ul" stagger className={styles.chefs}>
            {supper.chefs.map((c) => (
              <li key={c.name}>
                <span className={styles.portrait}>
                  <Image bare src={c.src} alt="" width={523} height={820} sizes="(max-width: 720px) 30vw, 140px" />
                </span>
                <span className={styles.name}>{c.name}</span>
              </li>
            ))}
          </Reveal>
        </section>

        <Reveal as="section" className="nl-made">
          <div>
            <p className="h3">Shoujo Supper is made with the Nine Lives cooking tool.</p>
            <p className="small muted">Bring a recipe and produce your own.</p>
          </div>
          <ButtonLink href="/app" variant="secondary">
            Create a video
          </ButtonLink>
        </Reveal>
      </main>
    </div>
  );
}
