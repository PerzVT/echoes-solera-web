"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Lettering } from "@/app/(labs)/manga/golden-ticket/Lettering";
import { Picture as Image } from "../fx/Picture";
import { Button, ButtonLink } from "../Button";
import { Icon } from "../Icon";
import { AccessSheets } from "../access/AccessSheets";
import type { SheetName } from "../access/sheets";
import { useAccess, useAccessReady } from "../access/store";
import { releaseDay, unlocksIn, useNow } from "../access/timer";
import { isEarly } from "@/lib/labs/series";
import type { MangaPage } from "@/lib/labs/manga/golden-ticket";
import type { ChapterOutline, SeriesOutline } from "@/lib/labs/manga/outline";
import { chapterProgress, chapterState, isOpen, savePage } from "./progress";
import styles from "./reader.module.css";

export type Mode = "spread" | "single" | "scroll";
export type Dir = "ltr" | "rtl";
export type Fit = "width" | "height";
export type ReaderSettings = { mode: Mode; dir: Dir; fit: Fit };

/* ---------- Reader settings: remembered in this browser, one set for every chapter and series. ---------- */

const KEY = "nl-manga-reader-v1";
const MODES: Mode[] = ["spread", "single", "scroll"];
const DIRS: Dir[] = ["ltr", "rtl"];
const FITS: Fit[] = ["width", "height"];
type Stored = { mode: Mode; fit: Fit; dir?: Dir };

let cache: { raw: string | null; value: Stored } | null = null;
const listeners = new Set<() => void>();

/** Wide landscape screens open on a spread, a phone held upright on vertical scroll, anything else on one page. */
function deviceMode(): Mode {
  if (window.matchMedia("(min-width: 900px) and (min-aspect-ratio: 1/1)").matches) return "spread";
  return window.matchMedia("(orientation: portrait)").matches ? "scroll" : "single";
}

