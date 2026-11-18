import { Nav } from "@/components/labs/Nav";
import { Skeleton, SkeletonGroup } from "@/components/labs/fx/Skeleton";
import pack from "@/components/labs/PackOpening.module.css";
import t from "@/components/labs/Title.module.css";
import styles from "../cards.module.css";
import p from "./packs.module.css";

/** The pack stage: the heading and the three packs to choose from. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup className={`${t.page} ${p.page}`}>
      <Nav />
      <div className={`${styles.desk} ${styles.packs} ${p.desk}`}>
        <div className={pack.wrap} aria-hidden="true">
          <Skeleton width={260} height="clamp(2rem, 3.4vw, 3rem)" radius={10} />
          <ul className={pack.shelf}>
            {[0, 1, 2].map((i) => (
              <li key={i}>
                <Skeleton ratio="888 / 1440" width="100%" radius={10} index={i + 1} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SkeletonGroup>
  );
}
