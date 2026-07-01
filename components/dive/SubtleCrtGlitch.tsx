"use client";
/**
 * SubtleCrtGlitch — Variant B ambient glitch: "Old glitch, less glow"
 *
 * Replicates CrtGlitch behaviour but with intensity WAY down:
 *   - Chromatic opacity at ~30% of original bursts (max 0.22 vs 0.9)
 *   - No bloom / brightness flash (flicker clamped to 1)
 *   - Scanline opacity halved
 *   - Tear shifts smaller (max ~10px vs 28px)
 *   - Block count reduced (1-3 vs 2-6), smaller blocks, shorter duration
 *
 * Does NOT touch or import CrtGlitch — fully independent so CrtGlitch
 * used by /baseline remains unchanged.
 *
 * Props:
 *   enabled — only runs when phase === "error". DOM always present for ref safety.
 *
 * React 19 / StrictMode safe — same patterns as CrtGlitch:
 *   - DOM always in tree, visibility toggled.
 *   - [enabled] effect owns the rAF loop with full cleanup.
 *   - [] effect registers mousemove once.
 *   - No SSR-scope DOM/window access.
 */

import { useEffect, useRef } from "react";
import styles from "./SubtleCrtGlitch.module.css";

function rand(min: number, max: number) { return min + Math.random() * (max - min); }
function randInt(min: number, max: number) { return Math.floor(rand(min, max + 1)); }
let _bid = 0;

interface Block { id: number; x: number; y: number; w: number; h: number; dieAt: number; }

