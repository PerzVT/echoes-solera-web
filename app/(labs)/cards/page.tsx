import type { Metadata } from "next";
import Link from "next/link";
import { CardCollection } from "@/components/labs/CardCollection";
import { Icon } from "@/components/labs/Icon";
import { BackLink } from "@/components/labs/BackLink";
import { Nav } from "@/components/labs/Nav";
import t from "@/components/labs/Title.module.css";
import styles from "./cards.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Cards", ...og("Cards", "cards") };

export default function Cards() {
  return (
    <div className={t.page}>
      <Nav />
      <BackLink row href="/?p=cards">
        Cards
      </BackLink>
      <main id="main" className={styles.desk} data-theme="light">
        <CardCollection />
        <p className={styles.note}>Concept cards. They have no rarity or game rules yet.</p>
      </main>
    </div>
  );
}
