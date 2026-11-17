import { SkBlock, SkHeading, SkHeroCopy, SkTiles, SkTitlePage } from "@/components/labs/fx/PageSkeleton";
import styles from "./world.module.css";

/** The world page: the plate with its copy, the wardrobe, two captures. */
export default function PageSkeleton() {
  return (
    <SkTitlePage>
      <section className={styles.hero}>
        <div className={styles.stage} />
        <SkHeroCopy className={styles.heroCopy} lines={3} />
      </section>
      <section>
        <SkHeading note width={130} />
        <SkBlock height="clamp(320px, 44vw, 520px)" />
      </section>
      <section>
        <SkHeading note width={260} />
        <SkTiles as="div" className={styles.captures} count={2} ratio="16 / 9" />
      </section>
    </SkTitlePage>
  );
}
