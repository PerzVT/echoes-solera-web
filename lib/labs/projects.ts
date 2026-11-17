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
  /** Portrait pieces laid out as a fan (card faces), or manga panels set as a page grid. */
  fan?: { kind: "cards" | "panels"; items: { src: string; alt: string; width?: number; height?: number }[] };
  backdrop?: string;
  /** A muted looping video that fills the hero, with the still shown until it plays. */
  video?: string;
  poster?: string;
  /** Cover row along the bottom edge. */
  covers?: { title: string; src: string; href: string }[];
};

const L = "/labs";

export const projects: Project[] = [
  {
    slug: "anime",
    name: "Anime Production",
    line: "Turn an idea into a short anime video.",
    primary: { label: "Create an anime", href: "/app" },
    secondary: { label: "Watch Echoes of Solera", href: "/anime/echoes-of-solera" },
    tone: "dark",
    video: `${L}/anime/hero-montage.mp4`,
    poster: `${L}/anime/hero-montage.webp`,

  },
  {
    slug: "mini-series",
    name: "Mini-series",
    line: "Turn a script into a vertical series, one episode at a time.",
    primary: { label: "Create a mini-series", href: "/app" },
    secondary: { label: "Browse the series", href: "/mini-series" },
    tone: "dark",
    // The owner's settled leads for mini-series: Yeon-hee and King Yi Sun of The Scent of the Moonflower.
    bg: `${L}/mini-series/moonflower/hero-bg.webp`,
    cast: `${L}/mini-series/moonflower/hero-cast.webp`,
    covers: series.map((x) => ({ title: x.title, src: x.cover, href: `/mini-series/${x.slug}` })),
  },
  {
    slug: "cooking",
    name: "Cooking videos",
    line: "Turn a recipe into a short cooking video.",
    primary: { label: "Create a video", href: "/app" },
    secondary: { label: "Watch Shoujo Supper", href: "/cooking/shoujo-supper" },
    tone: "light",
    bg: `${L}/cooking/hero-akane.webp`,
  },
  {
    slug: "worlds",
    name: "Virtual worlds",
    line: "Walk around Tidebell Cove as a duck called FOMO.",
    // The outfit picker is the thing on the world page a visitor can try.
    primary: { label: "Try it out", href: "/worlds/tidebell-cove#outfits" },
    tone: "dark",
    bg: `${L}/worlds/pier.webp`,
    figures: [
      { src: `${L}/worlds/cast/fomo-dinosaur.webp`, right: "27%", height: "56%", bottom: "5%" },
      { src: `${L}/worlds/cast/fomo-heart-knit.webp`, right: "8%", height: "68%", bottom: "2%" },
    ],
  },
  {
    slug: "cards",
    name: "Cards",
    line: "Open a pack and turn over its concept cards.",
    primary: { label: "Open a pack", href: "/cards/packs" },
    secondary: { label: "See the collection", href: "/cards" },
    tone: "dark",
    backdrop: "radial-gradient(120% 90% at 78% 40%, #1f4a4f 0%, #12303a 46%, #0e1d27 100%)",
    fan: {
      kind: "cards",
      items: [
        { src: `${L}/cards/art/oren-pond.webp`, alt: "Or-en by a pond" },
        { src: `${L}/cards/art/nine-moonlight.webp`, alt: "Nine under the moon" },
        { src: `${L}/cards/art/nova-sunset.webp`, alt: "Nova at sunset" },
        { src: `${L}/cards/art/kohaku-bakery.webp`, alt: "Kohaku in the bakery" },
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
    // The three panels of Golden Ticket page 1, cut at native size, set as a page (manga-hero-a).
    fan: {
      kind: "panels",
      items: [
        { src: `${L}/manga/panels/shop-establishing.webp`, alt: "Inside a shop of old games", width: 994, height: 432 },
        { src: `${L}/manga/panels/nova-closeup.webp`, alt: "Nova holding a game cartridge, close up", width: 496, height: 545 },
        { src: `${L}/manga/panels/nova-searching.webp`, alt: "Nova looking through a bin of games", width: 994, height: 478 },
      ],
    },
  },
  {
    slug: "visual-novel",
    name: "Visual novel",
    line: "Turn a story into a visual novel with branches.",
    primary: { label: "Play the demo", href: "/visual-novel/after-hours" },
    tone: "dark",
    bg: `${L}/visual-novel/cg/rooftop.webp`,
  },
  {
    slug: "game-ads",
    name: "Game ads",
    line: "Short video ads for game studios, made from your build.",
    primary: { label: "Request an ad", href: "/game-ads#request" },
    secondary: { label: "Watch samples", href: "/game-ads" },
    tone: "dark",
    bg: `${L}/game-ads/hero-bg.webp`,

  },
  {
    slug: "shop",
    name: "Shop",
    line: "Concept objects from our worlds.",
    primary: { label: "See the objects", href: "/shop" },
    tone: "light",
    bg: `${L}/shop/hero-backpack.webp`,
  },
];

export const projectBySlug = (slug?: string) => projects.find((p) => p.slug === slug) ?? projects[0];
