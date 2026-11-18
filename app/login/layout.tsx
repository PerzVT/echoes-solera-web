import { preload } from "react-dom";

/** The old portal's display face, preloaded only on the old portal's pages. */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  preload("/shared/fonts/cinzel-latin-cc014fcb.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return children;
}
