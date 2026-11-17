import { Nav } from "@/components/labs/Nav";
import { Skeleton, SkeletonGroup, SkeletonText } from "@/components/labs/fx/Skeleton";
import s from "@/components/labs/pipeline/pipeline.module.css";

/** A function page: the contents on the left, the title and the four answers on the right. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup className={s.page}>
      <Nav />
      <div className={s.fnPage}>
        <div className={s.toc} aria-hidden="true">
          <div style={{ display: "grid", gap: 18 }}>
            {[72, 150, 170, 180, 160, 150, 165, 120, 175].map((w, i) => (
              <Skeleton key={i} width={w} height={12} index={i} />
            ))}
          </div>
        </div>
        <div className={s.article} data-figure="false" aria-hidden="true">
          <div className={s.titleBlock} style={{ display: "grid", gap: 16 }}>
            <Skeleton width="min(460px, 86%)" height={40} radius={10} />
            <SkeletonText lines={2} widths={["min(520px, 100%)", "min(300px, 58%)"]} />
          </div>
          <div className={s.io}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ display: "grid", gap: 12, alignContent: "start" }}>
                <Skeleton width={150} height={20} index={i} />
                <SkeletonText lines={3} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonGroup>
  );
}
