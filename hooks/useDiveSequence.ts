"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useDiveSequence — drives the 6-phase cinematic ARG entry ("The Dive").
 *
 * Phases (black-first, sparse → rich, then severed → denied):
 *   black    — pure black, sparse terminal lines type in
 *   autofill — masked access key auto-types, "authenticating..."
 *   awaken   — purple particles + medallions materialize
 *   welcome  — "WELCOME TO SOLER▮" peak
 *   severed  — red flash + glitch tear
 *   error    — settles into the AUTHENTICATION ERROR resting state
 *
 * The hook is a pure time-driven state machine (setTimeout chain stored in a
 * ref, fully cleaned up). It exposes the current phase, a 0..1 progress value
 * within the run, and a replay() to re-run from the top. StrictMode-safe.
 */

export type DivePhase =
  | "black"
  | "autofill"
  | "awaken"
  | "welcome"
  | "severed"
  | "error";

// Phase start offsets (ms from sequence start). Tunable.
export const DIVE_TIMING: Record<DivePhase, number> = {
  black:    0,
  autofill: 2200,
  awaken:   4600,
  welcome:  7000,
  severed:  8600,
  error:    9100,
};

const PHASE_ORDER: DivePhase[] = [
  "black",
  "autofill",
  "awaken",
  "welcome",
  "severed",
  "error",
];

export function useDiveSequence(autoStart = true): {
  phase: DivePhase;
  replay: () => void;
  skip: () => void;
} {
  const [phase, setPhase] = useState<DivePhase>("black");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setPhase("black");
    for (const p of PHASE_ORDER) {
      const at = DIVE_TIMING[p];
      if (at <= 0) continue;
      timersRef.current.push(setTimeout(() => setPhase(p), at));
    }
  }, [clearTimers]);

  const replay = useCallback(() => {
    start();
  }, [start]);

  const skip = useCallback(() => {
    clearTimers();
    setPhase("error");
  }, [clearTimers]);

  useEffect(() => {
    if (autoStart) start();
    return clearTimers;
  }, [autoStart, start, clearTimers]);

  return { phase, replay, skip };
}
