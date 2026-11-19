import type { Metadata } from "next";

/** Link-preview images, 1200 x 630 PNG, one per project, built from Codex's brand/og layouts. */
export type OgImage =
  | "default"
  | "anime"
  | "cards"
  | "cooking"
  | "game-ads"
  | "manga"
  | "mini-series"
  | "shop"
  | "visual-novel"
  | "worlds";

export const SITE_DESCRIPTION =
  "Anime, mini-series, cooking videos, worlds, cards, manga and visual novels, made from a script.";

/**
 * openGraph and twitter fields for one page. Next replaces a parent's openGraph wholesale,
 * so every page passes its full set. Addresses are relative and resolve against the labs
 * layout's metadataBase.
 */
export function og(title: string, image: OgImage = "default", description = SITE_DESCRIPTION): Pick<Metadata, "openGraph" | "twitter"> {
  const url = `/labs/og/${image}-v2.png`;
  return {
    openGraph: {
      title,
      description,
      siteName: "Nine Lives",
      type: "website",
      images: [{ url, width: 1200, height: 630, type: "image/png" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [url] },
  };
}

/**
 * The deployed host: an explicit site address, else the Vercel project's production domain (preview
 * hosts can sit behind deployment protection, which link previews cannot get past), else the
 * deployment's own host, else the local dev server. The staging branch has its own public domain, and the
 * production domain does not serve this site's files yet, so staging's previews point at staging.
 */
const onStaging = process.env.VERCEL_ENV === "preview" && process.env.VERCEL_GIT_COMMIT_REF === "staging";
const vercelHost = onStaging ? "staging.9livesinnovation.com" : (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL);
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3210"),
);
