"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";
import { AnimatedMark } from "./fx/AnimatedMark";
import { ScrollToCurrent } from "./ScrollToCurrent";
import { projects } from "@/lib/labs/projects";
import styles from "./Nav.module.css";

const under = (path: string, base: string) => path === base || path.startsWith(`${base}/`);

/** The home address of a project's section: the first one is the bare home page. */
export const homeHref = (slug: string) => (slug === projects[0].slug ? "/" : `/?p=${slug}`);

type PillBox = { x: number; w: number; h: number; animate: boolean };
const MIN_PILL_PAD = 15;

/**
 * The site header: the mark, the nine projects in a dock centred between the mark and Open app, and Open
 * app. The current project wears a cream rounded pill on the control radius; the others are plain text.
 * On home the parent passes the current section and a chooser, so a project link switches the section in
 * place and the pill slides to it; elsewhere the links go to the project pages and the current one comes
 * from the address. `current` is kept for older callers and no longer used.
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

  // One pill sits under the current link and slides to the next; without script each current link fills
  // itself (Nav.module.css), so the look is the same before hydration.
  const row = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<PillBox | null>(null);
  const measure = useCallback((animate: boolean) => {
    const link = row.current?.querySelector<HTMLElement>('a[aria-current="page"]');
    if (!link) return setPill(null);
    // Where the padding is at its least (narrow windows), the pill reaches a little past the link so the
    // word keeps clear of the corners.
    const spread = Math.max(0, MIN_PILL_PAD - parseFloat(getComputedStyle(link).paddingLeft));
    setPill({ x: link.offsetLeft - spread, w: link.offsetWidth + 2 * spread, h: link.offsetHeight, animate });
  }, []);
  const measured = useRef(false);
  useLayoutEffect(() => {
    measure(measured.current);
    measured.current = true;
  }, [here, measure]);
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure(false));
    el.querySelectorAll("a").forEach((a) => ro.observe(a));
    return () => ro.disconnect();
  }, [measure]);

  // Three parts, so the slide is all transforms: two rounded end caps that move and a middle that stretches.
  // A cap is as wide as the control radius (12px, labs.css), so the stretch never bends a corner.
  const cap = pill ? 12 : 0;
  const pillVars = pill
    ? ({
        "--px": `${pill.x}px`,
        "--pw": `${pill.w}px`,
        "--ph": `${pill.h}px`,
        "--cap": `${cap}px`,
        "--mid": ((pill.w - 2 * cap + 2) / 100).toFixed(4),
      } as React.CSSProperties)
    : undefined;

  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.brand}>
        <AnimatedMark variant="flow" material="06-colour-field" onHover size={36} />
        <span>Nine Lives</span>
      </Link>
      <div className={styles.middle}>
        <nav ref={row} className={styles.links} aria-label="Projects" data-pill={pill ? "on" : undefined}>
          {pill && (
            <span className={styles.pill} style={pillVars} data-animate={pill.animate} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          )}
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
      </div>
      <ButtonLink href="/app" variant="secondary" size="small" className={styles.app} iconAfter={<Icon name="arrow" size={16} />}>
        Open app
      </ButtonLink>
    </header>
  );
}
