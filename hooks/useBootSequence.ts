"use client";
/**
 * useBootSequence — cinematic boot animation hook
 *
 * Drives the portal boot sequence via a dedicated rAF clock.
 * Task 7B: BEAT 1 (frame stroke-draw) removed; brackets/edges/accents gone.
 * Polish: compass + sonar removed (compass deleted from scene).
 *
 * Artifact literal → BOOT key mapping:
 *   1240       → BOOT.igniteStart   (in PortalFrame's IGNITE_META, passed via elements.ignite)
 *   2180       → BOOT.textAt
 *   3300       → BOOT.textCommitAt
 *   3250       → BOOT.idleAt
 *   4500       → BOOT.commitAt
 *
 * Flicker gate: pass a flickerEnabledRef (optional) to control whether the
 * JS micro-flicker fires during idle. Subtle mode passes ref = { current: false }.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortalElements } from "@/components/PortalFrame";
import { BOOT } from "@/lib/content";

// ---------------------------------------------------------------------------
// Local constants
// ---------------------------------------------------------------------------
const SAFETY_MS = 5400;
const FLICKER_MIN = 2200;
const FLICKER_RANGE = 4200;


// ---------------------------------------------------------------------------
// Easing helpers
// ---------------------------------------------------------------------------
function clamp(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function outCubic(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useBootSequence(
  elements: React.RefObject<PortalElements | null>,
  cardRef: React.RefObject<HTMLDivElement | null>,
  flickerEnabledRef?: React.RefObject<boolean>
): { replay: () => void; phase: "boot" | "idle" } {
  const [phase, setPhase] = useState<"boot" | "idle">("boot");

  // rAF / timer ids stored in refs so cleanup is always current
  const rafIdRef = useRef<number>(0);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flickerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flickerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // boot clock state
  const bootT0Ref = useRef<number | null>(null);
  const textOnRef = useRef(false);
  const liveOnRef = useRef(false);
  // phase flip deferred to a ref to avoid mid-frame setState issues
  const idleFiredRef = useRef(false);

  // ---------------------------------------------------------------------------
  // startFlicker — artifact lines 342-356, gated on flickerEnabledRef
  // ---------------------------------------------------------------------------
  const startFlicker = useCallback(() => {
    // clear any prior flicker loops
    if (flickerRef.current !== null) clearTimeout(flickerRef.current);
    if (flickerIntervalRef.current !== null) clearInterval(flickerIntervalRef.current);

    const els = elements.current;
    if (!els) return;

    const loop = () => {
      flickerRef.current = setTimeout(() => {
        // Gate: if flickerEnabledRef is provided and false, skip the mutation
        // but keep the loop alive so toggling back to Rich resumes immediately.
        if (flickerEnabledRef && !flickerEnabledRef.current) {
          loop();
          return;
        }

        if (!els.art.classList.contains("live")) return;

        const igniteEls = els.ignite.map((g) => g.el);
        const targets: (HTMLElement | SVGElement)[] = [
          els.art as HTMLElement,
          ...igniteEls,
        ];
        const tgt = targets[Math.floor(Math.random() * targets.length)];

        let n = 0;
        const base = tgt.style.opacity || "1";
        flickerIntervalRef.current = setInterval(() => {
          n++;
          tgt.style.opacity = n % 2 ? "0.6" : "1";
          if (n > 3) {
            clearInterval(flickerIntervalRef.current!);
            flickerIntervalRef.current = null;
            tgt.style.opacity = base;
          }
        }, 45);

        loop();
      }, FLICKER_MIN + Math.random() * FLICKER_RANGE);
    };
    loop();
  }, [elements, flickerEnabledRef]);

  // ---------------------------------------------------------------------------
  // updateBoot — rAF tick; BEAT 1 (frame draw) removed; sonar removed
  // ---------------------------------------------------------------------------
  const updateBoot = useCallback(
    (now: number) => {
      const els = elements.current;
      if (!els || bootT0Ref.current === null) return;

      const t = now - bootT0Ref.current;

      // Medallions + gem ignite (dissolve + glow swell)
      for (const g of els.ignite) {
        const p = clamp((t - g.start) / g.dur);
        if (p <= 0) {
          g.el.style.opacity = "0";
          g.el.style.transform = "scale(.84)";
          continue;
        }
        if (p >= 1) {
          g.el.style.opacity = "1";
          g.el.style.transform = "none";
          g.el.style.filter = "none";
          continue;
        }
        g.el.style.opacity = String(Math.min(1, p / 0.5));
        let sc: number, br: number, glow: number;
        if (p < 0.55) {
          const k = p / 0.55;
          sc = 0.84 + (1.06 - 0.84) * outCubic(k);
          br = 0.35 + (g.power - 0.35) * k;
          // dissolve glow swell — ramps up during first half
          glow = k * 12;
        } else {
          const k = (p - 0.55) / 0.45;
          sc = 1.06 + (1 - 1.06) * k;
          br = g.power + (1 - g.power) * k;
          // dissolve glow settles back to 0
          glow = 12 * (1 - k);
        }
        g.el.style.transform = `scale(${sc.toFixed(3)})`;
        g.el.style.filter = `brightness(${br.toFixed(2)}) drop-shadow(0 0 ${glow.toFixed(1)}px rgba(185,108,230,0.9))`;
      }

      // BEAT 4 — text signal-lock (CSS glitch); then commit clean & visible
      const card = cardRef.current;
      if (t > BOOT.textAt && !textOnRef.current) {
        textOnRef.current = true;
        if (card) card.classList.add("on");
      }
      if (t > BOOT.textCommitAt) {
        if (card) {
          card.classList.remove("on");
          card.style.opacity = "1";
        }
      }

      // BEAT 5 — settle into living idle
      if (t > BOOT.idleAt && !liveOnRef.current) {
        liveOnRef.current = true;
        els.art.classList.add("live");
        startFlicker();
        // flip phase state — batched by React so safe to call here
        if (!idleFiredRef.current) {
          idleFiredRef.current = true;
          setPhase("idle");
        }
      }

      // Commit: stop the rAF clock
      if (t > BOOT.commitAt) {
        bootT0Ref.current = null;
        return; // do NOT schedule another frame
      }

      // Schedule next frame
      rafIdRef.current = requestAnimationFrame(updateBoot);
    },
    [elements, cardRef, startFlicker]
  );

  // ---------------------------------------------------------------------------
  // startBoot
  // ---------------------------------------------------------------------------
  const startBoot = useCallback(() => {
    const els = elements.current;
    if (!els) return;

    // Cancel any running rAF loop and safety timer
    cancelAnimationFrame(rafIdRef.current);
    if (safetyRef.current !== null) clearTimeout(safetyRef.current);
    if (flickerRef.current !== null) clearTimeout(flickerRef.current);
    if (flickerIntervalRef.current !== null) clearInterval(flickerIntervalRef.current);

    // Reset state
    bootT0Ref.current = performance.now();
    textOnRef.current = false;
    liveOnRef.current = false;
    idleFiredRef.current = false;
    setPhase("boot");

    // Reset art
    els.art.classList.remove("live");
    if ("style" in els.art) {
      (els.art as HTMLElement).style.opacity = "1";
    }

    // Reset card (gracefully if not mounted yet)
    const card = cardRef.current;
    if (card) {
      card.classList.remove("on");
      card.style.opacity = "";
    }

    // Reset medallions
    els.ignite.forEach((g) => {
      g.el.style.opacity = "0";
      g.el.style.transform = "scale(.84)";
      g.el.style.filter = "brightness(.35)";
    });

    // Safety net: if rAF is throttled (backgrounded tab), guarantee final
    // composition resolves.
    safetyRef.current = setTimeout(() => {
      if (bootT0Ref.current !== null) {
        bootT0Ref.current = performance.now() - 5000;
        updateBoot(performance.now());
      }
    }, SAFETY_MS);

    // Start the rAF clock
    rafIdRef.current = requestAnimationFrame(updateBoot);
  }, [elements, cardRef, updateBoot]);

  // ---------------------------------------------------------------------------
  // Mount effect — fire initial boot after fonts are ready
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let started = false;
    let fontFallbackId: ReturnType<typeof setTimeout> | null = null;

    function init() {
      if (started) return;
      started = true;
      startBoot();
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(init, 100));
    }
    // Fallback if fonts.ready never settles
    fontFallbackId = setTimeout(init, 900);

    return () => {
      // StrictMode cleanup: cancel everything so second mount starts clean
      if (fontFallbackId !== null) clearTimeout(fontFallbackId);
      cancelAnimationFrame(rafIdRef.current);
      if (safetyRef.current !== null) clearTimeout(safetyRef.current);
      if (flickerRef.current !== null) clearTimeout(flickerRef.current);
      if (flickerIntervalRef.current !== null) clearInterval(flickerIntervalRef.current);
      // Mark boot as stopped so safety net won't fire after cleanup
      bootT0Ref.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return { replay: startBoot, phase };
}
