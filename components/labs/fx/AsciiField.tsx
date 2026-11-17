"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./AsciiField.module.css";

/* Light to dense. The two block glyphs at the end are the portal's own (DiveStatusBar, DiveWelcome). */
const RAMP = " .·:-=+*x▚▮";

type Props = {
  /**
   * A picture to draw in glyphs. Use a cut-out with a clear shape, such as the mark: it is drawn by its
   * silhouette and reads well. A photograph is drawn by brightness rank and edges, but at this glyph size
   * and contrast a dark frame comes out as texture, not as the picture, so the site does not use one.
   * Without `src` the field is drifting noise.
   */
  src?: string;
  /** How the picture sits in the field. */
  fit?: "contain" | "cover";
  /** "drift": slow weather. "scan": a band of density crosses the field again and again, for work in progress. */
  mode?: "drift" | "scan";
  /** Cell height in CSS pixels. The cell is 0.6 as wide. */
  cell?: number;
  /** Peak opacity of the glyphs, 0 to 1. Keep it low behind text. */
  intensity?: number;
  /** Time scale. */
  speed?: number;
  /** Tints the densest glyph with the accent. */
  accent?: boolean;
  className?: string;
  style?: CSSProperties;
};

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/**
 * A field of monospace glyphs in the manner of the Solera portal's terminal, drawn on a 2D canvas.
 * Decorative: it sits behind content or stands in for work in progress. It redraws twelve times a
 * second, only while it is on screen and the tab is visible. Under reduced motion it draws one frame.
 */
