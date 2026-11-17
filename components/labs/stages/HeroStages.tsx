"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { series } from "@/lib/labs/series";
import { supper, releases } from "@/lib/labs/supper";
import { products } from "@/lib/labs/shop";
import { tidebell } from "@/lib/labs/worlds";
import type { Project } from "@/lib/labs/projects";
import styles from "../HomeStages.module.css";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Reduced motion as state, so a stage that is already up stops when the setting changes. */
function useStill() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return still;
}

/** True from the first time the stage is shown with motion allowed, and stays true: video sources are set once and never taken away, so a return resumes where it paused. */
function useStarted(active: boolean, still: boolean) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    // Read the media query here too: on the first pass `still` has not caught up yet.
    if (active && !still && !reduced()) setStarted(true);
  }, [active, still]);
  return started;
}

/** The per-project stage contents that need more than the shared layers: one switch, so the call site stays one line. */
export function HeroStage({ kind, active, backdrops = [] }: { kind: NonNullable<Project["stage"]>; active: boolean; backdrops?: readonly string[] }) {
  if (kind === "montage") return <MontageHero active={active} />;
  if (kind === "series") return <SeriesHero active={active} backdrops={backdrops} />;
  if (kind === "chefs") return <KitchenHero active={active} />;
  if (kind === "worlds") return <WorldsHero active={active} />;
  if (kind === "ads") return <AdsHero active={active} />;
  if (kind === "shop") return <ShopHero active={active} />;
  return <CardsTint />;
}

/* Anime ------------------------------------------------------------------------------------------ */

/** The vertical shorts, at their own 720 x 1280. No Or-en clips, and Catalyst (landscape) stays on the anime page. */
const SHORTS = ["back-to-me", "creature-comfort", "highquest-on-break", "everyday-stops", "celestial-fruit-grazer", "one-second-express", "glowmote-grooming"].map(
  (n) => ({ video: `/labs/anime/shorts/${n}.mp4`, poster: `/labs/anime/shorts/${n}.webp` }),
);
/** Seconds each panel holds a clip before it cuts, in turn. The first cuts fall at different times, so the panels never cut together. */
const CUTS = [
  [5.5, 8, 6.5, 9.5, 7],
  [7.5, 5, 9, 6, 8.5],
  [9.5, 6.5, 7.5, 5, 8],
  [6.5, 9, 5.5, 8, 6],
];

type Pick = (panel: number) => number;

/**
 * Four vertical panels across the whole stage, each cutting to its next short every five to ten seconds.
 * No two panels show the same clip at once, and a clip picks up where it was last cut away from. The cuts
 * run on the videos' own clocks, so leaving the stage pauses the montage and coming back carries on.
 * Posters only under reduced motion.
 */
function MontageHero({ active }: { active: boolean }) {
  const still = useStill();
  const started = useStarted(active, still);
  const shown = useRef<number[]>(CUTS.map((_, i) => i));
  const cursor = useRef(CUTS.length);
  const pos = useRef<number[]>(SHORTS.map(() => 0));
  const pick = useCallback<Pick>((panel) => {
    for (let k = 0; k < SHORTS.length; k++) {
      const c = (cursor.current + k) % SHORTS.length;
      if (!shown.current.includes(c)) {
        cursor.current = c + 1;
        shown.current[panel] = c;
        return c;
      }
    }
    return shown.current[panel];
  }, []);
  return (
    <div className={styles.montage} aria-hidden="true">
      {CUTS.map((_, i) => (
        <MontagePanel key={i} panel={i} play={active && !still} started={started} eager={active} pick={pick} pos={pos} />
      ))}
    </div>
  );
}

