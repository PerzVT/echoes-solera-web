"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./PigmentField.module.css";

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

/*
 * The pigment painting, drifting. The picture is sampled through a slow two-step domain warp, so the
 * colour moves the way ink does in water: it folds and creeps, it does not scroll. Then the ink veil
 * goes over it, at the strength the static CSS version uses, so both look the same at rest.
 */
const FRAG = `
precision mediump float;
uniform sampler2D tex;
uniform vec2 res;
uniform vec2 texRes;
uniform float t;
uniform float flow;
uniform float veil;
uniform vec3 ink;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.0, 9.0); a *= 0.5; }
  return v;
}
vec2 cover(vec2 uv){
  float ra = res.x / res.y, rt = texRes.x / texRes.y;
  vec2 s = ra > rt ? vec2(1.0, rt / ra) : vec2(ra / rt, 1.0);
  return (uv - 0.5) * s + 0.5;
}
void main(){
  vec2 uv = gl_FragCoord.xy / res;
  uv.y = 1.0 - uv.y;
  vec2 p = uv * vec2(res.x / res.y, 1.0) * 1.7;
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.115)), fbm(p + vec2(5.2, 1.3) - t * 0.1));
  vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, 9.2) + t * 0.08), fbm(p + 2.6 * q + vec2(8.3, 2.8) - t * 0.065));
  vec2 st = (cover(uv) - 0.5) * 0.86 + 0.5 + (r - 0.5) * flow;
  vec3 c = texture2D(tex, st).rgb;
  c *= 0.9 + 0.2 * fbm(p * 0.6 - t * 0.018);
  gl_FragColor = vec4(mix(c, ink, veil), 1.0);
}`;

/*
 * The renderer. It runs in a worker on an OffscreenCanvas, so nothing it does (creating the GL context,
 * compiling, decoding the picture, drawing) can hold up the page. Plain script: it is loaded from a
 * Blob, outside the bundle. Messages in: init, size, run, level. Messages out: "on" after the first frame,
 * "fail" when there is no usable WebGL.
 */
const WORKER = `
var gl, cv, uRes, uT, uVeil, uFlow, level = null, raf = 0, ready = false, running = true, said = false, last = 0, speed = 1;
var clock = Math.random() * 60, w = 2, h = 2;
function frame(now) {
  raf = 0;
  if (!ready || !running) return;
  raf = requestAnimationFrame(frame);
  var dt = now - last;
  if (dt < 32) return;
  last = now;
  clock += Math.min(dt, 100) / 1000 * speed;
  gl.uniform1f(uT, clock);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  if (!said) { said = true; postMessage("on"); }
}
function loop() {
  if (raf || !ready || !running) return;
  last = performance.now() - 33;
  raf = requestAnimationFrame(frame);
}
function resize() {
  if (!ready) return;
  cv.width = w; cv.height = h;
  gl.viewport(0, 0, w, h);
  gl.uniform2f(uRes, w, h);
}
onmessage = function (e) {
  var m = e.data;
  if (m.type === "size") { w = m.w; h = m.h; resize(); return; }
  if (m.type === "level") { level = m; if (ready) { gl.uniform1f(uVeil, m.veil); gl.uniform1f(uFlow, m.flow); } return; }
  if (m.type === "run") { running = m.on; if (running) loop(); else if (raf) { cancelAnimationFrame(raf); raf = 0; } return; }
  cv = m.canvas; speed = m.speed; w = m.w; h = m.h; running = m.running;
  // No software rendering: a CPU fallback would cost more than this background is worth.
  gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power", failIfMajorPerformanceCaveat: true });
  if (!gl || typeof requestAnimationFrame !== "function") { postMessage("fail"); return; }
  cv.addEventListener("webglcontextlost", function (ev) { ev.preventDefault(); ready = false; postMessage("fail"); });
  function shader(type, source) { var s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s); return s; }
  var prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, m.vert));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, m.frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { postMessage("fail"); return; }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  uVeil = gl.getUniformLocation(prog, "veil");
  uFlow = gl.getUniformLocation(prog, "flow");
  gl.uniform1f(uVeil, (level || m).veil);
  gl.uniform1f(uFlow, (level || m).flow);
  gl.uniform3f(gl.getUniformLocation(prog, "ink"), m.ink[0], m.ink[1], m.ink[2]);
  uRes = gl.getUniformLocation(prog, "res");
  uT = gl.getUniformLocation(prog, "t");
  fetch(m.src, { headers: { Accept: "image/avif,image/webp,*/*" } }).then(function (r) { return r.blob(); }).then(function (blob) {
    return createImageBitmap(blob).then(function (full) {
      gl.uniform2f(gl.getUniformLocation(prog, "texRes"), full.width, full.height);
      full.close();
      // MIRRORED_REPEAT needs power-of-two sides in WebGL 1, so the picture goes through a 1024 square.
      return createImageBitmap(blob, { resizeWidth: 1024, resizeHeight: 1024, resizeQuality: "medium" });
    });
  }).then(function (square) {
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, square);
    square.close();
    ready = true;
    resize();
    loop();
  }).catch(function () { postMessage("fail"); });
};
`;

const LEVELS = {
  low: { veil: 0.8, flow: 0.2 },
  medium: { veil: 0.72, flow: 0.24 },
  high: { veil: 0.58, flow: 0.28 },
} as const;

