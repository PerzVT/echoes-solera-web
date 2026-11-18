"use client";

import { readCards } from "./store";

/**
 * The package's 17 cues through Web Audio. Nothing loads or plays until the first tap on the page
 * (`unlockSound`), and every cue respects the remembered mute. Long cues (charge, hum) return a stop handle,
 * so skipping or leaving cuts them off.
 */

export type Cue =
  | "pack-drop"
  | "seam-hum"
  | "tear-1"
  | "tear-2"
  | "stack-slide"
  | "flip-1"
  | "flip-2"
  | "flip-3"
  | "reveal-common"
  | "charge"
  | "reveal-rare"
  | "reveal-sr"
  | "reveal-secret"
  | "new"
  | "feather"
  | "tick"
  | "set-complete";

const CUES: Cue[] = ["pack-drop", "seam-hum", "tear-1", "tear-2", "stack-slide", "flip-1", "flip-2", "flip-3", "reveal-common", "charge", "reveal-rare", "reveal-sr", "reveal-secret", "new", "feather", "tick", "set-complete"];
const src = (c: Cue) => `/labs/cards/flock/sfx/${c}.mp3`;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const bytes = new Map<Cue, Promise<ArrayBuffer | null>>();
const buffers = new Map<Cue, Promise<AudioBuffer | null>>();
const live = new Set<AudioBufferSourceNode>();

/** Fetches the cue files (about 190 KB) without playing anything, so the first cue after the tap is ready. */
export function prefetchSound() {
  if (typeof window === "undefined" || bytes.size) return;
  for (const c of CUES) bytes.set(c, fetch(src(c)).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null));
}

/** Call from a user gesture. Creates the audio context and decodes the cues once. */
export function unlockSound() {
  if (typeof window === "undefined") return;
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
    return;
  }
  prefetchSound();
  for (const c of CUES) {
    buffers.set(
      c,
      bytes.get(c)!.then((b) => (b ? ctx!.decodeAudioData(b.slice(0)) : null)).catch(() => null),
    );
  }
}

export type Playing = { stop: () => void };
const none: Playing = { stop() {} };

/** Plays a cue. A cue still decoding plays if it is ready within 250 ms, and is dropped after that. */
export function play(cue: Cue, volume = 1): Playing {
  if (!ctx || !master || readCards().muted) return none;
  const p = buffers.get(cue);
  if (!p) return none;
  const asked = performance.now();
  let handle: Playing | null = null;
  let cancelled = false;
  p.then((buf) => {
    if (!buf || cancelled || performance.now() - asked > 250 || readCards().muted) return;
    handle = start(buf, volume);
  });
  return {
    stop() {
      cancelled = true;
      handle?.stop();
    },
  };
}

function start(buf: AudioBuffer, volume: number): Playing {
  if (!ctx || !master) return none;
  const node = ctx.createBufferSource();
  node.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = volume;
  node.connect(g).connect(master);
  node.onended = () => live.delete(node);
  live.add(node);
  node.start();
  return {
    stop() {
      try {
        g.gain.setTargetAtTime(0, ctx!.currentTime, 0.03);
        node.stop(ctx!.currentTime + 0.12);
      } catch {
        /* already stopped */
      }
    },
  };
}

/** Cuts every cue that is still sounding, for mute and for leaving the opening. */
export function silence() {
  for (const n of live) {
    try {
      n.stop();
    } catch {
      /* already stopped */
    }
  }
  live.clear();
}

let flipN = 0;
export const flipCue = (): Cue => (["flip-1", "flip-2", "flip-3"] as const)[flipN++ % 3];
