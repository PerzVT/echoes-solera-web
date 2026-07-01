"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  a: number;
  sp: number;
  base: number;
}

interface StarfieldProps {
  /**
   * Particle density divisor — innerWidth is divided by this value to get
   * particle count. Lower = fewer particles.
   * Defaults to 14 (rich mode). Pass 26 for subtle mode.
   */
  density?: number;
}

export function Starfield({ density = 14 }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Track density in a ref so the effect can re-seed when it changes
  const densityRef = useRef(density);

  // Update the ref whenever the prop changes — the effect reads from the ref
  densityRef.current = density;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    let W = 0;
    let H = 0;
    let parts: Particle[] = [];
    let rafId = 0;
    // Track density used for the current seed so we detect changes
    let seededWithDensity = densityRef.current;

    function resize() {
      W = cv!.width = window.innerWidth * devicePixelRatio;
      H = cv!.height = window.innerHeight * devicePixelRatio;
    }

    function seed(d: number) {
      parts = [];
      const n = Math.round(window.innerWidth / d);
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: (Math.random() * 1.6 + 0.3) * devicePixelRatio,
          vy: -(Math.random() * 0.18 + 0.04) * devicePixelRatio,
          vx: (Math.random() - 0.5) * 0.06 * devicePixelRatio,
          a: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.02 + 0.005,
          base: Math.random() * 0.5 + 0.25,
        });
      }
      seededWithDensity = d;
    }

    function tick() {
      // Re-seed if density prop changed since last seed
      const currentDensity = densityRef.current;
      if (currentDensity !== seededWithDensity) {
        seed(currentDensity);
      }

      cx!.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y += p.vy;
        p.x += p.vx;
        p.a += p.sp;
        if (p.y < -4) p.y = H + 4;
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
        const tw = p.base + Math.sin(p.a) * 0.25;
        cx!.beginPath();
        cx!.arc(p.x, p.y, p.r, 0, 7);
        cx!.fillStyle = "rgba(190,120,235," + Math.max(0, tw) + ")";
        cx!.shadowBlur = 6 * devicePixelRatio;
        cx!.shadowColor = "rgba(185,108,230,.8)";
        cx!.fill();
      }
      rafId = requestAnimationFrame(tick);
    }

    resize();
    seed(densityRef.current);
    window.addEventListener("resize", resize);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []); // run once on mount — density changes detected inside tick() via ref

  return (
    <canvas
      ref={canvasRef}
      className="stars"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
