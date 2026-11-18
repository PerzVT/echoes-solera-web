import { Nav } from "@/components/labs/Nav";
import { Skeleton, SkeletonButton, SkeletonGroup } from "@/components/labs/fx/Skeleton";
import cc from "@/components/labs/CardCollection.module.css";
import t from "@/components/labs/Title.module.css";
import styles from "./cards.module.css";

/** The collection: the desk, its heading, counters and bar, the filter row and the first rows of pockets. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup className={t.page}>
      <Nav />
      <div className={styles.desk} data-theme="light">
        <div className={cc.head} aria-hidden="true">
          <div className={cc.titleRow}>
            <Skeleton width="min(340px, 70%)" height="clamp(2.4rem, 4.8vw, 4.2rem)" radius={12} />
            <SkeletonButton index={1} />
          </div>
          <Skeleton width="min(420px, 90%)" height={28} radius={8} index={2} />
          <Skeleton width="100%" height={8} radius="var(--r-pill)" index={3} />
        </div>
        <Skeleton width="100%" height={40} radius={12} index={4} />
        <Skeleton ratio="5 / 1.4" width="100%" radius={20} index={5} />
      </div>
    </SkeletonGroup>
  );
}
