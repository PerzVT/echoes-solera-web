// lib/diveScript.ts

import type { Cue, CueEngine } from "./cueEngine";

export type DivePhase =
  | "black"
  | "autofill"
  | "awaken"
  | "welcome"
  | "severed"
  | "error";

export const DIVE_SCRIPT: Cue[] = [
  // ACT 1: Terminal boot
  { id: "terminal-type",     after: "START",                                    duration: 1800 },
  { id: "autofill",          after: "terminal-type",                            duration: 2000 },

  // ACT 2: Awaken
  { id: "scene-fade",        after: "autofill",                                 duration: 1400 },
  { id: "medallion-ignite",  after: "scene-fade", trigger: "start", delay: 300, duration: 1200 },

  // ACT 3: Peak + sever
  { id: "welcome",           after: "medallion-ignite",              delay: 400, duration: 1200 },
  { id: "sever",             after: "welcome",                                  duration: 500  },

  // ACT 4: Error settle
  { id: "error-card",        after: "sever",                                    duration: 1000 },
  { id: "crt-enable",        after: "error-card",                   delay: 200 },
  { id: "idle",              after: "crt-enable" },
];

export function derivePhase(engine: CueEngine): DivePhase {
  if (engine.isComplete("idle") || engine.isActive("error-card") || engine.isActive("crt-enable") || engine.isComplete("error-card"))
    return "error";
  if (engine.isActive("sever"))                                     return "severed";
  if (engine.isActive("welcome"))                                   return "welcome";
  if (engine.isActive("scene-fade") || engine.isActive("medallion-ignite"))
                                                                    return "awaken";
  if (engine.isActive("autofill") || engine.isComplete("autofill")) return "autofill";
  if (engine.isActive("terminal-type"))                             return "autofill";
  return "black";
}
