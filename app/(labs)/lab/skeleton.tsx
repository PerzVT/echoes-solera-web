import { Nav } from "@/components/labs/Nav";
import { SkHeading } from "@/components/labs/fx/PageSkeleton";
import { Skeleton, SkeletonButton, SkeletonGroup, SkeletonText } from "@/components/labs/fx/Skeleton";
import styles from "./lab.module.css";

/** Lab: the statement and its two actions, then the eight creator screens. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup className={styles.page}>
      <Nav current="/lab" />
      <div className={styles.main}>
        <section className={styles.intro} aria-hidden="true">
          <SkeletonText size="display" lines={2} widths={["min(420px, 86%)", "min(360px, 72%)"]} />
          <div className={styles.introSide}>
            <SkeletonText lines={2} widths={["100%", "66%"]} />
            <div className={styles.actions}>
              <SkeletonButton index={2} width={210} />
              <SkeletonButton index={3} width={190} />
            </div>
          </div>
        </section>
        <section>
          <SkHeading note width={130} />
          <ol className={styles.stages} style={{ listStyle: "none" }} aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} style={{ display: "grid", gap: 12, alignContent: "start" }}>
                <Skeleton width={36} height={36} radius="50%" index={i} />
                <Skeleton width="60%" height={18} index={i} />
                <SkeletonText lines={2} widths={["92%", "58%"]} />
              </li>
            ))}
          </ol>
        </section>
      </div>
    </SkeletonGroup>
  );
}
