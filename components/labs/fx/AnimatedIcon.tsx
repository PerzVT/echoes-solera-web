import type { CSSProperties, ReactNode } from "react";
import { iconPaths, type IconName } from "../Icon";
import styles from "./AnimatedIcon.module.css";

/*
 * Moving versions of the icons whose state changes. Same 24px grid and 1.75 stroke as Icon.
 * Two kinds:
 *   state icons take `on` and cross-fade or redraw when it flips (play-pause, volume, check, chevron,
 *   search-close, and any pair through `swap`);
 *   gesture icons move when the link or button that holds them is hovered or focused (arrow, back,
 *   upload, download, close, search, plus), and `replay` turns once each time `turn` changes.
 * No script: every one is CSS on a class or attribute, so they work in server components.
 */

const SPEAKER = "M3 9h4l5-5v16l-5-5H3Z";
const WAVE = "M16 8q6 4 0 8";
const CROSS = "M16 9l5 6m0-6-5 6";
const UPLOAD_TRAY = "M4 16v5h16v-5";
const UPLOAD_ARROW = "M12 16V3m-5 5 5-5 5 5";
const DOWNLOAD_TRAY = "M4 18v3h16v-3";
const DOWNLOAD_ARROW = "M12 3v13m-5-5 5 5 5-5";
const SEARCH_GLASS = "M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0";
const SEARCH_HANDLE = "M16 16l5 5";

type Common = { size?: number; className?: string; style?: CSSProperties };

function Svg({ size = 20, filled, className, style, children, ...data }: Common & { filled?: boolean; children: ReactNode } & Record<`data-${string}`, string | boolean | undefined>) {
  return (
    <svg
      className={[styles.icon, className].filter(Boolean).join(" ")}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...data}
    >
      {children}
    </svg>
  );
}

/** Cross-fades between two icons: both stay in the DOM; one scales up from 0.25 as the other scales down, with opacity and a 4px blur. */
export function IconSwap({ from, to, on, size = 20, className, style }: Common & { from: IconName; to: IconName; on: boolean }) {
  return (
    <span className={[styles.swap, className].filter(Boolean).join(" ")} data-on={on} style={{ width: size, height: size, ...style }} aria-hidden="true">
      <span className={styles.a}>
        <Svg size={size} filled={from === "play"}>
          <path d={iconPaths[from]} />
        </Svg>
      </span>
      <span className={styles.b}>
        <Svg size={size} filled={to === "play"}>
          <path d={iconPaths[to]} />
        </Svg>
      </span>
    </span>
  );
}

/** Play when `playing` is false, pause when true. */
export function PlayPauseIcon({ playing, ...p }: Common & { playing: boolean }) {
  return <IconSwap from="play" to="pause" on={playing} {...p} />;
}

/** The speaker stays put; only the wave and the cross trade places. */
export function VolumeIcon({ muted, size = 20, className, style }: Common & { muted: boolean }) {
  return (
    <Svg size={size} className={className} style={style} data-kind="volume" data-on={muted}>
      <path d={SPEAKER} />
      <path className={styles.partA} d={WAVE} />
      <path className={styles.partB} d={CROSS} />
    </Svg>
  );
}

/** Turns half a circle when `open`. */
export function ChevronIcon({ open, size = 20, className, style }: Common & { open: boolean }) {
  return (
    <Svg size={size} className={className} style={style} data-kind="chevron" data-on={open}>
      <path d={iconPaths.down} />
    </Svg>
  );
}

/** The tick draws itself on when `shown` becomes true (and on mount when it starts true). */
export function CheckIcon({ shown = true, size = 20, className, style }: Common & { shown?: boolean }) {
  return (
    <Svg size={size} className={className} style={style} data-kind="check" data-on={shown}>
      <path d={iconPaths.check} pathLength={1} />
    </Svg>
  );
}

/** Turns one full circle each time `turn` changes. Pass a counter that goes up when the replay happens. */
export function ReplayIcon({ turn = 0, size = 20, className, style }: Common & { turn?: number }) {
  return (
    <Svg key={turn} size={size} className={className} style={style} data-kind="replay" data-on={turn > 0}>
      <path d={iconPaths.replay} />
    </Svg>
  );
}

export type GestureName = "arrow" | "back" | "upload" | "download" | "close" | "search" | "plus";

/** Moves a little when the link or button around it is hovered or keyboard-focused. `active` holds the moved state. */
export function GestureIcon({ name, active, size = 20, className, style }: Common & { name: GestureName; active?: boolean }) {
  const body =
    name === "upload" ? (
      <>
        <path d={UPLOAD_TRAY} />
        <path className={styles.part} d={UPLOAD_ARROW} />
      </>
    ) : name === "download" ? (
      <>
        <path d={DOWNLOAD_TRAY} />
        <path className={styles.part} d={DOWNLOAD_ARROW} />
      </>
    ) : name === "search" ? (
      <g className={styles.part}>
        <path d={SEARCH_GLASS} />
        <path d={SEARCH_HANDLE} />
      </g>
    ) : (
      <path className={styles.part} d={iconPaths[name]} />
    );
  return (
    <Svg size={size} className={className} style={style} data-kind="gesture" data-gesture={name} data-on={active || undefined}>
      {body}
    </Svg>
  );
}

type AnimatedIconProps = Common &
  (
    | { name: "play-pause" | "volume" | "chevron" | "check" | "search-close"; on: boolean }
    | { name: "replay"; turn?: number }
    | { name: GestureName; active?: boolean }
  );

/** One entry point for all of the above, by name. */
export function AnimatedIcon(props: AnimatedIconProps) {
  const { size, className, style } = props;
  const common = { size, className, style };
  switch (props.name) {
    case "play-pause":
      return <PlayPauseIcon playing={props.on} {...common} />;
    case "volume":
      return <VolumeIcon muted={props.on} {...common} />;
    case "chevron":
      return <ChevronIcon open={props.on} {...common} />;
    case "check":
      return <CheckIcon shown={props.on} {...common} />;
    case "search-close":
      return <IconSwap from="search" to="close" on={props.on} {...common} />;
    case "replay":
      return <ReplayIcon turn={props.turn} {...common} />;
    default:
      return <GestureIcon name={props.name} active={props.active} {...common} />;
  }
}
