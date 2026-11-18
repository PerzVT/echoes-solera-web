import Link from "next/link";
import type { ReactNode } from "react";
import st from "./StartScreen.module.css";

/** Every tool the creator makes with, as the start screens offer them. */
export const CREATOR_TOOLS = [
  { key: "mini-series", label: "Mini-series", href: "/app" },
  { key: "anime", label: "Anime", href: "/app/anime" },
  { key: "cooking", label: "Cooking", href: "/app/cooking" },
  { key: "storyboard", label: "Storyboard", href: "/app/storyboard" },
  { key: "manga", label: "Manga", href: "/app/manga" },
] as const;
export type CreatorTool = (typeof CREATOR_TOOLS)[number]["key"];

/** A start screen: the question, the tools under it, then the tool's prompt box. */
export function StartScreen({ tool, children }: { tool: CreatorTool; children: ReactNode }) {
  return (
    <div className={st.page}>
      <h1 className={st.title}>What do you want to make?</h1>
      <nav aria-label="Make" className={st.tools}>
        <ul className={st.row}>
          {CREATOR_TOOLS.map((t) => (
            <li key={t.key}>
              <Link href={t.href} className={st.tool} aria-current={t.key === tool ? "page" : undefined}>
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {children}
    </div>
  );
}
