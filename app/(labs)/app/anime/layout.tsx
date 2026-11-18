import { CastProvider } from "@/components/labs/app/CastProvider";

/** Anime runs the same episode flow as mini-series, with its own series, cast, styles and clips. */
export default function AnimeLayout({ children }: { children: React.ReactNode }) {
  return <CastProvider tool="anime">{children}</CastProvider>;
}
