import { Nav } from "@/components/labs/Nav";
import { Skeleton, SkeletonGroup } from "@/components/labs/fx/Skeleton";
import styles from "./reader.module.css";

/** The reader: the title row and the first page. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup className={styles.page}>
      <Nav />
      <div className={styles.header} aria-hidden="true">
        <Skeleton width={84} height={14} />
        <div className={styles.titles}>
          <Skeleton width="min(420px, 80%)" height={34} radius={10} />
          <Skeleton width="min(320px, 60%)" height={12} index={1} />
        </div>
        <Skeleton width={96} height={12} index={2} />
      </div>
      <div className={styles.reader}>
        <div className={styles.pages}>
          <Skeleton ratio="1024 / 1536" width="100%" radius="var(--r-thumb)" index={3} />
        </div>
      </div>
    </SkeletonGroup>
  );
}
