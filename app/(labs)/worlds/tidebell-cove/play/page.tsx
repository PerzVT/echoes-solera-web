import type { Metadata } from "next";
import { Nav } from "@/components/labs/Nav";
import { og } from "@/lib/labs/og";
import styles from "./play.module.css";

export const metadata: Metadata = { title: "Play Tidebell Cove", ...og("Play Tidebell Cove", "worlds") };

export default function PlayTidebellCove() {
  return (
    <div className={styles.page}>
      <Nav />
      <main id="main" className={styles.play}>
        <h1 className={styles.title}>Tidebell Cove</h1>
        <iframe
          className={styles.frame}
          src="/walk"
          title="Tidebell Cove"
          allow="fullscreen; gamepad"
          allowFullScreen
        />
      </main>
    </div>
  );
}
