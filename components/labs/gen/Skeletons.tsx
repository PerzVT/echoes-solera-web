import { Skeleton, SkeletonGroup } from "@/components/labs/fx";
import g from "./gen.module.css";
import f from "./feed.module.css";

const bar = { display: "flex", alignItems: "center", gap: 12, height: 61, padding: "0 16px 0 12px", borderBottom: "1px solid var(--border)" } as const;

function Bar() {
  return (
    <div style={bar}>
      <Skeleton width={40} height={40} radius={10} />
      <Skeleton width={300} height={36} radius={12} index={1} style={{ maxWidth: "60%" }} />
    </div>
  );
}

/** The generator on its way: the bar and the form's fields. */
export function CookingSkeleton() {
  return (
    <SkeletonGroup label="Loading" className={g.page}>
      <Bar />
      <div className={g.form}>
        <Skeleton width={320} height={38} radius={8} style={{ maxWidth: "80%" }} />
        <Skeleton height={58} radius={10} index={1} />
        <Skeleton height={100} radius={10} index={2} />
        <Skeleton height={180} radius={10} index={3} />
        <Skeleton width={180} height={48} radius={10} index={4} style={{ justifySelf: "end" }} />
      </div>
    </SkeletonGroup>
  );
}

/** The library on its way: the bar and the first row of videos. */
export function CookingLibrarySkeleton() {
  return (
    <SkeletonGroup label="Loading" className={g.page}>
      <Bar />
      <div className={f.feed}>
        <Skeleton width={240} height={30} radius={8} />
        <div className={f.grid}>
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} ratio="9 / 16" radius={14} index={i + 1} />
          ))}
        </div>
      </div>
    </SkeletonGroup>
  );
}
