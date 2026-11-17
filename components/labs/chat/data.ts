/** Demo data the chat needs on top of lib/labs/maker.ts. Everything here is derived from that file or points at art in public/. */
import { generations, screenplay, seriesCards, type Take } from "@/lib/labs/maker";
import { allStyles, type Style } from "@/lib/labs/styles";

export const DEMO_CHAT = "second-chance-1";

/** Anime has its own tool (/app/anime), so it is not a type here. */
export const productionTypes = ["Mini-series", "Ad", "Storyboard", "Comic"] as const;
export type ProductionType = (typeof productionTypes)[number];

/** Styles for the picker: "In use" first, hidden ones left out. */
export const pickerStyles: Style[] = [...allStyles.filter((s) => !s.hidden && s.group === "In use"), ...allStyles.filter((s) => !s.hidden && s.group === "Library")];
export const defaultStyle = pickerStyles[0];
export const styleBySlug = (slug: string | undefined) => pickerStyles.find((s) => s.slug === slug) ?? defaultStyle;

export type ChatStatus = "working" | "needs-you" | "done";

export type ChatRow = { id: string; label: string; title: string; status: ChatStatus; stage: string };
export type ChatGroup = { series: string; slug: string; cover: string; type: ProductionType; chats: ChatRow[] };

const statusOf = (stage: string): ChatStatus => (stage === "Results" ? "done" : "needs-you");

/** The chats, grouped by series: one per episode, in the series' own order. */
export const chatGroups: ChatGroup[] = seriesCards.map((s) => ({
  series: s.title,
  slug: s.slug,
  cover: s.cover,
  type: s.tool === "Cooking" ? "Ad" : "Mini-series",
  chats: s.episodes.map((e, i) => {
    const n = e.name.match(/\d+/)?.[0];
    const id = `${s.slug}-${n ?? i + 1}`;
    const label = n ? `${n} ${e.title ?? e.name}` : e.name;
    return { id, label, title: e.title ?? e.name, status: id === DEMO_CHAT ? "working" : statusOf(e.stage), stage: e.stage };
  }),
}));

export function findChat(id: string) {
  for (const g of chatGroups) {
    const chat = g.chats.find((c) => c.id === id);
    if (chat) return { group: g, chat };
  }
  return { group: chatGroups[0], chat: chatGroups[0].chats[0] };
}

/** Script pages the mock Notion connection lists. Each opens a chat with that script. */
export const notionPages = [
  { title: "Second Chance, EP01 Reflection", chat: "second-chance-1", cover: "/labs/mini-series/second-chance/episodes/ep-01.webp" },
  { title: "Second Chance, EP02 The Crimson Pact", chat: "second-chance-2", cover: "/labs/mini-series/second-chance/episodes/ep-02.webp" },
  { title: "Moonflower, EP08", chat: "moonflower-8", cover: "/labs/mini-series/moonflower/episodes/ep-04.webp" },
];

/* ---------- Screenplay ---------- */

export const SCRIPT_TITLE = "Reflection";
export const REVISED_BLOCKS = ["a2", "a3"];
export const sceneCount = screenplay.filter((b) => b.kind === "heading").length;
export const genCount = generations.length;

/* ---------- References ---------- */

export type RefKind = "character" | "location" | "prop";
export type Ref = { id: string; kind: RefKind; name: string; tag: string; src?: string; character?: string };

const SC = "/labs/mini-series/second-chance";

/** What the agent finds in Notion: four with art, two without. Chloe has several sheets; the chosen one is a tag of her cast sheets. */
export const startingRefs: Ref[] = [
  { id: "julian", kind: "character", name: "Julian", tag: "@julian", src: "/labs/app/sheets/julian.webp", character: "julian" },
  { id: "chloe", kind: "character", name: "Chloe", tag: "@chloe_ep01", src: "/labs/app/sheets/chloe_ep01.webp", character: "chloe" },
  { id: "cemetery", kind: "location", name: "Cemetery", tag: "@cemetery_wide" },
  { id: "ballroom", kind: "location", name: "Ballroom", tag: "@ballroom_wide", src: `${SC}/hero-bg.webp` },
  // The white flowers laid at the headstone in the episode 1 still.
  { id: "camellias", kind: "prop", name: "Camellias", tag: "@camellias", src: `${SC}/episodes/ep-01.webp` },
  { id: "umbrella", kind: "prop", name: "Umbrella", tag: "@umbrella" },
];

/** Art a missing reference gets when the agent makes it with a prompter. Already in public/: nothing is generated. The umbrella has none that reads as an umbrella. */
export const madeArt: Partial<Record<string, string>> = {
  cemetery: `${SC}/episodes/ep-01.webp`,
};

export const refGroups: { kind: RefKind; label: string }[] = [
  { kind: "character", label: "Characters" },
  { kind: "location", label: "Locations" },
  { kind: "prop", label: "Props" },
];

/** The two Chloe sheets the question offers. Their labels come from the cast data. */
export const CHLOE_OPTIONS = ["@chloe_ep01", "@chloe_ep04_5"];
export const CHLOE_SCOPES = ["This scene", "Following scenes", "Project default"];

/* ---------- Quote ---------- */

export const quote = { provider: "Dreamina", covers: `${genCount} clips, 85 seconds`, price: "$14.20" };

/* ---------- Generations ---------- */

const E = `${SC}/episodes`;
/** The first take of each generation is its own clip. */
export const firstTake = (n: number): Take => ({ name: "Take 1", src: `${E}/${n}.mp4`, poster: `${E}/${n}.webp` });
/** A new take after feedback. Clip 7 is a second cut already in public/. */
export const newTake = (count: number): Take => ({ name: `Take ${count + 1}`, src: `${E}/7.mp4`, poster: `${E}/7.webp` });
/** Generation 6 fails on the first try, as the demo needs one failure. */
export const FAILS = 6;

export const FEEDBACK_SCRIPT = "Elena should be half hidden by the oak, closer to him.";
export const FEEDBACK_CLIP = "Julian keeps his head down until the end.";
