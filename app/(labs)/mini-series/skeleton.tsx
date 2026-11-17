import { SkHeading, SkHeroCopy, SkTiles, SkTitlePage } from "@/components/labs/fx/PageSkeleton";
import { Skeleton } from "@/components/labs/fx/Skeleton";
import lib from "@/components/labs/Library.module.css";
import styles from "./library.module.css";

/** The library: the featured series, the filter row, the first twelve posters. */
export default function PageSkeleton() {
  return (
    <SkTitlePage>
      <section className={styles.feature}>
        <SkHeroCopy className={styles.featureCopy} />
      </section>
      <section>
        <div className={lib.head} aria-hidden="true">
          <Skeleton width={170} height={28} radius={8} />
          <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[52, 84, 110, 76, 76, 70].map((w, i) => (
              <Skeleton key={i} width={w} height={36} radius="var(--r-pill)" index={i} />
            ))}
          </span>
        </div>
        <SkTiles className={lib.grid} count={12} ratio="2 / 3" radius="var(--r-thumb)" captions={2} />
      </section>
    </SkTitlePage>
  );
}
