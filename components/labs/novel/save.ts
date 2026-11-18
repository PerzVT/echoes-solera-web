import type { Run, Sprite } from "@/lib/labs/novel";

/**
 * What the player keeps in the browser. Three keys, because they live for different lengths of time:
 * the save is one run and goes on Start over; progress (gallery, endings, lines read) outlives every run;
 * preferences are the reader's own. Every read and write is wrapped, because storage can be missing or
 * blocked, and the player has to work without it.
 */
const KEY = { save: "nl.vn.after-hours.save", progress: "nl.vn.after-hours.progress", prefs: "nl.vn.prefs" };

/** One automatic save. The choice's warmth and its next scene are written together, so Continue cannot award a choice twice. */
export type Save = {
  v: 1;
  scene: string;
  /** The next line to show, counted among the lines this run sees. */
  index: number;
  run: Run;
  /** Who was on screen, and which illustration, as the scene began. */
  entry: Sprite;
  entryCg?: string;
  phase: "play" | "end";
};
export type Progress = { v: 1; cgs: string[]; endings: string[]; read: string[] };
export type Speed = "slow" | "normal" | "fast";
export type Prefs = { volume: number; muted: boolean; speed: Speed; large: boolean };

export const defaultPrefs: Prefs = { volume: 0.7, muted: false, speed: "normal", large: false };
const emptyProgress: Progress = { v: 1, cgs: [], endings: [], read: [] };

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the run goes on, it just will not be there next time.
  }
}

export function loadSave(): Save | null {
  const s = read<Save>(KEY.save);
  return s && s.v === 1 && typeof s.scene === "string" && s.run?.warmth ? s : null;
}
export const writeSave = (s: Save | null) => write(KEY.save, s);

export function loadProgress(): Progress {
  const p = read<Progress>(KEY.progress);
  return p && p.v === 1 ? { ...emptyProgress, ...p } : emptyProgress;
}
export const writeProgress = (p: Progress) => write(KEY.progress, p);

export const loadPrefs = (): Prefs => ({ ...defaultPrefs, ...(read<Partial<Prefs>>(KEY.prefs) ?? {}) });
export const writePrefs = (p: Prefs) => write(KEY.prefs, p);
