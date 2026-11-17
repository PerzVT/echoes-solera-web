import { SkHeading, SkHeroCopy, SkTiles, SkTitlePage } from "@/components/labs/fx/PageSkeleton";
import styles from "./shop.module.css";

/** The shop: the hero and the grid of objects. */
export default function PageSkeleton() {
  return (
    <SkTitlePage>
      <section className={styles.hero} data-theme="light">
        <SkHeroCopy className={styles.heroCopy} lines={1} button={false} />
      </section>
      <section>
        <SkHeading note width={130} />
        <SkTiles className={styles.grid} count={8} ratio="1 / 1" captions={2} />
      </section>
    </SkTitlePage>
  );
}
