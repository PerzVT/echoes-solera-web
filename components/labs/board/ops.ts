import type { Episode, Scene, Shot } from "./data";

/** Edits to an episode. Each returns a new episode and leaves the one given alone. */

let n = 0;
export const newId = (p: string) => `${p}-${Date.now().toString(36)}-${++n}`;

export function find(e: Episode, id: string) {
  for (let si = 0; si < e.scenes.length; si++) {
    const i = e.scenes[si].shots.findIndex((s) => s.id === id);
    if (i >= 0) return { si, i, scene: e.scenes[si], shot: e.scenes[si].shots[i] };
  }
  return null;
}

const mapScenes = (e: Episode, f: (s: Scene, si: number) => Scene): Episode => ({ scenes: e.scenes.map(f) });

export function patchShot(e: Episode, id: string, p: Partial<Shot> | ((s: Shot) => Partial<Shot>)): Episode {
  return mapScenes(e, (sc) => (sc.shots.some((s) => s.id === id) ? { ...sc, shots: sc.shots.map((s) => (s.id === id ? { ...s, ...(typeof p === "function" ? p(s) : p) } : s)) } : sc));
}

export function blankShot(like?: Shot): Shot {
  return { id: newId("shot"), label: "New shot", action: "", cast: [], place: like?.place ?? "aisles", prompt: "", seconds: 4, takes: [], take: 0, status: "empty", next: like?.next.length ? like.next : like?.takes ?? [] };
}

/** A new empty shot at `at` in scene `sceneId`. */
export function addShot(e: Episode, sceneId: string, at: number): { e: Episode; id: string } {
  const scene = e.scenes.find((s) => s.id === sceneId);
  if (!scene) return { e, id: "" };
  const like = scene.shots[Math.max(0, at - 1)] ?? scene.shots[0];
  const fresh = blankShot(like);
  return { e: mapScenes(e, (sc) => (sc.id === sceneId ? { ...sc, shots: [...sc.shots.slice(0, at), fresh, ...sc.shots.slice(at)] } : sc)), id: fresh.id };
}

export function duplicateShot(e: Episode, id: string): { e: Episode; id: string } {
  const f = find(e, id);
  if (!f) return { e, id };
  const copy: Shot = { ...f.shot, id: newId("shot"), review: undefined, status: f.shot.status === "generating" ? "ready" : f.shot.status };
  return { e: mapScenes(e, (sc, si) => (si === f.si ? { ...sc, shots: [...sc.shots.slice(0, f.i + 1), copy, ...sc.shots.slice(f.i + 1)] } : sc)), id: copy.id };
}

export function deleteShot(e: Episode, id: string): Episode {
  return mapScenes(e, (sc) => ({ ...sc, shots: sc.shots.filter((s) => s.id !== id) }));
}

/** Moves a shot to index `at` of scene `sceneId`, where `at` counts the scene's shots without the one moving. */
export function moveShot(e: Episode, id: string, sceneId: string, at: number): Episode {
  const f = find(e, id);
  if (!f) return e;
  const without = deleteShot(e, id);
  return mapScenes(without, (sc) => {
    if (sc.id !== sceneId) return sc;
    const k = Math.max(0, Math.min(sc.shots.length, at));
    return { ...sc, shots: [...sc.shots.slice(0, k), f.shot, ...sc.shots.slice(k)] };
  });
}

/** One place left or right in the single line of shots, crossing into the next scene at an edge. */
export function nudgeShot(e: Episode, id: string, dir: -1 | 1): Episode {
  const f = find(e, id);
  if (!f) return e;
  const j = f.i + dir;
  if (j >= 0 && j < f.scene.shots.length) return moveShot(e, id, f.scene.id, j);
  const other = e.scenes[f.si + dir];
  if (!other) return e;
  return moveShot(e, id, other.id, dir < 0 ? other.shots.length : 0);
}

export function canNudge(e: Episode, id: string, dir: -1 | 1) {
  const f = find(e, id);
  if (!f) return false;
  const j = f.i + dir;
  return (j >= 0 && j < f.scene.shots.length) || !!e.scenes[f.si + dir];
}

export function addScene(e: Episode, after: number): { e: Episode; id: string } {
  const scene: Scene = { id: newId("scene"), heading: "INT. NEW SCENE - DAY", shots: [] };
  return { e: { scenes: [...e.scenes.slice(0, after + 1), scene, ...e.scenes.slice(after + 1)] }, id: scene.id };
}

export function renameScene(e: Episode, id: string, heading: string): Episode {
  return mapScenes(e, (sc) => (sc.id === id ? { ...sc, heading } : sc));
}

export function deleteScene(e: Episode, id: string): Episode {
  return { scenes: e.scenes.filter((s) => s.id !== id) };
}

export function moveScene(e: Episode, id: string, dir: -1 | 1): Episode {
  const i = e.scenes.findIndex((s) => s.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= e.scenes.length) return e;
  const scenes = [...e.scenes];
  [scenes[i], scenes[j]] = [scenes[j], scenes[i]];
  return { scenes };
}
