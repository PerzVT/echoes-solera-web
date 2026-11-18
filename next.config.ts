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

/**
 * The full Content-Security-Policy, sent report-only for now (see headers()). Inline scripts are allowed because
 * the pages are built ahead of time and cannot carry a per-request nonce. Videos and creator uploads come from Blob
 * stores; browser uploads go to vercel.com/api/blob.
 */
const BLOB = "https://*.public.blob.vercel-storage.com";
const policy = (parts: Record<string, string>) =>
  Object.entries(parts)
    .map(([k, v]) => `${k} ${v}`)
    .join("; ");
const pagePolicy = policy({
  "default-src": "'self'",
  "script-src": "'self' 'unsafe-inline'",
  "style-src": "'self' 'unsafe-inline'",
  "img-src": `'self' data: blob: ${BLOB}`,
  "media-src": `'self' blob: ${BLOB}`,
  "font-src": "'self' data:",
  "connect-src": `'self' https://vercel.com ${BLOB}`,
  "worker-src": "'self' blob:",
  "frame-src": "'self'",
  "form-action": "'self'",
  "base-uri": "'self'",
  "object-src": "'none'",
  "frame-ancestors": "'self'",
});
const gamePolicy = policy({
  "default-src": "'self'",
  "script-src": "'self' 'unsafe-inline'",
  "style-src": "'self' 'unsafe-inline'",
  "img-src": "'self' data: blob:",
  "media-src": "'self' data: blob:",
  "font-src": "'self' data:",
  "connect-src": "'self' data: blob:",
  "worker-src": "'self' blob:",
  "form-action": "'self'",
  "base-uri": "'self'",
  "object-src": "'none'",
  "frame-ancestors": "'self'",
});

const nextConfig: NextConfig = {
  devIndicators: false,
  // The response does not need to name the framework.
  poweredByHeader: false,
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
    return [
      { source: "/:path(.*\\.mp4)", destination: `${MEDIA}/:path`, permanent: false },
      // Anime now runs the episode flow: the old anime addresses open its steps.
      { source: "/app/anime/new", destination: "/app/anime", permanent: false },
      { source: "/app/anime/new/:step(screenplay|cast|style)", destination: "/app/anime/episode/:step", permanent: false },
      { source: "/app/anime/new/storyboard", destination: "/app/anime/episode/results", permanent: false },
    ];
  },
  async headers() {
    // Every response. The site has inline scripts on statically built pages, so a nonce policy is not possible
    // without making every page dynamic: the enforced policy holds only what cannot break a page, and the full
    // policy runs in report-only mode until the browser console shows it is clean on every page.
    const always = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
    ];
    // Pages only: API routes set their own policy where they serve content (/api/creator/files sandboxes everything).
    // Development leaves the report-only policy out, because React's dev build uses eval and would fill the console.
    const pages = [
      { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'" },
      ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy-Report-Only", value: pagePolicy }] : []),
    ];
    const catalogHeaders = [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ];
    const closed = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "same-origin" },
    ];
    // The game is a third-party build with inline script and style, WebGL and blob: textures. Only this site may frame it.
    const game = [{ key: "Content-Security-Policy-Report-Only", value: gamePolicy }];
    // Later entries override earlier ones for the same header, so the site-wide set comes first.
    return [
      { source: "/:path*", headers: always },
      { source: "/:path((?!api/).*)", headers: pages },
      { source: "/sign-in", headers: [{ key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'" }] },
      ...(process.env.NODE_ENV === "production" ? [{ source: "/walk", headers: game }] : []),
      // The old portal's sign-in and the bare game page carry no robots tag of their own; every other page says noindex.
      { source: "/login", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/walk", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/app", headers: closed },
      { source: "/app/:path*", headers: closed },
      { source: "/studio/media-6e4b9a", headers: catalogHeaders },
      { source: "/media-preview/:path*", headers: catalogHeaders },
      { source: "/studio/styles-7c9e4a2b", headers: catalogHeaders },
      { source: "/style-library/:path*", headers: catalogHeaders },
    ];
  },
};

export default nextConfig;

