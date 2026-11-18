import { Nav } from "@/components/labs/Nav";
import { Skeleton, SkeletonGroup } from "@/components/labs/fx/Skeleton";
import styles from "@/components/labs/manga/series.module.css";
import t from "@/components/labs/Title.module.css";

/** The series page: the hero and the chapter cards. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup className={t.page}>
      <Nav />
      <div className={styles.main} aria-hidden="true">
        <Skeleton className={styles.hero} width="100%" radius="var(--r-stage)" />
        <div className={styles.chapters}>
          <Skeleton width={160} height={30} radius={10} index={1} />
          <div className={styles.cards}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} ratio="2 / 3" width="100%" radius="var(--r-card)" index={2 + i} />
            ))}
          </div>
        </div>
      </div>
    </SkeletonGroup>
  );
}
