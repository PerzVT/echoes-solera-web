"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatedMark } from "./fx/AnimatedMark";
import styles from "./SiteFooter.module.css";

const links = [
  { href: "/", label: "Projects" },
  { href: "/studio", label: "Studio" },
  { href: "/lab", label: "Lab" },
  { href: "/pipeline", label: "Pipeline" },
];

/** Full-screen surfaces that have no page foot: the creator and the visual novel. */
const bare = ["/app", "/visual-novel"];

/** The site foot: the studio's name, the places a visitor can go from anywhere and the company's legal name. */
export function SiteFooter() {
  const path = usePathname();
  // Home is one screen with its own legal line, so it has no foot either.
  if (path === "/" || bare.some((p) => path === p || path.startsWith(`${p}/`))) return null;
  return (
    <footer className={styles.foot}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <AnimatedMark variant="flow" material="06-colour-field" onHover size={28} />
          <span>Nine Lives</span>
        </Link>
        <nav className={styles.links} aria-label="Site">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <p className={styles.line}>Retinad Virtual Reality Inc. / Retinad Réalité Virtuelle Inc.</p>
      </div>
    </footer>
  );
}