function MontagePanel({
  panel,
  play,
  started,
  eager,
  pick,
  pos,
}: {
  panel: number;
  play: boolean;
  started: boolean;
  eager: boolean;
  pick: Pick;
  pos: MutableRefObject<number[]>;
}) {
  const vids = useRef<(HTMLVideoElement | null)[]>([null, null]);
  const [front, setFront] = useState(0);
  const frontRef = useRef(0);
  const playRef = useRef(play);
  const seg = useRef({ clip: panel, start: 0, n: 0, busy: false });

  useEffect(() => {
    playRef.current = play;
    const v = vids.current[frontRef.current];
    if (!v || !v.src) return;
    if (play) v.play().catch(() => {});
    else v.pause();
  }, [play, started]);

  // The first clip, set once.
  useEffect(() => {
    const v = vids.current[0];
    if (!started || !v || v.src) return;
    v.src = SHORTS[panel].video;
    if (playRef.current) v.play().catch(() => {});
  }, [started, panel]);

  useEffect(() => {
    const cuts = CUTS[panel];
    const cut = () => {
      const s = seg.current;
      const from = vids.current[frontRef.current];
      const back = vids.current[1 - frontRef.current];
      if (s.busy || !from || !back) return;
      s.busy = true;
      pos.current[s.clip] = from.currentTime;
      const c = pick(panel);
      const len = cuts[(s.n + 1) % cuts.length];
      const go = () => {
        const swap = () => {
          from.pause();
          frontRef.current = 1 - frontRef.current;
          setFront(frontRef.current);
          seg.current = { clip: c, start: back.currentTime, n: s.n + 1, busy: false };
        };
        if (playRef.current) back.play().then(swap, swap);
        else swap();
      };
      const seek = () => {
        let at = pos.current[c];
        if (!(at + len < back.duration - 0.3)) at = 0;
        back.addEventListener("seeked", go, { once: true });
        back.currentTime = at;
      };
      if (back.dataset.clip === String(c) && back.readyState >= 1) seek();
      else {
        back.dataset.clip = String(c);
        back.addEventListener("loadedmetadata", seek, { once: true });
        back.src = SHORTS[c].video;
      }
    };
    const onTime = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement;
      if (v !== vids.current[frontRef.current]) return;
      const s = seg.current;
      if (v.ended || v.currentTime - s.start >= cuts[s.n % cuts.length]) cut();
    };
    const all = vids.current.filter((v): v is HTMLVideoElement => !!v);
    all.forEach((v) => {
      v.addEventListener("timeupdate", onTime);
      v.addEventListener("ended", onTime);
    });
    return () =>
      all.forEach((v) => {
        v.removeEventListener("timeupdate", onTime);
        v.removeEventListener("ended", onTime);
      });
  }, [panel, pick, pos]);

  return (
    <div className={styles.panel}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={SHORTS[panel].poster} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
      {[0, 1].map((k) => (
        <video
          key={k}
          ref={(el) => {
            vids.current[k] = el;
          }}
          data-front={k === front}
          data-clip={k === 0 ? String(panel) : undefined}
          poster={k === 0 ? SHORTS[panel].poster : undefined}
          muted
          playsInline
          preload="auto"
        />
      ))}
    </div>
  );
}

/* Mini-series ------------------------------------------------------------------------------------ */

/** A series' hover backdrop, by the folder convention read in ./backdrops.ts. */
const backdropOf = (slug: string) => `/labs/mini-series/backdrops/${slug}.webp`;

/**
 * Every series cover on a row that keeps moving. Pointing at or focusing a cover stops the row and,
 * where the series has a backdrop, crossfades to it. A file in public/labs/mini-series/backdrops wins over
 * the layered key art; a series with neither leaves the backdrop as it is. Still under reduced motion.
 */
