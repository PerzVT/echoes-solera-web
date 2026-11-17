import { Nav } from "@/components/labs/Nav";
import { SkHeading } from "@/components/labs/fx/PageSkeleton";
import { Skeleton, SkeletonButton, SkeletonGroup, SkeletonText } from "@/components/labs/fx/Skeleton";
import styles from "./studio.module.css";

const sizes = ["wide", "tall", "mid", "narrow"] as const;

/** Studio: the statement and its two actions, then the four pieces of selected work. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup className={styles.page}>
      <Nav current="/studio" />
      <div className={styles.main}>
        <section className={styles.intro} aria-hidden="true">
          <SkeletonText size="display" lines={3} widths={["min(300px, 70%)", "min(380px, 86%)", "min(340px, 78%)"]} />
          <div className={styles.introSide}>
            <SkeletonText lines={2} widths={["100%", "74%"]} />
            <div className={styles.actions}>
              <SkeletonButton index={2} width={170} />
              <SkeletonButton index={3} width={160} />
            </div>
          </div>
        </section>
        <section>
          <SkHeading width={200} />
          <ul className={styles.work} style={{ listStyle: "none" }} aria-hidden="true">
            {sizes.map((size, i) => (
              <li key={size} className={styles[size]}>
                <Skeleton className={styles.card} radius="var(--r-stage)" index={i} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SkeletonGroup>
  );
}
