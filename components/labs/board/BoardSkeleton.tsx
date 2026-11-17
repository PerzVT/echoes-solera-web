import { Skeleton, SkeletonGroup } from "@/components/labs/fx";
import b from "./board.module.css";

/** The storyboard while it is on its way: the bar, the shot panel, the stage and the strip. */
export function BoardSkeleton() {
  return (
    <SkeletonGroup label="Loading" className={b.app}>
      <div className={b.top}>
        <Skeleton width={36} height={36} radius={10} />
        <Skeleton width={260} height={36} radius={12} index={1} />
        <span className={b.topEnd}>
          <Skeleton width={136} height={40} radius={10} index={2} />
        </span>
      </div>
      <div className={b.panel}>
        <div className={b.panelBody}>
          <Skeleton width="70%" height={28} radius={6} />
          <Skeleton width="90%" height={18} radius={6} index={1} />
          <Skeleton height={32} radius="var(--r-pill)" index={2} />
          <Skeleton height={32} radius="var(--r-pill)" index={3} />
          <Skeleton height={140} radius={12} index={4} />
        </div>
        <div className={b.panelFoot}>
          <Skeleton height={40} radius={10} index={5} />
        </div>
      </div>
      <div className={b.stage}>
        <div className={b.stageBar}>
          <Skeleton width={120} height={36} radius={12} />
        </div>
        <div className={b.shotStage}>
          <div className={b.frameBox}>
            <Skeleton className={b.frame} radius={14} index={1} />
          </div>
          <div className={b.ends}>
            <Skeleton width={180} height={54} radius={6} index={2} />
            <Skeleton width={180} height={54} radius={6} index={3} />
          </div>
        </div>
      </div>
      <div className={b.strip}>
        <div className={b.stripScroll}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} width={176} height={124} radius={8} index={i} />
          ))}
        </div>
      </div>
    </SkeletonGroup>
  );
}
