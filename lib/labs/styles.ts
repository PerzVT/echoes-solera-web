/* Style library for the creator app. Every image is real: the style-library catalogue, the Solera art and Second Chance at Your Heart. */
import { styles as directions } from "@/app/studio/styles-7c9e4a2b/styleData";

export type StyleStatus = "Approved" | "Draft";
export type MediumFilter = "video" | "images";

export type Media = { src: string; video?: string; alt: string };

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
      closeUp: { src: `${SC}/episodes/6.webp`, alt: "Close on her face" },
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

/** The style-library directions. Each holds one sample frame and its clip, so far only two chart subjects. */
const library: Style[] = directions.map((d) => ({
  slug: slugify(d.title),
  name: d.title,
  id: d.id,
  medium: "Video",
  filter: "video",
  status: "Draft",
  group: "Library",
  source: "Style library",
  card: { src: d.poster, alt: `${d.title}, sample frame` },
  chart: {
    inScene: { src: d.poster, alt: `${d.title}, sample frame` },
    example: { src: d.poster, video: d.video, alt: `${d.title}, sample clip` },
  },
  rules: {},
  versions: [],
}));

export const allStyles: Style[] = [...inUse, draft, ...library];

/** A style page needs at least three chart subjects with art. Below that the style is listed as coming soon. */
export const MIN_CHART = 3;
export function filledSlots(style: Pick<Style, "chart">) {
  return chartSlots.filter((c) => style.chart[c.key]).length;
}
export function isComingSoon(style: Style) {
  return style.group === "Library" && !style.hidden && filledSlots(style) < MIN_CHART;
}

export function getStyle(slug: string) {
  return allStyles.find((s) => s.slug === slug);
}

