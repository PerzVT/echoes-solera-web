/* Style library for the creator app. Every image is real: the style-library catalogue, the Solera art and Second Chance at Your Heart. */
import { styles as directions } from "@/app/studio/styles-7c9e4a2b/styleData";

export type StyleStatus = "Approved" | "Draft";
export type MediumFilter = "video" | "images";

export type Media = { src: string; video?: string; alt: string; /** Caption in place of the slot name when the art is not what the slot names. */ label?: string };

/** The five fixed subjects of a style chart. A missing one is a named slot. */
export const chartSlots = [
  { key: "closeUp", label: "Character close-up" },
  { key: "inScene", label: "Character in scene" },
  { key: "environment", label: "Environment" },
  { key: "material", label: "Material and prop" },
  { key: "example", label: "Medium example" },
] as const;
export type ChartKey = (typeof chartSlots)[number]["key"];

export type Style = {
  slug: string;
  name: string;
  id: string;
  medium: string;
  filter: MediumFilter;
  status: StyleStatus;
  version?: string;
  source: string;
  usedBy?: string;
  card?: Media;
  chart: Partial<Record<ChartKey, Media>>;
  /** The rules the style fixes, in the guide's own words. */
  rules: Partial<Record<RuleKey, string>>;
  versions: { name: string; state: string }[];
  /** True when the guide text is held here and can be shown. */
  hasGuide?: boolean;
  /** "In use" when a project pins it; "Library" otherwise. */
  group: "In use" | "Library";
  /** Not listed on the hub. */
  hidden?: boolean;
  /** Shows the guide's location samples. */
  samples?: boolean;
  /** A generated style-library direction: one still and its clip, reviewed side by side in place of the chart. */
  review?: { still: string; clip: string };
};

export const ruleFields = [
  { key: "rendering", label: "Rendering", tag: "RENDERING" },
  { key: "lines", label: "Lines", tag: "LINES" },
  { key: "detail", label: "Detail", tag: "DETAIL" },
  { key: "palette", label: "Palette", tag: "PALETTE" },
  { key: "lighting", label: "Light and shadow", tag: "SHADOWS AND LIGHTING" },
  { key: "depth", label: "Depth", tag: "DEPTH" },
  { key: "texture", label: "Texture", tag: "TEXTURE" },
  { key: "avoid", label: "Avoid", tag: "FORBIDDEN" },
] as const;
export type RuleKey = (typeof ruleFields)[number]["key"];

/** The style creator's steps. The chart is where a draft is made, so it opens there. */
export const CREATOR_STEPS = [
  { key: "source", label: "Source" },
  { key: "rules", label: "Rules" },
  { key: "chart", label: "Chart" },
  { key: "samples", label: "Samples" },
] as const;
export type CreatorStep = (typeof CREATOR_STEPS)[number]["key"];

export const PROJECT = "Second Chance at Your Heart";
export const GUIDE_FILE = "environment-style-code.md";

const A = "/labs/anime";

/** Fields read from a style guide file. A field the file does not hold is undefined. */
export type ReadGuide = {
  name?: string;
  id?: string;
  version?: string;
  status?: string;
  medium?: string;
  owner?: string;
  rules: Partial<Record<RuleKey, string>>;
  /** Terms in the text that another guide treats differently. */
  conflict?: { term: string; withStyle: string; text: string };
};

const squash = (s: string) => s.replace(/\s+/g, " ").trim();