function readRaw() {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function settingsSnapshot(): Stored {
  const raw = readRaw();
  if (cache && cache.raw === raw) return cache.value;
  let s: Partial<Stored> = {};
  try {
    s = raw ? (JSON.parse(raw) as Partial<Stored>) : {};
  } catch {
    s = {};
  }
  const value: Stored = {
    mode: MODES.includes(s.mode as Mode) ? (s.mode as Mode) : (cache?.value.mode ?? deviceMode()),
    fit: FITS.includes(s.fit as Fit) ? (s.fit as Fit) : "height",
    dir: DIRS.includes(s.dir as Dir) ? s.dir : undefined,
  };
  cache = { raw, value };
  return value;
}

function listenSettings(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => e.key === KEY && l();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

function saveSetting(patch: Partial<ReaderSettings>) {
  const next = { ...settingsSnapshot(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage is blocked: keep the choice for this visit.
    cache = { raw: readRaw(), value: next };
  }
  listeners.forEach((l) => l());
}

const useStoredSettings = () => useSyncExternalStore(listenSettings, settingsSnapshot, () => null);

const noop = () => () => {};
const useFullscreenEnabled = () =>
  useSyncExternalStore(
    noop,
    () => !!document.fullscreenEnabled,
    () => false,
  );

/* ---------- Layout helpers ---------- */

/** Spread views as 0-based page indices: page 1 alone, then pairs, an odd last page alone. */
function spreads(count: number): number[][] {
  if (count <= 0) return [];
  const out: number[][] = [[0]];
  for (let i = 1; i < count; i += 2) out.push(i + 1 < count ? [i, i + 1] : [i]);
  return out;
}

/** What the browser should pick from srcset: the page's on-screen width in each layout. */
function sizesFor(mode: Mode, fit: Fit) {
  if (mode === "scroll") return fit === "width" ? "min(100vw, 900px)" : "calc((100svh - 120px) * 0.667)";
  if (fit === "width") return mode === "spread" ? "50vw" : "min(100vw, 1100px)";
  return mode === "spread" ? "min(50vw, calc((100svh - 160px) * 0.667))" : "min(100vw, calc((100svh - 160px) * 0.667))";
}

const srcSetOf = (p: MangaPage) => `${p.src} 1024w, ${p.srcLarge} 1536w`;
const pageWords = (view: number[], count: number) =>
  view.length === 2 ? `Pages ${view[0] + 1} and ${view[1] + 1} of ${count}` : `Page ${view[0] + 1} of ${count}`;

/* ---------- The reader ---------- */

type Props = {
  slug: string;
  seriesTitle: string;
  /** The series' composed direction, the reader's default. */
  direction: Dir;
  chapter: { number: number; title: string; cover: string; pages: MangaPage[] };
  outline: SeriesOutline;
  /** 1-based page from the address, or the chapter's end. */
  start: number | "end";
  /** Settings from the address, for this visit only. */
  url: Partial<ReaderSettings>;
  sheet: SheetName | null;
  now: number;
};

export function MangaReader({ slug, seriesTitle, direction, chapter, outline, start, url, sheet: fromUrl, now: serverNow }: Props) {
  const access = useAccess();
  const accessRef = useRef(access);
  useEffect(() => {
    accessRef.current = access;
  });
  const ready = useAccessReady();
  const now = useNow(serverNow);
  const stored = useStoredSettings();
  const fsEnabled = useFullscreenEnabled();

  const pages = chapter.pages;
  const count = pages.length;
  const me = outline.chapters.find((c) => c.number === chapter.number)!;
  const next = outline.chapters.find((c) => c.number === chapter.number + 1);
  const early = isEarly(me, now);
  // An early chapter waits for the browser's subscription state, so a subscriber never sees the lock flash.
  const gate: "pending" | "open" | "locked" | "coming" = count === 0 || me.status !== "available" ? "coming" : !early ? "open" : !ready ? "pending" : isOpen(me, access, now) ? "open" : "locked";

  // Address settings win for this visit; a choice made in the bar is remembered and drops its address value.
  const [override, setOverride] = useState(url);
  const settings: ReaderSettings | null = stored ? { mode: stored.mode, fit: stored.fit, dir: stored.dir ?? direction, ...stripUndefined(override) } : null;
  const hasSettings = !!settings;

  const choose = useCallback((patch: Partial<ReaderSettings>) => {
    saveSetting(patch);
    setOverride((o) => {
      const n = { ...o };
      for (const k of Object.keys(patch) as (keyof ReaderSettings)[]) delete n[k];
      return n;
    });
    const u = new URL(window.location.href);
    for (const k of Object.keys(patch)) u.searchParams.delete(k);
    window.history.replaceState(window.history.state, "", u);
  }, []);

  // The position: the first page on screen, 0-based. `count` is the chapter's end.
  const [pos, setPos] = useState(start === "end" ? count : Math.min(Math.max(0, start - 1), Math.max(0, count - 1)));
  const mode = settings?.mode ?? "single";
  const dir = settings?.dir ?? direction;
  const fit = settings?.fit ?? "height";
  const views = useMemo(() => (mode === "spread" ? spreads(count) : pages.map((_, i) => [i])), [mode, count, pages]);
  const atEnd = pos >= count;
  const viewIndex = atEnd ? views.length : Math.max(0, views.findIndex((v) => v.includes(pos)));
  const view = views[viewIndex];
  const sizes = sizesFor(mode, fit);

  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLElement | null)[]>([]);
  const endRef = useRef<HTMLElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [sheet, setSheet] = useState<SheetName | null>(fromUrl);
  const [menu, setMenu] = useState<"chapters" | "options" | null>(null);

  /* Navigation */
  const scrollToPage = useCallback((i: number) => {
    const el = i >= count ? endRef.current : pageRefs.current[i];
    el?.scrollIntoView({ block: "start" });
  }, [count]);

  const go = useCallback(
    (target: number) => {
      const i = Math.min(Math.max(0, target), views.length);
      const p = i >= views.length ? count : views[i][0];
      setPos(p);
      if (mode === "scroll") {
        scrollToPage(p);
        return;
      }
      // A page taller than the window (fit to width) starts again at its top.
      const top = rootRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) rootRef.current?.scrollIntoView({ block: "start" });
    },
    [views, count, mode, scrollToPage],
  );
  const step = useCallback((d: 1 | -1) => go(viewIndex + d), [go, viewIndex]);
  const forward = dir === "ltr" ? 1 : -1;

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenEnabled) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen().catch(() => {});
  }, []);
  useEffect(() => {
    const on = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  /* The room a page has: the window less the header above the reader, its bar and its scrubber. */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const bar = barRef.current?.offsetHeight ?? 56;
      const above = fullscreen ? 0 : root.getBoundingClientRect().top + window.scrollY;
      const scrub = 64;
      root.style.setProperty("--avail", `${Math.max(320, window.innerHeight - Math.min(above, 160) - bar - scrub)}px`);
      root.style.setProperty("--page-h", `${Math.max(320, window.innerHeight - bar - scrub - 16)}px`);
      root.style.setProperty("--bar-h", `${bar}px`);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [fullscreen, gate]);

  /* Address, progress and preloading follow the position. */
  useEffect(() => {
    if (gate !== "open" || !settings) return;
    const u = new URL(window.location.href);
    const shown = atEnd ? "end" : view ? String(view[0] + 1) : "1";
    if (shown === "1") u.searchParams.delete("p");
    else u.searchParams.set("p", shown);
    if (u.href !== window.location.href) window.history.replaceState(window.history.state, "", u);
    const last = atEnd ? count : view ? view[view.length - 1] + 1 : 1;
    // A chapter once read stays read: paging back through it does not put it in progress again.
    if (last >= count || !chapterProgress(accessRef.current, slug, chapter.number)?.done) savePage(slug, chapter.number, last, count);
    if (mode !== "scroll" && view) {
      // The next two pages, at the size this layout will ask for.
      const after = pages.slice(view[view.length - 1] + 1, view[view.length - 1] + 3);
      for (const p of after) {
        const img = new window.Image();
        img.decoding = "async";
        img.sizes = sizes;
        img.srcset = srcSetOf(p);
        img.src = p.src;
      }
    }
    // settings is a fresh object every render; its parts are listed instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, viewIndex, mode, gate, hasSettings, sizes]);

  /* Vertical scroll: the page crossing the upper middle of the window is the current one. */
  useEffect(() => {
    if (mode !== "scroll" || gate !== "open" || !settings) return;
    const els = [...pageRefs.current.slice(0, count), endRef.current].filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = els.indexOf(e.target as HTMLElement);
          if (i >= 0) setPos(i);
        }
      },
      { rootMargin: "-40% 0px -59% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, gate, hasSettings, count]);

  // Entering vertical scroll (or opening on a page in it) puts that page at the top.
  const scrolledFor = useRef<string>("");
  useLayoutEffect(() => {
    if (mode !== "scroll" || gate !== "open" || !settings) {
      scrolledFor.current = "";
      return;
    }
    if (scrolledFor.current) return;
    scrolledFor.current = "done";
    if (pos > 0) scrollToPage(pos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, gate, hasSettings]);

  /* Keyboard: arrows and space in the reading direction, Home and End, F for full screen. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (document.querySelector("dialog[open]")) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
        return;
      }
      if (gate !== "open" || !hasSettings || menu) return;
      const onControl = !!t?.closest("button, a");
      let d: 1 | -1 | 0 = 0;
      if (e.key === "ArrowRight") d = forward as 1 | -1;
      else if (e.key === "ArrowLeft") d = -forward as 1 | -1;
      else if (mode !== "scroll" && (e.key === "PageDown" || (e.key === " " && !onControl))) d = e.shiftKey ? -1 : 1;
      else if (mode !== "scroll" && e.key === "PageUp") d = -1;
      if (d) {
        e.preventDefault();
        step(d);
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(views.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gate, hasSettings, menu, forward, mode, step, go, views.length, toggleFullscreen]);

  /* Swipe on touch: a mostly horizontal stroke turns the page the way a finger turns paper. */
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const swiped = useRef(0);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" || mode === "scroll") return;
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    swiped.current = Date.now();
    // A stroke to the left brings the page from the right: forward when reading left to right.
    step((dx < 0 ? forward : -forward) as 1 | -1);
  };
  // Click or tap zones: the outer third of the stage on each side turns the page; the middle does nothing.
  // A press that ends a text selection, or lands on a control, is left alone, so the lettering stays selectable.
  const onStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Date.now() - swiped.current < 450) return;
    if ((e.target as HTMLElement).closest("a, button, input")) return;
    if (window.getSelection()?.toString()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const side = x < 1 / 3 ? "left" : x > 2 / 3 ? "right" : null;
    if (!side) return;
    const d = (side === "left") === (dir === "ltr") ? -1 : 1;
    if (atEnd && d === 1) return;
    step(d);
  };
  const onStageMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const side = x < 1 / 3 ? "left" : x > 2 / 3 ? "right" : "";
    if (e.currentTarget.dataset.hover !== side) e.currentTarget.dataset.hover = side;
  };

  const closeSheet = useCallback(() => {
    setSheet(null);
    const u = new URL(window.location.href);
    if (u.searchParams.has("state")) {
      u.searchParams.delete("state");
      window.history.replaceState(window.history.state, "", u);
    }
  }, []);

  const heading = `${seriesTitle}, chapter ${chapter.number}: ${chapter.title}`;
  const paged = mode !== "scroll";

  return (
    <>
      <div ref={rootRef} className={styles.root} data-mode={mode} data-fit={fit} data-dir={dir} data-fullscreen={fullscreen || undefined}>
        <h1 className="sr-only">{heading}</h1>
        <div ref={barRef} className={styles.bar}>
          <ChapterMenu
            slug={slug}
            seriesTitle={seriesTitle}
            current={chapter.number}
            outline={outline}
            now={now}
            open={menu === "chapters"}
            onOpen={(o) => setMenu(o ? "chapters" : null)}
          />
          {gate === "open" && settings && (
            <>
              <div className={styles.options}>
                <Options settings={settings} onChange={choose} />
              </div>
              <OptionsMenu settings={settings} onChange={choose} open={menu === "options"} onOpen={(o) => setMenu(o ? "options" : null)} />
            </>
          )}
          {fsEnabled && (
            <button type="button" className={styles.iconButton} onClick={toggleFullscreen} aria-pressed={fullscreen} aria-label={fullscreen ? "Leave full screen" : "Full screen"} title="Full screen (F)">
              <Icon name={fullscreen ? "shrink" : "fullscreen"} size={20} />
            </button>
          )}
        </div>

        {gate === "pending" || (gate === "open" && !settings) ? (
          <div className={styles.stage} data-pending aria-busy="true" />
        ) : gate === "locked" ? (
          <Gate cover={me.cover} title={`Chapter ${me.number}: ${me.title}`} headingLevel={2}>
            <span className={styles.lockMark}>
              <Icon name="lock" size={24} />
            </span>
            <p className={styles.gateTime}>{unlocksIn(me, now)}</p>
            <p className={styles.gateMeta}>{releaseDay(me)}</p>
            <Button onClick={() => setSheet("subscribe")}>Subscribe</Button>
            <button type="button" className={styles.textButton} onClick={() => setSheet("how")}>
              How early access works
            </button>
          </Gate>
        ) : gate === "coming" ? (
          <Gate cover={me.cover} title={`Chapter ${me.number}: ${me.title}`} headingLevel={2}>
            <p className={styles.gateTime}>Out {releaseDay(me)}</p>
            <p className={styles.gateMeta}>{unlocksIn(me, now)}</p>
            <LatestOpen slug={slug} outline={outline} before={me.number} now={now} />
          </Gate>
        ) : paged ? (
          <>
            <div
              className={styles.stage}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => (swipe.current = null)}
              onPointerMove={onStageMove}
              onClick={onStageClick}
              aria-roledescription="page viewer"
              aria-label={heading}
              role="region"
            >
              {atEnd ? (
                <EndCard slug={slug} next={next} access={access} now={now} onSheet={setSheet} endRef={endRef} />
              ) : (
                <div className={styles.view} data-spread={mode === "spread" || undefined}>
                  {view.map((i, k) => (
                    <Sheet
                      key={`${chapter.number}-${i}`}
                      page={pages[i]}
                      index={i}
                      sizes={sizes}
                      eager
                      col={mode !== "spread" ? undefined : view.length === 2 ? ((k === 0) === (dir === "ltr") ? 1 : 2) : i === 0 ? (dir === "ltr" ? 2 : 1) : dir === "ltr" ? 1 : 2}
                    />
                  ))}
                </div>
              )}
            </div>
            <Scrubber views={views} viewIndex={viewIndex} count={count} dir={dir} atEnd={atEnd} onGo={go} />
          </>
        ) : (
          <>
            <ol className={styles.scroll} aria-label={heading}>
              {pages.map((p, i) => (
                <li key={i} ref={(el) => void (pageRefs.current[i] = el)} className={styles.scrollItem}>
                  <Sheet page={p} index={i} sizes={sizes} eager={Math.abs(i - pos) <= 1} />
                </li>
              ))}
            </ol>
            <Scrubber views={views} viewIndex={viewIndex} count={count} dir={dir} atEnd={atEnd} onGo={go} sticky />
            <EndCard slug={slug} next={next} access={access} now={now} onSheet={setSheet} endRef={endRef} />
          </>
        )}
        <p className="sr-only" aria-live="polite">
          {gate === "open" && settings ? (atEnd ? "End of the chapter" : view ? pageWords(view, count) : "") : ""}
        </p>
      </div>
      <AccessSheets sheet={sheet} onChange={setSheet} onClose={closeSheet} />
    </>
  );
}

