"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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

/** The vertical shorts, at their own 720 x 1280. No Or-en clips. */
const SHORTS = ["back-to-me", "creature-comfort", "highquest-on-break", "everyday-stops", "celestial-fruit-grazer", "one-second-express", "glowmote-grooming"].map(
  (n) => ({ video: `/labs/anime/shorts/${n}.mp4`, poster: `/labs/anime/shorts/${n}.webp` }),
);

/**
 * A full-screen cut plays to its end; each is already 6 to 10 seconds long. Catalyst is cut from the
 * 1920 x 1080 master, the dances are at their own 1280 x 720. The row of four shorts holds for `len`.
 */
type Segment = { kind: "film"; video: string; poster: string } | { kind: "row"; len: number };
const film = (n: string): Segment => ({ kind: "film", video: `/labs/anime/montage/${n}.mp4`, poster: `/labs/anime/montage/${n}.webp` });
const SEGMENTS: Segment[] = [
  film("catalyst-aisle"),
  { kind: "row", len: 7 },
  film("dance-indoor"),
  film("catalyst-card"),
  { kind: "row", len: 6.5 },
  film("catalyst-night"),
  film("dance-cloud"),
  film("catalyst-rain"),
  film("catalyst-tree"),
  { kind: "row", len: 7.5 },
];
const PANELS = 4;
const after = (k: number) => (k + 1) % SEGMENTS.length;
const FIRST_POSTER = "/labs/anime/montage/catalyst-aisle.webp";

/**
 * One montage with hard cuts: a full-screen Catalyst or dance cut, then the row of four vertical shorts,
 * and so on. Each time the row comes round it deals the next four shorts, and a short picks up where it
 * was last cut away from. Only the shown segment and the next one have sources; a full-screen cut drops
 * its source once it has played. The cuts run on the videos' own clocks, so leaving the stage pauses the
 * montage and coming back carries on from the same segment and time. One still under reduced motion.
 */
