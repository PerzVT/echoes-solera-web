/**
 * The mini-series that have a hover backdrop: one 16:9 file per series at
 * public/labs/mini-series/backdrops/<slug>.webp, named after its cover. next.config.ts lists the
 * folder when the site builds, so a new file shows up on the next build with no code change.
 */
export function seriesBackdrops(): string[] {
  return (process.env.NL_SERIES_BACKDROPS ?? "").split(",").filter(Boolean);
}