function stripUndefined<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/* ---------- A page with its live lettering ---------- */

function Sheet({ page, index, sizes, eager, col }: { page: MangaPage; index: number; sizes: string; eager: boolean; col?: 1 | 2 }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className={styles.sheet} data-col={col} data-loaded={loaded || undefined}>
      {/* The two exports through srcset, not the image optimiser: the reader decides what loads and when. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
        }}
        className={styles.img}
        src={page.src}
        srcSet={srcSetOf(page)}
        sizes={sizes}
        width={1024}
        height={1536}
        alt={`Page ${index + 1}. ${page.alt}`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        draggable={false}
      />
      <Lettering letters={page.letters} />
    </figure>
  );
}

/* ---------- The scrubber: position in the chapter, draggable ---------- */

function Scrubber({ views, viewIndex, count, dir, atEnd, onGo, sticky }: { views: number[][]; viewIndex: number; count: number; dir: Dir; atEnd: boolean; onGo: (i: number) => void; sticky?: boolean }) {
  const v = views[Math.min(viewIndex, views.length - 1)];
  const label = atEnd ? "End" : v.length === 2 ? `${v[0] + 1}–${v[1] + 1} of ${count}` : `${v[0] + 1} of ${count}`;
  const back = (
    <button type="button" className={styles.iconButton} onClick={() => onGo(viewIndex - 1)} disabled={viewIndex <= 0} aria-label="Previous page">
      <Icon name={dir === "ltr" ? "back" : "arrow"} size={20} />
    </button>
  );
  const on = (
    <button type="button" className={styles.iconButton} onClick={() => onGo(viewIndex + 1)} disabled={atEnd} aria-label={viewIndex === views.length - 1 ? "Chapter end" : "Next page"}>
      <Icon name={dir === "ltr" ? "arrow" : "back"} size={20} />
    </button>
  );
  return (
    <div className={styles.scrub} data-sticky={sticky || undefined}>
      {dir === "ltr" ? back : on}
      <input
        type="range"
        className={styles.range}
        min={0}
        max={views.length - 1}
        step={1}
        value={Math.min(viewIndex, views.length - 1)}
        onChange={(e) => onGo(Number(e.currentTarget.value))}
        dir={dir}
        aria-label="Page"
        aria-valuetext={atEnd ? "End of the chapter" : pageWords(v, count)}
        style={{ "--fill": `${views.length > 1 ? (Math.min(viewIndex, views.length - 1) / (views.length - 1)) * 100 : 100}%` } as React.CSSProperties}
      />
      {dir === "ltr" ? on : back}
      <span className={styles.scrubLabel} aria-hidden="true">
        {label}
      </span>
    </div>
  );
}

/* ---------- Bar controls ---------- */

const MODE_LABEL: Record<Mode, string> = { spread: "Spread", single: "Single", scroll: "Scroll" };
const DIR_LABEL: Record<Dir, string> = { ltr: "Left to right", rtl: "Right to left" };
const FIT_LABEL: Record<Fit, string> = { width: "Fit width", height: "Fit height" };

function Segmented<T extends string>({ name, label, value, options, labels, onChange }: { name: string; label: string; value: T; options: T[]; labels: Record<T, string>; onChange: (v: T) => void }) {
  return (
    <div className={styles.segmented} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        // A choice made with a pointer hands the keys back to the reader, so the next arrow turns a page
        // instead of moving the radio selection.
        <label key={o} className={styles.segment} data-on={o === value || undefined} onPointerUp={() => requestAnimationFrame(() => (document.activeElement as HTMLElement | null)?.blur())}>
          <input type="radio" name={name} value={o} checked={o === value} onChange={() => onChange(o)} />
          <span>{labels[o]}</span>
        </label>
      ))}
    </div>
  );
}

