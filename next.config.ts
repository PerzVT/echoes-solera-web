import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 86400, qualities: [75, 90] },
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

