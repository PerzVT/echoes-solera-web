import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    const catalogHeaders = [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ];
    return [
      { source: "/studio/styles-7c9e4a2b", headers: catalogHeaders },
      { source: "/style-library/:path*", headers: catalogHeaders },
    ];
  },
};

export default nextConfig;
