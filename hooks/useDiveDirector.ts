// hooks/useDiveDirector.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CueEngine } from "@/lib/cueEngine";
import { DIVE_SCRIPT, derivePhase, type DivePhase } from "@/lib/diveScript";
import type { PortalElements } from "@/components/PortalFrame";

export interface DirectorDeps {
  frameRef: React.RefObject<PortalElements | null>;
  cardRef: React.RefObject<HTMLDivElement | null>;
  flickerEnabledRef: React.RefObject<boolean>;
}

export interface DirectorAPI {
  phase: DivePhase;
  cueActive: (id: string) => boolean;
  cueComplete: (id: string) => boolean;
  replay: () => void;
}

// --- Medallion ignite rAF animation (extracted from useBootSequence) ---
interface IgniteItem {
  el: SVGGElement;
  power: number;
  start: number;
  dur: number;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function outCubic(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

function animateIgnite(
  items: IgniteItem[],
  totalDuration: number,
  onComplete: () => void
): () => void {
  let rafId = 0;
  const t0 = performance.now();
  let done = false;

  // Reset all medallions to hidden state
  items.forEach(g => {
    g.el.style.opacity = "0";
    g.el.style.transform = "scale(.84)";
    g.el.style.filter = "brightness(.35)";
  });

  function tick() {
    if (done) return;
    const elapsed = performance.now() - t0;

    for (const g of items) {
      const p = clamp01((elapsed - g.start) / g.dur);
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
        glow = k * 12;
      } else {
        const k = (p - 0.55) / 0.45;
        sc = 1.06 + (1 - 1.06) * k;
        br = g.power + (1 - g.power) * k;
        glow = 12 * (1 - k);
      }
      g.el.style.transform = `scale(${sc.toFixed(3)})`;
      g.el.style.filter = `brightness(${br.toFixed(2)}) drop-shadow(0 0 ${glow.toFixed(1)}px rgba(185,108,230,0.9))`;
    }

    if (elapsed >= totalDuration) {
      // Commit final state
      items.forEach(g => {
        g.el.style.opacity = "1";
        g.el.style.transform = "none";
        g.el.style.filter = "none";
      });
      done = true;
      onComplete();
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  return () => {
    done = true;
    cancelAnimationFrame(rafId);
  };
}

// --- Flicker (from useBootSequence) ---
function startFlicker(
  art: Element,
  igniteEls: SVGGElement[],
  flickerEnabledRef: React.RefObject<boolean>
): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const loop = () => {
    timeoutId = setTimeout(() => {
      if (flickerEnabledRef && !flickerEnabledRef.current) {
        loop();
        return;
      }
      if (!art.classList.contains("live")) return;

      const targets: (HTMLElement | SVGElement)[] = [art as HTMLElement, ...igniteEls];
      const tgt = targets[Math.floor(Math.random() * targets.length)];

      let n = 0;
      const base = (tgt as HTMLElement).style.opacity || "1";
      intervalId = setInterval(() => {
        n++;
        (tgt as HTMLElement).style.opacity = n % 2 ? "0.6" : "1";
        if (n > 3) {
          clearInterval(intervalId!);
          intervalId = null;
          (tgt as HTMLElement).style.opacity = base;
        }
      }, 45);

      loop();
    }, 2200 + Math.random() * 4200);
  };
  loop();

  return () => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    if (intervalId !== null) clearInterval(intervalId);
  };
}

// --- The hook ---
export function useDiveDirector(deps: DirectorDeps): DirectorAPI {
  const engineRef = useRef<CueEngine | null>(null);
  const [phase, setPhase] = useState<DivePhase>("black");

  // Stable reference to deps so actions can read them
  const depsRef = useRef(deps);
  depsRef.current = deps;

  const replay = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.reset();

    // Reset DOM state
    const frame = depsRef.current.frameRef.current;
    if (frame) {
      frame.art.classList.remove("live");
      (frame.art as HTMLElement).style.opacity = "1";
      frame.ignite.forEach(g => {
        g.el.style.opacity = "0";
        g.el.style.transform = "scale(.84)";
        g.el.style.filter = "brightness(.35)";
      });
    }
    const card = depsRef.current.cardRef.current;
    if (card) {
      card.classList.remove("on");
      card.style.opacity = "";
    }

    setPhase("black");
    engine.start();
  }, []);

  useEffect(() => {
    const engine = new CueEngine(DIVE_SCRIPT);
    engineRef.current = engine;

    engine.setOnChange(() => {
      setPhase(derivePhase(engine));
    });

    // --- Register cue actions ---

    // scene-fade: the page reads derived phase "awaken" and applies sceneIn class
    // No explicit action needed; duration timer handles completion.
    engine.onCueStart("scene-fade", () => {});

    // medallion-ignite: rAF animation
    engine.onCueStart("medallion-ignite", () => {
      const frame = depsRef.current.frameRef.current;
      if (!frame) return;
      // Remap ignite items with relative start offsets (staggered within the cue)
      const items: IgniteItem[] = frame.ignite.map((g, i) => ({
        el: g.el,
        power: g.power,
        start: i * 140,
        dur: g.dur,
      }));
      const totalDur = (frame.ignite.length - 1) * 140 + frame.ignite[frame.ignite.length - 1].dur;
      const cleanup = animateIgnite(items, totalDur, () => {
        engine.completeCue("medallion-ignite");
      });
      return cleanup;
    });

    // error-card: add .on class for signalLock animation
    engine.onCueStart("error-card", () => {
      const card = depsRef.current.cardRef.current;
      if (card) card.classList.add("on");
      return () => {};
    });
    engine.onCueComplete("error-card", () => {
      const card = depsRef.current.cardRef.current;
      if (card) {
        card.classList.remove("on");
        card.style.opacity = "1";
      }
    });

    // idle: add .live class + start flicker
    engine.onCueStart("idle", () => {
      const frame = depsRef.current.frameRef.current;
      if (!frame) return;
      frame.art.classList.add("live");
      const flickerCleanup = startFlicker(
        frame.art,
        frame.ignite.map(g => g.el),
        depsRef.current.flickerEnabledRef
      );
      return flickerCleanup;
    });

    // Start the sequence
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return {
    phase,
    cueActive: useCallback((id: string) => engineRef.current?.isActive(id) ?? false, []),
    cueComplete: useCallback((id: string) => engineRef.current?.isComplete(id) ?? false, []),
    replay,
  };
}
