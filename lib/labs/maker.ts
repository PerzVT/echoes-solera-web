/** Fixed demo data for the creator app. One working episode: Second Chance at Your Heart, episode 1. */
import { notionCast } from "./cast";

export const EPISODE = {
  series: "Second Chance at Your Heart",
  episode: "Episode 1",
  file: "reflection.fdx",
};

/** The mini-series flow, in order. Script is the start screen. */
export const STEPS = [
  { key: "script", label: "Script", href: "/app" },
  { key: "screenplay", label: "Screenplay", href: "/app/episode/screenplay" },
  { key: "cast", label: "Cast", href: "/app/episode/cast" },
  { key: "style", label: "Style", href: "/app/episode/style" },
  { key: "results", label: "Results", href: "/app/episode/results" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

/* ---------- Library ---------- */

export type SeriesCard = {
  title: string;
  /** Key of the series cast. */
  slug: string;
  cover: string;
};

/** The three mini-series in the Library. Episodes are named by number only. */
export const seriesCards: SeriesCard[] = [
  { title: "Second Chance at Your Heart", slug: "second-chance", cover: "/labs/mini-series/second-chance/cover.webp" },
  { title: "The Scent of the Moonflower", slug: "moonflower", cover: "/labs/mini-series/moonflower/cover.webp" },
  { title: "Heart of the Gray Winter", slug: "gray-winter", cover: "/labs/mini-series/gray-winter/cover.webp" },
];

/** The anime in the Library before anything is saved. Episodes are named by number only. */
export const animeSeriesCards: SeriesCard[] = [
  { title: "Catalyst", slug: "catalyst", cover: "/labs/anime/catalyst.webp" },
  { title: "Back to Me", slug: "back-to-me", cover: "/labs/anime/dances/cloud-dance.webp" },
  { title: "Echoes of Solera", slug: "echoes-of-solera", cover: "/labs/anime/hero-bg.webp" },
];

/* ---------- Script ---------- */

export const scriptTypes = [".txt", ".docx", ".fdx", ".pdf"];

export const processingStages = ["Reading the scenes", "Splitting into generations", "Finding what each one needs"];

/* ---------- Screenplay ---------- */

export type Block =
  | { id: string; kind: "heading"; number: number; text: string }
  | { id: string; kind: "camera"; text: string; prompt: string; /** Acting, light and blocking notes for the shot, from a generated screenplay. */ direction?: string }
  | { id: string; kind: "action"; text: string; rewrite: string }
  | { id: string; kind: "dialogue"; cue: string; text: string; rewrite: string };

export const screenplay: Block[] = [
  { id: "h1", kind: "heading", number: 1, text: "EXT. CEMETERY - DAY, RAIN" },
  {
    id: "c1",
    kind: "camera",
    text: "WIDE, SLOW PAN",
    prompt:
      "Vertical 9:16, live action, photoreal period style. Wide slow pan across a cemetery in slanting rain, rows of gray headstones. Julian (@julian) in a stark black suit kneels in sodden grass and lays white camellias (@camellias) against a fresh marble headstone. Overcast light, cold palette, rain visible against dark coats. 25 seconds.",
  },
  {
    id: "a1",
    kind: "action",
    text: "Gray headstones in slanting rain. JULIAN, in a stark black suit, kneels in the sodden grass and lays white camellias against a fresh marble headstone.",
    rewrite:
      "Gray headstones in slanting rain. JULIAN, in a stark black suit, stands a moment, then kneels in the sodden grass and lays white camellias against a fresh marble headstone.",
  },
  {
    id: "d1",
    kind: "dialogue",
    cue: "JULIAN (V.O.)",
    text: "You want to know how I died?",
    rewrite: "You want to know how I died? Ask her.",
  },
  {
    id: "c2",
    kind: "camera",
    text: "CLOSE ON JULIAN",
    prompt:
      "Vertical 9:16, live action, photoreal period style. Close on Julian (@julian), rain running off his jaw, eyes lowered to the headstone. He does not look up. Shallow depth of field, cold gray light. 10 seconds.",
  },
  {
    id: "a2",
    kind: "action",
    text: "Rain runs off his jaw. He does not look up.",
    rewrite: "Rain runs off his jaw. He does not look up, even when the bell tolls.",
  },
  {
    id: "c3",
    kind: "camera",
    text: "OVER THE SHOULDER, FROM THE OAK",
    prompt:
      "Vertical 9:16, live action, photoreal period style. Over the shoulder from behind an old oak. Elena as Chloe (@chloe_ep01) watches Julian from behind the tree, black silk umbrella (@umbrella) lowered, rain on her hair. Julian small in the frame at the grave. 10 seconds.",
  },
  {
    id: "a3",
    kind: "action",
    text: "ELENA watches from behind the tree, umbrella lowered.",
    rewrite: "ELENA watches from behind the oak, half hidden by the trunk, closer to him. Her umbrella is lowered.",
  },
  { id: "h2", kind: "heading", number: 2, text: "INT. BALLROOM - NIGHT, FLASHBACK" },
  {
    id: "c4",
    kind: "camera",
    text: "TRACKING, THROUGH THE CROWD",
    prompt:
      "Vertical 9:16, live action, photoreal period style. Tracking shot through a crowded ballroom at night, warm chandelier light. Julian (@julian) moves among investors holding a full glass. Elena as Chloe (@chloe_ep01) in a green gown crosses the floor toward him. 15 seconds.",
  },
  {
    id: "a4",
    kind: "action",
    text: "Julian moves among the investors, a glass in his hand that he never drinks.",
    rewrite: "Julian moves among the investors, a full glass in his hand that he never drinks.",
  },
  {
    id: "a5",
    kind: "action",
    text: "ELENA crosses the ballroom toward him.",
    rewrite: "ELENA crosses the ballroom toward him, the crowd parting around her green gown.",
  },
];

export type Note = {
  id: string;
  block: string;
  type: "comment" | "suggestion";
  quote: string;
  body: string;
};


/* ---------- Cast ---------- */

export type Sheet = { tag: string; who: string; src?: string; face?: string };
const S = "/labs/app/sheets";

export const sheets: Record<"character", Sheet[]> = {
  character: [
    { tag: "@chloe_ep01", who: "Chloe", src: `${S}/chloe_ep01.webp`, face: `${S}/chloe_ep01-face.webp` },
    { tag: "@chloe_ep04_5", who: "Chloe", src: `${S}/chloe_ep04_5.webp`, face: `${S}/chloe_ep04_5-face.webp` },
    { tag: "@chloe_ep06", who: "Chloe", src: `${S}/chloe_ep06.webp`, face: `${S}/chloe_ep06-face.webp` },
    { tag: "@elena", who: "Elena", src: `${S}/elena.webp`, face: `${S}/elena-face.webp` },
    { tag: "@elena_van_ep16", who: "Elena", src: `${S}/elena_van_ep16.webp`, face: `${S}/elena_van_ep16-face.webp` },
    { tag: "@julian", who: "Julian", src: `${S}/julian.webp`, face: `${S}/julian-face.webp` },
    { tag: "@julian_ep06", who: "Julian", src: `${S}/julian_ep06.webp`, face: `${S}/julian_ep06-face.webp` },
  ],
};

/* ---------- Results ---------- */

export type Take = { name: string; src: string; poster: string };

const E = "/labs/mini-series/second-chance/episodes";
const clip = (file: string, name = "Take 1"): Take => ({ name, src: `${E}/${file}.mp4`, poster: `${E}/${file}.webp` });

/** The six clips an episode's generations show, in order, each a different shot from public/labs/mini-series/second-chance/episodes. */
export const clips = ["ep-01", "1", "7", "6", "5", "ep-05"].map((f) => clip(f));


type CastCharacter = { id: string; name: string };
export type CastSheet = {
  id: string;
  tag: string;
  character: string;
  src: string;
  face?: string;
  /** The episode or outfit the sheet is for, as the Notion character page labels it ("Episode 4", "Episode 15, second look"). */
  variant?: string;
  /** The Notion page shows this sheet without a tag; the tag follows the character's other tags. */
  tagMade?: boolean;
};
export type SeriesCast = { characters: CastCharacter[]; sheets: CastSheet[] };

/**
 * The cast each series starts with. The three mini-series hold every approved character sheet from Notion
 * (lib/labs/cast.ts), grouped by character.
 */
export const startingCast: Record<string, SeriesCast> = notionCast;

export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
