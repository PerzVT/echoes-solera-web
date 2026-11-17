import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedMark } from "@/components/labs/fx";
import { Account } from "./Account";
import { FileDrops } from "./FileDrops";
import styles from "./AppShell.module.css";

const rail = [
  { href: "/app", label: "Series", icon: <path d="M4 6.5h6l2 2h8v9.5H4z" /> },
  { href: "/app/cast", label: "Cast", icon: <path d="M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 21v-4q0-5 6-5t6 5v4M17 4q5 2 0 6m1 3q4 0 4 5v3" /> },
  { href: "/app/styles", label: "Styles", icon: <path d="M5 8h9M17 8h2M5 16h2M10 16h9M15.5 6v4M8.5 14v4" /> },
];

type Props = {
  /** Which rail item is current: "/app", "/app/cast" or "/app/styles". Styles is the last item. */
  section: string;
  /** Header text, for example a series name and its episode. */
  title: ReactNode;
  /** The row under the header: the main action and any stepper or filters. */
  bar?: ReactNode;
  /** Files dropped anywhere outside a drop zone. Without it such a drop is swallowed, so the browser never opens the file in place of the page. */
  onFiles?: (files: File[]) => void;
  children: ReactNode;
};

/** The creator app frame: a labelled rail (the skip link in the labs layout leads to the work area), the frame with its folded corner, a header with the signed-in account, an action bar, the work area. */
export function AppShell({ section, title, bar, onFiles, children }: Props) {
  return (
    <div className={styles.shell}>
      <FileDrops onFiles={onFiles} />
      <nav className={styles.rail} aria-label="Creator">
        <Link href="/" className={styles.mark} aria-label="Nine Lives Labs home">
          <AnimatedMark variant="idle" size={32} />
        </Link>
        {rail.map((r) => (
          <Link key={r.href} href={r.href} className={styles.item} aria-current={section === r.href ? "page" : undefined}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {r.icon}
            </svg>
            <span>{r.label}</span>
          </Link>
        ))}
      </nav>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div className={styles.title}>{title}</div>
          <Account />
        </header>
        {bar && <div className={styles.bar}>{bar}</div>}
        <main id="main" tabIndex={-1} className={styles.work}>
          {children}
        </main>
      </div>
    </div>
  );
}
