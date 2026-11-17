/** Fixed demo data for the creator app. One working episode: Second Chance at Your Heart, episode 1. */
import { notionCast } from "./cast";

export const EPISODE = {
  series: "Second Chance at Your Heart",
  episode: "Episode 1",
  file: "reflection.fdx",
};

export const STEPS = [
  { key: "script", label: "Script", href: "/app/episode/script" },
  { key: "screenplay", label: "Screenplay", href: "/app/episode/screenplay" },
  { key: "references", label: "References", href: "/app/episode/references" },
  { key: "results", label: "Results", href: "/app/episode/results" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

/* ---------- App home ---------- */

export type Tool = "Mini-series" | "Anime" | "Cooking";

export type SeriesCard = {
  title: string;
  /** Key of the series cast, used by /app/cast?series=. */
  slug: string;
  tool: Tool;
  cover: string;
  /** Label of the add action at the foot of the card. */
  add: string;
  episodes: { name: string; stage: string; href: string }[];
};

const stageHref: Record<string, string> = {
  Script: "/app/episode/script",
  Recipe: "/app/episode/script",
  Screenplay: "/app/episode/screenplay",
  References: "/app/episode/references",
  Results: "/app/episode/results",
};
const ep = (name: string, stage: string) => ({ name, stage, href: stageHref[stage] });

export const seriesCards: SeriesCard[] = [
  {
    title: "Second Chance at Your Heart",
    slug: "second-chance",
    tool: "Mini-series",
    cover: "/labs/mini-series/second-chance/cover.webp",
    add: "New episode",
    episodes: [ep("Episode 1", "Results"), ep("Episode 2", "Screenplay")],
  },
  {
    title: "The Scent of the Moonflower",
    slug: "moonflower",
    tool: "Mini-series",
    cover: "/labs/mini-series/moonflower/cover.webp",
    add: "New episode",
    episodes: [ep("Episode 7", "Results"), ep("Episode 8", "Script")],
  },
  {
    title: "Heart of the Gray Winter",
    slug: "gray-winter",
    tool: "Mini-series",
    cover: "/labs/mini-series/gray-winter/cover.webp",
    add: "New episode",
    episodes: [ep("Episode 1", "Results"), ep("Episode 2", "References")],
  },
  {
    title: "Echoes of Solera",
    slug: "echoes-of-solera",
    tool: "Anime",
    cover: "/labs/anime/hero-bg.webp",
    add: "New episode",
    episodes: [ep("Episode 1", "References")],
  },
  {
    title: "Shoujo Supper",
    slug: "shoujo-supper",
    tool: "Cooking",
    cover: "/labs/cooking/stills/masala-dosa.webp",
    add: "New video",
    episodes: [ep("Mushroom stroganoff", "Results"), ep("Masala dosa", "Recipe")],
  },
];

/* ---------- New series ---------- */

export const tools: { value: Tool; note: string }[] = [
  { value: "Mini-series", note: "Live-action episodes from a script." },
  { value: "Anime", note: "Anime episodes from a script." },
  { value: "Cooking", note: "Recipe videos from a recipe." },
];


/* ---------- Script ---------- */

export const scriptTypes = [".txt", ".docx", ".fdx", ".pdf"];

export const recentScripts = [
  { title: "Reflection", state: "Processed", date: "Today", href: "/app/episode/screenplay" },
  { title: "The Crimson Pact", state: "Processed", date: "Nov 12", href: "/app/episode/screenplay" },
  { title: "Waking Up in Silk", state: "Draft", date: "Nov 9", href: undefined },
];

export const processingStages = ["Reading the scenes", "Splitting into generations", "Finding what each one needs"];

/* ---------- Screenplay ---------- */

export type Block =
  | { id: string; kind: "heading"; number: number; text: string }
  | { id: string; kind: "camera"; text: string; prompt: string }
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

/** The prompt behind a camera break. */
export function promptOf(id: string) {
  const b = screenplay.find((x) => x.id === id);
  return b && b.kind === "camera" ? b.prompt : "";
}

/** The camera break a passage sits under. */
export function shotOf(id: string) {
  let shot: Extract<Block, { kind: "camera" }> | undefined;
  for (const b of screenplay) {
    if (b.kind === "camera") shot = b;
    if (b.id === id) return shot;
  }
  return undefined;
}

export type Note = {
  id: string;
  block: string;
  type: "comment" | "suggestion";
  quote: string;
  body: string;
};

/** Two comments from a teammate, shown only on the ?state=comments demo link. A suggestion quotes its whole passage, as the screen can only select whole passages. */
export const startingNotes: Note[] = [
  {
    id: "n1",
    block: "a3",
    type: "comment",
    quote: "ELENA watches from behind the tree, umbrella lowered.",
    body: "Half hidden by the trunk, closer to him.",
  },
  {
    id: "n2",
    block: "a2",
    type: "suggestion",
    quote: "Rain runs off his jaw. He does not look up.",
    body: "Rain runs off his jaw. He does not look up, even when the bell tolls.",
  },
];

/* ---------- References ---------- */

export type Sheet = { tag: string; who: string; src?: string; face?: string };
const S = "/labs/app/sheets";

export const sheets: Record<"character" | "location" | "prop", Sheet[]> = {
  character: [
    { tag: "@chloe_ep01", who: "Chloe", src: `${S}/chloe_ep01.webp`, face: `${S}/chloe_ep01-face.webp` },
    { tag: "@chloe_ep04_5", who: "Chloe", src: `${S}/chloe_ep04_5.webp`, face: `${S}/chloe_ep04_5-face.webp` },
    { tag: "@chloe_ep06", who: "Chloe", src: `${S}/chloe_ep06.webp`, face: `${S}/chloe_ep06-face.webp` },
    { tag: "@elena", who: "Elena", src: `${S}/elena.webp`, face: `${S}/elena-face.webp` },
    { tag: "@elena_van_ep16", who: "Elena", src: `${S}/elena_van_ep16.webp`, face: `${S}/elena_van_ep16-face.webp` },
    { tag: "@julian", who: "Julian", src: `${S}/julian.webp`, face: `${S}/julian-face.webp` },
    { tag: "@julian_ep06", who: "Julian", src: `${S}/julian_ep06.webp`, face: `${S}/julian_ep06-face.webp` },
  ],
  location: [
    { tag: "@cemetery_wide", who: "Cemetery" },
    { tag: "@cemetery_gate", who: "Cemetery" },
    { tag: "@ballroom_wide", who: "Ballroom" },
    { tag: "@ballroom_stairs", who: "Ballroom" },
  ],
  prop: [
    { tag: "@camellias", who: "Camellias" },
    { tag: "@umbrella", who: "Umbrella" },
    { tag: "@umbrella_closed", who: "Umbrella" },
  ],
};

export type RefKind = "character" | "location" | "prop" | "continuity";

export type RefRow = {
  id: string;
  kind: RefKind;
  name: string;
  used: string;
  /** Tag of the matched sheet, if any. */
  tag?: string;
  /** Who the picker opens on. */
  who?: string;
};

export const refGroups: { kind: RefKind; label: string }[] = [
  { kind: "character", label: "Characters" },
  { kind: "location", label: "Locations" },
  { kind: "prop", label: "Props" },
  { kind: "continuity", label: "Continuity" },
];

export const refRows: RefRow[] = [
  { id: "julian", kind: "character", name: "Julian, black suit", used: "In generations 1, 5", tag: "@julian", who: "Julian" },
  { id: "chloe", kind: "character", name: "Elena as Chloe, green gown", used: "In generations 2, 4, 6", who: "Chloe" },
  { id: "cemetery", kind: "location", name: "Cemetery", used: "In generations 1, 2, 5, 6", tag: "@cemetery_wide" },
  { id: "ballroom", kind: "location", name: "Ballroom", used: "In generations 3, 4" },
  { id: "camellias", kind: "prop", name: "White camellias", used: "In generation 1", tag: "@camellias" },
  { id: "umbrella", kind: "prop", name: "Black silk umbrella", used: "In generations 2, 6", tag: "@umbrella" },
];

/** Rows for the outfit decision: the Chloe row has two matching sheets and a continuity frame is missing. */
export const outfitRows: RefRow[] = [
  refRows[0],
  { ...refRows[1], name: "Chloe" },
  refRows[2],
  refRows[3],
  { id: "frame3", kind: "continuity", name: "Last frame of generation 3", used: "In generation 4" },
];

export const outfitClash = {
  row: "chloe",
  scene: "Screenplay, scene 2",
  line: "ELENA crosses the ballroom toward him.",
  options: ["@chloe_ep01", "@chloe_ep04_5"],
  scopes: ["This scene", "Following scenes", "Project default"],
};

export const confirmEpisode = {
  title: "Generate episode 1",
  makes: "Generations 1 to 6",
};

export const confirmRetry = {
  title: "Try generation 6 again",
  makes: "Generation 6, second attempt",
};

/* ---------- Results ---------- */

export type GenStatus = "Ready" | "Kept" | "Generating" | "Failed";

export type Take = { name: string; src: string; poster: string };

export type Generation = {
  n: number;
  summary: string;
  status: GenStatus;
  takes: Take[];
  attempt: string;
  prompt: string;
};

const E = "/labs/mini-series/second-chance/episodes";
const take = (name: string, i: number): Take => ({ name, src: `${E}/${i}.mp4`, poster: `${E}/${i}.webp` });

export const generations: Generation[] = [
  {
    n: 1,
    summary: "Cemetery, rain, 25 seconds",
    status: "Ready",
    takes: [take("Take 2", 1), take("Take 1", 7)],
    attempt: "First",
    prompt: promptOf("c1"),
  },
  {
    n: 2,
    summary: "Close on Julian, 10 seconds",
    status: "Kept",
    takes: [take("Take 1", 2)],
    attempt: "First",
    prompt: promptOf("c2"),
  },
  {
    n: 3,
    summary: "Ballroom, tracking, 15 seconds",
    status: "Kept",
    takes: [take("Take 1", 3)],
    attempt: "First",
    prompt: promptOf("c4"),
  },
  {
    n: 4,
    summary: "Ballroom, Elena crosses, 15 seconds",
    status: "Ready",
    takes: [take("Take 1", 4), take("Take 2", 8)],
    attempt: "First",
    prompt:
      "Vertical 9:16, live action, photoreal period style. Elena as Chloe (@chloe_ep01) in a green gown crosses the ballroom toward Julian (@julian). Start from the last frame of generation 3 (@start-gen4). Warm chandelier light. 15 seconds.",
  },
  {
    n: 5,
    summary: "Over the shoulder, from the oak, 10 seconds",
    status: "Generating",
    takes: [take("Take 1", 5)],
    attempt: "First",
    prompt: promptOf("c3"),
  },
  {
    n: 6,
    summary: "Closing hold, 10 seconds",
    status: "Failed",
    takes: [take("Take 1", 6)],
    attempt: "First",
    prompt:
      "Vertical 9:16, live action, photoreal period style. Closing hold on the fresh marble headstone in the rain, white camellias (@camellias) at its foot, black silk umbrella (@umbrella) left open on the grass. No people. 10 seconds.",
  },
];

export const failReason = "The provider returned no clip.";

export const frameFixes = ["Wardrobe", "Prop state", "Pose", "Screen position", "Geography"];

export type Harvest = { gen: number; time: number; fixes: string; feeds: number; poster: string };

export const startingHarvest: Harvest[] = [
  { gen: 1, time: 14, fixes: "Pose", feeds: 2, poster: `${E}/1.webp` },
  { gen: 3, time: 22, fixes: "Wardrobe", feeds: 4, poster: `${E}/3.webp` },
];

/** Letters a plain accent fold does not reach. */
const folds: Record<string, string> = { ø: "o", æ: "ae", œ: "oe", ß: "ss", ł: "l", đ: "d", ð: "d", þ: "th", ı: "i" };

/** Lowercase letters and digits joined by underscores, accents folded, punctuation dropped: "Dr. Chen" gives "dr_chen", "Mara V. Örn" gives "mara_v_orn". */
export const slug = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[øæœßłđðþı]/g, (c) => folds[c])
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** A file name without its extension. */
export const stripExt = (file: string) => file.replace(/\.[a-z0-9]{1,5}$/i, "");

/** A sheet is found by its tag: "@" and the slug of a name. Never empty: a name with no letters gives @sheet. */
export const tagFrom = (name: string) => "@" + (slug(name) || "sheet");

/** The first free form of a tag: @chloe, then @chloe_2, @chloe_3. */
function firstFree(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}

/** A tag from a name that no other sheet uses. */
export function uniqueTag(name: string, taken: Iterable<string>) {
  return firstFree(tagFrom(name), taken);
}

/** Words in a file name that say what the file is, not who is on it. */
const noise = /^(sheet|sheets|character|char|ref|reference|final|turnaround|img|image|scan|copy|v\d+|ep\d+(_\d+)?|\d+)$/;

/** The words of a file name that may name a person: "Mara Voss sheet.png" gives "Mara Voss"; "IMG_2041.png" gives "". */
export function nameFromFile(file: string) {
  const words = stripExt(file)
    .split(/[\s_\-.]+/)
    .filter((w) => w && !noise.test(slug(w)));
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * The tag for an uploaded sheet. When the file name already starts with the character's name
 * (the team's chloe_ep07.png), the file name is the tag; otherwise the character's name is.
 */
export function tagForFile(character: string, file: string | undefined, taken: Iterable<string>) {
  const name = slug(character);
  const fromFile = file ? slug(stripExt(file)).replace(/_(sheet|character_sheet|ref|reference)$/, "") : "";
  if (name && fromFile.startsWith(`${name}_`)) return firstFree(`@${fromFile}`, taken);
  return uniqueTag(character, taken);
}

/** The existing character a file name points at, by the longest name its slug starts with. */
export function characterFromFile(file: string, characters: { id: string; name: string }[]) {
  const s = slug(stripExt(file));
  let best: { id: string; name: string } | undefined;
  for (const c of characters) {
    const n = slug(c.name);
    if (n && (s === n || s.startsWith(`${n}_`)) && n.length > (best ? slug(best.name).length : 0)) best = c;
  }
  return best;
}

/** Keeps what a person types inside the tag convention: a leading @, lowercase, letters, digits, _ and -. */
/** A typed tag, cleaned as it is typed: accents folded like a name's, spaces to underscores. A trailing underscore stays so the next word can follow. */
export const cleanTag = (typed: string) =>
  "@" +
  typed
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[øæœßłđðþı]/g, (c) => folds[c])
    .replace(/^@+/, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");

/* ---------- Cast ---------- */

export type CastCharacter = { id: string; name: string };
export type CastSheet = {
  id: string;
  tag: string;
  character: string;
  src: string;
  face?: string;
  /** Added in this session: its tag can still change and follows the character name until edited. */
  added?: boolean;
  tagEdited?: boolean;
  /** The uploaded file's name, which can give the tag (chloe_ep07.png gives @chloe_ep07). */
  file?: string;
  /** The episode or outfit the sheet is for, as the Notion character page labels it ("Episode 4", "Episode 15, second look"). */
  variant?: string;
  /** The Notion page shows this sheet without a tag; the tag follows the character's other tags. */
  tagMade?: boolean;
};
/** A location, prop or continuity frame uploaded on References. */
export type OtherSheet = { id: string; kind: "location" | "prop" | "continuity"; tag: string; who: string; src: string };
export type SeriesCast = { characters: CastCharacter[]; sheets: CastSheet[]; others?: OtherSheet[] };

/**
 * The cast each series starts with. The three mini-series hold every approved character sheet from Notion
 * (lib/labs/cast.ts), grouped by character; the other series start empty.
 */
export const startingCast: Record<string, SeriesCast> = {
  ...notionCast,
  "echoes-of-solera": { characters: [], sheets: [] },
  "shoujo-supper": { characters: [], sheets: [] },
};

/** Tags outside the cast that a new tag must not repeat. */
export const otherTags = [...sheets.location, ...sheets.prop].map((x) => x.tag);

/** "a", "a and b", "a, b and c". */
export const listOf = (items: string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