function Options({ settings, onChange, idPrefix = "bar", showLabels = false }: { settings: ReaderSettings; onChange: (p: Partial<ReaderSettings>) => void; idPrefix?: string; showLabels?: boolean }) {
  const group = (label: string, control: ReactNode) =>
    showLabels ? (
      <div className={styles.optionGroup}>
        <span className={styles.optionLabel}>{label}</span>
        {control}
      </div>
    ) : (
      control
    );
  return (
    <>
      {group("Mode", <Segmented name={`${idPrefix}-mode`} label="Reading mode" value={settings.mode} options={MODES} labels={MODE_LABEL} onChange={(mode) => onChange({ mode })} />)}
      {group("Direction", <Segmented name={`${idPrefix}-dir`} label="Reading direction" value={settings.dir} options={DIRS} labels={DIR_LABEL} onChange={(dir) => onChange({ dir })} />)}
      {group("Fit", <Segmented name={`${idPrefix}-fit`} label="Page fit" value={settings.fit} options={FITS} labels={FIT_LABEL} onChange={(fit) => onChange({ fit })} />)}
    </>
  );
}

/** A panel under the bar that closes on Escape, on a press outside and when focus leaves it. */
function usePanel(open: boolean, onOpen: (o: boolean) => void) {
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const panel = wrap.current?.querySelector<HTMLElement>("[data-panel]");
    (panel?.querySelector<HTMLElement>("[aria-current='page'], input:checked, a, button") ?? panel)?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) onOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      onOpen(false);
      button.current?.focus({ preventScroll: true });
    };
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Node && !wrap.current?.contains(e.target)) onOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open, onOpen]);
  return { wrap, button };
}

