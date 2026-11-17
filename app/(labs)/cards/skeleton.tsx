import { Nav } from "@/components/labs/Nav";
import { SkBackRow } from "@/components/labs/fx/PageSkeleton";
import { Skeleton, SkeletonButton, SkeletonGroup } from "@/components/labs/fx/Skeleton";
import cc from "@/components/labs/CardCollection.module.css";
import t from "@/components/labs/Title.module.css";
import styles from "./cards.module.css";

/** The collection: the desk, its heading row and the binder. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup className={t.page}>
      <Nav />
      <SkBackRow />
      <div className={styles.desk} data-theme="light">
        <div className={cc.head} aria-hidden="true">
          <Skeleton width="min(340px, 70%)" height="clamp(2.4rem, 4.8vw, 4.2rem)" radius={12} />
          <Skeleton width={330} height={52} radius="var(--r-pill)" index={1} />
          <SkeletonButton index={2} />
        </div>
        <div className={cc.book}>
          <Skeleton ratio="5 / 2" width="100%" radius={22} index={3} />
        </div>
      </div>
    </SkeletonGroup>
  );
}
