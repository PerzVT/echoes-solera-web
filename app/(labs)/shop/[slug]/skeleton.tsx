import { SkHeading, SkTiles, SkTitlePage } from "@/components/labs/fx/PageSkeleton";
import { Skeleton, SkeletonText } from "@/components/labs/fx/Skeleton";
import shop from "../shop.module.css";
import styles from "./product.module.css";

/** An object: its picture beside its name and description, then more from the shop. */
export default function PageSkeleton() {
  return (
    <SkTitlePage>
      <div className={styles.product} aria-hidden="true">
        <div className={styles.media}>
          <Skeleton ratio="4 / 3" width="100%" radius="var(--r-stage)" />
        </div>
        <div className={styles.info}>
          <Skeleton width="min(360px, 80%)" height={40} radius={10} index={1} />
          <Skeleton width={150} height={12} index={2} />
          <SkeletonText lines={3} />
        </div>
      </div>
      <section>
        <SkHeading width={240} />
        <SkTiles className={shop.grid} count={4} ratio="1 / 1" captions={2} />
      </section>
    </SkTitlePage>
  );
}
