import type { CSSProperties, ReactNode } from "react";
import styles from "./Skeleton.module.css";

type Base = { className?: string; style?: CSSProperties };

type SkeletonProps = Base & {
  /** CSS aspect-ratio, for example "2 / 3". */
  ratio?: string;
  width?: number | string;
  height?: number | string;
  /** Corner radius. Defaults to 6px. */
  radius?: number | string;
  /** Position in a group. Each step starts its sheen one stagger later. */
  index?: number;
  /** "shoulder" cuts the block to the button's shape. */
  shape?: "block" | "shoulder";
};

const cx = (...c: (string | undefined | false)[]) => c.filter(Boolean).join(" ");

/** One placeholder block: a quiet surface with a slow sheen crossing it. Decorative; name the group, not the block. */
export function Skeleton({ ratio, width, height, radius, index = 0, shape = "block", className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(styles.sk, shape === "shoulder" && styles.shoulder, className)}
      style={
        {
          aspectRatio: ratio,
          width,
          height,
          "--sk-r": typeof radius === "number" ? `${radius}px` : radius,
          "--sk-i": index,
          ...style,
        } as CSSProperties
      }
    />
  );
}

/** Wraps a set of skeletons and tells assistive technology that this region is loading. */
export function SkeletonGroup({ label = "Loading", className, style, children }: Base & { label?: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className} style={style}>
      {children}
    </div>
  );
}

/** Lines of text. `widths` sets each line; the last line is short by default. */
export function SkeletonText({ lines = 3, widths, size = "body", className, style }: Base & { lines?: number; widths?: string[]; size?: "body" | "title" | "display" }) {
  return (
    <span aria-hidden="true" className={cx(styles.text, className)} data-size={size} style={style}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} index={i} width={widths?.[i] ?? (i === lines - 1 && lines > 1 ? "62%" : "100%")} />
      ))}
    </span>
  );
}

/** A poster, 2:3. */
export function SkeletonPoster(p: Base & { index?: number }) {
  return <Skeleton ratio="2 / 3" width="100%" radius="var(--r-thumb)" {...p} />;
}

/** A vertical clip, 9:16. */
export function SkeletonClip(p: Base & { index?: number }) {
  return <Skeleton ratio="9 / 16" width="100%" radius="var(--r-card)" {...p} />;
}

/** A collectible card, 5:7, with the card's own corner. */
export function SkeletonCard(p: Base & { index?: number }) {
  return <Skeleton ratio="5 / 7" width="100%" radius="6.4% / 4.57%" {...p} />;
}

/** A button: the shouldered shape for the main action, or `rounded` on the control radius for any other. */
export function SkeletonButton({ width = 148, small, rounded, ...p }: Base & { width?: number | string; small?: boolean; rounded?: boolean; index?: number }) {
  return rounded ? <Skeleton width={width} height={small ? 40 : 48} radius="var(--r-control)" {...p} /> : <Skeleton shape="shoulder" width={width} height={small ? 40 : 48} {...p} />;
}

/** The home stage: the rounded stage with its title, line and two actions bottom left. Fills its parent. */
export function SkeletonStage({ className, style }: Base) {
  return (
    <span aria-hidden="true" className={cx(styles.stage, className)} style={style}>
      <span className={styles.stageCopy}>
        <SkeletonText size="display" lines={1} widths={["min(420px, 70%)"]} />
        <SkeletonText lines={2} widths={["min(340px, 86%)", "min(220px, 60%)"]} />
        <span className={styles.row}>
          <SkeletonButton index={3} />
          <SkeletonButton index={4} width={132} rounded />
        </span>
      </span>
    </span>
  );
}

/** A bordered panel with a heading and a few lines. */
export function SkeletonPanel({ lines = 3, className, style }: Base & { lines?: number }) {
  return (
    <span aria-hidden="true" className={cx(styles.panel, className)} style={style}>
      <SkeletonText size="title" lines={1} widths={["46%"]} />
      <SkeletonText lines={lines} />
    </span>
  );
}

/** A list row: a thumbnail and two lines. */
export function SkeletonRow({ thumb = "16 / 9", index = 0, className, style }: Base & { thumb?: string; index?: number }) {
  return (
    <span aria-hidden="true" className={cx(styles.listRow, className)} style={style}>
      <Skeleton ratio={thumb} width={96} radius="var(--r-thumb)" index={index} />
      <SkeletonText lines={2} widths={["72%", "44%"]} />
    </span>
  );
}

/** A grid of posters with a title line under each, for library pages. */
export function SkeletonPosterGrid({ count = 6, min = 168, className, style }: Base & { count?: number; min?: number }) {
  return (
    <span aria-hidden="true" className={cx(styles.grid, className)} style={{ "--sk-min": `${min}px`, ...style } as CSSProperties}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={styles.cell}>
          <SkeletonPoster index={i} />
          <Skeleton index={i} width="70%" height={12} />
        </span>
      ))}
    </span>
  );
}