export function SubtleCrtGlitch({ enabled }: { enabled: boolean }) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const chromRef  = useRef<HTMLDivElement>(null);
  const tearRef   = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);

  const enabledRef = useRef(false);
  enabledRef.current = enabled;

  // ---- Effect 1: start/stop rAF loop ----
  useEffect(() => {
    if (!enabled) {
      if (wrapRef.current) wrapRef.current.style.visibility = "hidden";
      return;
    }

    if (wrapRef.current) wrapRef.current.style.visibility = "visible";

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const onMQ = (e: MediaQueryListEvent) => { reduced = e.matches; };
    mq.addEventListener("change", onMQ);

    let burstActive = false;
    let burstEndAt = 0;
    let burstIntensity = 0;
    let tearY = 50;
    let tearShift = 0;
    let chromShift = 0;

    let liveBlocks: Block[] = [];
    let nextBurstAt = performance.now() + 1500 + Math.random() * 3000;
    let rafId = 0;

    function spawnBurst(intensity: number) {
      if (reduced) return;
      const now = performance.now();
      burstActive = true;
      // Clamp intensity — this variant keeps things subtle
      burstIntensity = Math.min(0.45, intensity * 0.5);
      burstEndAt = now + rand(80, 280);
      tearY = rand(15, 85);
      // Smaller shift: max ~10px
      tearShift = rand(2, 10) * (Math.random() > 0.5 ? 1 : -1) * intensity;
      chromShift = rand(1, 6) * intensity;
      // Fewer, smaller blocks
      const count = randInt(1, 3);
      if (liveBlocks.length + count > 4) liveBlocks = liveBlocks.slice(-2);
      for (let i = 0; i < count; i++) {
        liveBlocks.push({
          id: ++_bid,
          x: rand(5, 88), y: rand(5, 88),
          w: randInt(20, 100), h: randInt(6, 36),
          dieAt: now + rand(60, 180) + i * rand(0, 30),
        });
      }
    }

    // Bridge for mousemove effect
    const wrap = wrapRef.current as unknown as {
      _spawnBurst?: (i: number) => void;
      _nextBurstAt?: () => number;
      _setNextBurstAt?: (v: number) => void;
    };
    if (wrap) {
      wrap._spawnBurst = spawnBurst;
      wrap._nextBurstAt = () => nextBurstAt;
      wrap._setNextBurstAt = (v: number) => { nextBurstAt = v; };
    }

    function tick() {
      const now = performance.now();

      if (now >= nextBurstAt) {
        nextBurstAt = now + rand(3000, 8000);
        spawnBurst(0.5 + Math.random() * 0.5);
      }

      if (burstActive && now > burstEndAt) {
        burstActive = false;
        burstIntensity = 0;
      }

      // Chromatic — very low opacity
      const chromEl = chromRef.current;
      if (chromEl) {
        if (burstActive) {
          const cs = chromShift.toFixed(1);
          chromEl.style.setProperty("--scrt-r-x", `${cs}px`);
          chromEl.style.setProperty("--scrt-b-x", `-${cs}px`);
          // Max opacity 0.22 (vs 0.9 in full CrtGlitch)
          chromEl.style.setProperty("--scrt-opacity", (0.08 + burstIntensity * 0.14).toFixed(2));
        } else {
          chromEl.style.setProperty("--scrt-r-x", "0.8px");
          chromEl.style.setProperty("--scrt-b-x", "-0.8px");
          chromEl.style.setProperty("--scrt-opacity", "0.07");
        }
      }

      // Tear
      const tearEl = tearRef.current;
      if (tearEl) {
        if (burstActive && Math.abs(tearShift) > 0) {
          tearEl.style.setProperty("--scrt-tear-y", `${tearY.toFixed(1)}%`);
          tearEl.style.setProperty("--scrt-tear-shift", `${tearShift.toFixed(1)}px`);
          tearEl.style.opacity = (0.25 + burstIntensity * 0.3).toFixed(2);
        } else {
          tearEl.style.opacity = "0";
        }
      }

      // Blocks
      const container = blocksRef.current;
      if (container) {
        liveBlocks = liveBlocks.filter((b) => now < b.dieAt);
        const existing = new Set<number>();
        for (let i = 0; i < container.children.length; i++) {
          const child = container.children[i] as HTMLElement;
          const id = Number(child.dataset.bid);
          if (!liveBlocks.find((b) => b.id === id)) {
            container.removeChild(child);
            i--;
          } else {
            existing.add(id);
          }
        }
        for (const blk of liveBlocks) {
          if (!existing.has(blk.id)) {
            const el = document.createElement("div");
            el.dataset.bid = String(blk.id);
            el.className = styles.block;
            el.style.cssText =
              `position:absolute;left:${blk.x}%;top:${blk.y}%;` +
              `width:${blk.w}px;height:${blk.h}px;` +
              `background:rgba(185,108,230,0.22);` +
              `mix-blend-mode:screen;`;
            container.appendChild(el);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      mq.removeEventListener("change", onMQ);
      wrapRef.current?.closest("[data-idle]")?.removeAttribute("data-glitching");
      const container = blocksRef.current;
      if (container) container.innerHTML = "";
      liveBlocks = [];
      const chromEl = chromRef.current;
      if (chromEl) {
        chromEl.style.setProperty("--scrt-r-x", "0.8px");
        chromEl.style.setProperty("--scrt-b-x", "-0.8px");
        chromEl.style.setProperty("--scrt-opacity", "0.07");
      }
      const tearEl = tearRef.current;
      if (tearEl) tearEl.style.opacity = "0";
      if (wrapRef.current) wrapRef.current.style.visibility = "hidden";
    };
  }, [enabled]);

  // ---- Effect 2: mousemove boost (registered once) ----
  useEffect(() => {
    let rafPending = false;

    function handleMouseMove() {
      if (rafPending || !enabledRef.current) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        if (!enabledRef.current) return;
        const now = performance.now();
        const wrap = wrapRef.current as unknown as {
          _spawnBurst?: (i: number) => void;
          _nextBurstAt?: () => number;
          _setNextBurstAt?: (v: number) => void;
        } | null;
        if (!wrap?._spawnBurst) return;
        const nextAt = wrap._nextBurstAt?.() ?? Infinity;
        if (now > nextAt - 2000) {
          wrap._setNextBurstAt?.(now + rand(800, 2500));
          wrap._spawnBurst(0.4 + Math.random() * 0.3);
        }
      });
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} style={{ visibility: "hidden" }} aria-hidden="true">
      {/* Scanlines — halved opacity vs original */}
      <div className={styles.scanlines} />

      {/* Chromatic aberration — much lower intensity */}
      <div
        ref={chromRef}
        className={styles.chrom}
        style={{
          ["--scrt-r-x" as string]: "0.8px",
          ["--scrt-b-x" as string]: "-0.8px",
          ["--scrt-opacity" as string]: "0.07",
        }}
      />

      {/* Horizontal tear */}
      <div ref={tearRef} className={styles.tear} style={{ opacity: 0 }} />

      {/* Blocks container */}
      <div ref={blocksRef} className={styles.blocks} />
    </div>
  );
}