/** Reads a markdown, text or JSON style guide into fields. Pure, so it runs in the browser on a dropped file. */
export function readGuide(text: string, fileName = ""): ReadGuide {
  if (fileName.toLowerCase().endsWith(".json")) {
    try {
      const o = JSON.parse(text) as Record<string, unknown>;
      const get = (k: string) => {
        const hit = Object.keys(o).find((x) => x.toLowerCase() === k);
        const v = hit ? o[hit] : undefined;
        return typeof v === "string" ? squash(v) : undefined;
      };
      const rules: ReadGuide["rules"] = {};
      for (const f of ruleFields) {
        const v = get(f.key) ?? get(f.tag.toLowerCase());
        if (v) rules[f.key] = v;
      }
      return withConflict({
        name: get("name") ?? get("title"),
        id: get("id"),
        version: get("version"),
        status: get("status"),
        medium: get("medium"),
        owner: get("owner"),
        rules,
      });
    } catch {
      return { rules: {} };
    }
  }

  const front = /^---\n([\s\S]*?)\n---/.exec(text.replace(/\r\n/g, "\n"))?.[1] ?? "";
  const meta = (k: string) => {
    const m = new RegExp(`^${k}:\\s*"?([^"\\n]+)"?`, "m").exec(front);
    return m ? m[1].trim() : undefined;
  };
  const heading = /^#\s+(.+)$/m.exec(text)?.[1];
  const title = meta("title") ?? heading;
  const code = /\b([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*)-v(\d+(?:\.\d+)*)\b/.exec(text);

  const rules: ReadGuide["rules"] = {};
  for (const f of ruleFields) {
    const m = new RegExp(`^${f.tag}:\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\`\`\`|(?![\\s\\S]))`, "m").exec(text);
    if (m) rules[f.key] = squash(m[1]);
  }

  return withConflict({
    name: title ? squash(title.split(" - ")[0]) : undefined,
    id: code?.[1],
    version: code ? `v${code[2]}` : meta("version"),
    status: meta("status"),
    medium: meta("medium"),
    owner: meta("owner"),
    rules,
  });
}

/** The deck states that Solera's image guide uses cel-shading language and its video guide does not share it. */
function withConflict(g: ReadGuide): ReadGuide {
  if (g.rules.rendering && /cel-shad/i.test(g.rules.rendering)) {
    return {
      ...g,
      conflict: {
        term: "cel-shaded",
        withStyle: "Solera anime",
        text: "Solera's image guide uses cel-shading language; its video guide has different instructions.",
      },
    };
  }
  return g;
}

const env = () => readGuide(environmentGuide, GUIDE_FILE);

const SC = "/labs/mini-series/second-chance";

/** The guide's locations. Three have art; the rest are named slots. */
export const environmentSamples: { name: string; src?: string }[] = [
  { name: "Cathedral ruins", src: `${A}/places/cathedral-ruins.webp` },
  { name: "Market overlook", src: `${A}/places/market-overlook.webp` },
  { name: "Oasis", src: `${A}/places/oasis.webp` },
  { name: "Lagoon dock" },
  { name: "Sun temple" },
  { name: "Moss library" },
  { name: "Ember forge" },
  { name: "Spirit pool" },
];

const environmentChart: Style["chart"] = {
  environment: { src: `${A}/places/cathedral-ruins.webp`, alt: "Cathedral ruins, wide" },
  example: { src: `${A}/places/market-overlook.webp`, alt: "Market overlook, street level" },
};

/** Styles that a project uses today. */
const inUse: Style[] = [
  {
    slug: "photoreal-period",
    name: "Photoreal period",
    id: "photoreal-period",
    medium: "Live-action video",
    filter: "video",
    status: "Draft",
    group: "In use",
    source: "Episode prompts",
    usedBy: PROJECT,
    card: { src: `${SC}/episodes/6.webp`, alt: "Second Chance at Your Heart, production clip" },
    chart: {
      closeUp: { src: `${SC}/episodes/6.webp`, alt: "Both leads, full length", label: "Two-shot, full length" },
      inScene: { src: `${SC}/episodes/6.webp`, alt: "Both leads at the table" },
      environment: { src: `${SC}/hero-bg.webp`, alt: "Lit corridor, no people" },
      example: { src: `${SC}/episodes/1.webp`, video: `${SC}/episodes/1.mp4`, alt: "Second Chance at Your Heart, production clip" },
    },
    rules: { rendering: "Vertical 9:16, live action, photoreal period style." },
    versions: [],
  },
  {
    slug: "solera-anime",
    name: "Solera anime",
    id: "solera-anime-prompter",
    medium: "Anime video",
    filter: "video",
    status: "Approved",
    group: "In use",
    source: "solera-anime-prompter.md",
    usedBy: "Anime Production",
    card: { src: `${A}/shorts/highquest-on-break.webp`, alt: "Highquest on Break, still" },
    chart: {
      closeUp: { src: `${A}/shorts/everyday-stops.webp`, alt: "Everyday Stops, close on a character" },
      inScene: { src: `${A}/shorts/highquest-on-break.webp`, alt: "Highquest on Break, a character at the quest board" },
      environment: { src: `${A}/hero-bg.webp`, alt: "The city of Solera from a terrace" },
      example: { src: `${A}/shorts/back-to-me.webp`, video: `${A}/shorts/back-to-me.mp4`, alt: "Back to Me, short" },
    },
    rules: {},
    versions: [],
  },
  {
    slug: "solera-environments",
    name: "Solera environments",
    id: "SOLERA-ENV",
    medium: "Images",
    filter: "images",
    status: "Approved",
    group: "In use",
    version: "v2.2",
    source: GUIDE_FILE,
    usedBy: "Anime Production",
    card: { src: `${A}/places/cathedral-ruins.webp`, alt: "Cathedral ruins" },
    chart: environmentChart,
    get rules() {
      return env().rules;
    },
    versions: [
      { name: "v2.2", state: "Approved" },
      { name: "v2.1", state: "Retired" },
    ],
    hasGuide: true,
    samples: true,
  },
];

/** The imported copy of the environment guide. Reached from Import and the creator, not listed on the hub. */
const draft: Style = {
  slug: "solera-environments-draft",
  name: "Solera environments",
  id: "SOLERA-ENV",
  medium: "Images",
  filter: "images",
  status: "Draft",
  group: "Library",
  hidden: true,
  version: "v2.2",
  source: GUIDE_FILE,
  card: { src: `${A}/places/oasis.webp`, alt: "Oasis" },
  chart: environmentChart,
  get rules() {
    return env().rules;
  },
  versions: [{ name: "v2.2", state: "Draft, imported" }],
  hasGuide: true,
  samples: true,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * The generated style library: the 18 directions in app/studio/styles-7c9e4a2b/styleData.ts, read where they are
 * (public/style-library). Each is one vertical still and its clip. The library holds a name for each and no written rules.
 */
const library: Style[] = directions.map((d) => ({
  slug: slugify(d.title),
  name: d.title,
  id: d.id,
  medium: "Video",
  filter: "video",
  status: "Draft",
  group: "Library",
  source: "Style library",
  card: { src: d.poster, alt: `${d.title}, still` },
  chart: {
    inScene: { src: d.poster, alt: `${d.title}, still` },
    example: { src: d.poster, video: d.video, alt: `${d.title}, clip` },
  },
  rules: {},
  versions: [],
  review: { still: d.poster, clip: d.video },
}));

export const allStyles: Style[] = [...inUse, draft, ...library];

/** A style page needs at least three chart subjects with art, or a library still and clip. Below that the style is listed as coming soon. */
export const MIN_CHART = 3;
export function filledSlots(style: Pick<Style, "chart">) {
  return chartSlots.filter((c) => style.chart[c.key]).length;
}
export function isComingSoon(style: Style) {
  return style.group === "Library" && !style.hidden && !style.review && filledSlots(style) < MIN_CHART;
}

export function getStyle(slug: string) {
  return allStyles.find((s) => s.slug === slug);
}

/** A sample style guide for the import and style screens: an invented guide in the house format (front matter, a style lock of tagged rules, angles). */
export const environmentGuide: string = "---\ntype: style-guide\ntitle: \"Solera Environments - SOLERA-ENV-v2.2\"\nstatus: approved\nmedium: Images\nowner: Art direction\n---\n\n# Solera Environments - SOLERA-ENV-v2.2\n\nA sample style guide for background art in the world of Solera. Paste the\nstyle lock into every environment prompt, then add the angle and the place.\n\n## Style lock\n\n```\nSTYLE: SOLERA-ENV-v2.2\n\nRENDERING: Cel-shaded anime background. Each surface has a base colour and\none shadow tone. Shadows are flat shapes with hard edges.\n\nLINES: Dark brown outlines, never black. Thin, even weight, on large shapes\nand buildings only. Small details are shown by a change of colour.\n\nDETAIL: Low to medium. Big shapes describe the place. Leave open ground and\nsky where characters will stand.\n\nPALETTE: Warm and slightly muted, four hues and one glowing accent, so the\ncharacters in front read brighter than the world behind them.\n\nSHADOWS AND LIGHTING: A third of the scene sits in shadow. A shadow is a\ndarker tone of the surface it falls on, not grey.\n\nDEPTH: Near shapes carry the detail, middle shapes are simpler, far shapes\nare silhouettes. Warm near, cool far. Nothing is blurred.\n```\n\n## Avoid\n\n```\nFORBIDDEN: black outlines, photorealism, soft airbrush shading, gradients\non surfaces, lens blur, bloom, film grain, a brick or leaf drawn one by one,\na scene lit evenly with no shadow.\n```\n\n## Angles\n\n```\nANGLE: WIDE\nEye level or a little below. The whole place in view, sky in the top\nquarter, a railing or step in the foreground for depth.\n```\n\n```\nANGLE: STREET\nEye level, as a person walking through would see it. About ten metres of\nground in view.\n```\n\n## Places\n\nSolera Prime and the lands around it: cathedral ruins, the market overlook,\nan oasis in the canyon, a lagoon dock, a sun temple, a moss library, an\nember forge and a spirit pool. Each place gets a wide view and a street view\nin daylight.\n";
