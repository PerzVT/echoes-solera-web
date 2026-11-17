import { Nav } from "@/components/labs/Nav";
import { Skeleton, SkeletonButton, SkeletonGroup, SkeletonText } from "@/components/labs/fx/Skeleton";
import styles from "./lab.module.css";

/** Lab: the title and its two actions, then the creator clip beside its eight screens. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup className={styles.page}>
      <Nav current="/lab" />
      <div className={styles.main}>
        <section className={styles.intro} aria-hidden="true">
          <SkeletonText size="display" lines={1} widths={["min(180px, 50%)"]} />
          <div className={styles.introSide}>
            <SkeletonText lines={1} widths={["90%"]} />
            <div className={styles.actions}>
              <SkeletonButton index={2} width={210} />
              <SkeletonButton index={3} width={190} />
            </div>
          </div>
        </section>
        <section className={styles.creator} aria-hidden="true">
          <Skeleton className={styles.creatorClip} ratio="9 / 16" radius="var(--r-card)" index={1} />
          <div className={styles.creatorCopy}>
            <Skeleton width="40%" height={28} index={2} />
            <SkeletonText lines={2} widths={["92%", "64%"]} />
            <ol className={styles.stages} style={{ listStyle: "none" }}>
              {Array.from({ length: 8 }, (_, i) => (
                <li key={i}>
                  <Skeleton width={36} height={36} radius="50%" index={i} />
                  <SkeletonText lines={2} widths={["50%", "80%"]} />
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </SkeletonGroup>
  );
}