/** The Solera environment guide, kept as it is. Source: ProjectSolera style-blocks/environment-style-code.md. */
export const environmentGuide: string = "---\ntype: prompt-block\ntitle: \"Environment Style Code - SOLERA-ENV-v2.2\"\nstatus: production-locked\ncreated: 2026-07-02\nupdated: 2026-07-02\n---\n\n# Environment Style Code - SOLERA-ENV-v2.2 (Production Locked)\n\nPaste-and-fill system for generating consistent environment art across all\nPOIs in Echoes of Solera. Validated on 20+ POIs across 5 regions. This is\nthe locked style for the rest of the project term.\n\n**Platform:** Higgsfield MCP, model `gpt_image_2`, 16:9, 1k resolution, high quality.\n\n**IMPORTANT:** Always set `quality: \"high\"` and `resolution: \"1k\"` explicitly\nin every generate_image call. The Higgsfield default changed to `quality: \"low\"`\nwhich produces noticeably worse linework (fussy detail, inconsistent outlines).\nNever rely on defaults.\n\n**v2.2 changes from v2.1:**\n- Production locked after successful biome batch (8/8 on-style)\n- Added biome-specific palette/terrain blocks\n- Added full gen pipeline with ref-anchor workflow for TOD variants\n- Added explicit anti-dome, anti-dithering, anti-detail language\n- Documented exact prompts that produced validated results\n- Added simplification rules that prevent over-detail\n\n---\n\n## STYLE LOCK: SOLERA-ENV-v2.2\n\nThis is the canonical style block. Paste it verbatim into every environment prompt.\n\n```\nSTYLE: SOLERA-ENV-v2.2\n\nRENDERING: Cel-shaded anime background. Two-tone flat fills per surface\n(base color + one shadow tone). Shadows are hard-edged flat shapes.\nNo gradients, no soft shading, no ambient occlusion.\n\nLINES: Dark brown outlines (NOT black). Thin and consistent weight.\nOutlines on major shapes and architecture only. Small details implied\nthrough color shifts, not linework. Clean and minimal.\n\nDETAIL: LOW-MEDIUM. Large shapes define the space. Surface detail\nsuggested by 2-3 color value shifts, not drawn linework. Leave open\nwall/floor/sky space for characters. Anime TV background quality\n(Dungeon Meshi, Frieren level), not feature film concept art.\nSimplify by 50% from any reference image.\n\nPALETTE: Muted and warm. Max 4 hues + 1 accent glow color. Colors\nslightly desaturated so fully-saturated characters pop in front.\n\nSHADOWS AND LIGHTING: Shadows are ESSENTIAL for atmosphere, not\noptional. 30-40% of surfaces should be in shadow. Shadow shapes are\nflat, hard-edged, and use a DARKER value of the local surface color\n(not grey, not universal shadow). Lit areas and shadowed areas create\na clear light/dark pattern across the scene. DO NOT flatten everything\nto the same brightness.\n\nDEPTH: Near shapes detailed, mid simplified, far silhouettes only.\nWarm near, cool far. No blur of any kind.\n```\n\n---\n\n## FORBIDDEN BLOCK (paste into every prompt)\n\n```\nFORBIDDEN: black outlines, photorealism, heavy detail on every\nsurface, gradient shading, soft airbrush shadows, 3D render look,\ndepth of field blur, lens flare, bloom, film grain, texture noise,\nindividually drawn bricks/stones, cluttered small objects,\nuniformly bright/flat lighting with no shadow contrast,\nglass dome, geodesic dome, dithering, airbrush effects, noise grain.\n```\n\n---\n\n## ANGLE CODES\n\n```\nANGLE: ENV-WIDE\nSlight low angle or eye-level. Full location visible, shows scale.\nSky in upper quarter. Foreground framing element (steps, railing,\narch edge, rocks) for depth. Vanishing point placed in the RIGHT or\nLEFT third of the frame, NOT centered. Horizon at lower third.\n```\n\n```\nANGLE: ENV-STREET\nEye-level, 5ft camera height. Character-scale walkable space.\n~10m visible depth. Ground detail visible. Vanishing point off-center.\nThis is the view a character would see walking through.\n```\n\n```\nANGLE: ENV-DETAIL\nTight crop on a signature feature of the location. Fills 80% of frame.\n2-3m depth max. Shows material character rendered as simple flat shapes.\n```\n\n```\nANGLE: ENV-OVERHEAD\n45-degree bird's eye looking down. Shows spatial layout and flow.\nShadows cast as flat shapes across ground plane.\n```\n\n---\n\n## TIME OF DAY CODES\n\n```\nTOD: DAY\nMidday or early afternoon. Bright directional sunlight from above-left.\nShort strong shadows. Warm sunlit surfaces, cool shadowed surfaces.\nSky: clear light blue. Overall bright but with clear shadow pattern.\n```\n\n```\nTOD: DUSK\nGolden hour transitioning to blue hour. Warm amber light from low\nangle (left or right). Long dramatic shadows. Sky: gradient from\nwarm orange horizon to deep blue above. Interior windows glow warm\namber against cooling exterior.\n```\n\n```\nTOD: NIGHT\nMoonlit or lamp-lit. Cool blue-grey ambient. Warm amber pools from\nstreet lanterns, lit windows, tech glow. Most of the scene in shadow\nwith selective warm spots. Sky: deep navy with TWO MOONS visible.\nHigh contrast between lit and unlit areas.\n```\n\n---\n\n## BIOME BLOCKS\n\nEach biome has its own terrain/palette/flora block. Paste the relevant\none after the style lock.\n\n### Halu (Tropical Lagoon)\n\n```\nBIOME: HALU\nTropical island lagoon biome. Turquoise shallow water, sandy beaches,\ntall limestone rock pillars covered in tropical vegetation. Wooden\nstructures with fabric canopies, rope railings, weathered timber.\nPalm trees, broad-leaf ferns, flowering plants. Warm humid atmosphere.\nPALETTE: Turquoise water, warm timber brown, sandy beige, lush green\nfoliage, amber lantern glow accent.\nTERRAIN: Sand, shallow water, mossy rock, wooden platforms.\n```\n\n### Khel-mari (Desert Canyon / Aztec)\n\n```\nBIOME: KHEL-MARI\nDesert canyon biome with Mesoamerican/Aztec architecture. Sandstone\ncanyon walls carved with geometric patterns. Teal-accented tech glyphs\nintegrated into stone. Cactus, date palms, desert scrub. Turquoise\nwater streams and waterfalls. Warm dry atmosphere.\nPALETTE: Warm sandstone tan, turquoise water, teal tech accents,\nterracotta red-brown, dusty sage green.\nTERRAIN: Sand, sandstone, carved stone, dry canyon floor.\n```\n\n### Quelium (Mystical Swamp / Forest Ruins)\n\n```\nBIOME: QUELIUM\nAncient forest ruins biome. Overgrown stone structures with moss and\nvines. Teal crystal formations and glowing portal eggs. Bonsai-shaped\ntrees on stone platforms. Swamp pools with lily pads. Mushrooms and\nferns. Dappled green light filtering through canopy. Mystical\natmosphere. Circular port windows (World DNA) on ruins.\nPALETTE: Deep forest green, teal crystal glow, mossy grey-green stone,\npurple-violet mushrooms, warm amber light patches.\nTERRAIN: Moss-covered stone, swamp water, root-covered ground.\n```\n\n### Brasa (Volcanic Highlands)\n\n```\nBIOME: BRASA\nVolcanic highlands biome. Rocky terrain with dark stone formations\nand boulders. Crimson-leafed trees and deep red vegetation (like\nautumn maples, NOT hellfire). Elegant cream/white architecture with\ndeep maroon/burgundy accents and gold trim. Tall pillared structures.\nSmall streams winding between rocks. Normal sky (NOT red). The\nvolcanic origin shows in the dark rock and geothermal warmth, but\nthis is a civilized, livable region -- dramatic, not demonic.\nPALETTE: Dark volcanic grey rock, cream-white architecture, deep\nmaroon/burgundy accents, crimson-red foliage, gold ornamental trim.\nTERRAIN: Dark rock, gravel paths, stream beds, rocky outcrops.\n```\n\n---\n\n## GENERATION PIPELINE\n\nEach POI gets TWO angles: ENV-WIDE + ENV-STREET, DAY only.\nTOD variants (DUSK/NIGHT) are deprioritized -- existing ones are\nkept but new POIs only need the two DAY angles.\n\n### Standard POI generation (2 images per POI)\n\n**Step 1: WIDE angle (ref-guided)**\n\n```\nGenerate a COMPLETELY NEW image from scratch. Do NOT modify, paint\nover, or iterate on the reference image. Use the reference ONLY for\ncolor palette and architectural style guidance.\n\n[PASTE STYLE LOCK]\n\nANGLE: ENV-WIDE\n\nTOD: DAY\n\n[PASTE BIOME BLOCK]\n\nLOCATION: [Region] [POI Name] -- [1 sentence description + mood]\n\nKEY SHAPES: [2-3 sentences describing the big architectural forms]\n\n[PASTE FORBIDDEN BLOCK]\n\n16:9 landscape, high quality. No characters. No text.\n```\n\n**Step 2: STREET angle (same POI)**\n\nSame prompt but swap angle code to ENV-STREET and adjust KEY SHAPES\nfor the street-level perspective. Use the appropriate Detail Tier\n(Tier 1 for wilderness wide, Tier 2 for street/market).\n\n**Without reference (established biomes):**\n\nSame as above but remove the first paragraph about reference images.\n\n### Legacy TOD pipeline (for existing TOD sets only)\n\nTOD variants use the DAY image as ref anchor. If TOD variants are\nneeded for a specific POI, follow the ref-anchor workflow:\n1. Upload DAY image to Higgsfield via `media_upload` + `media_confirm`\n2. Generate DUSK/NIGHT with ref anchor + anti-dithering language\n3. NIGHT must include \"TWO MOONS visible in the sky\"\n\nThis pipeline is validated but deprioritized. Focus on completing\nWIDE + STREET coverage across all POIs first.\n\n---\n\n## DETAIL TIERS\n\nDetail level depends on angle and scene type, not a single setting.\n\n### Tier 1: Expanse (ENV-WIDE, all establishing shots)\n\n```\nDETAIL: LOW-MEDIUM. Simplify by 40% from a typical illustration.\n```\n\n**CRITICAL: No biome ref image for WIDE shots.** Text-only prompts\nproduce cleaner results. Ref images push detail up and cause\ngrainy/busy output. The biome block in the prompt handles palette.\n\nLarge shapes with clear brown outline separation between elements.\nEach distinct element (wall, stall, ground, awning) gets its own\noutline. Surface detail through color shifts, not linework. No\nstone crack textures. Market stalls at WIDE scale show a few\nrecognizable item silhouettes (pots, fabric rolls) but NOT\nindividually detailed items.\n\nValidated on bazaar WIDE v3 (40%, text-only, no ref). Matches\nthe arena/main-street benchmark quality.\n\nPrevious attempts:\n- 50% with ref: Too detailed, grainy, stone cracks everywhere\n- 70% no ref: Too flat, empty boxes, shapes merging\n- 40% no ref: Correct -- defined shapes, clean, not empty\n\n### Tier 2: Street (ENV-STREET, markets, shops, urban)\n\n```\nDETAIL: MEDIUM. Simplify by 30% from reference.\n```\n\nForeground objects must be RECOGNIZABLE SILHOUETTES, not abstract\ncubes. A pot is round, a bottle is tapered, cloth drapes, bowls\nstack. Each item gets its silhouette shape + one shadow tone, but\nNO interior linework, no labels, no surface texture. Think Dungeon\nMeshi potion shop -- you can tell what each item is from its shape\nalone. Walls and floors stay simple (Tier 1 rules), but items\nwithin arm's reach of the camera need readable shapes.\n\nItems that are TOO simplified (colored cubes on a shelf) break\nimmersion at street level. Items that are TOO detailed (individual\nbottle labels, wood grain on barrels) break the style.\n\n### Tier 3: Detail (ENV-DETAIL, close-ups)\n\n```\nDETAIL: MEDIUM-HIGH. Simplify by 20% from reference.\n```\n\nSignature feature fills 80% of frame. Material character visible\nas flat shapes with 2-3 value shifts. More linework acceptable\nhere since the camera is close and fewer objects are in frame.\n\n---\n\n## ANTI-PATTERN RULES\n\nThese rules prevent the most common quality failures we've encountered.\n\n### Anti-dithering (ref iteration quality loss)\n\nEvery ref-anchored prompt MUST include:\n```\nGenerate a COMPLETELY NEW image from scratch. Do NOT modify, paint\nover, or iterate on the reference image.\n```\n\nNever chain ref iterations (A -> B -> use B as ref for C). Always\nreference the original DAY anchor, not a downstream result.\n\n### Anti-detail (wilderness over-detail)\n\nFor outdoor/wilderness POIs, add:\n```\nDETAIL: LOW-MEDIUM. Simplify by 50% from reference.\n```\n\nFor interior POIs, standard MEDIUM is fine.\n\nFORBIDDEN additions for wilderness:\n- individually drawn stones/bricks\n- stone cracks or weathering texture\n- individual leaf rendering\n- cluttered ground objects\n\n### Anti-dome\n\nAll biomes exist inside geodesic glass domes, but the dome should\nNEVER be visible in street-level or wide-angle shots. The camera is\ninside the biome looking at the landscape, not looking up at the\ndome structure.\n\nAlways include in FORBIDDEN: `glass dome, geodesic dome`\n\n### Anti-beam (Quelium specific)\n\nQuelium stone circle and portal locations should NOT have:\n- light beams from center\n- magic pillars of light\n- energy beams connecting portals\n\n### Anti-flat-light\n\nIf results come back too uniformly bright, the shadow instructions\nweren't followed. Re-prompt with emphasis:\n```\nCRITICAL: 30-40% of surfaces MUST be in shadow. Shadows are DARK,\nnot subtle. The scene needs a clear light/dark contrast pattern.\n```\n\n---\n\n## POI REGISTRY\n\n### Solera Prime (15 POIs)\n\n| POI | Angles | TODs | Status |\n|---|---|---|---|\n| main-street | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| grand-staircase | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| market-overlook | OVERHEAD, STREET | DAY, DUSK, NIGHT | Complete |\n| arena | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| training-court | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| potion-shop | STREET, DETAIL | DAY, DUSK, NIGHT | Complete |\n| canyon-city | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| cathedral-ruins | WIDE, DETAIL | DAY, DUSK, NIGHT | Complete |\n| dorms | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| stray-zone-lobby | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| highquest-hall | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| power-core | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| old-district | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| upper-district | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| lower-district | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n\n### Halu (4 POIs)\n\n| POI | Angles | TODs | Status |\n|---|---|---|---|\n| lagoon-dock | STREET | DAY | v2.2 batch |\n| hot-spring | WIDE | DAY | v2.2 batch |\n| treehouse-village | -- | -- | Planned |\n| fishing-pier | -- | -- | Planned |\n\n### Khel-mari (4 POIs)\n\n| POI | Angles | TODs | Status |\n|---|---|---|---|\n| oasis | STREET | DAY | v2.2 batch |\n| sun-temple | STREET | DAY | v2.2 batch |\n| sand-ruins | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| sand-bridges | WIDE, STREET | DAY, DUSK, NIGHT | In progress |\n| bazaar | -- | -- | Planned |\n| sand-mine | -- | -- | Planned |\n\n### Quelium (4 POIs)\n\n| POI | Angles | TODs | Status |\n|---|---|---|---|\n| spirit-pool | STREET | DAY | v2.2 batch |\n| moss-library | WIDE | DAY | v2.2 batch |\n| stone-circle | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| elder-tree | -- | -- | Planned |\n| mushroom-hollow | -- | -- | Planned |\n\n### Brasa (4 POIs)\n\n| POI | Angles | TODs | Status |\n|---|---|---|---|\n| ember-forge | WIDE | DAY | v2.2 batch |\n| obsidian-mine | STREET | DAY | v2.2 batch |\n| sulfur-springs | -- | -- | Planned |\n| ash-settlement | -- | -- | Planned |\n\n### Outlands / Sky\n\n| POI | Angles | TODs | Status |\n|---|---|---|---|\n| grasslands | WIDE, STREET | DAY, DUSK, NIGHT | Complete |\n| cliff-expanse | WIDE, STREET | DAY, DUSK, NIGHT | In progress |\n| cloud-intro | WIDE | DAY, DUSK, NIGHT | Complete |\n\n---\n\n## REF ANCHOR MEDIA IDS (Higgsfield)\n\nThese are the uploaded anchor refs for each biome. Reuse for\nconsistency when generating new POIs in the same biome.\n\n| Biome | Ref Image | Media ID |\n|---|---|---|\n| Halu | HALU4.png | `49e4a81a-9dd6-4dcb-8dfe-d0535b4f5a34` |\n| Khel-mari | KHELMARI (7).png | `0d46692b-e49c-45a3-9553-5f2a0ad8e89e` |\n| Quelium | QUELIUM7.png | `6be85196-1dc3-4838-ae9d-4e8f3849f91d` |\n| Brasa | brasa 5.png | `d0d278e8-194d-45a3-b451-abe0b3429ad5` |\n\n---\n\n## FILE NAMING\n\n```\n[poi-name]_[angle]_[tod].png\n\nExamples:\n  lagoon-dock_street_day.png\n  lagoon-dock_street_dusk.png\n  lagoon-dock_street_night.png\n  lagoon-dock_wide_day.png\n```\n\nAll outputs saved to `POI/[region]/[poi-name]/`.\nMedia stays local only. Never committed to git.\n";