type Props = {
  /** How much of the painting shows through the ink. "low" is the site background; muted text keeps better than 6:1 over its brightest point. */
  intensity?: keyof typeof LEVELS;
  /** Time scale. 1 is slow; the field is meant to be noticed late. */
  speed?: number;
  /** "fixed" sits behind the whole page. "absolute" fills the nearest positioned ancestor. */
  position?: "fixed" | "absolute";
  /** Keeps the static picture and never starts the shader. */
  still?: boolean;
  src?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * The site's background. A static picture under an ink veil is always there: it is the fallback, the
 * reduced-motion state and what shows without script. Where motion is welcome and the browser has
 * OffscreenCanvas and hardware WebGL, a canvas fades in over it and drifts. The shader starts a few
 * seconds after the page has loaded, runs in a worker at half resolution and 30 frames a second, and stops
 * while the tab is hidden or the field is off screen. Anything less capable keeps the picture.
 */
/**
 * The picture through the image optimiser: AVIF where the browser takes it, at the file's own size
 * (pigment-dark is 1672 x 941, 287 KB as WebP, about 55 KB as AVIF). Under the veil the two look the same.
 */
const texture = (src: string) => (/^\/[^/].*\.(webp|png|jpe?g)$/.test(src) ? getImageProps({ src, width: 1672, height: 941, alt: "" }).props.src : src);

export function PigmentField({ intensity = "low", speed = 1, position = "fixed", still = false, src: file = "/labs/brand/pigment-dark.webp", className, style }: Props) {
  const src = texture(file);
  const host = useRef<HTMLDivElement>(null);
  const live = useRef<Worker | null>(null);
  const wanted = useRef(intensity);
  wanted.current = intensity;

  // A change of intensity goes to the running shader; the static picture follows through data-intensity.
  useEffect(() => {
    live.current?.postMessage({ type: "level", ...LEVELS[intensity] });
  }, [intensity]);

  useEffect(() => {
    const el = host.current;
    if (!el || still) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    if (typeof Worker === "undefined" || !("transferControlToOffscreen" in HTMLCanvasElement.prototype)) return;

    let dead = false;
    let stop = () => {};

    const boot = () => {
      if (dead) return;
      // A canvas can hand over control only once, so each run of this effect makes its own.
      const cv = document.createElement("canvas");
      cv.className = styles.canvas;
      const measure = () => {
        const r = el.getBoundingClientRect();
        // Half resolution, capped: the picture is soft, so the pixels would be wasted.
        const k = Math.min(0.5, 880 / Math.max(r.width, 1));
        return { w: Math.max(2, Math.round(r.width * k)), h: Math.max(2, Math.round(r.height * k)) };
      };
      let url = "";
      let worker: Worker;
      try {
        const off = cv.transferControlToOffscreen();
        url = URL.createObjectURL(new Blob([WORKER], { type: "text/javascript" }));
        worker = new Worker(url);
        el.prepend(cv);
        const level = LEVELS[wanted.current];
        live.current = worker;
        worker.postMessage(
          // --bg, #121923.
          { type: "init", canvas: off, vert: VERT, frag: FRAG, src: new URL(src, location.href).href, speed, ...level, ink: [18 / 255, 25 / 255, 35 / 255], ...measure(), running: !document.hidden },
          [off],
        );
      } catch {
        if (url) URL.revokeObjectURL(url);
        cv.remove();
        return;
      }

      let visible = true;
      const run = () => worker.postMessage({ type: "run", on: visible && !document.hidden });
      const quit = () => {
        if (live.current === worker) live.current = null;
        worker.terminate();
        URL.revokeObjectURL(url);
        cv.remove();
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", run);
        reduced.removeEventListener("change", onMotion);
      };
      worker.onmessage = (e) => {
        if (e.data === "on") cv.dataset.on = "true";
        else quit();
      };
      worker.onerror = quit;
      const ro = new ResizeObserver(() => worker.postMessage({ type: "size", ...measure() }));
      ro.observe(el);
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        run();
      });
      io.observe(el);
      const onMotion = () => {
        if (reduced.matches) quit();
      };
      document.addEventListener("visibilitychange", run);
      reduced.addEventListener("change", onMotion);
      stop = quit;
    };

    // The static picture is already showing, so there is no hurry. Starting a GL context can stall frames
    // for a moment even from a worker (the GPU process is shared), so it waits until the intro and the
    // page's entrance have played, and then for an idle moment.
    let idle = 0;
    let timer = 0;
    const whenIdle = () => {
      timer = window.setTimeout(() => {
        // Safari has no requestIdleCallback.
        if (typeof requestIdleCallback === "function") idle = requestIdleCallback(boot, { timeout: 2000 });
        else boot();
      }, 2600);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });

    return () => {
      dead = true;
      window.removeEventListener("load", whenIdle);
      if (idle) cancelIdleCallback(idle);
      clearTimeout(timer);
      stop();
    };
  }, [speed, src, still]);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={[styles.field, className].filter(Boolean).join(" ")}
      data-intensity={intensity}
      data-position={position}
      style={{ "--pf-src": `url(${src})`, ...style } as CSSProperties}
    >
      <span className={styles.grain} />
    </div>
  );
}
