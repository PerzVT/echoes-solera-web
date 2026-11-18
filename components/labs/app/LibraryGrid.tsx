"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { AnimatedMark, Skeleton } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { IconBtn } from "@/components/labs/chat/ui";
import { useDismiss } from "@/components/labs/chat/hooks";
import { AppIcon } from "./AppIcon";
import { Alert } from "./parts";
import l from "./LibraryGrid.module.css";

/** The shape of a tool's work: "wide" for frames and series, "page" for manga pages, "clip" for 9:16 videos. */
export type CardShape = "wide" | "page" | "clip";

export type LibraryItem = {
  id: string;
  title: string;
  /** When it was made, as an ISO time. Built-in work has none and shows `meta` alone. */
  date?: string | null;
  /** A short second fact after the date: a series name, a chef. */
  meta?: string | null;
  /** Pictures of the work in the order to try them: when one fails to load, the next is shown. */
  covers?: string[];
  /** Drawn art in place of a picture, such as a manga page with its lettering. */
  art?: ReactNode;
  href?: string;
  onOpen?: () => void;
  busy?: boolean;
  menu?: { label: string; run: () => void }[];
  /** A field in place of the name, such as a rename in progress. The card then does not open. */
  editing?: ReactNode;
};

const RATIO: Record<CardShape, string> = { wide: "16 / 9", page: "2 / 3", clip: "9 / 16" };

/** "18 Nov 2026". */
export const cardDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

/** A card's "more" button and its menu. */
function More({ label, items }: { label: string; items: { label: string; run: () => void }[] }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useDismiss(open, panel, () => setOpen(false), button);
  return (
    <span className={l.more}>
      <IconBtn ref={button} label={label} aria-expanded={open} onClick={() => setOpen(!open)}>
        <AppIcon name="more" size={20} />
      </IconBtn>
      {open && (
        <ul ref={panel} className={l.menu}>
          {items.map((it) => (
            <li key={it.label}>
              <button
                type="button"
                className={l.menuItem}
                onClick={() => {
                  setOpen(false);
                  it.run();
                }}
              >
                {it.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

/** A picture that falls back to the next cover when it cannot be loaded. */
function Cover({ covers, eager, sizes }: { covers: string[]; eager: boolean; sizes: string }) {
  const [at, setAt] = useState(0);
  const src = covers[at];
  if (!src) return null;
  return <Image key={src} src={src} alt="" fill sizes={sizes} loading={eager ? "eager" : undefined} onError={() => setAt((n) => n + 1)} />;
}

/**
 * One card, the same in every tool's Library: the work's picture at the shape it was made in, its name, and the
 * date it was made. The picture opens it; the menu beside the name holds the rest.
 */
function Card({ it, shape, index }: { it: LibraryItem; shape: CardShape; index: number }) {
  const art = (
    <span className={l.art} data-shape={shape} aria-hidden="true">
      {it.art ?? <Cover covers={it.covers ?? []} eager={index < 6} sizes={shape === "wide" ? "(max-width: 767px) 100vw, 33vw" : "(max-width: 767px) 50vw, 240px"} />}
      {it.busy && (
        <span className={l.busy}>
          <AnimatedMark variant="busy" size={20} />
        </span>
      )}
    </span>
  );
  const date = it.date ? cardDate(it.date) : null;
  const meta = [date, it.meta].filter(Boolean).join(" · ");
  const body = (
    <>
      {art}
      <span className={l.text}>
        <span className={l.name}>{it.title}</span>
        {meta && <span className={l.meta}>{meta}</span>}
      </span>
    </>
  );
  if (it.editing)
    return (
      <li className={l.item}>
        <div className={l.card}>
          {art}
          <span className={l.text}>{it.editing}</span>
        </div>
      </li>
    );
  return (
    <li className={l.item}>
      {it.href ? (
        <Link href={it.href} className={l.card} aria-busy={it.busy || undefined} onClick={it.onOpen}>
          {body}
        </Link>
      ) : (
        <button type="button" className={l.card} aria-busy={it.busy || undefined} onClick={it.onOpen}>
          {body}
        </button>
      )}
      {it.menu && it.menu.length > 0 && <More label={`More for ${it.title}`} items={it.menu} />}
    </li>
  );
}

/** A tool's Library: its heading and the cards, newest first as given, or a quiet skeleton while they load. */
export function LibraryGrid({ title = "Library", shape, items, loading, error, empty }: { title?: string; shape: CardShape; items: LibraryItem[]; loading?: boolean; error?: string; empty?: ReactNode }) {
  return (
    <div className={l.page}>
      <h1 className={l.title}>{title}</h1>
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <ul className={l.grid} data-shape={shape} aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className={l.item}>
              <Skeleton ratio={RATIO[shape]} radius={16} index={i} />
              <Skeleton width="60%" height={18} radius={6} index={i} />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        empty
      ) : (
        <ul className={l.grid} data-shape={shape}>
          {items.map((it, i) => (
            <Card key={it.id} it={it} shape={shape} index={i} />
          ))}
        </ul>
      )}
    </div>
  );
}

/** The skeleton of a Library while its route loads: the same heading and grid as LibraryGrid. */
export function LibraryGridSkeleton({ shape }: { shape: CardShape }) {
  return <LibraryGrid shape={shape} items={[]} loading />;
}
