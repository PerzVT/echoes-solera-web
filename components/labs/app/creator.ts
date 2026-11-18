/** Fixed data for the Library and the Cast step. The cast sheets come from lib/labs/maker.ts. */
import { sheets } from "@/lib/labs/maker";
import type { Step } from "@/lib/labs/store/types";

/** One episode in the Library. A finished episode opens its Results; a saved one still in progress opens its step. */
export type EpisodeItem = { name: string; poster?: string; /** A saved episode's id. */ id?: string; step?: Step };

const SC = "/labs/mini-series/second-chance";
const MF = "/labs/mini-series/moonflower";
const GW = "/labs/mini-series/gray-winter";

/** The wide backdrop of each series card and the poster of each of its episodes. */
export const seriesExtra: Record<string, { backdrop: string; episodes: EpisodeItem[] }> = {
  "second-chance": {
    backdrop: `${SC}/hero-bg.webp`,
    episodes: [
      { name: "Episode 1", poster: `${SC}/episodes/ep-01.webp` },
      { name: "Episode 2", poster: `${SC}/episodes/ep-03.webp` },
    ],
  },
  moonflower: {
    backdrop: `${MF}/hero-bg.webp`,
    episodes: [
      { name: "Episode 7", poster: `${MF}/episodes/ep-03.webp` },
      { name: "Episode 8", poster: `${MF}/episodes/ep-04.webp` },
    ],
  },
  "gray-winter": {
    backdrop: `${GW}/hero-bg.webp`,
    episodes: [
      { name: "Episode 1", poster: `${GW}/episodes/ep-01.webp` },
      { name: "Episode 2", poster: `${GW}/episodes/ep-02.webp` },
    ],
  },
};

/** "Episode 3" after "Episode 1" and "Episode 2". */
export function nextEpisodeName(episodes: { name: string }[]) {
  const numbers = episodes.map((e) => Number(/(\d+)$/.exec(e.name)?.[1] ?? 0));
  return `Episode ${Math.max(episodes.length, ...numbers) + 1}`;
}

/** A series' episodes: the fixed ones, then any finished in this session. */
export function episodesOf(slug: string, added: EpisodeItem[] = [], extra = seriesExtra): EpisodeItem[] {
  const base = extra[slug]?.episodes ?? [];
  return [...base, ...added.filter((a) => !base.some((b) => b.name === a.name))];
}

/* ---------- Cast ---------- */

type ElementKind = "character" | "location";

/** One character or place the script needs. `tag` is the element ID the prompts use; `src` is its picture, if it has one. `who` is the character id in the series cast. */
export type Element = { id: string; kind: ElementKind; name: string; tag: string; src?: string; who?: string; variant?: string; /** The uploaded cast sheet the picture is, if it is one. */ sheet?: string; /** A choice the cast match could not make, put to the person. */ question?: string };

type PoolImage = { tag: string; name: string; src: string };

const sheetSrc = (tag: string) => sheets.character.find((x) => x.tag === tag)?.src;

/** Pictures of places already in the series, which a location can be matched to. */
export const libraryPlaces: PoolImage[] = [
  { tag: "@ballroom_wide", name: "Ballroom", src: `${SC}/hero-bg.webp` },
  { tag: "@penthouse_window", name: "Penthouse", src: `${SC}/episodes/ep-03.webp` },
  { tag: "@office_night", name: "Office", src: `${SC}/episodes/ep-05.webp` },
];

/** What the episode 1 script needs. Elena and the cemetery have no picture yet. */
export const startingElements: Element[] = [
  { id: "julian", kind: "character", name: "Julian", tag: "@julian", src: sheetSrc("@julian"), who: "julian", variant: "Episode 1" },
  { id: "chloe", kind: "character", name: "Chloe", tag: "@chloe_ep01", src: sheetSrc("@chloe_ep01"), who: "chloe", variant: "Episode 1" },
  { id: "elena", kind: "character", name: "Elena", tag: "@elena", who: "elena" },
  { id: "cemetery", kind: "location", name: "Cemetery", tag: "@cemetery" },
  { id: "ballroom", kind: "location", name: "Ballroom", tag: "@ballroom_wide", src: libraryPlaces[0].src },
];
