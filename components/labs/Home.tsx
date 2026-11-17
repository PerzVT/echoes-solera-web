import { HomeStages } from "./HomeStages";
import type { Project } from "@/lib/labs/projects";
import styles from "./Home.module.css";

/** One screen, no page scroll: the header (HomeStages renders it, since it shares the section), the stages and the legal line. */
export function Home({ active }: { active: Project }) {
  return (
    <div className={styles.page} data-backdrop="medium">
      <HomeStages initial={active.slug} />
      <p className={styles.legal}>Retinad Virtual Reality Inc. / Retinad Réalité Virtuelle Inc.</p>
    </div>
  );
}
