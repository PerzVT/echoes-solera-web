import { MangaProvider } from "@/components/labs/app/work";

/** The manga tool keeps the manga being made, and the saved ones, across its pages. */
export default function MangaLayout({ children }: { children: React.ReactNode }) {
  return <MangaProvider>{children}</MangaProvider>;
}
