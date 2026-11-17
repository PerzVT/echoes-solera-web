import { Skeleton, SkeletonGroup } from "@/components/labs/fx";
import b from "./board.module.css";
import f from "./flow.module.css";
import l from "./list.module.css";

const bar = { display: "flex", alignItems: "center", gap: 12, height: 61, padding: "0 16px 0 12px", borderBottom: "1px solid var(--border)" } as const;

function Bar() {
  return (
    <div style={bar}>
      <Skeleton width={40} height={40} radius={10} />
      <Skeleton width={300} height={36} radius={12} index={1} style={{ maxWidth: "60%" }} />
    </div>
  );
}

/** The storyboard on its way: the bar, the shot panel, the stage and the strip. */
export function BoardSkeleton() {
  return (
    <SkeletonGroup label="Loading" className={b.app}>
      <Bar />
      <div className={b.body}>
        <div className={b.panel}>
          <div className={b.panelBody}>
            <Skeleton width="70%" height={30} radius={6} />
            <Skeleton width="90%" height={18} radius={6} index={1} />
            <Skeleton height={32} radius="var(--r-pill)" index={2} />
            <Skeleton height={32} radius="var(--r-pill)" index={3} />
            <Skeleton height={110} radius={12} index={4} />
          </div>
        </div>
        <div className={b.stage}>
          <div className={b.stageBar}>
            <span />
            <Skeleton width={120} height={36} radius={12} />
          </div>
          <div className={b.shotStage}>
            <Skeleton className={b.frame} radius={14} index={1} />
          </div>
        </div>
        <div className={b.strip}>
          <div className={b.stripRow}>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} width={176} height={132} radius={8} index={i} />
            ))}
          </div>
        </div>
      </div>
    </SkeletonGroup>
  );
}

/** The canvas list on its way. */
export function ListSkeleton() {
  return (
    <SkeletonGroup label="Loading" className={l.page}>
      <Bar />
      <div className={l.main}>
        <Skeleton width={140} height={36} radius={8} />
        <div className={l.grid}>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} ratio="16 / 9" radius={14} index={i + 1} />
          ))}
        </div>
      </div>
    </SkeletonGroup>
  );
}

/** A step of the new-anime flow on its way: the bar and a centred block. */
export function FlowSkeleton() {
  return (
    <SkeletonGroup label="Loading" className={f.page}>
      <Bar />
      <div className={f.start}>
        <Skeleton width={360} height={40} radius={8} style={{ maxWidth: "80%" }} />
        <Skeleton height={360} radius={20} index={1} style={{ width: "min(760px, 100%)" }} />
      </div>
    </SkeletonGroup>
  );
}