function MontageHero({ active }: { active: boolean }) {
  const still = useStill();
  const started = useStarted(active, still);
  const play = active && !still;
  const [cur, setCur] = useState(0);
  const curRef = useRef(0);
  const prevRef = useRef(-1);
  const playRef = useRef(play);
  const films = useRef<(HTMLVideoElement | null)[]>([]);
  const panels = useRef<(HTMLVideoElement | null)[]>([]);
  const [clips, setClips] = useState<number[]>(() => Array.from({ length: PANELS }, (_, i) => i));
  const clipsRef = useRef(clips);
  const cursor = useRef(0);
  const rowFor = useRef(-1);
  const pos = useRef<number[]>(SHORTS.map(() => 0));
  const clock = useRef({ elapsed: 0, last: -1 });
  const busy = useRef(false);

  const videosOf = useCallback((k: number) => {
    const list = SEGMENTS[k].kind === "film" ? [films.current[k]] : panels.current;
    return list.filter((v): v is HTMLVideoElement => !!v);
  }, []);

  // Give a segment its sources ahead of time. The row deals its next four shorts here and seeks each to
  // where it was left, or to the start when that would run past its end.
  const prepare = useCallback((k: number) => {
    const s = SEGMENTS[k];
    if (s.kind === "film") {
      const v = films.current[k];
      if (v && !v.getAttribute("src")) {
        v.preload = "auto";
        v.src = s.video;
      }
      return;
    }
    if (rowFor.current === k) return;
    rowFor.current = k;
    const deal = Array.from({ length: PANELS }, (_, i) => (cursor.current + i) % SHORTS.length);
    cursor.current = (cursor.current + PANELS) % SHORTS.length;
    clipsRef.current = deal;
    setClips(deal);
    clock.current = { elapsed: 0, last: -1 };
    deal.forEach((c, i) => {
      const v = panels.current[i];
      if (!v) return;
      const seek = () => {
        let at = pos.current[c];
        if (!(at + s.len < v.duration - 0.3)) at = 0;
        v.currentTime = at;
      };
      if (v.getAttribute("src") === SHORTS[c].video && v.readyState >= 1) seek();
      else {
        v.addEventListener("loadedmetadata", seek, { once: true });
        v.src = SHORTS[c].video;
      }
    });
  }, []);

  // A hard cut: start the next segment, and swap only once it is playing, so the outgoing frame holds
  // until then and nothing blank shows between them.
  const advance = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    const from = curRef.current;
    const to = after(from);
    prepare(to);
    const swap = () => {
      if (SEGMENTS[from].kind === "row") {
        clipsRef.current.forEach((c, i) => {
          const v = panels.current[i];
          if (!v) return;
          pos.current[c] = v.currentTime;
          v.pause();
        });
        rowFor.current = -1;
      } else films.current[from]?.pause();
      if (!playRef.current) videosOf(to).forEach((v) => v.pause());
      prevRef.current = from;
      curRef.current = to;
      setCur(to);
      busy.current = false;
      prepare(after(to));
    };
    const next = videosOf(to);
    if (!playRef.current || !next.length) swap();
    else Promise.all(next.map((v) => v.play())).then(swap, swap);
  }, [prepare, videosOf]);

  // After the swap has painted, drop the source of the full-screen cut that just played.
  useEffect(() => {
    const k = prevRef.current;
    if (k < 0 || k === cur || SEGMENTS[k].kind !== "film") return;
    const v = films.current[k];
    if (v?.getAttribute("src")) {
      v.removeAttribute("src");
      v.load();
    }
  }, [cur]);

  // Play while the stage is shown, pause while away. The first time, load the opening segment and the next.
  useEffect(() => {
    playRef.current = play;
    if (!started || still) return;
    const k = curRef.current;
    prepare(k);
    prepare(after(k));
    videosOf(k).forEach((v) => (play ? v.play().catch(() => {}) : v.pause()));
  }, [play, started, still, prepare, videosOf]);

  // A full-screen cut ends its segment when it ends; the row counts its first panel's playing time.
  useEffect(() => {
    if (still) return;
    const onEnded = (e: Event) => {
      if (e.currentTarget === films.current[curRef.current]) advance();
    };
    const onTime = (e: Event) => {
      const s = SEGMENTS[curRef.current];
      if (s.kind !== "row") return;
      const t = (e.currentTarget as HTMLVideoElement).currentTime;
      const c = clock.current;
      if (c.last >= 0) {
        const d = t - c.last;
        if (d > 0 && d < 1) c.elapsed += d;
      }
      c.last = t;
      if (c.elapsed >= s.len) advance();
    };
    const fs = films.current.filter((v): v is HTMLVideoElement => !!v);
    const lead = panels.current[0];
    fs.forEach((v) => v.addEventListener("ended", onEnded));
    lead?.addEventListener("timeupdate", onTime);
    return () => {
      fs.forEach((v) => v.removeEventListener("ended", onEnded));
      lead?.removeEventListener("timeupdate", onTime);
    };
  }, [still, advance]);

  if (still) {
    return (
      <div className={styles.montage} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.film} data-on="true" src={FIRST_POSTER} alt="" decoding="async" />
      </div>
    );
  }

  const near = (k: number) => k === cur || k === after(cur);
  return (
    <div className={styles.montage} aria-hidden="true">
      {SEGMENTS.map((s, k) =>
        s.kind === "film" ? (
          <video
            key={k}
            ref={(el) => {
              films.current[k] = el;
            }}
            className={styles.film}
            data-on={k === cur}
            poster={near(k) ? s.poster : undefined}
            muted
            playsInline
            preload="none"
          />
        ) : null,
      )}
      <div className={styles.row} data-on={SEGMENTS[cur].kind === "row"}>
        {clips.map((c, i) => (
          <div key={i} className={styles.panel}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SHORTS[c].poster} alt="" loading={active ? "eager" : "lazy"} decoding="async" />
            <video
              ref={(el) => {
                panels.current[i] = el;
              }}
              muted
              loop
              playsInline
              preload="auto"
            />
          </div>
        ))}
      </div>
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

/** Whole pictures that each fill the stage: the Akane kitchen and two rows of episode stills. */
const KITCHEN: ({ kind: "art"; src: string } | { kind: "dishes"; items: string[] } | { kind: "stills"; items: string[] })[] = [
  { kind: "art", src: supper.art },
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
