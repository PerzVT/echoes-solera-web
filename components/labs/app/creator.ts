/** Fixed data for the series and episode screens of the creator. The cast sheets come from lib/labs/maker.ts. */
import { sheets } from "@/lib/labs/maker";

/** The four steps of an episode, by the label the person sees. Cooking calls its script a recipe. */
export type Stage = "Script" | "Recipe" | "Screenplay" | "References" | "Results";

export type EpisodeItem = {
  name: string;
  stage: Stage;
  poster?: string;
  /** Generations made so far, and how many of them are kept. */
  generations?: number;
  kept?: number;
};

export const stageHref: Record<Stage, string> = {
  Script: "/app/episode/script",
  Recipe: "/app/episode/script",
  Screenplay: "/app/episode/screenplay",
  References: "/app/episode/references",
  Results: "/app/episode/results",
};

const SC = "/labs/mini-series/second-chance";
const MF = "/labs/mini-series/moonflower";

type SeriesExtra = { backdrop?: string; episodes: EpisodeItem[]; style?: string };

/** What the series screens show beyond the series card: a wide backdrop, the episodes with their posters, and the style the series pins. */
export const seriesExtra: Record<string, SeriesExtra> = {
  "second-chance": {
    backdrop: `${SC}/hero-bg.webp`,
    style: "photoreal-period",
    episodes: [
      { name: "Episode 1", stage: "Results", poster: `${SC}/episodes/ep-01.webp`, generations: 6, kept: 2 },
      { name: "Episode 2", stage: "Screenplay", poster: `${SC}/episodes/ep-02.webp` },
    ],
  },
  moonflower: {
    backdrop: `${MF}/hero-bg.webp`,
    style: "photoreal-period",
    episodes: [
      { name: "Episode 7", stage: "Results", poster: `${MF}/episodes/ep-03.webp`, generations: 5, kept: 5 },
      { name: "Episode 8", stage: "Script", poster: `${MF}/episodes/ep-04.webp` },
    ],
  },
  "gray-winter": {
    backdrop: "/labs/mini-series/gray-winter/hero-bg.webp",
    style: "photoreal-period",
    episodes: [
      { name: "Episode 1", stage: "Results", poster: "/labs/mini-series/gray-winter/episodes/ep-01.webp", generations: 6, kept: 6 },
      { name: "Episode 2", stage: "References", poster: "/labs/mini-series/gray-winter/episodes/ep-02.webp" },
    ],
  },
  "echoes-of-solera": {
    backdrop: "/labs/anime/hero-bg.webp",
    style: "solera-anime",
    episodes: [{ name: "Episode 1", stage: "References", poster: "/labs/anime/catalyst-rain.webp" }],
  },
  "shoujo-supper": {
    backdrop: "/labs/cooking/hero-akane.webp",
    episodes: [
      { name: "Mushroom stroganoff", stage: "Results", poster: "/labs/cooking/stills/mushroom-stroganoff.webp", generations: 4, kept: 4 },
      { name: "Masala dosa", stage: "Recipe", poster: "/labs/cooking/stills/masala-dosa.webp" },
    ],
  },
};

/** "Episode 3" after "Episode 1" and "Episode 2"; "Video 3" for a cooking series. */
export function nextEpisodeName(episodes: { name: string }[], cooking: boolean) {
  const word = cooking ? "Video" : "Episode";
  const numbers = episodes.map((e) => Number(/(\d+)$/.exec(e.name)?.[1] ?? 0));
  return `${word} ${Math.max(episodes.length, ...numbers) + 1}`;
}

/* ---------- References ---------- */

export type ElementKind = "character" | "location" | "prop";

/** One thing the episode needs a picture of. `tag` is the element ID the prompts use; `src` is its picture, if it has one. */
export type Element = { id: string; kind: ElementKind; name: string; tag: string; src?: string };

export const elementGroups: { kind: ElementKind; label: string }[] = [
  { kind: "character", label: "Characters" },
  { kind: "location", label: "Locations" },
  { kind: "prop", label: "Props" },
];

export type PoolImage = { tag: string; name: string; src: string };

const sheetSrc = (tag: string) => sheets.character.find((x) => x.tag === tag)?.src;

/** Pictures of places and things already in the series, which an element can be matched to. */
export const libraryImages: Record<Exclude<ElementKind, "character">, PoolImage[]> = {
  location: [
    { tag: "@ballroom_wide", name: "Ballroom", src: `${SC}/hero-bg.webp` },
    { tag: "@penthouse_window", name: "Penthouse", src: `${SC}/episodes/ep-03.webp` },
    { tag: "@office_night", name: "Office", src: `${SC}/episodes/ep-05.webp` },
  ],
  prop: [{ tag: "@camellias", name: "Camellias", src: `${SC}/episodes/ep-01.webp` }],
};

/** The elements of episode 1. Cemetery and Umbrella have no picture yet. */
export function startingElements(state: "default" | "outfit" | "confirm"): Element[] {
  // ?state=outfit opens with Chloe unmatched: two of her sheets could be the one.
  const chloe = state === "outfit" ? undefined : "@chloe_ep01";
  return [
    { id: "julian", kind: "character", name: "Julian", tag: "@julian", src: sheetSrc("@julian") },
    { id: "chloe", kind: "character", name: "Chloe", tag: chloe ?? "@chloe", src: chloe ? sheetSrc(chloe) : undefined },
    { id: "cemetery", kind: "location", name: "Cemetery", tag: "@cemetery" },
    { id: "ballroom", kind: "location", name: "Ballroom", tag: "@ballroom_wide", src: libraryImages.location[0].src },
    { id: "camellias", kind: "prop", name: "Camellias", tag: "@camellias", src: libraryImages.prop[0].src },
    { id: "umbrella", kind: "prop", name: "Umbrella", tag: "@umbrella" },
  ];
}

/** A series' episodes: the fixed ones, then any started in this session. */
export function episodesOf(card: { slug: string; episodes: { name: string; stage: string }[] }, added: EpisodeItem[] = []): EpisodeItem[] {
  const base: EpisodeItem[] = seriesExtra[card.slug]?.episodes ?? card.episodes.map((e) => ({ name: e.name, stage: e.stage as Stage }));
  return [...base, ...added.filter((a) => !base.some((b) => b.name === a.name))];
}

/** "2 episodes", "1 video". */
export const episodeCount = (n: number, cooking: boolean) => `${n} ${cooking ? (n === 1 ? "video" : "videos") : n === 1 ? "episode" : "episodes"}`;
