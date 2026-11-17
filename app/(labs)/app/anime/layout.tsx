import { AnimeProvider } from "@/components/labs/board/store";

/** The anime tool keeps its canvases and the anime being made across its pages. */
export default function AnimeLayout({ children }: { children: React.ReactNode }) {
  return <AnimeProvider>{children}</AnimeProvider>;
}
