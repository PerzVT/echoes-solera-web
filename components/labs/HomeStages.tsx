"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonLink } from "./Button";
import { Card } from "./Card";
import { CoverCarousel } from "./CoverCarousel";
import { HeroVideo } from "./HeroVideo";
import { Nav } from "./Nav";
import { HeroStage } from "./stages/HeroStages";
import { cards } from "@/lib/labs/cards";
import { projectBySlug, projects, type Project } from "@/lib/labs/projects";
import styles from "./Home.module.css";

/** Idle time where the browser offers it (not Safari), a plain timeout where it does not. */
const hasIdle = () => typeof window.requestIdleCallback === "function";
const onIdle = (fn: () => void, timeout: number) => (hasIdle() ? window.requestIdleCallback(fn, { timeout }) : window.setTimeout(fn, timeout / 2));
const offIdle = (id: number) => (hasIdle() ? window.cancelIdleCallback(id) : clearTimeout(id));

const hrefOf = (slug: string) => (slug === projects[0].slug ? "/" : `/?p=${slug}`);

function Stage({ project, active, media, backdrops }: { project: Project; active: boolean; media: boolean; backdrops: readonly string[] }) {
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
      {media && project.stage && <HeroStage kind={project.stage} active={active} backdrops={backdrops} />}
      {media && project.fan && (
        <div className={styles.fan} data-kind={project.fan.kind}>
          {project.fan.items.map((it, i) => {
            const vars = { "--i": i, "--n": project.fan!.items.length } as React.CSSProperties;
            const card = project.fan!.kind === "cards" && cards.find((c) => c.art === it.src);
            return card ? (
              <span key={it.src} className={styles.fanCard} style={vars} data-art={it.src}>
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

      {media && project.covers && !project.stage && <CoverCarousel covers={project.covers} eager={active} />}
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
export function HomeStages({ initial, backdrops = [] }: { initial: string; backdrops?: readonly string[] }) {
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
  const param = params.get("p") ?? undefined;
  useEffect(() => {
    setActive(projectBySlug(param).slug);
  }, [param]);

  // Every switch (header link, wheel, arrow key, swipe) goes through here: show the stage, rewrite ?p=.
  const choose = useCallback((slug: string) => {
    setActive(slug);
    window.history.replaceState(null, "", hrefOf(slug));
  }, []);

  // The page does not scroll: wheel, trackpad, ArrowLeft/ArrowRight and a swipe step one section, like
  // tabs. A wheel gesture's deltas add up until they pass a small threshold (a single mouse notch is
  // enough), then the gesture is locked for 600 ms and until the wheel goes quiet, so trackpad momentum
  // never counts twice. A turn the other way acts at once. Nothing moves while the intro is showing or a
  // menu or dialog is open. Reduced motion gets the instant change from the stage CSS.
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    const blocked = (t: EventTarget | null) => {
      if (document.querySelector(".nl[data-nl-intro]")) return true;
      if (document.querySelector("details[open], dialog[open], [aria-modal='true'], [role='menu']")) return true;
      const el = t instanceof Element ? t : null;
      return !!el?.closest('dialog, [role="dialog"], [aria-modal="true"], details[open], [role="menu"]');
    };
    const step = (dir: 1 | -1) => {
      const i = projects.findIndex((p) => p.slug === activeRef.current);
      const next = projects[i + dir];
      if (next) choose(next.slug);
    };
    // Something inside the stage that scrolls by itself keeps the wheel while it has room that way.
    const canScroll = (from: EventTarget | null, d: number, vertical: boolean) => {
      for (let el = from instanceof Element ? from : null; el && el !== document.body; el = el.parentElement) {
        const cs = getComputedStyle(el);
        const o = vertical ? cs.overflowY : cs.overflowX;
        if (o !== "auto" && o !== "scroll") continue;
        const [pos, size, full] = vertical ? [el.scrollTop, el.clientHeight, el.scrollHeight] : [el.scrollLeft, el.clientWidth, el.scrollWidth];
        if (full > size + 1 && (d > 0 ? pos + size < full - 1 : pos > 0)) return true;
      }
      return false;
    };

    let sum = 0;
    let last = -Infinity;
    let lastAbs = 0;
    let locked = false;
    let stepAt = -Infinity;
    let stepDir = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented || blocked(e.target)) return;
      const vertical = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
      const d = vertical ? e.deltaY : e.deltaX;
      const px = e.deltaMode === 1 ? d * 16 : e.deltaMode === 2 ? d * window.innerHeight : d;
      if (px === 0 || canScroll(e.target, px, vertical)) return;
      // Event times, not timers: a switch can hold the main thread, and the queued momentum events that
      // follow must still read as the same gesture.
      const gap = e.timeStamp - last;
      const abs = Math.abs(px);
      last = e.timeStamp;
      const since = e.timeStamp - stepAt;
      const dir = px > 0 ? 1 : -1;
      if (locked) {
        // Momentum only fades; a quiet gap, or a fresh push stronger than the fading tail, starts a new gesture.
        const fresh = since > 600 && (gap > 160 || abs > lastAbs * 1.6 + 4);
        if (dir !== stepDir || fresh) {
          locked = false;
          sum = 0;
        }
      } else if (gap > 300) {
        sum = 0;
      }
      lastAbs = abs;
      if (locked) return;
      if (sum !== 0 && Math.sign(sum) !== dir) sum = 0;
      sum += px;
      if (Math.abs(sum) < 30) return;
      locked = true;
      stepAt = e.timeStamp;
      stepDir = dir;
      sum = 0;
      step(dir);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented || blocked(e.target)) return;
      const el = e.target instanceof HTMLElement ? e.target : null;
      if (el?.closest('input, textarea, select, [contenteditable="true"], [role="slider"], [role="tablist"], video')) return;
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    };

    // A swipe: the stronger axis decides, up or left is the next section. Touches on the header strip
    // are left alone so it can scroll sideways.
    let start: { x: number; y: number; t: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      start = e.touches.length === 1 && !el?.closest("header") && !blocked(e.target) ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: e.timeStamp } : null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const quick = e.timeStamp - start.t < 800;
      start = null;
      const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (!quick || Math.abs(d) < 50 || blocked(e.target)) return;
      if (Math.abs(dx) > Math.abs(dy) && canScroll(e.target, -dx, false)) return;
      step(d < 0 ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [choose]);

  return (
    <>
      <Nav project={active} onProject={choose} />
      <main id="main" className={styles.stages}>
        {projects.map((p) => (
          <Stage key={p.slug} project={p} active={p.slug === active} media={loaded.has(p.slug)} backdrops={backdrops} />
        ))}
      </main>
    </>
  );
}
