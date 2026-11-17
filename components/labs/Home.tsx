import { HomeStages } from "./HomeStages";
import { SiteFooter } from "./SiteFooter";
import { seriesBackdrops } from "./stages/backdrops";
import type { Project } from "@/lib/labs/projects";
import styles from "./Home.module.css";

/** One screen, no page scroll: the header (HomeStages renders it, since it shares the section), the stages and the site foot in one row. */
export function Home({ active }: { active: Project }) {
  return (
    <div className={styles.page} data-backdrop="medium">
      <HomeStages initial={active.slug} backdrops={seriesBackdrops()} />
      <SiteFooter slim />
    </div>
  );
}
