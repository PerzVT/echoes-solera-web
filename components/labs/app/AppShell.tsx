import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedMark } from "@/components/labs/fx";
import { FileDrops } from "./FileDrops";
import styles from "./AppShell.module.css";

type Props = {
  /** The part of the creator: "/app" for series and episodes, "/app/styles" for the style library. */
  section: string;
  /** The trail from the section down to this page. The section itself (Series, Styles) is the switch beside the mark, so the header leaves a leading link to it out. */
  title: ReactNode;
  /** After the trail: the episode steps, or the filters of a list. */
  bar?: ReactNode;
  /** At the right of the header: the page's own actions, one of them filled. On a phone they are pinned to the foot of the screen. */
  actions?: ReactNode;
  /** Files dropped anywhere outside a drop zone. Without it such a drop is swallowed, so the browser never opens the file in place of the page. */
  onFiles?: (files: File[]) => void;
  children: ReactNode;
};

/** The creator frame: one header row (the mark, the two sections, the trail, the steps, the actions), then the work area. The skip link in the labs layout leads to the work area. */
export function AppShell({ section, title, bar, actions, onFiles, children }: Props) {
  const inStyles = section.startsWith("/app/styles");
  return (
    <div className={styles.shell}>
      <FileDrops onFiles={onFiles} />
      <div className={styles.frame}>
        <header className={styles.header}>
          <Link href="/" className={styles.mark} aria-label="Nine Lives home">
            <AnimatedMark variant="idle" size={28} />
          </Link>
          <nav className={styles.sections} aria-label="Creator">
            <Link href="/app" className={styles.section} aria-current={inStyles ? undefined : "true"}>
              Series
            </Link>
            <Link href="/app/styles" className={styles.section} aria-current={inStyles ? "true" : undefined}>
              Styles
            </Link>
          </nav>
          <nav className={styles.title} aria-label="Breadcrumb">
            {title}
          </nav>
          {bar && <div className={styles.barStart}>{bar}</div>}
          {actions && <div className={styles.barEnd}>{actions}</div>}
        </header>
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
