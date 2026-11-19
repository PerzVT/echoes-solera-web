import type { Metadata } from "next";
import { Nav } from "@/components/labs/Nav";
import { og } from "@/lib/labs/og";
import styles from "./page.module.css";

const title = "Solera: First Arrival";

export const metadata: Metadata = { title, ...og(title, "visual-novel") };

/** The story lab's branching adventure, played inside the site: the player is its own document in a frame. */
export default function FirstArrival() {
  return (
    <div className={styles.page}>
      <Nav />
      <main id="main" className={styles.play}>
        <h1 className={styles.title}>{title}</h1>
        <iframe className={styles.frame} src="/story-lab/solera/index.html" title={title} allow="fullscreen; autoplay" allowFullScreen />
      </main>
    </div>
  );
}
