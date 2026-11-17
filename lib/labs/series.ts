const L = "/labs/mini-series";

export type Episode = { number: number; title?: string; video: string; poster: string; seconds: number };

export type Series = {
  slug: string;
  title: string;
  genre: string;
  hook?: string;
  cover: string;
  /** Wide key art in two registered layers, where it exists. */
  art?: { bg: string; cast: string };
  episodes: Episode[];
  /** What the playable items are called. Defaults to "Episodes". */
  listLabel?: string;
  /** Shown in place of "No episodes are out yet" when the series is made but not on the site. */
  awaiting?: string;
  /**
   * Where the series stands: production clips on this site, episodes finished but not on this site,
   * or not made yet. Drives the library tag, the dimming, the order and the Finished filter.
   */
  state: SeriesState;
};

export type SeriesState = "clips" | "finished" | "planned";

/**
 * Source takes from the Second Chance production, not finished episodes: four parts of one episode,
 * then three parts of scene 8. The sixteen finished episodes are not on the site yet.
 */
const takes: [string, number][] = [
  ["Part 1", 25],
  ["Part 2", 23],
  ["Part 3", 22],
  ["Part 4", 27],
  ["Scene 8, part 4", 30],
  ["Scene 8, part 5A", 30],
  ["Scene 8, part 5B", 26],
];
const secondChance = takes.map(([title, seconds], i) => ({
  number: i + 1,
  title,
  video: `${L}/second-chance/episodes/${i + 1}.mp4`,
  poster: `${L}/second-chance/episodes/${i + 1}.webp`,
  seconds,
}));

const finished = "The episodes are finished. They are not on this site yet.";

export const series: Series[] = [
  {
    slug: "second-chance",
    title: "Second Chance at Your Heart",
    genre: "Supernatural romance",
    hook: "Elena returns in another woman's body while Julian mourns the woman she used to be.",
    cover: `${L}/second-chance/cover.webp`,
    art: { bg: `${L}/second-chance/hero-bg.webp`, cast: `${L}/second-chance/hero-cast.webp` },
    episodes: secondChance,
    listLabel: "Clips from production",
    state: "clips",
  },
  {
    slug: "moonflower",
    title: "The Scent of the Moonflower",
    genre: "Palace romance",
    hook: "A Joseon palace romance led by Yeon-hee and King Yi Sun.",
    cover: `${L}/moonflower/cover.webp`,
    art: { bg: `${L}/moonflower/hero-bg.webp`, cast: `${L}/moonflower/hero-cast.webp` },
    episodes: [],
    awaiting: finished,
    state: "finished",
  },
  {
    slug: "gray-winter",
    title: "Heart of the Gray Winter",
    genre: "Dark fantasy romance",
    cover: `${L}/gray-winter/cover.webp`,
    art: { bg: `${L}/gray-winter/hero-bg.webp`, cast: `${L}/gray-winter/hero-cast.webp` },
    episodes: [],
    awaiting: finished,
    state: "finished",
  },
  {
    slug: "bellmaker",
    title: "The Bellmaker Who Woke the Sky",
    genre: "Fantasy romance",
    hook: "A village bellmaker branded cursed learns she is the last storm phoenix when an exiled royal astronomer wakes their bond.",
    cover: `${L}/bellmaker/cover-v04.webp`,
    episodes: [],
    state: "planned",
  },
  {
    slug: "she-bought-the-family",
    title: "She Bought the Family That Broke Her",
    genre: "Revenge drama",
    hook: "A shipyard foundling returns as the creditor who can destroy the dynasty that rejected her.",
    cover: `${L}/she-bought-the-family/cover-v04.webp`,
    episodes: [],
    state: "planned",
  },
  {
    slug: "four-beast-husbands",
    title: "How Did I End Up with Four Beast-man Husbands?!",
    genre: "Fantasy romance",
    cover: `${L}/four-beast-husbands/cover.webp`,
    episodes: [],
    state: "planned",
  },
];

export const seriesBySlug = (slug: string) => series.find((s) => s.slug === slug);
export const isOut = (s: Series) => s.episodes.length > 0;
/** The series the owner has finished making: production clips on the site, or episodes made. */
export const isFinished = (s: Series) => s.state !== "planned";
