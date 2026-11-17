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
