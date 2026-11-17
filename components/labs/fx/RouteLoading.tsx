import { Nav } from "../Nav";
import { AnimatedMark } from "./AnimatedMark";
import { Skeleton, SkeletonGroup, SkeletonPanel, SkeletonStage, SkeletonText } from "./Skeleton";
import home from "../Home.module.css";
import watch from "../WatchView.module.css";
import styles from "./RouteLoading.module.css";

/*
 * Whole-page skeletons that are not tied to one page file: home, the watch pages, the generic reading
 * page and the working mark. RouteSkeleton lays them over the page on a slow navigation.
 *
 * None of them is a loading.tsx, and the public routes must not get one: a loading.tsx makes Next send
 * the skeleton as the HTML and swap the page in with script (true of prerendered pages too on this
 * version), so a visitor without script would never see the page.
 */

/** The home page: nav, the stage, the dock. */
export function HomeLoading() {
  return (
    <SkeletonGroup className={home.page}>
      <Nav current="/" />
      <div className={home.stages}>
        <SkeletonStage />
      </div>
      <Skeleton width="100%" height={56} radius={18} />
    </SkeletonGroup>
  );
}

/** A watch page: the vertical player on the left, the title and its list on the right. */
export function WatchLoading() {
  return (
    <SkeletonGroup className={watch.page}>
      <Nav />
      <div className={watch.main}>
        <div className={watch.stage} aria-hidden="true">
          <span style={{ justifySelf: "start", display: "inline-flex", alignItems: "center", minHeight: 44 }}>
            <Skeleton width={128} height={14} />
          </span>
          <Skeleton ratio="9 / 16" height="100%" radius="var(--r-stage)" style={{ maxHeight: "100%", maxWidth: "100%" }} />
        </div>
        <div className={watch.panel} aria-hidden="true">
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Skeleton width={56} height={84} radius="var(--r-thumb)" />
            <SkeletonText size="title" lines={2} widths={["80%", "40%"]} />
          </div>
          <SkeletonText lines={2} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} ratio="9 / 16" width="100%" radius="var(--r-thumb)" index={i} />
            ))}
          </div>
        </div>
      </div>
    </SkeletonGroup>
  );
}

/** Any reading page whose shape is not known yet: nav, a heading, a paragraph, three panels. */
export function PageLoading() {
  return (
    <SkeletonGroup className={styles.page}>
      <Nav />
      <div className={styles.body}>
        <SkeletonText size="display" lines={1} widths={["min(520px, 72%)"]} />
        <SkeletonText lines={3} widths={["min(620px, 100%)", "min(560px, 92%)", "min(360px, 60%)"]} />
        <div className={styles.panels}>
          <SkeletonPanel />
          <SkeletonPanel />
          <SkeletonPanel />
        </div>
      </div>
    </SkeletonGroup>
  );
}

/** The creator: the mark, working. Its frames differ too much for one skeleton to be honest. */
export function BusyScreen() {
  return (
    <div className={styles.busy} role="status" aria-busy="true" aria-label="Loading">
      <AnimatedMark variant="busy" size={56} />
    </div>
  );
}
