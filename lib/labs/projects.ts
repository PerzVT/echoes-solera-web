import { series } from "./series";

export type Action = { label: string; href: string };

/** A cutout standing in the hero, anchored to the bottom edge. Values are CSS lengths. */
export type Figure = { src: string; right: string; height: string; bottom?: string; alt?: string };

export type Project = {
  slug: string;
  name: string;
  line: string;
  primary: Action;
  secondary?: Action;
  /** Light art needs dark text; everything else gets the dark fade. */
  tone: "dark" | "light";
  bg?: string;
  /** Full-frame transparent layer registered to the background. */
  cast?: string;
  figures?: Figure[];
  /** Card faces laid out as a fan. */
  fan?: { kind: "cards"; items: { src: string; alt: string; width?: number; height?: number }[] };
  backdrop?: string;
  /** A tilted wall of pictures that fills the whole stage behind everything else (card faces or manga pages). */
  wall?: { kind: "cards" | "pages"; items: string[] };
  /** A transparent illustration contained against the right edge, over the wall. */
  art?: string;
  /** A muted looping video that fills the hero, with the still shown until it plays. */
  video?: string;
  poster?: string;
  /** Cover row along the bottom edge. */
  covers?: { title: string; src: string; href: string }[];
  /** A stage with its own contents, drawn by HeroStage in components/labs/stages/HeroStages.tsx. */
  stage?: "montage" | "series" | "chefs" | "worlds" | "ads" | "shop" | "cards";
};

const L = "/labs";

export const projects: Project[] = [
  {
    slug: "anime",
    name: "Anime Production",
    line: "Turn an idea into a short anime video.",
    primary: { label: "Create an anime", href: "/app/anime" },
    secondary: { label: "Watch Echoes of Solera", href: "/anime/echoes-of-solera" },
    tone: "dark",
    // One montage of hard cuts: full-screen Catalyst and dance cuts, with the row of four vertical shorts between them.
    stage: "montage",
  },
  {
    slug: "mini-series",
    name: "Mini-series",
    line: "Turn a script into a vertical series, one episode at a time.",
    primary: { label: "Create a mini-series", href: "/app" },
    secondary: { label: "Browse the series", href: "/mini-series" },
    tone: "dark",
    // The owner's settled leads for mini-series: Moonflower's key art shows first; the cover row switches it.
    stage: "series",
    covers: series.map((x) => ({ title: x.title, src: x.cover, href: `/mini-series/${x.slug}` })),
  },
  {
    slug: "cooking",
    name: "Cooking videos",
    line: "Turn a recipe into a short cooking video.",
    primary: { label: "Create a video", href: "/app/cooking" },
    secondary: { label: "Watch Shoujo Supper", href: "/cooking/shoujo-supper" },
    tone: "light",
    // Full scenes crossfading edge to edge: the Akane kitchen, the dishes, rows of episode stills.
    stage: "chefs",
  },
  {
    slug: "worlds",
    name: "Virtual worlds",
    line: "Check out our interactive virtual world.",
    primary: { label: "Play Tidebell Cove", href: "/worlds/tidebell-cove/play" },
    secondary: { label: "See the world", href: "/worlds/tidebell-cove" },
    tone: "dark",
    // Every place and capture from the world page, crossfading.
    stage: "worlds",
  },
  {
    slug: "cards",
    name: "Cards",
    line: "Open a pack. Find every duck in Flock 01.",
    primary: { label: "Open a pack", href: "/cards/packs" },
    secondary: { label: "See the collection", href: "/cards" },
    tone: "dark",
    backdrop: "radial-gradient(120% 90% at 78% 40%, #1f4a4f 0%, #12303a 46%, #0e1d27 100%)",
    stage: "cards",
    // The whole stage is a wall of Flock 01, the fan on top. Hidden cards and secrets stay off the home page.
    wall: {
      kind: "cards",
      items: ["f001-yellow-hoodie", "f022-icy-blue-fireman", "f012-penguin-hypebeast", "f042-icy-blue-santa", "f031-mallard-farmer", "f007-yellow-cap-hypebeast", "f055-purple-party-sweater", "f027-yellow-fireman"].map(
        (id) => `${L}/cards/flock/art/${id}.webp`,
      ),
    },
    fan: {
      kind: "cards",
      items: [
        { src: `${L}/cards/flock/art/f018-tiger-hoodie.webp`, alt: "Tiger Hoodie" },
        { src: `${L}/cards/flock/art/f037-steel-fireman.webp`, alt: "Steel Fireman" },
        { src: `${L}/cards/flock/art/f058-tiger-pirate.webp`, alt: "Tiger Pirate" },
        { src: `${L}/cards/flock/art/f038-zebra-nerd.webp`, alt: "Zebra Nerd" },
      ],
    },
  },
  {
    slug: "manga",
    name: "Manga",
    line: "Turn a story into manga pages.",
    primary: { label: "Read Golden Ticket", href: "/manga/golden-ticket" },
    tone: "dark",
    // A screentone over the dark ground, as in the kit's manga patterns.
    backdrop:
      "radial-gradient(circle at 1px 1px, rgb(246 243 236 / 0.07) 1px, transparent 1.6px) 0 0 / 7px 7px, linear-gradient(120deg, #0d1016 0%, #171c25 100%)",
    // Codex's manga home concept (homepage-art-v04 manga-hero): the three leads drawn as one torn page,
    // over a wall of Golden Ticket pages that runs the width of the stage.
    wall: {
      kind: "pages",
      items: ["ch-01/page-07", "ch-01/page-11", "ch-03/page-04"].map((p) => `${L}/manga/golden-ticket/${p}.webp`),
    },
    art: `${L}/home/manga-hero.webp`,
  },
  {
    slug: "visual-novel",
    name: "Visual novel",
    line: "Turn a story into a visual novel with branches.",
    primary: { label: "Play After Hours", href: "/visual-novel/after-hours" },
    tone: "dark",
    // The title art: the four leads outside the store in the rain.
    bg: `${L}/visual-novel/after-hours/ui/title.webp`,
  },
  {
    slug: "game-ads",
    name: "Game ads",
    line: "Short video ads for game studios, made from your build.",
    primary: { label: "Request an ad", href: "/game-ads#request" },
    secondary: { label: "Watch samples", href: "/game-ads" },
    tone: "dark",
    bg: `${L}/game-ads/hero-bg.webp`,
    stage: "ads",
  },
  {
    slug: "shop",
    name: "Shop",
    line: "Concept objects from our worlds.",
    primary: { label: "See the objects", href: "/shop" },
    tone: "light",
    bg: `${L}/shop/hero-backpack.webp`,
    stage: "shop",
  },
];

export const projectBySlug = (slug?: string) => projects.find((p) => p.slug === slug) ?? projects[0];