export function AsciiField({ src, fit = "contain", mode = "drift", cell = 16, intensity = 0.22, speed = 1, accent = true, className, style }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = host.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const css = getComputedStyle(el);
    const ink = css.color;
    const hot = css.getPropertyValue("--accent").trim() || ink;

    let cols = 0;
    let rows = 0;
    let cw = 0;
    let dpr = 1;
    let source: Float32Array | null = null;
    let photo = false;
    let picture: HTMLImageElement | null = null;

    const sample = () => {
      if (!picture || !cols || !rows) return;
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      // A glyph cell is taller than wide, so the picture is fitted in pixels and then mapped to cells.
      const pw = cols * cw;
      const ph = rows * cell;
      const k = (fit === "cover" ? Math.max : Math.min)(pw / picture.naturalWidth, ph / picture.naturalHeight) * (fit === "cover" ? 1 : 0.82);
      const dw = (picture.naturalWidth * k) / cw;
      const dh = (picture.naturalHeight * k) / cell;
      o.drawImage(picture, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
      const px = o.getImageData(0, 0, cols, rows).data;
      const n = cols * rows;
      const lum = new Float32Array(n);
      let lo = 1;
      let hi = 0;
      let holes = 0;
      for (let i = 0; i < n; i++) {
        lum[i] = (px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114) / 255;
        if (px[i * 4 + 3] < 250) holes++;
        else {
          lo = Math.min(lo, lum[i]);
          hi = Math.max(hi, lum[i]);
        }
      }
      source = new Float32Array(n);
      // A cut-out (the mark, a figure): its shape is the picture, so alpha leads and the field weathers it.
      photo = holes < n * 0.02 && hi - lo > 0.1;
      if (!photo) {
        for (let i = 0; i < n; i++) source[i] = (px[i * 4 + 3] / 255) * (0.35 + 0.65 * lum[i]);
        return;
      }
      // A photograph: its brightness is spread over the whole ramp and its edges are added, which is
      // what lets a face or a doorway survive being set in glyphs.
      // Brightness by rank, not by value: a dark, low-key frame still uses the whole ramp.
      const order = Array.from(lum.keys()).sort((i, j) => lum[i] - lum[j]);
      const rank = new Float32Array(n);
      order.forEach((i, k) => (rank[i] = Math.pow(k / (n - 1), 1.6)));
      const at = (x: number, y: number) => lum[Math.min(rows - 1, Math.max(0, y)) * cols + Math.min(cols - 1, Math.max(0, x))];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
          const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
          source[y * cols + x] = Math.min(1, rank[y * cols + x] * 0.86 + Math.min(1, Math.hypot(gx, gy)) * 0.35);
        }
      }
    };

    const size = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cw = cell * 0.6;
      cols = Math.max(1, Math.ceil(r.width / cw));
      rows = Math.max(1, Math.ceil(r.height / cell));
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      sheets = { ink: glyphSheet(ink), hot: glyphSheet(hot) };
      sample();
      draw();
    };

    /*
     * Each ramp glyph is drawn once, per fill style, into a strip at device resolution; the frame loop
     * copies cells out of it with drawImage, which is far cheaper than a fillText per glyph.
     */
    const font = () => `${Math.round(cell * 0.82)}px ui-monospace, "Cascadia Mono", "SF Mono", Menlo, Consolas, monospace`;
    const glyphSheet = (fill: string) => {
      const sheet = document.createElement("canvas");
      sheet.width = Math.ceil(cw * dpr) * RAMP.length;
      sheet.height = Math.ceil(cell * dpr);
      const g = sheet.getContext("2d")!;
      g.scale(dpr, dpr);
      g.font = font();
      g.textBaseline = "top";
      g.fillStyle = fill;
      const step = Math.ceil(cw * dpr) / dpr;
      for (let i = 1; i < RAMP.length; i++) g.fillText(RAMP[i], i * step, 0);
      return sheet;
    };
    let sheets: { ink: HTMLCanvasElement; hot: HTMLCanvasElement } | null = null;

    let clock = 0;
    let glyphs = new Uint8Array(0);
    const draw = () => {
      if (!cols || !sheets) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      const sw = Math.ceil(cw * dpr);
      const sh = Math.ceil(cell * dpr);
      const t = clock;
      const band = mode === "scan" ? ((t * 0.22) % 1.4) - 0.2 : 0;
      const last = RAMP.length - 1;
      if (glyphs.length !== cols * rows) glyphs = new Uint8Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const n = noise(x * 0.09 + t * 0.05, y * 0.16 - t * 0.035) * 0.62 + noise(x * 0.27 - t * 0.04, y * 0.4 + 7.3) * 0.38;
          let v: number;
          if (source) {
            const s = source[y * cols + x];
            // A photograph holds still apart from a slight shimmer; a cut-out is weathered by the noise.
            v = photo ? s * (0.9 + 0.14 * n) : s > 0.02 ? s * (0.55 + 0.6 * n) : n * 0.2;
          } else {
            v = Math.max(0, n * 1.5 - 0.42);
          }
          if (mode === "scan") {
            const d = Math.abs(x / cols - band);
            v = v * 0.5 + Math.max(0, 1 - d * 6) * (0.25 + 0.5 * n);
          }
          glyphs[y * cols + x] = Math.min(last, Math.floor(Math.min(1, v) * (last + 1)));
        }
      }
      // Three passes, one per opacity step, so the fill style changes three times a frame and not per glyph.
      for (let pass = 0; pass < 3; pass++) {
        const sheet = pass === 2 && accent ? sheets.hot : sheets.ink;
        ctx.globalAlpha = intensity * (pass === 0 ? 0.45 : pass === 1 ? 0.8 : 1);
        for (let i = 0; i < glyphs.length; i++) {
          const g = glyphs[i];
          if (g === 0 || (g <= 4 ? 0 : g < last ? 1 : 2) !== pass) continue;
          ctx.drawImage(sheet, g * sw, 0, sw, sh, (i % cols) * cw, Math.floor(i / cols) * cell, sw / dpr, sh / dpr);
        }
      }
      ctx.globalAlpha = 1;
    };

    let timer = 0;
    let visible = false;
    const tick = () => {
      clock += (1 / 12) * speed;
      draw();
    };
    const start = () => {
      if (timer || !visible || document.hidden || reduced.matches) return;
      timer = window.setInterval(tick, 1000 / 12);
    };
    const stop = () => {
      clearInterval(timer);
      timer = 0;
    };

    if (src) {
      const img = new Image();
      img.onload = () => {
        picture = img;
        sample();
        draw();
      };
      img.src = src;
    }

    const ro = new ResizeObserver(size);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(el);
    const onVis = () => (document.hidden ? stop() : start());
    const onMotion = () => (reduced.matches ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    reduced.addEventListener("change", onMotion);
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      reduced.removeEventListener("change", onMotion);
    };
  }, [src, fit, mode, cell, intensity, speed, accent]);

  return (
    <div ref={host} aria-hidden="true" className={[styles.field, className].filter(Boolean).join(" ")} style={style}>
      <canvas ref={canvas} />
    </div>
  );
}
