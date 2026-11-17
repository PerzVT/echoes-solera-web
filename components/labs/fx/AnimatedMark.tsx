import { useId, type CSSProperties } from "react";
import styles from "./AnimatedMark.module.css";

/*
 * The focal nine, inline. Three parts, named as in the brand file (Solera Web, 01 / Brand identity):
 * Lattice (the nine's contour), Focal-bridge (the gradient link) and Focal-centre (the pink node).
 * Path data is public/labs/brand/mark-paper.svg, unchanged.
 */
const LATTICE =
  "M31.8774 2.44252C32.8408 1.47911 34.4029 1.47913 35.3663 2.44252L38.1575 5.23366C39.1209 6.19708 39.1209 7.75914 38.1575 8.72257L35.889 10.9908C35.0233 12.6008 35.0233 14.6771 35.889 16.2871L38.1575 18.5555C39.1209 19.519 39.1209 21.081 38.1575 22.0444L35.889 24.3127C35.0233 25.9227 35.0233 27.999 35.889 29.609L38.1575 31.8774C39.1209 32.8408 39.1209 34.4029 38.1575 35.3663L35.3663 38.1575C34.4029 39.1209 32.8408 39.1209 31.8774 38.1575L29.6093 35.8892C27.9993 35.0233 25.9228 35.0232 24.3127 35.889L22.0444 38.1575C21.081 39.1209 19.5189 39.1209 18.5555 38.1575L16.2874 35.8892C14.6774 35.0233 12.6009 35.0232 10.9908 35.889L8.72257 38.1575C7.75914 39.1209 6.19707 39.1209 5.23365 38.1575L2.44266 35.3663C1.47924 34.4029 1.47924 32.8408 2.44266 31.8774L5.23365 29.0863C6.19707 28.1229 7.75914 28.1229 8.72257 29.0863L10.991 31.3547C12.601 32.2204 14.6773 32.2203 16.2873 31.3545L18.5555 29.0863C19.5189 28.1229 21.081 28.1229 22.0444 29.0863L24.3129 31.3547C25.9229 32.2204 27.9992 32.2203 29.6091 31.3545L31.3548 29.6087C32.2204 27.9988 32.2204 25.9228 31.3548 24.313L29.0864 22.0444C28.123 21.081 28.123 19.519 29.0864 18.5555L31.3548 16.2868C32.2204 14.6769 32.2205 12.6008 31.3548 10.991L29.6093 9.24544C27.9993 8.37955 25.9228 8.37946 24.3127 9.24529L22.0444 11.5137C21.081 12.4771 19.5189 12.4771 18.5555 11.5137L16.2874 9.24544C14.6774 8.37955 12.6009 8.37946 10.9908 9.24529L9.24529 10.9907C8.37945 12.6007 8.37954 14.6771 9.24529 16.2871L11.5137 18.5555C12.4771 19.519 12.4771 21.081 11.5137 22.0444L8.72257 24.8356C7.75914 25.799 6.19707 25.799 5.23365 24.8356L2.44266 22.0444C1.47924 21.081 1.47924 19.519 2.44266 18.5555L4.71108 16.2868C5.57661 14.677 5.57666 12.601 4.71108 10.9911L2.44266 8.72257C1.47924 7.75914 1.47924 6.19708 2.44266 5.23366L5.23365 2.44252C6.19707 1.47911 7.75914 1.47913 8.72257 2.44252L10.991 4.71094C12.601 5.5767 14.6773 5.5766 16.2873 4.71079L18.5555 2.44252C19.5189 1.47911 21.081 1.47913 22.0444 2.44252L24.3129 4.71094C25.9229 5.5767 27.9992 5.5766 29.6091 4.71079L31.8774 2.44252Z";
const BRIDGE =
  "M10.4989 17.7308V22.8693C12.3164 21.6005 14.9617 21.6005 16.7792 22.8693V17.7308C14.9617 18.9996 12.3164 18.9996 10.4989 17.7308Z";
const CENTRE =
  "M24.8355 18.5556L22.0444 15.7645C21.081 14.801 19.519 14.801 18.5555 15.7645L15.7644 18.5556C14.801 19.519 14.801 21.081 15.7644 22.0445L18.5555 24.8356C19.519 25.799 21.081 25.799 22.0444 24.8356L24.8355 22.0445C25.799 21.081 25.799 19.519 24.8355 18.5556Z";
