import { SkHeading, SkHeroCopy, SkTiles, SkTitlePage } from "@/components/labs/fx/PageSkeleton";
import ads from "@/components/labs/AdSamples.module.css";
import styles from "./game-ads.module.css";

/** Game ads: the hero, then the three vertical samples beside their facts. */
export default function PageSkeleton() {
  return (
    <SkTitlePage>
      <section className={styles.hero}>
        <SkHeroCopy className={styles.heroCopy} />
      </section>
      <section>
        <SkHeading note width={150} />
        <div className={styles.samples}>
          <SkTiles className={ads.row} count={3} ratio="9 / 16" captions={2} />
        </div>
      </section>
    </SkTitlePage>
  );
}
