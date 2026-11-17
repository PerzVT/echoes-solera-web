import catalogue from "./catalogue.json";

const L = "/labs/mini-series";

export type Episode = {
  number: number;
  title?: string;
  video: string;
  poster: string;
  seconds: number;
  /** Early access: the episode is out before its free release and unlocks for `price` coins. */
  early?: boolean;
  /** The early-access price in coins. Set only when `early` is. */
  price?: number;
};

/** The early-access price of one episode, in coins. Same as the earlier media-preview mock. */
export const EARLY_PRICE = 1;
/** How many of the newest episodes in a finished series are early access. */
const EARLY_COUNT = 2;

/** A still shown on a series page: a cover variant or a character sheet. */
export type Still = { src: string; alt: string; width: number; height: number };

export type Series = {
  slug: string;
  title: string;
  /** Genre tags from the Notion story catalogue, in its order. Empty when Notion has none. */
  genres: string[];
  /** The same tags as one line. */
  genre: string;
  hook?: string;
  /** The cover image. Every entry in `series` has one; titles without a cover are left out. */
  cover: string;
  /** Wide key art in two registered layers, where it exists. */
  art?: { bg: string; cast: string };
  episodes: Episode[];
  /** What the playable items are called. Defaults to "Episodes". */
  listLabel?: string;
  /** The other images for this series, shown on its page. */
  stills: Still[];
  state: SeriesState;
};

export type SeriesState = "clips" | "finished" | "planned";

/**
 * Finished episodes, one entry per file, in order. Entry N plays
 * `/labs/mini-series/<slug>/episodes/ep-NN.mp4` with the poster `ep-NN.webp` beside it
 * (NN is N padded to two digits). Seconds are the encoded file's length, rounded.
 */
const finished: Record<string, [title: string, seconds: number][]> = {
  "second-chance": [
    ["Episode 1", 117],
    ["Episode 2", 131],
    ["Episode 3", 123],
    ["Episode 3.5", 128],
    ["Episode 4", 153],
  ],
  moonflower: [
    ["Episode 1", 130],
    ["Episode 2", 129],
    ["Episode 3", 130],
    ["Episode 4", 132],
  ],
  "gray-winter": [
    ["Episode 1", 140],
    ["Episode 2", 135],
    ["Episode 3", 132],
    ["Episode 4", 150],
    ["Episode 5", 126],
  ],
};

const cut = (slug: string): Episode[] => {
  const all = finished[slug] ?? [];
  return all.map(([title, seconds], i) => {
    const n = String(i + 1).padStart(2, "0");
    const early = i >= all.length - EARLY_COUNT;
    return {
      number: i + 1,
      title,
      video: `${L}/${slug}/episodes/ep-${n}.mp4`,
      poster: `${L}/${slug}/episodes/ep-${n}.webp`,
      seconds,
      ...(early ? { early: true, price: EARLY_PRICE } : {}),
    };
  });
};

const sheet = (slug: string, file: string, name: string, wide = false): Still => ({
  src: `${L}/${slug}/cast/${file}.webp`,
  alt: `Character sheet: ${name}`,
  width: wide ? 1400 : 1122,
  height: wide ? 1050 : 1402,
});

/** What the catalogue does not hold: key art, the other images and the state, by slug. */
const extra: Record<string, Partial<Series>> = {
  "second-chance": {
    art: { bg: `${L}/second-chance/hero-bg.webp`, cast: `${L}/second-chance/hero-cast.webp` },
    state: "finished",
    stills: [
      { src: `${L}/second-chance/cover-red.webp`, alt: "Second Chance at Your Heart cover", width: 1060, height: 1484 },
      sheet("second-chance", "elena-vance", "Elena Vance"),
      sheet("second-chance", "chloe-hayes", "Chloe Hayes"),
      sheet("second-chance", "julian-montgomery", "Julian Montgomery"),
      sheet("second-chance", "madam-sylas", "Madam Sylas", true),
      sheet("second-chance", "marcus-vance", "Marcus Vance", true),
      sheet("second-chance", "bradley-cole", "Bradley Cole", true),
    ],
  },
  moonflower: {
    art: { bg: `${L}/moonflower/hero-bg.webp`, cast: `${L}/moonflower/hero-cast.webp` },
    state: "finished",
    stills: [
      { src: `${L}/moonflower/title-page.webp`, alt: "The Scent of the Moonflower title page", width: 1024, height: 1536 },
      sheet("moonflower", "yeon-hee", "Yeon-hee"),
      sheet("moonflower", "king-yi-sun", "King Yi Sun"),
      sheet("moonflower", "queen-min", "Queen Min"),
      sheet("moonflower", "lord-min", "Lord Min"),
      sheet("moonflower", "chief-eunuch", "the Chief Eunuch"),
      sheet("moonflower", "captain-kang", "Captain Kang"),
      sheet("moonflower", "head-court-lady", "Queen Min's head court lady"),
      sheet("moonflower", "maid-choi", "Maid Choi"),
      sheet("moonflower", "junior-maid", "the junior maid"),
      sheet("moonflower", "royal-physician", "the head royal physician"),
      sheet("moonflower", "head-midwife", "the head midwife"),
      sheet("moonflower", "royal-brewer", "the royal brewer"),
      sheet("moonflower", "assassin", "the assassin", true),
    ],
  },
  "gray-winter": {
    art: { bg: `${L}/gray-winter/hero-bg.webp`, cast: `${L}/gray-winter/hero-cast.webp` },
    state: "finished",
    stills: [
      { src: `${L}/gray-winter/title-cover.webp`, alt: "Heart of the Gray Winter cover", width: 1000, height: 1500 },
      sheet("gray-winter", "kalore", "Kalore", true),
    ],
  },
};

/** The three series with key art lead; the rest follow the Notion catalogue order. */
const lead = ["second-chance", "moonflower", "gray-winter"];
const rank = (slug: string) => {
  const i = lead.indexOf(slug);
  return i === -1 ? lead.length : i;
};

const genresOf = (g: string | null) =>
  (g ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/** Every series in the Notion story catalogue that has a cover. Titles without one are not shown. */
export const series: Series[] = catalogue
  .filter((c): c is typeof c & { cover: string } => !!c.cover)
  .map((c) => {
    const more = extra[c.slug] ?? {};
    const tags = genresOf(c.genre);
    return {
      slug: c.slug,
      title: c.title,
      genres: tags,
      genre: tags.join(", "),
      hook: c.hook ?? undefined,
      cover: c.cover,
      art: more.art,
      episodes: cut(c.slug),
      stills: more.stills ?? [],
      state: more.state ?? "planned",
    };
  })
  .sort((a, b) => rank(a.slug) - rank(b.slug));

/** Every genre tag in use, the most used first. */
export const genres = [...new Set(series.flatMap((s) => s.genres))].sort(
  (a, b) => series.filter((s) => s.genres.includes(b)).length - series.filter((s) => s.genres.includes(a)).length,
);

export const seriesBySlug = (slug: string) => series.find((s) => s.slug === slug);
export const isOut = (s: Series) => s.episodes.length > 0;
/** The series the owner has finished making. */
export const isFinished = (s: Series) => s.state !== "planned";