function OptionsMenu({ settings, onChange, open, onOpen }: { settings: ReaderSettings; onChange: (p: Partial<ReaderSettings>) => void; open: boolean; onOpen: (o: boolean) => void }) {
  const { wrap, button } = usePanel(open, onOpen);
  return (
    <div ref={wrap} className={styles.optionsMenu}>
      <button ref={button} type="button" className={styles.iconButton} aria-expanded={open} aria-controls="reader-options" aria-label="Reading options" onClick={() => onOpen(!open)}>
        <Icon name="settings" size={20} />
      </button>
      {open && (
        <div id="reader-options" className={`${styles.panel} ${styles.panelEnd}`} data-panel tabIndex={-1} role="group" aria-label="Reading options">
          <Options settings={settings} onChange={onChange} idPrefix="menu" showLabels />
        </div>
      )}
    </div>
  );
}

function ChapterMenu({ slug, seriesTitle, current, outline, now, open, onOpen }: { slug: string; seriesTitle: string; current: number; outline: SeriesOutline; now: number; open: boolean; onOpen: (o: boolean) => void }) {
  const { wrap, button } = usePanel(open, onOpen);
  const access = useAccess();
  const me = outline.chapters.find((c) => c.number === current)!;
  return (
    <div ref={wrap} className={styles.chapterMenu}>
      <button ref={button} type="button" className={styles.chapterButton} aria-expanded={open} aria-controls="reader-chapters" onClick={() => onOpen(!open)}>
        <span className={styles.chapterNumber}>{String(me.number).padStart(2, "0")}</span>
        <span className={styles.chapterTitle}>{me.title}</span>
        <Icon name="down" size={18} />
      </button>
      {open && (
        <div id="reader-chapters" className={styles.panel} data-panel tabIndex={-1}>
          <Link href={`/manga/${slug}`} className={styles.panelTitle} onClick={() => onOpen(false)}>
            {seriesTitle}
          </Link>
          <ol className={styles.chapterList}>
            {outline.chapters.map((c) => {
              const state = chapterState(c, access, slug, now);
              const meta = state === "locked" ? unlocksIn(c, now) : state === "coming" ? `Out ${releaseDay(c)}` : state === "read" ? "Read" : state === "reading" ? "In progress" : `${c.pageCount} pages`;
              return (
                <li key={c.number}>
                  <Link href={`/manga/${slug}/${c.number}`} className={styles.chapterRow} aria-current={c.number === current ? "page" : undefined} data-state={state} onClick={() => onOpen(false)}>
                    <Image src={c.thumb} alt="" width={480} height={720} sizes="40px" className={styles.rowThumb} />
                    <span className={styles.rowText}>
                      <span className={styles.rowTitle}>
                        {String(c.number).padStart(2, "0")} {c.title}
                      </span>
                      <span className={styles.rowMeta}>{meta}</span>
                    </span>
                    {(state === "locked" || state === "read") && <Icon name={state === "locked" ? "lock" : "check"} size={16} />}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ---------- Lock, announcement and chapter end ---------- */

function Gate({ cover, title, headingLevel, children }: { cover: string; title: string; headingLevel: 2 | 3; children: ReactNode }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <section className={styles.gate}>
      <Image className={styles.gateCover} src={cover} alt="" width={1024} height={1536} sizes="(max-width: 720px) 52vw, 260px" loading="eager" />
      <div className={styles.gateBody}>
        <H className="h2">{title}</H>
        {children}
      </div>
    </section>
  );
}

function LatestOpen({ slug, outline, before, now }: { slug: string; outline: SeriesOutline; before: number; now: number }) {
  const access = useAccess();
  const latest = [...outline.chapters].reverse().find((c) => c.number < before && isOpen(c, access, now));
  if (!latest) return null;
  return <ButtonLink href={`/manga/${slug}/${latest.number}`}>Read chapter {latest.number}</ButtonLink>;
}

function EndCard({
  slug,
  next,
  access,
  now,
  onSheet,
  endRef,
}: {
  slug: string;
  next: ChapterOutline | undefined;
  access: ReturnType<typeof useAccess>;
  now: number;
  onSheet: (s: SheetName) => void;
  endRef: React.RefObject<HTMLElement | null>;
}) {
  if (!next) {
    return (
      <section ref={endRef} className={styles.end}>
        <ButtonLink href={`/manga/${slug}`}>All chapters</ButtonLink>
      </section>
    );
  }
  const state = chapterState(next, access, slug, now);
  return (
    <section ref={endRef} className={styles.end}>
      <Gate cover={next.cover} title={`Chapter ${next.number}: ${next.title}`} headingLevel={2}>
        {state === "coming" ? (
          <>
            <p className={styles.gateTime}>Out {releaseDay(next)}</p>
            <p className={styles.gateMeta}>{unlocksIn(next, now)}</p>
            <ButtonLink href={`/manga/${slug}`} variant="secondary">
              All chapters
            </ButtonLink>
          </>
        ) : state === "locked" ? (
          <>
            <p className={styles.gateTime}>
              <Icon name="lock" size={18} /> {unlocksIn(next, now)}
            </p>
            <p className={styles.gateMeta}>{releaseDay(next)}</p>
            <Button onClick={() => onSheet("subscribe")}>Subscribe</Button>
            <button type="button" className={styles.textButton} onClick={() => onSheet("how")}>
              How early access works
            </button>
          </>
        ) : (
          <ButtonLink href={`/manga/${slug}/${next.number}`}>Read chapter {next.number}</ButtonLink>
        )}
      </Gate>
    </section>
  );
}
