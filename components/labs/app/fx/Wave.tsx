"use client";

/**
 * The wave that carries the creator into work it has just started: Submit on a start screen, Generate at the end of
 * a flow. Nowhere else.
 *
 * The wave is distortion-waves, in its one-view form, played over the screen being left. The press calls `sendWave`
 * as it starts the work; the screen bends toward the button and the wave carries it up and away while the request
 * runs. The navigation (or change of state) happens whenever the work is accepted, as it always did, and the next
 * screen shows through behind the wave's tail. Nothing waits on the wave: the canvas takes no pointer events, lies
 * over the screen only while the wave is out, and is removed when it ends. Work that fails calls `cancelWave`, and
 * the wave runs back into its button.
 *
 * WaveHost, mounted once in the creator's layout, holds the wave, so it carries on across the navigation.
 *
 * The library is imported here only, through next/dynamic, so it stays out of the server bundle and loads with
 * `preloadWave` on the screens that send a wave. Without WebGL 2, and under reduced motion, the library crossfades
 * instead; in this form there is no second view to fade to, so the screen simply changes as it does without a wave.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { CaptureRequest, DistortionWaveHandle, Palette, Rect, WaveStyleInput } from "distortion-waves";

type Lib = typeof import("distortion-waves");
let loading: Promise<Lib> | null = null;
const load = () => (loading ??= import("distortion-waves"));

/** Development only: the wave's moments, timed, in the console. */
const trace = (what: string) => {
  if (process.env.NODE_ENV === "development") console.info(`[wave] ${Math.round(performance.now())} ${what}`);
};

let warmed = false;

/**
 * Loads the library, so the wave can leave the moment its button is pressed, and warms what the first wave would
 * otherwise pay for while the browser is idle on the screen that will send it:
 * - one picture of the screen. The library keeps the fonts and images it has embedded, so the picture taken at the
 *   press is ready within a frame or two.
 * - the wave's shaders, compiled once on a throwaway canvas. The browser keeps compiled shaders, so the wave's own
 *   renderer does not stall its first frames compiling them (about 300 ms on a cold cache).
 */
export function preloadWave() {
  if (typeof window === "undefined") return;
  const lib = load();
  if (!state.primed) {
    state = { ...state, primed: true };
    notify();
  }
  if (warmed) return;
  warmed = true;
  lib
    .then(({ snapshot, WaveRenderer }) => {
      const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200));
      idle(() => {
        const el = document.getElementById("main");
        if (!el) return;
        void snapshot(el, { width: el.clientWidth, height: Math.min(el.clientHeight, window.innerHeight), scale: 0.5, background: "#000" }).catch(() => {});
      });
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      idle(() => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        try {
          const r = new WaveRenderer(canvas, { alpha: true });
          r.dispose();
          canvas.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
        } catch {}
      });
    })
    .catch(() => {
      loading = null;
      warmed = false;
    });
}

/** The brand's pigments: rose, cream, air and iris, with the deep and liquid blues of the materials. */
const PALETTE: Palette = {
  colors: [
    [255, 131, 183],
    [198, 220, 235],
    [146, 155, 210],
    [246, 243, 236],
    [72, 128, 228],
    [255, 170, 205],
    [44, 72, 170],
  ],
  ahead: [255, 131, 183],
  behind: [72, 128, 228],
};

/**
 * About 1.6 s in all (anticipation plus the longest of travel, rim, hairline and dots): the library's own vertical
 * wave, its swell, blur, colour and pull at full strength, run at a little over twice its speed.
 */
const STYLE: WaveStyleInput = {
  anticipation: 0.28,
  travel: 1.7,
  linger: -0.25,
  rimFade: 1.55,
  hairlineLinger: 0.3,
  hairlineFade: 1,
  particleLife: 1.2,
  returnSpeed: 2.2,
  strength: 1,
  rimStrength: 0.95,
  amplitude: 40,
  swell: 26,
  aberration: 0.9,
};

/* ---------- Requests ---------- */

type Play = { id: number; box: Rect; source: Rect };

/** `primed` once a screen that sends a wave has asked for the library: the wave's element is mounted, empty, so the press does not wait for it. */
let state: { primed: boolean; play: Play | null } = { primed: false, play: null };
let next = 0;
/** Waves up to this id were called off. */
let cancelled = 0;
let running: DistortionWaveHandle | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const subscribe = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn));
const setPlay = (play: Play | null) => {
  state = { primed: state.primed || Boolean(play), play };
  notify();
};

