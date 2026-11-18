import type { NextConfig } from "next";
import fs from "node:fs";

// Read at build time: the deployed functions do not carry public/, so the list is baked in here.
const backdrops = (() => {
  try {
    return fs.readdirSync("public/labs/mini-series/backdrops").filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5));
  } catch {
    return [];
  }
})();

/** The public address of the Blob store that holds the site's videos. */
const MEDIA = "https://xdkyhndo0jxmfyrf.public.blob.vercel-storage.com";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: { NL_SERIES_BACKDROPS: backdrops.join(",") },
  images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 86400, qualities: [75, 90] },
  // app/walk/route.ts serves the Tidebell Cove HTML; the game loads garments from /assets/wardrobe/.
  // The creator's postgres adapter reads its schema from lib/labs/store/schema.sql when it first connects.
  outputFileTracingIncludes: { "/walk": ["./lib/labs/cove/tidebell-cove.html"], "/api/creator/**": ["./lib/labs/store/schema.sql"] },
  async rewrites() {
    return [{ source: "/assets/wardrobe/:file", destination: "/labs/worlds/play/assets/wardrobe/:file" }];
  },
  // Videos are not in the repo or the deployment. Each lives in the Vercel Blob store under the path it had
  // in public/, so every .mp4 address on the site is sent there. A new video is uploaded to the store at
  // its public/ path; nothing else changes.
  async redirects() {
    return [{ source: "/:path(.*\\.mp4)", destination: `${MEDIA}/:path`, permanent: false }];
  },
  async headers() {
    const catalogHeaders = [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ];
    const closed = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "same-origin" },
    ];
    return [
      { source: "/app/:path*", headers: closed },
      { source: "/studio/media-6e4b9a", headers: catalogHeaders },
      { source: "/media-preview/:path*", headers: catalogHeaders },
      { source: "/studio/styles-7c9e4a2b", headers: catalogHeaders },
      { source: "/style-library/:path*", headers: catalogHeaders },
    ];
  },
};

export default nextConfig;

