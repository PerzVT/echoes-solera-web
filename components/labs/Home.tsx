import { Nav } from "./Nav";
import { HomeStages } from "./HomeStages";
import type { Project } from "@/lib/labs/projects";
import styles from "./Home.module.css";

export function Home({ active }: { active: Project }) {
  return (
    <div className={styles.page} data-backdrop="medium">
      <Nav current="/" />
      <HomeStages initial={active.slug} />
    </div>
  );
}
