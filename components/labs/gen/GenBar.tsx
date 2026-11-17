"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatedMark, ChevronIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { useDismiss } from "./hooks";
import g from "./gen.module.css";

export const tools = [
  { href: "/app", label: "Mini-series" },
  { href: "/app/cooking", label: "Cooking videos" },
  { href: "/app/anime", label: "Anime" },
] as const;

type Props = { current: (typeof tools)[number]["href"]; feedId?: string };

/** The slim bar: the mark and the switch between the three creators. On a phone, a link down to the videos. */
export function GenBar({ current, feedId }: Props) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useDismiss(open, panel, () => setOpen(false), button);
  const now = tools.find((t) => t.href === current)!;

  return (
    <header className={g.top}>
      <Link href="/" className={g.mark} aria-label="Nine Lives home">
        <AnimatedMark variant="still" size={26} />
      </Link>
      <nav aria-label="Creators" className={g.segs}>
        {tools.map((t) => (
          <Link key={t.href} href={t.href} className={g.seg} aria-current={t.href === current ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
      <div className={g.toolMenu}>
        <button ref={button} type="button" className={g.switcher} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}>
          {now.label}
          <ChevronIcon open={open} size={16} />
        </button>
        {open && (
          <div ref={panel} className={g.menu}>
            <nav aria-label="Creators">
              {tools.map((t) => (
                <Link key={t.href} href={t.href} className={g.menuItem} aria-current={t.href === current ? "page" : undefined} onClick={() => setOpen(false)}>
                  {t.label}
                  {t.href === current && <Icon name="check" size={16} />}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
      {feedId && (
        <a href={`#${feedId}`} className={g.jump}>
          Videos
        </a>
      )}
    </header>
  );
}
