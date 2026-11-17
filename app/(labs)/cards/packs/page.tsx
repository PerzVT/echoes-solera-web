import type { Metadata } from "next";
import { BackLink } from "@/components/labs/BackLink";
import { Nav } from "@/components/labs/Nav";
import { PackOpening } from "@/components/labs/PackOpening";
import t from "@/components/labs/Title.module.css";
import styles from "../cards.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Open a pack", ...og("Open a pack", "cards") };

export default function Packs() {
  return (
    <div className={t.page} data-backdrop="medium">
      <Nav />
      <BackLink row href="/cards">
        Collection
      </BackLink>
      <main id="main" className={`${styles.desk} ${styles.packs}`}>
        <PackOpening />
        <p className={styles.note}>Concept packs and concept cards. The cards you open are not kept.</p>
      </main>
    </div>
  );
}
