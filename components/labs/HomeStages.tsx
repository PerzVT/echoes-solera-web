"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { ButtonLink } from "./Button";
import { Card } from "./Card";
import { CoverCarousel } from "./CoverCarousel";
import { HeroVideo } from "./HeroVideo";
import { ScrollToCurrent } from "./ScrollToCurrent";
import { cards } from "@/lib/labs/cards";
import { projectBySlug, projects, type Project } from "@/lib/labs/projects";
import styles from "./Home.module.css";

/** Idle time where the browser offers it (not Safari), a plain timeout where it does not. */
const hasIdle = () => typeof window.requestIdleCallback === "function";
const onIdle = (fn: () => void, timeout: number) => (hasIdle() ? window.requestIdleCallback(fn, { timeout }) : window.setTimeout(fn, timeout / 2));
const offIdle = (id: number) => (hasIdle() ? window.cancelIdleCallback(id) : clearTimeout(id));

const hrefOf = (slug: string) => (slug === projects[0].slug ? "/" : `/?p=${slug}`);

function Stage({ project, active, media }: { project: Project; active: boolean; media: boolean }) {
  const eager = active ? "eager" : "lazy";
  const wide = "(max-width: 900px) 200vw, 100vw";
  return (
    <section
      className={styles.stage}
      data-active={active}
      data-theme={project.tone === "light" ? "light" : undefined}
      data-covers={project.covers ? "" : undefined}
      aria-hidden={!active}
      inert={!active}
      style={project.backdrop ? { background: project.backdrop } : undefined}
    >
      {media && project.wall && <Wall wall={project.wall} eager={active} />}
      {media && project.video && project.poster && <HeroVideo src={project.video} poster={project.poster} active={active} />}
      {media && project.bg && <Image className={styles.layer} src={project.bg} alt="" fill sizes={wide} priority={active} />}
      {media && project.cast && <Image bare className={`${styles.layer} ${styles.cast}`} src={project.cast} alt="" fill sizes={wide} priority={active} />}
      {media && project.figures?.map((f) => (
        <img
          key={f.src}
          className={styles.figure}
          src={f.src}
          alt={f.alt ?? ""}
          loading={eager}
          style={{ right: f.right, height: f.height, bottom: f.bottom ?? 0 }}
        />
      ))}
      {media && project.fan && (
        <div className={styles.fan} data-kind={project.fan.kind}>
          {project.fan.items.map((it, i) => {
            const vars = { "--i": i, "--n": project.fan!.items.length } as React.CSSProperties;
            const card = project.fan!.kind === "cards" && cards.find((c) => c.art === it.src);
            return card ? (
              <span key={it.src} className={styles.fanCard} style={vars}>
                <Card card={card} sizes="(max-width: 900px) 40vw, 22vw" />
              </span>
            ) : (
              <Image key={it.src} src={it.src} alt={it.alt} width={it.width ?? 640} height={it.height ?? 960} sizes="(max-width: 900px) 60vw, 34vw" loading={eager} style={vars} />
            );
          })}
        </div>
      )}
      {/* The art is one 1680 px file with transparency, served as is: it is already sized for the stage. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {media && project.art && <img className={styles.art} src={project.art} alt="" loading={eager} fetchPriority={active ? "high" : "auto"} decoding="async" />}
      {project.tone === "dark" && <div className={styles.fade} />}

      <div className={styles.copy}>
        <h1 className="display">{project.name}</h1>
        <p className={`body-lg ${styles.line}`}>{project.line}</p>
        <div className={styles.actions}>
          <ButtonLink href={project.primary.href}>{project.primary.label}</ButtonLink>
          {project.secondary && (
            <ButtonLink href={project.secondary.href} variant="secondary">
              {project.secondary.label}
            </ButtonLink>
          )}
        </div>
      </div>

      {media && project.covers && <CoverCarousel covers={project.covers} eager={active} />}
    </section>
  );
}

/** Rows and columns of the wall: enough tiles to run past every edge of the tilted grid at any width. */
const WALL = { cards: { cols: 9, rows: 3 }, pages: { cols: 9, rows: 3 } } as const;

/**
 * A tilted wall of card faces or manga pages under the whole stage, so the hero has no empty ground.
 * The items repeat, offset by one each row, so no two neighbours match.
 */
function Wall({ wall, eager }: { wall: NonNullable<Project["wall"]>; eager: boolean }) {
  const { cols, rows } = WALL[wall.kind];
  const n = wall.items.length;
  const tiles = Array.from({ length: cols * rows }, (_, k) => wall.items[(k + Math.floor(k / cols) * 3) % n]);
  return (
    <div className={styles.wall} data-kind={wall.kind} aria-hidden="true">
      <div className={styles.wallGrid} style={{ "--cols": cols } as React.CSSProperties}>
        {tiles.map((src, k) => {
          const card = wall.kind === "cards" && cards.find((c) => c.art === src);
          return card ? (
            <span key={k} className={styles.wallTile}>
              <Card card={card} sizes="(max-width: 900px) 30vw, 12vw" />
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={k} className={styles.wallTile} src={src} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
          );
        })}
      </div>
    </div>
  );
}

/**
 * The nine stages and the dock that switches between them. Every stage is already rendered, so a dock
 * press switches at once and only rewrites ?p= in the address. Links from elsewhere (the Projects
 * menu, Back and Forward) still switch the stage through the search params.
 */
export function HomeStages({ initial }: { initial: string }) {
  const params = useSearchParams();
  const [active, setActive] = useState(initial);
  // Only the first stage's media loads with the page. The rest mount when their dock link is pointed
  // at or focused, when chosen, or once the browser is idle, so a switch is still instant.
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set([initial]));
  const warm = useCallback((slug: string) => {
    setLoaded((s) => (s.has(slug) ? s : new Set(s).add(slug)));
  }, []);
  useEffect(() => warm(active), [active, warm]);
  // Decode the pictures of stages that are mounted but not shown, in idle time, so a switch does not
  // stall on image decode mid-fade (it did on the many-picture stages, Mini-series and Cards).
  useEffect(() => {
    const run = () =>
      document.querySelectorAll<HTMLImageElement>(`.${styles.stage}[data-active="false"] img`).forEach((img) => {
        img.decode().catch(() => {});
      });
    const id = onIdle(run, 3000);
    return () => {
      offIdle(id);
    };
  }, [loaded]);
  useEffect(() => {
    const all = () => setLoaded(new Set(projects.map((p) => p.slug)));
    let idle = 0;
    const start = () => {
      idle = onIdle(all, 8000);
    };
    // Wait for the first screen to finish loading before asking for idle time.
    const after = window.setTimeout(start, 2500);
    return () => {
      clearTimeout(after);
      offIdle(idle);
    };
  }, []);
  const dock = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number; h: number; animate: boolean } | null>(null);

  const param = params.get("p") ?? undefined;
  useEffect(() => {
    setActive(projectBySlug(param).slug);
  }, [param]);

  const choose = (e: MouseEvent<HTMLAnchorElement>, slug: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setActive(slug);
    window.history.replaceState(null, "", hrefOf(slug));
  };

  // A wheel or trackpad gesture over the page moves one tab along the dock. One gesture is one step: the
  // deltas add up until they pass a threshold, then nothing more counts until the wheel has been still
  // for a moment (a trackpad keeps sending momentum for a second after the fingers lift). It leaves alone
  // anything that scrolls itself, open menus and dialogs, pinch zoom, and a page that still has room to
  // scroll that way. The switch itself is the dock's switch, so reduced motion gets the instant change.
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    let sum = 0;
    let last = -Infinity;
    let locked = false;
    let stepAt = -Infinity;
    const canScroll = (from: EventTarget | null, dy: number) => {
      for (let el = from instanceof Element ? from : null; el && el !== document.body; el = el.parentElement) {
        const oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
          if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
        }
      }
      const doc = document.scrollingElement ?? document.documentElement;
      return dy > 0 ? doc.scrollTop + window.innerHeight < doc.scrollHeight - 1 : doc.scrollTop > 0;
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return;
      const t = e.target instanceof Element ? e.target : null;
      if (t?.closest('dialog, [role="dialog"], [aria-modal="true"], details[open], [role="menu"]')) return;
      if (document.querySelector("details[open], dialog[open], [aria-modal='true']")) return;
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const px = e.deltaMode === 1 ? d * 16 : e.deltaMode === 2 ? d * window.innerHeight : d;
      if (Math.abs(e.deltaY) >= Math.abs(e.deltaX) && canScroll(e.target, px)) return;
      // Event times, not timers: a switch can hold the main thread, and the queued momentum events that
      // follow must still read as the same gesture.
      const gap = e.timeStamp - last;
      last = e.timeStamp;
      if (gap > 300 && e.timeStamp - stepAt > 500) {
        locked = false;
        sum = 0;
      }
      if (locked) return;
      sum += px;
      if (Math.abs(sum) < 40) return;
      locked = true;
      stepAt = e.timeStamp;
      const i = projects.findIndex((p) => p.slug === activeRef.current);
      const next = projects[i + (sum > 0 ? 1 : -1)];
      sum = 0;
      if (!next) return;
      setActive(next.slug);
      window.history.replaceState(null, "", hrefOf(next.slug));
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // The shouldered pill sits under the current dock link and slides to the next one.
  const measure = useCallback((animate: boolean) => {
    const link = dock.current?.querySelector<HTMLElement>('a[aria-current="page"]');
    if (link) setPill({ x: link.offsetLeft, w: link.offsetWidth, h: link.offsetHeight, animate });
  }, []);
  const measured = useRef(false);
  useLayoutEffect(() => {
    measure(measured.current);
    measured.current = true;
  }, [active, measure]);
  useEffect(() => {
    const row = dock.current;
    if (!row) return;
    const ro = new ResizeObserver(() => measure(false));
    row.querySelectorAll("a").forEach((a) => ro.observe(a));
    return () => ro.disconnect();
  }, [measure]);

  // Three parts, so the slide is all transforms: two end caps that move and a middle that stretches.
  const cap = pill ? pill.h * 0.4444 : 0;
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
    <>
      <main id="main" className={styles.stages}>
        {projects.map((p) => (
          <Stage key={p.slug} project={p} active={p.slug === active} media={loaded.has(p.slug)} />
        ))}
      </main>
      <nav ref={dock} className={styles.dock} aria-label="Projects" data-pill={pill ? "on" : undefined}>
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
            href={hrefOf(p.slug)}
            scroll={false}
            replace
            onClick={(e) => choose(e, p.slug)}
            onPointerEnter={() => warm(p.slug)}
            onFocus={() => warm(p.slug)}
            aria-current={p.slug === active ? "page" : undefined}
          >
            {p.name}
          </Link>
        ))}
        <ScrollToCurrent current={active} />
      </nav>
    </>
  );
}