/*
 * The way a pen writes the nine through the node centres: up from the middle-left node, along the top,
 * down the right side and back along the bottom. Stroked wide with round ends and clipped to the lattice, it fills the
 * mark in writing order (draw) or carries a pulse round it (busy, and idle on hover).
 */
const ROUTE = "M6.98 20.3V6.98H33.62V33.62H6.98";
/*
 * The same line the other way, and on into the middle: from the end of the nine's tail, round the
 * loop, down to the middle-left node and along the bridge to the focal centre. `reveal` grows the
 * material along it, so the mark fills along its own shape and finishes where the pink node sits.
 */
const REVEAL_ROUTE = "M6.98 33.62H33.62V6.98H6.98V20.3H20.3";

/** The nine materials of the mark (Solera Web, "Nine Lives / Material variants"). Files in public/labs/brand/materials. */
export const MATERIALS = [
  "01-chalk-bloom",
  "02-apricot-haze",
  "03-vermilion-ink",
  "04-pigment-paper",
  "05-rose-at-dusk",
  "06-colour-field",
  "07-flow-study",
  "08-liquid-blue",
  "09-night-current",
] as const;
export type Material = (typeof MATERIALS)[number];
/** Every material that reads on the dark site. Night current is ink on ink there. */
export const LIGHT_MATERIALS: Material[] = MATERIALS.filter((m) => m !== "09-night-current");

/* Where a material raster (229 px: the lattice with its pale rim) sits in the 41-unit frame: on the
   lattice path's own bounding box. Checked by laying the raster over the vector. */
const BOX = { x: 1.72, y: 1.72, size: 37.16 };
const HOLD = 2200;
const FADE = 900;

export type MarkVariant = "draw" | "idle" | "busy" | "still" | "cycle" | "flow" | "reveal";

type Props = {
  /**
   * draw, idle, busy: the paper mark's own motions. With `material`: `still` shows it, `flow` drifts it
   * like wet pigment, `cycle` cross-fades through a list of them, `reveal` grows it along the mark's own
   * shape over a ghost of the mark (the intro).
   */
  variant?: MarkVariant;
  /** One material, or the list `cycle` and `reveal` go through (reveal lands on the last). */
  material?: Material | Material[];
  /**
   * The material only shows while the link or button around the mark is hovered or focused; at rest it
   * is the plain paper mark. For the nav brand.
   */
  onHover?: boolean;
  /** Width and height. A number is pixels; a string is any CSS length. */
  size?: number | string;
  /** "brand" keeps the pink focal node. "mono" is the single-ink mark. */
  tone?: "brand" | "mono";
  /** Delay before `draw` or `reveal` starts, in ms. */
  delay?: number;
  /** Gives the mark an accessible name. Without it the mark is decorative. */
  title?: string;
  className?: string;
  style?: CSSProperties;
};

/*
 * Keyframes for a cross-fade through n stacked images, first on top. Each one is opaque through its
 * hold and then fades out to show the one beneath, which is already opaque, so the mark never thins
 * mid-fade. The last (bottom) one never fades; the first fades back in over it to close the loop.
 */
function cycleCss(n: number) {
  const step = HOLD + FADE;
  const total = n * step;
  const pc = (ms: number) => `${((ms / total) * 100).toFixed(3)}%`;
  let css = "";
  for (let i = 0; i < n - 1; i++) {
    const out = (i + 1) * step;
    const back = i === 0 ? `${pc(total - FADE)}{opacity:0;animation-timing-function:ease-in-out}100%{opacity:1}` : `99.999%{opacity:0}100%{opacity:1}`;
    css += `@keyframes nl-mark-cycle-${n}-${i}{0%,${pc(out - FADE)}{opacity:1;animation-timing-function:ease-in-out}${pc(out)}{opacity:0}${back}}`;
  }
  return { css, total };
}

