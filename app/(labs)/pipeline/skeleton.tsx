import { Nav } from "@/components/labs/Nav";
import { Skeleton, SkeletonGroup, SkeletonText } from "@/components/labs/fx/Skeleton";
import s from "@/components/labs/pipeline/pipeline.module.css";

/** The pipeline: the statement and its two halves beside the clip, then the first step. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup className={s.page}>
      <Nav />
      <div className={s.main}>
        <section className={s.hero} aria-hidden="true">
          <div className={s.heroCopy}>
            <SkeletonText size="display" lines={2} widths={["min(520px, 90%)", "min(380px, 66%)"]} />
            <SkeletonText lines={2} widths={["min(560px, 100%)", "min(420px, 76%)"]} />
            <div className={s.halves}>
              {[0, 1].map((i) => (
                <div key={i} style={{ display: "grid", gap: 12 }}>
                  <Skeleton width="62%" height={20} index={i + 2} />
                  <SkeletonText lines={3} />
                </div>
              ))}
            </div>
          </div>
          <div className={s.heroClip}>
            <Skeleton ratio="9 / 16" width="100%" radius="var(--r-card)" index={4} />
          </div>
        </section>
        <section className={s.walk} aria-hidden="true">
          <Skeleton width="min(420px, 80%)" height={40} radius={10} />
        </section>
      </div>
    </SkeletonGroup>
  );
}
