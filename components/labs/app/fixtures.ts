/** Fixed data for the storyboard and manga tools: their styles and page counts. */
import { allStyles, type Style } from "@/lib/labs/styles";
import { animeStyles } from "./anime";

const listed = allStyles.filter((s) => !s.hidden && s.card);

/** A storyboard can be drawn in any listed style; drawn ones come first. */
export const storyboardStyles: Style[] = [...animeStyles.filter((s) => s.card), ...listed.filter((s) => !animeStyles.includes(s))];

const G = "/labs/manga/golden-ticket";

/** The house manga look (the Golden Ticket pages), then the ink-led library directions. */
const lineAndTone: Style = {
  slug: "line-and-tone",
  name: "Line and tone",
  id: "manga-line-and-tone",
  medium: "Manga",
  filter: "images",
  status: "Approved",
  group: "In use",
  source: "Catalyst: Golden Ticket",
  card: { src: "/labs/manga/panels/nova-searching.webp", alt: "Line and tone, panel" },
  chart: { example: { src: `${G}/page-1.webp`, alt: "Line and tone, page" } },
  rules: {},
  versions: [],
};
const inky = new Set(["Urban ink", "Brass & ink", "Graphic texture", "Tailored cel", "Expressive detail", "Playful minimal", "Chromatic graphic"]);
export const mangaStyles: Style[] = [lineAndTone, ...listed.filter((s) => inky.has(s.name))];

export const PAGE_COUNTS = [2, 4, 6, 8, 12];

