/**
 * Golden Ticket without its pages: what the series page, the chapter list and the home page's Continue
 * button need. Kept apart from the page data so a client bundle that only needs a chapter's state does not
 * carry every page's lettering. `index.ts` checks it against the page data, so the two cannot drift.
 */
export type ChapterOutline = {
  number: number;
  title: string;
  /** `YYYY-MM-DD`, from midnight UTC: the same release rule as a mini-series episode. */
  releases: string;
  status: "available" | "announced";
  cover: string;
  thumb: string;
  pageCount: number;
};

export type SeriesOutline = { slug: string; title: string; chapters: ChapterOutline[] };

const G = "/labs/manga/golden-ticket";

export const goldenTicketOutline: SeriesOutline = {
  slug: "golden-ticket",
  title: "Golden Ticket",
  chapters: [
    { number: 1, title: "The Bargain Bin", releases: "2026-11-18", status: "available", cover: `${G}/ch-01/cover.webp`, thumb: `${G}/ch-01/thumb.webp`, pageCount: 12 },
    { number: 2, title: "Delivery Confirmed", releases: "2026-11-18", status: "available", cover: `${G}/ch-02/cover.webp`, thumb: `${G}/ch-02/thumb.webp`, pageCount: 10 },
    { number: 3, title: "The Dive", releases: "2026-11-25", status: "available", cover: `${G}/ch-03/cover.webp`, thumb: `${G}/ch-03/thumb.webp`, pageCount: 10 },
    { number: 4, title: "Off the Record", releases: "2026-12-02", status: "announced", cover: `${G}/ch-04/cover.webp`, thumb: `${G}/ch-04/thumb.webp`, pageCount: 0 },
  ],
};
