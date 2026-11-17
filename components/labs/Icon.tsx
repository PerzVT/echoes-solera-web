/* Paths from the brand icon set (24px grid, 1.75 stroke, round caps). The last five extend it in the same style.
   Icons whose state changes have moving versions in fx/AnimatedIcon. */
export const iconPaths = {
  play: "M8 5l11 7-11 7Z",
  pause: "M8 5v14M16 5v14",
  volume: "M3 9h4l5-5v16l-5-5H3ZM16 8q6 4 0 8",
  mute: "M3 9h4l5-5v16l-5-5H3ZM16 9l5 6m0-6-5 6",
  back: "M20 12H4m6-6-6 6 6 6",
  arrow: "M4 12h16M14 6l6 6-6 6",
  replay: "M20 8a8 8 0 1 0 0 8M20 2v6h-6",
  lock: "M5 10h14v11H5ZM8 10V6a4 4 0 0 1 8 0v4",
  check: "m4 12 5 5L20 6",
  close: "m6 6 12 12M18 6 6 18",
  down: "m5 9 7 7 7-7",
  download: "M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3",
  upload: "M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5",
  search: "M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  plus: "M12 4v16M4 12h16",
  settings: "M4 6h16M4 18h16M9 3v6M15 15v6",
  hide: "M2 12q10-14 20 0-10 14-20 0ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  script: "M6 3h12v18H6ZM9 7h6M9 11h6M9 15h4",
  cast: "M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 21v-4q0-5 6-5t6 5v4M17 4q5 2 0 6m1 3q4 0 4 5v3",
  cards: "M7 3h14v18H7ZM3 6v15",
  storyboard: "M3 4h18v16H3ZM3 12h18M12 4v16",
  world: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2q8 10 0 20-8-10 0-20",
  up: "m5 15 7-7 7 7",
  fullscreen: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
  shrink: "M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5",
} as const;

export type IconName = keyof typeof iconPaths;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === "play" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}