function SeriesHero({ active, backdrops }: { active: boolean; backdrops: readonly string[] }) {
  const files = new Set(backdrops);
  const shown = series.filter((s) => files.has(s.slug) || s.art);
  const first = shown.find((s) => s.slug === "moonflower")?.slug ?? shown[0]?.slug;
  const [art, setArt] = useState(first);
  const eager = active ? "eager" : "lazy";
  const pick = (slug: string) => {
    if (shown.some((s) => s.slug === slug)) setArt(slug);
  };
  return (
    <>
      {shown.map((s) => (
        <div key={s.slug} className={styles.seriesArt} data-on={s.slug === art} aria-hidden="true">
          {files.has(s.slug) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backdropOf(s.slug)} alt="" loading={eager} decoding="async" />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.art!.bg} alt="" loading={eager} decoding="async" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.art!.cast} alt="" loading={eager} decoding="async" />
            </>
          )}
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

/* Crossfading backdrops ------------------------------------------------------------------------- */

/** Steps through `count` scenes every `ms` while the stage is shown; holds its place while away, and holds the first under reduced motion. */
function useCycle(count: number, ms: number, active: boolean) {
  const still = useStill();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active || still) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % count), ms);
    return () => clearInterval(id);
  }, [active, still, count, ms]);
  return i;
}

/* Cooking ---------------------------------------------------------------------------------------- */

const stillOf = (slug: string) => releases.find((r) => r.poster.endsWith(`/${slug}.webp`))?.poster ?? `/labs/cooking/stills/${slug}.webp`;
const DISHES = releases.map((r) => r.dish);

/** Whole pictures that each fill the stage: the Akane kitchen, the table of dishes, two rows of episode stills. */
const KITCHEN: ({ kind: "art"; src: string } | { kind: "dishes"; items: string[] } | { kind: "stills"; items: string[] })[] = [
  { kind: "art", src: supper.art },
  { kind: "dishes", items: [...DISHES, ...DISHES].slice(0, 15) },
  { kind: "stills", items: ["kacchi-biryani", "cobb-salad", "margherita-pizza", "masala-dosa"].map(stillOf) },
  { kind: "stills", items: ["mushroom-stroganoff", "gambas-al-ajillo", "oyakodon", "lemon-ricotta-pancakes"].map(stillOf) },
];

/** The kitchen scenes crossfading every five seconds, each one edge to edge. Stays on Akane under reduced motion. */
function KitchenHero({ active }: { active: boolean }) {
  const i = useCycle(KITCHEN.length, 5000, active);
  return (
    <div className={styles.kitchen} aria-hidden="true">
      {KITCHEN.map((scene, k) => {
        const loading = active && k < 2 ? "eager" : "lazy";
        return (
          <div key={k} className={styles.scene} data-on={k === i} data-kind={scene.kind}>
            {scene.kind === "art" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.sceneArt} src={scene.src} alt="" loading={loading} decoding="async" />
            ) : (
              <div className={styles.sceneGrid} data-kind={scene.kind}>
                {scene.items.map((src, n) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={n} src={src} alt="" loading={loading} decoding="async" />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* Virtual worlds --------------------------------------------------------------------------------- */

/**
 * Every Tidebell Cove place from /worlds/tidebell-cove. The two game captures stay on that page: they carry
 * the game's buttons in their corners, and cropping those off would blow the 1250 px frames up past sharp.
 */
const COVE = [tidebell.heroPlate, ...tidebell.places.map((p) => p.src)];

/** The cove's places crossfading full bleed, six seconds each. Stays on the pier under reduced motion. */
function WorldsHero({ active }: { active: boolean }) {
  const i = useCycle(COVE.length, 6000, active);
  return (
    <div className={styles.cove} aria-hidden="true">
      {COVE.map((src, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" data-on={k === i} loading={active && k < 2 ? "eager" : "lazy"} decoding="async" />
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
  const still = useStill();
  const started = useStarted(active, still);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    refs.current.forEach((v) => {
      if (!v) return;
      if (active && !still && started) v.play().catch(() => {});
      else v.pause();
    });
  }, [active, still, started]);
  return (
    <div className={styles.ads} aria-hidden="true">
      {ADS.map((a, k) => (
        <div key={a.video} className={styles.ad} style={{ "--i": k } as React.CSSProperties}>
          <video
            ref={(el) => {
              refs.current[k] = el;
            }}
            src={started ? a.video : undefined}
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
