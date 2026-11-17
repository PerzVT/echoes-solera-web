import { Skeleton, SkeletonGroup } from "@/components/labs/fx/Skeleton";

/** The visual novel fills the screen: the scene, and the text box at its foot. */
export default function PageSkeleton() {
  return (
    <SkeletonGroup style={{ position: "relative", height: "100dvh", background: "var(--surface-sunken)" }}>
      <Skeleton width="100%" height="100%" radius={0} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "absolute", left: "50%", bottom: "clamp(16px, 5vh, 48px)", translate: "-50% 0", width: "min(960px, calc(100% - 32px))", display: "grid", gap: 12, padding: 28, borderRadius: "var(--r-card)", background: "var(--surface)" }}>
        <Skeleton width={120} height={14} index={1} />
        <Skeleton width="92%" height={14} index={2} />
        <Skeleton width="64%" height={14} index={3} />
      </div>
    </SkeletonGroup>
  );
}
