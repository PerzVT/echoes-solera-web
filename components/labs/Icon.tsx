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
  /* The creator's tools. */
  series: "M7 2.5h10v19H7ZM10.5 18.5h3M10 9.5l4.5 2.5-4.5 2.5Z",
  anime: "M12 3q1.2 7.8 9 9-7.8 1.2-9 9-1.2-7.8-9-9 7.8-1.2 9-9Z",
  cooking: "M4 10h16v3a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7ZM2 10h20M9 7q-1-2 .5-4M14.5 7q-1-2 .5-4",
  manga: "M12 6.5Q8 4 3 5v14q5-1 9 1.5 4-2.5 9-1.5V5q-5-1-9 1.5ZM12 6.5v14M6 9.5h3M15 9.5h3M15 13h3",
  /* The creator's views and actions. */
  create: "M4 20h4L19.5 8.5l-4-4L4 16ZM13 7l4 4",
  library: "M4 4h4v16H4ZM10 4h4v16h-4ZM15.6 5.4l3.9-1 3.4 14.6-3.9 1Z",
  file: "M6 3h8l4 4v14H6ZM14 3v4h4",
  attach: "M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L15 7",
  send: "M12 20V4M5 11l7-7 7 7",
  generate: "M4 20 14.5 9.5M13 4.5v2M18.5 10h2M16.5 6l1.5-1.5M17 14l1.5 1.5M8.5 4.5 10 6",
  comment: "M4 5h16v11H9.5L4 20Z",
  save: "M6 3h12v18l-6-4.5L6 21Z",
  copy: "M9 9h11v11H9ZM5 15H4V4h11v1",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21q0-6 8-6t8 6",
  signout: "M10 4H5v16h5M14 8l4 4-4 4M18 12H9",
  signin: "M14 4h5v16h-5M10 8l4 4-4 4M14 12H4",
  /* Third-party marks drawn on the same grid. Notion: the official cube with its N, kept to one stroke weight. */
  notion: "M4.5 5.5 15 3.5l4.5 3V20L8 21l-3.5-3.5ZM4.5 5.5 8 8.5l11.5-2M8 8.5V21M11 11v7M11 11l5 7v-8",
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

/**
 * Google's "G", in its four official colours and shape, as Google's sign-in branding requires: never recoloured,
 * never monochrome, always on a white or near-white surface.
 */
export function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