/** Where the wave goes: the part of #main in view, or the whole view when there is none. */
function frameOf(): Rect {
  const all = { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
  const r = document.getElementById("main")?.getBoundingClientRect();
  if (!r || r.width < 40) return all;
  const top = Math.max(r.top, 0);
  const bottom = Math.min(r.bottom, window.innerHeight);
  return bottom - top < 40 ? all : { x: r.left, y: top, w: r.width, h: bottom - top };
}

/**
 * Sends the wave from `source` (the pressed button; left out, the element marked data-wave-source) over the screen,
 * now. Call it as the press starts the work, and `cancelWave` when the work fails. `when` settles with whether the
 * work was taken: false runs the wave back into its button, as `cancelWave` does. Never waits.
 */
export function sendWave(source?: Element | null, opts: { when?: Promise<boolean> } = {}) {
  if (typeof document === "undefined") return;
  const el = source ?? document.querySelector("[data-wave-source]");
  if (!el) return;
  preloadWave();
  const f = el.getBoundingClientRect();
  const box = frameOf();
  const id = ++next;
  trace(`send ${id}${opts.when ? " gated" : ""}`);
  setPlay({ id, box, source: { x: f.left - box.x, y: f.top - box.y, w: f.width, h: f.height } });
  const off = () => {
    if (state.play?.id === id) cancelWave();
  };
  opts.when?.then((ok) => ok || off(), off);
}

/** For work that failed: the wave runs back into its button, or never leaves when it has not yet. */
export function cancelWave() {
  const play = state.play;
  if (!play || play.id <= cancelled) return;
  trace(`cancel ${play.id}${running ? " (running back)" : ""}`);
  cancelled = play.id;
  if (running) running.reverse();
  else setPlay(null);
}

function end(id: number) {
  if (state.play?.id !== id) return;
  trace(`end ${id}`);
  running = null;
  setPlay(null);
}

/* ---------- The wave ---------- */

type RunProps = { play: Play | null };

/** The wave itself, in the library's chunk. It plays once on mount and reports when it is done. */
const Run = dynamic(
  () =>
    load()
      .then(({ DistortionWave, snapshot }) => {
        function OneWave({ play }: { play: Play }) {
          const ref = useRef<DistortionWaveHandle>(null);
          const marker = useRef<HTMLSpanElement>(null);
          useEffect(() => {
            if (play.id <= cancelled) return end(play.id);
            const h = ref.current;
            running = h;
            trace(`play ${play.id} handle=${Boolean(h)}`);
            h?.play({ source: play.source, focus: null });
            // When the next screen comes in under the wave, the wave pictures it again, so its lens bends what is
            // there. The marker is a change inside the wave's element, which is what the library watches.
            const main = document.getElementById("main");
            const seen = new MutationObserver(() => {
              if (document.getElementById("main") === main) return;
              seen.disconnect();
              trace(`next screen under wave ${play.id}`);
              marker.current?.setAttribute("data-next", "");
            });
            seen.observe(document.body, { childList: true, subtree: true });
            return () => {
              seen.disconnect();
              if (running === h) running = null;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
          }, []);
          // The picture is of #main, not of this empty layer: the wave bends the screen underneath.
          const capture = async (req: CaptureRequest) => {
            const t0 = performance.now();
            const t = document.getElementById("main");
            if (!t) {
              const blank = document.createElement("canvas");
              blank.width = blank.height = 1;
              return blank;
            }
            const r = t.getBoundingClientRect();
            const root = {
              position: "absolute",
              left: `${r.left - play.box.x}px`,
              top: `${r.top - play.box.y}px`,
              margin: "0",
              transform: "none",
              translate: "none",
              opacity: "1",
              width: `${t.offsetWidth}px`,
              height: `${t.offsetHeight}px`,
              "box-sizing": "border-box",
            };
            const shot = await snapshot(t, {
              width: req.width,
              height: req.height,
              scale: req.scale,
              background: req.background,
              skip: (el) => req.ignore(el) || el.hasAttribute("data-dw-skip"),
              // A picture part-way through its fade-in (fx/Picture) is drawn as it will be a moment later.
              force: (el): Record<string, string> | undefined => (el === t ? root : el.hasAttribute("data-pic") ? { opacity: "1" } : undefined),
            });
            trace(`picture ${play.id} in ${Math.round(performance.now() - t0)} ms`);
            return shot.canvas;
          };
          const { box } = play;
          return (
            <DistortionWave
              ref={ref}
              aria-hidden="true"
              data-dw-skip=""
              type="vertical"
              palette={PALETTE}
              waveStyle={STYLE}
              cornerRadius={0}
              prewarm={false}
              live
              resolution={1}
              capture={capture}
              onFinish={() => end(play.id)}
              style={{ position: "fixed", left: box.x, top: box.y, width: box.w, height: box.h, pointerEvents: "none", zIndex: 30 }}
            >
              <span ref={marker} />
            </DistortionWave>
          );
        }
        return function WaveRun({ play }: RunProps) {
          return play ? <OneWave key={play.id} play={play} /> : null;
        };
      })
      .catch(() => {
        // A library that does not load costs the wave and nothing else.
        loading = null;
        return function NoWave({ play }: RunProps) {
          useEffect(() => {
            if (play) end(play.id);
          }, [play]);
          return null;
        };
      }),
  { ssr: false },
);

const SERVER = { primed: false, play: null };

/** Mounted once in the creator's layout. Renders nothing until a screen that sends a wave asks for it. */
export function WaveHost() {
  const { primed, play } = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER,
  );
  const id = play?.id;
  // A wave that never reports its end is cleared anyway.
  useEffect(() => {
    if (id === undefined) return;
    const t = window.setTimeout(() => end(id), 6000);
    return () => window.clearTimeout(t);
  }, [id]);
  return primed ? <Run play={play} /> : null;
}
