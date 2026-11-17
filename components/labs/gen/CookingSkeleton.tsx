import { Skeleton, SkeletonGroup } from "@/components/labs/fx";
import g from "./gen.module.css";
import f from "./feed.module.css";

/** The generator while it is on its way: the bar, the settings rail with Generate at its foot, and the first row of videos. */
export function CookingSkeleton() {
  return (
    <SkeletonGroup label="Loading" className={g.app}>
      <div className={g.top}>
        <Skeleton width={36} height={36} radius={10} />
        <Skeleton width={300} height={36} radius={12} index={1} style={{ maxWidth: "60%" }} />
      </div>
      <div className={g.body}>
        <div className={g.rail}>
          <div className={g.railScroll}>
            <Skeleton width={64} height={16} radius={6} />
            <Skeleton height={44} radius={10} index={1} />
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} height={40} radius={8} index={i + 2} />
            ))}
            <Skeleton width={48} height={16} radius={6} index={6} />
            <Skeleton height={140} radius={10} index={7} />
          </div>
          <div className={g.foot}>
            <Skeleton height={48} radius={10} index={8} />
          </div>
        </div>
        <div className={g.work}>
          <div className={f.feed}>
            <Skeleton width={220} height={30} radius={8} />
            <div className={f.grid}>
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} ratio="9 / 16" radius={14} index={i + 1} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonGroup>
  );
}
