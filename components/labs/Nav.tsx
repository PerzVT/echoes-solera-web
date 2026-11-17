"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";
import { AnimatedMark } from "./fx/AnimatedMark";
import { ProjectsMenu } from "./ProjectsMenu";
import styles from "./Nav.module.css";

const links = [
  { href: "/studio", label: "Studio" },
  { href: "/lab", label: "Lab" },
];

/** Project pages mark Projects as current; the pipeline sits under Lab. */
const projectPaths = ["/mini-series", "/anime", "/cooking", "/worlds", "/cards", "/manga", "/visual-novel", "/game-ads", "/shop"];
const under = (path: string, base: string) => path === base || path.startsWith(`${base}/`);

function currentFor(path: string): string | undefined {
  if (path === "/" || projectPaths.some((p) => under(path, p))) return "/";
  if (under(path, "/studio")) return "/studio";
  if (under(path, "/lab") || under(path, "/pipeline")) return "/lab";
  return undefined;
}

export function Nav({ current }: { current?: string }) {
  const path = usePathname() ?? "";
  const here = current ?? currentFor(path);
  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.brand}>
        <AnimatedMark variant="flow" material="06-colour-field" onHover size={36} />
        <span>Nine Lives</span>
      </Link>
      <nav className={styles.links} aria-label="Main">
        <ProjectsMenu className={styles.menu} current={here === "/"} />
        {links.map((l) => (
          <Link key={l.href} href={l.href} aria-current={here === l.href ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className={styles.spacer} />
      <ButtonLink href="/app" variant="secondary" size="small" iconAfter={<Icon name="arrow" size={16} />}>
        Open app
      </ButtonLink>
    </header>
  );
}
