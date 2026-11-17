import type { CSSProperties, ReactNode } from "react";
import { Nav } from "../Nav";
import { Skeleton, SkeletonButton, SkeletonGroup, SkeletonText } from "./Skeleton";
import t from "../Title.module.css";

/*
 * Building blocks for route skeletons (the skeleton.tsx beside each page). A skeleton reuses its page's
 * own layout classes and puts placeholder blocks where the content will be, so the page does not move
 * when it arrives. The nav is the real one. RouteSkeleton shows them; see it for why they are not
 * loading.tsx files.
 */

const cx = (...c: (string | undefined | false)[]) => c.filter(Boolean).join(" ");

/** The back link's row. */
export function SkBackRow() {
  return (
    <div className="nl-back-row" aria-hidden="true">
      <span style={{ display: "inline-flex", alignItems: "center", minHeight: 44 }}>
        <Skeleton width={128} height={14} />
      </span>
    </div>
  );
}

/** A title page: nav, back row, the content column. */
export function SkTitlePage({ children, back = true }: { children: ReactNode; back?: boolean }) {
  return (
    <SkeletonGroup className={t.page}>
      <Nav />
      {back && <SkBackRow />}
      <div className={t.main}>{children}</div>
    </SkeletonGroup>
  );
}

/** A hero's title, its line or two, and its button. Give it the page's own copy class. */
export function SkHeroCopy({ className, lines = 2, button = true, style }: { className?: string; lines?: number; button?: boolean; style?: CSSProperties }) {
  return (
    <div className={className} style={{ width: "100%", ...style }} aria-hidden="true">
      <SkeletonText size="display" lines={1} widths={["min(440px, 82%)"]} />
      <SkeletonText lines={lines} widths={["min(380px, 90%)", "min(260px, 62%)", "min(200px, 50%)"].slice(0, lines)} />
      {button && <SkeletonButton index={3} />}
    </div>
  );
}

/** A section heading, with the note under it where the page has one. */
export function SkHeading({ note, width = 190 }: { note?: boolean; width?: number }) {
  return (
    <div style={{ display: "grid", gap: 14, marginBottom: note ? 28 : 24 }} aria-hidden="true">
      <Skeleton width={width} height={28} radius={8} />
      {note && <Skeleton width="min(440px, 80%)" height={12} />}
    </div>
  );
}

/** A grid of tiles in the page's own grid class: a picture and its caption lines. */
export function SkTiles({
  className,
  count,
  ratio,
  radius = "var(--r-card)",
  captions = 1,
  as: Tag = "ul",
}: {
  className?: string;
  count: number;
  ratio: string;
  radius?: string;
  captions?: number;
  as?: "ul" | "ol" | "div";
}) {
  const Item = Tag === "div" ? "div" : "li";
  return (
    <Tag className={className} style={{ listStyle: "none" }} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <Item key={i} style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <Skeleton ratio={ratio} width="100%" radius={radius} index={i} />
          {captions > 0 && <Skeleton width="72%" height={12} index={i} />}
          {captions > 1 && <Skeleton width="46%" height={10} index={i} />}
        </Item>
      ))}
    </Tag>
  );
}

/** A filled block, such as a story panel or a wardrobe. */
export function SkBlock({ height, radius = "var(--r-stage)", className }: { height: number | string; radius?: string; className?: string }) {
  return <Skeleton width="100%" height={height} radius={radius} className={className} />;
}

/** The show pages (anime, cooking): a hero, then a row of vertical episodes, then tiles. */
export function ShowSkeleton({ light = false, cast = 5 }: { light?: boolean; cast?: number }) {
  return (
    <SkTitlePage>
      <section className={cx(t.hero, light && t.heroLight)} data-theme={light ? "light" : undefined}>
        <SkHeroCopy className={t.heroCopy} />
      </section>
      <section>
        <SkHeading width={140} />
        <SkTiles className={t.shorts} count={5} ratio="9 / 16" />
      </section>
      <section>
        <SkHeading width={120} />
        <SkTiles className={light ? t.chefs : t.cast} count={cast} ratio="3 / 4" />
      </section>
    </SkTitlePage>
  );
}
