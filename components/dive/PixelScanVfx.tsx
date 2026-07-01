"use client";
/**
 * PixelScanVfx — applies the VFX-JS "Pixel Scan" dissolve-in shader to a
 * wrapped DOM element. Only fires when `active` is true (tied to dive phase).
 *
 * VFX-JS is WebGL-only and must not be imported at SSR scope. We dynamically
 * import it inside a useEffect so Next 16 / React 19 StrictMode is safe.
 *
 * Fallback: if WebGL is unavailable OR prefers-reduced-motion, the element
 * receives a simple opacity fade-in CSS class instead (no crash).
 *
 * mode: 0 = left-to-right, 1 = top-to-bottom, 2 = radial
 */
import { useEffect, useRef } from "react";
import { PIXEL_SCAN_SHADER } from "./pixelScanShader";
import styles from "./PixelScanVfx.module.css";

export interface PixelScanVfxProps {
  /** The element to apply the dissolve to — must be a direct single child. */
  children: React.ReactNode;
  /** Fire the dissolve? Set to true when the relevant dive phase begins. */
  active: boolean;
  /** Shader mode: 0=L-to-R, 1=top-to-bottom, 2=radial. Default 0. */
  mode?: 0 | 1 | 2;
  /** Width of the scan band. Default 0.2. */
  width?: number;
  /** Number of pixel layers. Default 3. */
  layers?: number;
  /** Reveal speed. Default 0.75. */
  speed?: number;
  /** Start delay in seconds. Default 0. */
  delay?: number;
  /** Extra class applied to the outer wrapper div. */
  className?: string;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PixelScanVfx({
  children,
  active,
  mode = 0,
  width = 0.2,
  layers = 3,
  speed = 0.75,
  delay = 0,
  className,
}: PixelScanVfxProps) {
  const elRef = useRef<HTMLDivElement>(null);
  // Track whether VFX has already fired so we don't re-add on StrictMode double-mount.
  const firedRef = useRef(false);

  // Track the VFX instance for cleanup — typed loosely to avoid SSR import.
  const vfxInstanceRef = useRef<{
    remove: (el: HTMLElement) => void;
    destroy: () => void;
  } | null>(null);
  const elTrackedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    if (firedRef.current) return;
    firedRef.current = true;

    const el = elRef.current;
    if (!el) return;

    // Fallback: reduced motion → simple CSS fade, skip WebGL.
    if (prefersReducedMotion()) {
      el.classList.remove(styles.sourceHidden);
      el.classList.add(styles.fadeFallback);
      return;
    }

    let disposed = false;
    let rafId: number | null = null;

    // Dynamic import keeps VFX-JS out of SSR bundle.
    import("@vfx-js/core").then(({ VFX }) => {
      if (disposed || !elRef.current) return;

      // VFX.init() returns null when WebGL is unavailable (instead of throwing).
      const vfx = VFX.init();
      if (!vfx) {
        // WebGL unavailable — CSS fallback.
        elRef.current.classList.remove(styles.sourceHidden);
        elRef.current.classList.add(styles.fadeFallback);
        return;
      }

      vfxInstanceRef.current = vfx;

      // Delay vfx.add() by one rAF so the browser has painted the element at
      // its final opacity before dom2canvas captures it. Without this delay,
      // CSS keyframe animations may still be at opacity:0 on the first paint,
      // causing dom2canvas to capture a blank (transparent) texture — the
      // shader then has no source pixels and renders nothing.
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (disposed || !elRef.current) return;
        elTrackedRef.current = elRef.current;

        // No intersection threshold — the element is position:fixed and
        // always fully in the viewport; threshold:0.99 caused enterTime to
        // stay at -1 in some layout scenarios.
        vfx.add(elRef.current, {
          shader: PIXEL_SCAN_SHADER,
          overflow: 30,
          uniforms: {
            mode,
            width,
            layers,
            speed,
            delay,
          },
        });
      });
    });

    return () => {
      disposed = true;
      // Reset firedRef so a StrictMode remount (or a future active=false→true cycle)
      // can fire the effect again. Without this, StrictMode's double-invocation of
      // effects leaves firedRef=true on the second mount, silently skipping VFX.
      firedRef.current = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      const vfx = vfxInstanceRef.current;
      const tracked = elTrackedRef.current;
      if (vfx && tracked) {
        try { vfx.remove(tracked); } catch { /* already removed */ }
        try { vfx.destroy(); } catch { /* already destroyed */ }
      }
      vfxInstanceRef.current = null;
      elTrackedRef.current = null;
    };
    // Only re-run when `active` flips true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Reset fired flag when active resets to false so replay works.
  useEffect(() => {
    if (!active) {
      firedRef.current = false;
      elRef.current?.classList.remove(styles.fadeFallback);
      // Re-hide the source so the next play starts hidden (prevents pre-flash on replay).
      elRef.current?.classList.add(styles.sourceHidden);
    }
  }, [active]);

  return (
    <div ref={elRef} className={`${styles.sourceHidden}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
