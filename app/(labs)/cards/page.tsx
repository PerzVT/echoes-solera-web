import type { Metadata } from "next";
import { CardCollection } from "@/components/labs/CardCollection";
import { Nav } from "@/components/labs/Nav";
import t from "@/components/labs/Title.module.css";
import styles from "./cards.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Cards", ...og("Cards", "cards") };

export default function Cards() {
  return (
    <div className={t.page}>
      <Nav />
      <main id="main" className={styles.desk} data-theme="light">
        <CardCollection />
      </main>
    </div>
  );
}
