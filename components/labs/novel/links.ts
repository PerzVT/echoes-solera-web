import { charIds, freshRun, linesFor, routeOf, type CharId, type Run, type Story } from "@/lib/labs/novel";
import type { Save } from "./save";

/**
 * Links that open the player in a given state, for showing the story without playing up to it. They
 * never write to the reader's save or gallery.
 *
 *   ?scene=nurse-1                 a scene from its first line (a route's start)
 *   ?scene=dawn&line=3             a scene at a line, by its index in the scene's script
 *   &flags=star,ask&warmth=juri:6  optional run state for the lines that depend on it
 *   ?end=nurse-end-good            an ending card over its scene
 *   ?view=title                    the title screen with a save (a stand-in save when there is none)
 *   ?view=gallery                  the gallery over the title screen
 *
 * A line's own condition is met automatically: its flags are set and its warmth floor is reached.
 */
export type Linked =
  | { kind: "play" | "end"; save: Save }
  | { kind: "title"; save: Save | null; gallery: boolean };

export const standInSave = (): Save => ({
  v: 1,
  scene: "nurse-3",
  index: 0,
  run: { warmth: { juri: 2, nurse: 2, busker: 0, baker: 0 }, flags: ["hand", "nurse-want"], route: "nurse" },
  entry: null,
  phase: "play",
});

export function fromLink(story: Story, search: string): Linked | null {
  const q = new URLSearchParams(search);
  const view = q.get("view");
  if (view === "title" || view === "gallery") return { kind: "title", save: null, gallery: view === "gallery" };

  const id = q.get("end") ?? q.get("scene");
  const scene = id ? story.scenes.find((s) => s.id === id) : undefined;
  if (!scene) return null;
  const ending = q.has("end") && !!scene.ending;

  const route = routeOf(scene.id);
  const run: Run = { ...freshRun(), route };
  for (const f of (q.get("flags") ?? "").split(",").filter(Boolean)) run.flags.push(f);
  for (const pair of (q.get("warmth") ?? "").split(",").filter(Boolean)) {
    const [who, n] = pair.split(":");
    if (charIds.includes(who as CharId) && Number.isFinite(+n)) run.warmth[who as CharId] = +n;
  }
  const at = Math.max(0, Math.min(scene.lines.length - 1, Number(q.get("line") ?? 0) || 0));
  const need = scene.lines[at]?.need;
  if (need) {
    for (const f of [need.flag ?? []].flat()) if (!run.flags.includes(f)) run.flags.push(f);
    const of = need.of ?? route ?? "juri";
    if (need.min !== undefined && run.warmth[of] < need.min) run.warmth[of] = need.min;
    if (need.max !== undefined && run.warmth[of] > need.max) run.warmth[of] = need.max;
  }
  const lines = linesFor(scene, run);
  const index = ending ? lines.length - 1 : Math.max(0, lines.findIndex((l) => l.at >= at));
  return { kind: ending ? "end" : "play", save: { v: 1, scene: scene.id, index, run, entry: null, phase: ending ? "end" : "play" } };
}
