import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedMark } from "@/components/labs/fx";
import { FileDrops } from "./FileDrops";
import styles from "./AppShell.module.css";

type Props = {
  /** The part of the creator: "/app" for series and episodes, "/app/styles" for the style library. */
  section: string;
  /** Header text: the trail from Series down to this page. */
  title: ReactNode;
  /** The left of the row under the header, such as the episode steps. */
  bar?: ReactNode;
  /** The right of that row: the page's own actions. */
  actions?: ReactNode;
  /** Files dropped anywhere outside a drop zone. Without it such a drop is swallowed, so the browser never opens the file in place of the page. */
  onFiles?: (files: File[]) => void;
  children: ReactNode;
};

/** The creator frame: the mark and the trail in the header, an optional row of steps with the actions at its right, then the work area. The skip link in the labs layout leads to the work area. */
export function AppShell({ section, title, bar, actions, onFiles, children }: Props) {
  return (
    <div className={styles.shell}>
      <FileDrops onFiles={onFiles} />
      <div className={styles.frame}>
        <header className={styles.header}>
          <Link href="/" className={styles.mark} aria-label="Nine Lives home">
            <AnimatedMark variant="idle" size={28} />
          </Link>
          <nav className={styles.title} aria-label="Breadcrumb">
            {section.startsWith("/app/styles") && (
              <>
                <Link href="/app" className={styles.crumb}>
                  Series
                </Link>
                <span className={styles.sep} aria-hidden="true">
                  /
                </span>
              </>
            )}
            {title}
          </nav>
        </header>
        {(bar || actions) && (
          <div className={styles.bar}>
            <div className={styles.barStart}>{bar}</div>
            {actions && <div className={styles.barEnd}>{actions}</div>}
          </div>
        )}
        <main id="main" tabIndex={-1} className={styles.work}>
          {children}
        </main>
      </div>
    </div>
  );
}

/** The header trail: each step up is a link followed by a slash; the last item, the page itself, is plain text. */
export function Crumbs({ items }: { items: { label: ReactNode; href?: string }[] }) {
  return (
    <ol className={styles.crumbs}>
      {items.map((x, i) => (
        <li key={i}>
          {x.href ? (
            <Link href={x.href} className={styles.crumb}>
              {x.label}
            </Link>
          ) : (
            <span aria-current="page">{x.label}</span>
          )}
          {i < items.length - 1 && (
            <span className={styles.sep} aria-hidden="true">
              /
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
