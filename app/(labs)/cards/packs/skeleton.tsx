import { Nav } from "@/components/labs/Nav";
import { Skeleton, SkeletonGroup } from "@/components/labs/fx/Skeleton";
import pack from "@/components/labs/PackOpening.module.css";
import t from "@/components/labs/Title.module.css";
import styles from "../cards.module.css";

/** The pack stage: the heading and the three packs to choose from. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup className={t.page}>
      <Nav />
      <div className={`${styles.desk} ${styles.packs}`}>
        <div className={pack.wrap} aria-hidden="true">
          <Skeleton width={260} height="clamp(2rem, 3.4vw, 3rem)" radius={10} />
          <div className={pack.choices}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} ratio="5 / 8" width="100%" radius={10} index={i + 1} />
            ))}
          </div>
        </div>
      </div>
    </SkeletonGroup>
  );
}
