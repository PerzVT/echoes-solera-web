"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { series } from "@/lib/labs/series";
import { supper } from "@/lib/labs/supper";
import { products } from "@/lib/labs/shop";
import type { Project } from "@/lib/labs/projects";
import styles from "../HomeStages.module.css";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The per-project stage contents that need more than the shared layers: one switch, so the call site stays one line. */
export function HeroStage({ kind, active }: { kind: NonNullable<Project["stage"]>; active: boolean }) {
  if (kind === "series") return <SeriesHero active={active} />;
  if (kind === "chefs") return <ChefsHero active={active} />;
  if (kind === "ads") return <AdsHero active={active} />;
  if (kind === "shop") return <ShopHero active={active} />;
  return <CardsTint />;
}

/* Mini-series ------------------------------------------------------------------------------------ */

const withArt = series.filter((s) => s.art);
const DEFAULT_ART = series.find((s) => s.slug === "moonflower")?.slug ?? withArt[0]?.slug;

/**
 * Every series cover on a row that keeps moving. Pointing at or focusing a cover stops the row and,
 * where the series has key art, crossfades the backdrop to it. Still under reduced motion.
 */
function SeriesHero({ active }: { active: boolean }) {
  const [art, setArt] = useState(DEFAULT_ART);
  const eager = active ? "eager" : "lazy";
  const pick = (slug: string) => {
    if (withArt.some((s) => s.slug === slug)) setArt(slug);
  };
  return (
    <>
      {withArt.map((s) => (
        <div key={s.slug} className={styles.seriesArt} data-on={s.slug === art} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.art!.bg} alt="" loading={eager} decoding="async" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.art!.cast} alt="" loading={eager} decoding="async" />
        </div>
      ))}
      <div className={styles.marquee} role="region" aria-label="Series">
        <ul className={styles.marqueeRow}>
          {[0, 1].map((copy) =>
            series.map((s) => (
              <li key={`${copy}-${s.slug}`} aria-hidden={copy === 1 ? true : undefined}>
                <Link
                  href={`/mini-series/${s.slug}`}
                  tabIndex={copy === 1 ? -1 : undefined}
                  onPointerEnter={() => pick(s.slug)}
                  onFocus={() => pick(s.slug)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.cover} alt={copy === 1 ? "" : s.title} loading={eager} decoding="async" />
                </Link>
              </li>
            )),
          )}
        </ul>
      </div>
    </>
  );
}

/* Cooking ---------------------------------------------------------------------------------------- */

/** The chefs one after another, four seconds each, crossfaded. Stays on the first under reduced motion. */
function ChefsHero({ active }: { active: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active || reduced()) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % supper.chefs.length), 4000);
    return () => clearInterval(id);
  }, [active]);
  return (
    <div className={styles.chefs} aria-hidden="true">
      {supper.chefs.map((c, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={c.src} src={c.src} alt="" data-on={k === i} loading={active && k < 2 ? "eager" : "lazy"} decoding="async" />
      ))}
    </div>
  );
}

/* Game ads --------------------------------------------------------------------------------------- */

const ADS = ["sweet-rush", "decorate-and-serve", "sweet-rush-reaction-first"].map((n) => ({
  video: `/labs/game-ads/${n}.mp4`,
  poster: `/labs/game-ads/${n}.webp`,
}));

/** Three vertical ads standing side by side across the right two thirds. Posters only under reduced motion. */
function AdsHero({ active }: { active: boolean }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    refs.current.forEach((v) => {
      if (!v) return;
      if (active && !reduced()) v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);
  return (
    <div className={styles.ads} aria-hidden="true">
      {ADS.map((a, k) => (
        <div key={a.video} className={styles.ad} style={{ "--i": k } as React.CSSProperties}>
          <video
            ref={(el) => {
              refs.current[k] = el;
            }}
            src={active ? a.video : undefined}
            poster={a.poster}
            muted
            loop
            playsInline
            preload="none"
          />
        </div>
      ))}
    </div>
  );
}

/* Shop ------------------------------------------------------------------------------------------- */

const SHELF = ["fomo-capsules", "chef-aprons", "moonflower-charm", "echoes-of-solera-puzzle", "illustrated-collection-packs", "fomo-blind-box"]
  .map((slug) => products.find((p) => p.slug === slug))
  .filter((p): p is (typeof products)[number] => !!p);

/** Six objects in a two by three grid between the copy and the backpack. */
function ShopHero({ active }: { active: boolean }) {
  return (
    <div className={styles.shelf} aria-hidden="true">
      {SHELF.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={p.slug} src={p.image.src} alt="" style={{ objectPosition: p.focus }} loading={active ? "eager" : "lazy"} decoding="async" />
      ))}
    </div>
  );
}

/* Cards ------------------------------------------------------------------------------------------ */

/**
 * The colour of a card's art, as /cards reads it (CardCollection): pixels averaged at 24 x 24, each
 * weighted by its saturation. Read once per card and kept.
 */
const tints = new Map<string, Promise<string | null>>();
function tintOf(src: string) {
  let t = tints.get(src);
  if (!t) {
    t = new Promise((resolve) => {
      const img = new window.Image();
      img.decoding = "async";
      img.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = c.height = 24;
          const g = c.getContext("2d", { willReadFrequently: true });
          if (!g) return resolve(null);
          g.drawImage(img, 0, 0, 24, 24);
          const d = g.getImageData(0, 0, 24, 24).data;
          let r = 0, gr = 0, b = 0, w = 0;
          for (let i = 0; i < d.length; i += 4) {
            const max = Math.max(d[i], d[i + 1], d[i + 2]);
            const min = Math.min(d[i], d[i + 1], d[i + 2]);
            const k = 0.05 + (max - min) / 255;
            r += d[i] * k;
            gr += d[i + 1] * k;
            b += d[i + 2] * k;
            w += k;
          }
          resolve(`rgb(${Math.round(r / w)} ${Math.round(gr / w)} ${Math.round(b / w)})`);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
    tints.set(src, t);
  }
  return t;
}

/** A colour wash over the card wall that takes the hue of the fan card under the pointer or focus. */
function CardsTint() {
  const ref = useRef<HTMLSpanElement>(null);
  const [tint, setTint] = useState<string | null>(null);
  useEffect(() => {
    const stage = ref.current?.parentElement;
    if (!stage) return;
    let want: string | null = null;
    const on = (e: Event) => {
      if (reduced()) return;
      const art = (e.target as Element | null)?.closest?.("[data-art]")?.getAttribute("data-art");
      if (!art || art === want) return;
      want = art;
      tintOf(art).then((col) => {
        if (col && want === art) setTint(col);
      });
    };
    stage.addEventListener("pointerover", on);
    stage.addEventListener("focusin", on);
    return () => {
      stage.removeEventListener("pointerover", on);
      stage.removeEventListener("focusin", on);
    };
  }, []);
  return (
    <span
      ref={ref}
      className={styles.cardsTint}
      style={tint ? ({ "--tint": tint } as React.CSSProperties) : undefined}
      data-on={tint ? "" : undefined}
      aria-hidden="true"
    />
  );
}
