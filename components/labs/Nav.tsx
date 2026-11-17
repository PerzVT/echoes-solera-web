"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";
import { AnimatedMark } from "./fx/AnimatedMark";
import { ScrollToCurrent } from "./ScrollToCurrent";
import { projects } from "@/lib/labs/projects";
import styles from "./Nav.module.css";

const under = (path: string, base: string) => path === base || path.startsWith(`${base}/`);

/** The home address of a project's section: the first one is the bare home page. */
export const homeHref = (slug: string) => (slug === projects[0].slug ? "/" : `/?p=${slug}`);

/**
 * The site header: the mark, the nine projects spread across the row and Open app. On home the parent
 * passes the current section and a chooser, so a project link switches the section in place; elsewhere
 * the links go to the project pages and the current one comes from the address. `current` is kept for
 * older callers and no longer used.
 */
export function Nav({
  project,
  onProject,
}: {
  current?: string;
  project?: string;
  onProject?: (slug: string) => void;
}) {
  const path = usePathname() ?? "";
  const here = project ?? projects.find((p) => under(path, `/${p.slug}`))?.slug;
  const choose = (e: MouseEvent<HTMLAnchorElement>, slug: string) => {
    if (!onProject || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onProject(slug);
  };
  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.brand}>
        <AnimatedMark variant="flow" material="06-colour-field" onHover size={36} />
        <span>Nine Lives</span>
      </Link>
      <nav className={styles.links} aria-label="Projects">
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={homeHref(p.slug)}
            scroll={onProject ? false : undefined}
            replace={onProject ? true : undefined}
            onClick={(e) => choose(e, p.slug)}
            aria-current={here === p.slug ? "page" : undefined}
          >
            {p.name}
          </Link>
        ))}
        <ScrollToCurrent current={here ?? ""} />
      </nav>
      <ButtonLink href="/app" variant="secondary" size="small" className={styles.app} iconAfter={<Icon name="arrow" size={16} />}>
        Open app
      </ButtonLink>
    </header>
  );
}
