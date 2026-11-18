import { Nav } from "@/components/labs/Nav";
import { Skeleton, SkeletonGroup } from "@/components/labs/fx/Skeleton";
import styles from "@/components/labs/manga/reader.module.css";

/** The reader: its bar, one page and the scrubber. */
export default function ChapterSkeleton() {
  return (
    <SkeletonGroup className={styles.page}>
      <Nav />
      <div className={styles.main} aria-hidden="true">
        <div className={styles.root}>
          <div className={styles.bar}>
            <Skeleton width={200} height={20} radius={8} />
          </div>
          <div className={styles.stage} style={{ display: "grid", placeItems: "center" }}>
            <Skeleton ratio="2 / 3" height="100%" radius="var(--r-thumb)" index={1} />
          </div>
          <div className={styles.scrub}>
            <Skeleton width="100%" height={4} radius="var(--r-pill)" index={2} />
          </div>
        </div>
      </div>
    </SkeletonGroup>
  );
}