export function AnimatedMark({ variant = "still", material, onHover = false, size = 36, tone = "brand", delay, title, className, style }: Props) {
  const id = useId();
  const grad = `${id}g`;
  const clip = `${id}c`;
  const wipe = `${id}w`;
  const sheen = `${id}s`;
  const list = material ? (Array.isArray(material) ? material : [material]) : [];
  const withMaterial = list.length > 0;
  const penned = variant === "draw" || variant === "idle" || variant === "busy";
  const cycling = variant === "cycle" && list.length > 1;
  const revealing = variant === "reveal" && withMaterial;
  const cycle = cycling ? cycleCss(list.length) : null;
  const dark = list.includes("09-night-current");

  // First of the list on top, so it is the one seen when nothing animates.
  const images = list.map((m, i) => (
    <image
      key={m}
      className={styles.material}
      href={`/labs/brand/materials/${m}.webp`}
      x={BOX.x}
      y={BOX.y}
      width={BOX.size}
      height={BOX.size}
      preserveAspectRatio="none"
      style={
        cycle && i < list.length - 1
          ? { animation: `nl-mark-cycle-${list.length}-${i} ${cycle.total}ms linear infinite` }
          : revealing && i < list.length - 1
            ? ({ "--k": i, "--n": list.length - 1 } as CSSProperties)
            : undefined
      }
      data-shift={revealing && i < list.length - 1 ? "" : undefined}
    />
  ));

  return (
    <svg
      className={[styles.mark, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-tone={tone}
      data-material={withMaterial ? "" : undefined}
      data-on-hover={onHover ? "" : undefined}
      width={size}
      height={size}
      viewBox="0 0 41 41"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={delay ? ({ ...style, "--mark-delay": `${delay}ms` } as CSSProperties) : style}
    >
      {cycle && <style>{cycle.css}</style>}
      <defs>
        <linearGradient id={grad} x1="10.4989" y1="20.3" x2="16.7792" y2="20.3" gradientUnits="userSpaceOnUse">
          {/* On a material the bridge is pink fading out to nothing, as in the brand file; on the paper mark it runs from the lattice colour. */}
          <stop stopColor={withMaterial && !onHover ? "#ff83b7" : "currentColor"} stopOpacity={withMaterial && !onHover ? 0 : 1} />
          <stop offset="1" className={styles.focalStop} />
        </linearGradient>
        {(penned || withMaterial) && (
          <clipPath id={clip}>
            <path d={LATTICE} />
          </clipPath>
        )}
        {revealing && (
          // A plain SVG mask with one stroked path: wide enough to cover a lattice arm with room to spare,
          // round at its end and at the corners, drawn on by its dash offset.
          <mask id={wipe} maskUnits="userSpaceOnUse" x="0" y="0" width="41" height="41">
            <path className={styles.grow} d={REVEAL_ROUTE} pathLength={1} />
          </mask>
        )}
        {variant === "flow" && (
          <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        )}
      </defs>

      {variant === "draw" && <path className={styles.ghost} d={LATTICE} fill="currentColor" />}
      {revealing && (
        // One group, so the three shapes share a single 0.16 and do not double where they overlap.
        <g className={styles.ghost}>
          <path d={LATTICE} fill="currentColor" />
          <path d={BRIDGE} fill="currentColor" />
          <path d={CENTRE} fill="currentColor" />
        </g>
      )}
      {(!withMaterial || onHover) && <path className={styles.lattice} d={LATTICE} fill="currentColor" />}
      {variant === "draw" && <path className={styles.outline} d={LATTICE} pathLength={1} />}
      {penned && (
        <g clipPath={`url(#${clip})`}>
          <path className={styles.run} d={ROUTE} pathLength={1} />
        </g>
      )}

      {withMaterial && (
        <g mask={revealing ? `url(#${wipe})` : undefined}>
          <g className={styles.materials} clipPath={`url(#${clip})`}>
            {/* Under the rasters in a reveal: if one is late the growing line uncovers the paper mark, never nothing. */}
            {revealing && <path d={LATTICE} fill="currentColor" />}
            {/* The rasters are lattice-shaped, so a copy that moves leaves gaps at the edges: a still copy lies under it. */}
            {variant === "flow" && <g>{[...images].reverse()}</g>}
            <g className={styles.drift}>{[...images].reverse()}</g>
            {variant === "flow" && <rect className={styles.sheen} x="-14" y="-6" width="14" height="53" fill={`url(#${sheen})`} />}
          </g>
          {dark && <path className={styles.rim} d={LATTICE} />}
        </g>
      )}

      {/* In a reveal the bridge and the centre are uncovered by the same growing line, so they land as it arrives. */}
      <g mask={revealing ? `url(#${wipe})` : undefined}>
        <path className={styles.bridge} d={BRIDGE} fill={`url(#${grad})`} />
        <path className={styles.centre} d={CENTRE} />
      </g>
      {/* The nib: a small pink point that leads the growing edge and comes to rest in the centre. */}
      {revealing && <path className={styles.nib} d={REVEAL_ROUTE} pathLength={1} />}
    </svg>
  );
}
