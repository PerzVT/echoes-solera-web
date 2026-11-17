import type { Metadata } from "next";
import { Nav } from "@/components/labs/Nav";
import { PackOpening } from "@/components/labs/PackOpening";
import t from "@/components/labs/Title.module.css";
import styles from "../cards.module.css";
import p from "./packs.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Open a pack", ...og("Open a pack", "cards") };

export default function Packs() {
  return (
    <div className={`${t.page} ${p.page}`} data-backdrop="medium">
      <Nav />
      <main id="main" className={`${styles.desk} ${styles.packs} ${p.desk}`}>
        <PackOpening />
      </main>
    </div>
  );
}
