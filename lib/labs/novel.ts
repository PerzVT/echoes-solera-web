/**
 * The visual novel's story contract and the rules that move a reader through it. Plain data and pure
 * functions, so the story can cross from the server page to the client player, and a script can walk
 * every path through it. The story itself is in lib/labs/novel/after-hours.ts.
 */

/** Data and file ids use the role, so renaming a character renames nothing. */
export type CharId = "juri" | "nurse" | "busker" | "baker";
export const charIds: CharId[] = ["juri", "nurse", "busker", "baker"];

/**
 * A condition on the run so far: every flag in `flag`, not the flag in `not`, and a floor or ceiling
 * (both inclusive) on one character's warmth. `of` names whose warmth is tested.
 */
export type Need = { flag?: string | string[]; not?: string; of?: CharId; min?: number; max?: number };
/** Checked in order; the first match wins. */
export type Branch = { need: Need; next: string };

export type Line = {
  /** Who speaks, or left out for narration. */
  who?: CharId;
  text: string;
  /** Puts this character on screen as the one visible sprite. */
  show?: CharId;
  /** The visible character's pose from this line on. "away" takes them off screen. */
  pose?: string;
  /** An event illustration from this line on, over the background and sprite. "none" clears it. */
  cg?: string;
  need?: Need;
};

export type Choice = {
  label: string;
  next: string;
  /** Added to each named character's warmth when picked. */
  warmth?: Partial<Record<CharId, number>>;
  flag?: string;
  /** Offered only to a run that meets it. */
  need?: Need;
  /** Picking it locks the run into this character's route. */
  route?: CharId;
  /** Checked after this choice's warmth and flag are applied; `next` is the fallback. */
  routes?: Branch[];
};

export type Scene = {
  id: string;
  bg: string;
  /** Where the background is anchored when a narrow screen crops it. */
  focus?: string;
  /** The loop that plays under the scene. */
  music?: string;
  lines: Line[];
  choices?: Choice[];
  next?: string;
  /** Checked after the last line; `next` is the fallback. */
  routes?: Branch[];
  ending?: { title: string; text: string };
};

export type CastMember = {
  name: string;
  age: number;
  pronouns: string;
  /** Name colour, a light tint chosen for the dark name plate (#161a28). */
  color: string;
  /** Transparent cut-outs on one 1073 x 1600 canvas, bottom anchored. */
  poses: Record<string, string>;
  portrait: string;
};

export type Cg = { id: string; src: string; thumb: string; title: string; focus: string };

export type Story = {
  title: string;
  blurb: string;
  start: string;
  /** Title art, the four of them outside the store. */
  cover: string;
  cast: Record<CharId, CastMember>;
  cgs: Cg[];
  scenes: Scene[];
};

/** Warmth for all four, the flags the reader's choices set, and the route once one is chosen. */
export type Run = { warmth: Record<CharId, number>; flags: string[]; route?: CharId };

export const freshRun = (): Run => ({ warmth: { juri: 0, nurse: 0, busker: 0, baker: 0 }, flags: [] });

export function meets(need: Need | undefined, run: Run) {
  if (!need) return true;
  if (need.flag && ![need.flag].flat().every((f) => run.flags.includes(f))) return false;
  if (need.not && run.flags.includes(need.not)) return false;
  const warmth = run.warmth[need.of ?? run.route ?? "juri"];
  if (need.min !== undefined && warmth < need.min) return false;
  if (need.max !== undefined && warmth > need.max) return false;
  return true;
}

/** A line that passed its condition, with its place in the scene so "read" and cues survive a different run. */
export type Shown = Line & { at: number };

export const linesFor = (scene: Scene, run: Run): Shown[] => scene.lines.map((l, at) => ({ ...l, at })).filter((l) => meets(l.need, run));

export const choicesFor = (scene: Scene, run: Run) => (scene.choices ?? []).filter((c) => meets(c.need, run));

/** The choice's warmth and flag, applied once, and its route. */
export function applyChoice(run: Run, c: Choice): Run {
  const warmth = { ...run.warmth };
  for (const [who, n] of Object.entries(c.warmth ?? {}) as [CharId, number][]) warmth[who] += n;
  return { warmth, flags: c.flag && !run.flags.includes(c.flag) ? [...run.flags, c.flag] : run.flags, route: c.route ?? run.route };
}

/** Where a choice leads: its branches, tested against the run after the choice is applied, then `next`. */
export const afterChoice = (c: Choice, applied: Run) => c.routes?.find((b) => meets(b.need, applied))?.next ?? c.next;

/** Where a scene with no choice leads after its last line. An ending leads nowhere. */
export const afterScene = (scene: Scene, run: Run) => scene.routes?.find((b) => meets(b.need, run))?.next ?? scene.next;

/** The one character on screen, or nobody. */
export type Sprite = { who: CharId; pose: string } | null;

/** The sprite and illustration in force at a line: the last ones set on or before it. */
export function stateAt(story: Story, lines: Shown[], index: number, entry: Sprite, entryCg?: string) {
  let sprite = entry;
  let cg = entryCg;
  for (let i = 0; i <= index && i < lines.length; i++) {
    const l = lines[i];
    if (l.pose === "away") sprite = null;
    else if (l.show) sprite = { who: l.show, pose: l.pose ?? (sprite?.who === l.show ? sprite.pose : Object.keys(story.cast[l.show].poses)[0]) };
    else if (l.pose && sprite) sprite = { ...sprite, pose: l.pose };
    // Clearing an illustration does not bring back whoever stood there before it: a group shot ends
    // with nobody on screen until a line shows someone.
    if (l.cg === "none" && cg && !l.show) sprite = null;
    if (l.cg) cg = l.cg === "none" ? undefined : l.cg;
  }
  return { sprite, cg };
}

/** Who stays on screen into the next scene: only someone still in the same place. A new background is a new place. */
export const carryInto = (from: Scene, to: Scene | undefined, sprite: Sprite): Sprite => (to && to.bg === from.bg ? sprite : null);

/** The route a scene belongs to, from its id, or none for the shared opening. */
export function routeOf(sceneId: string): CharId | undefined {
  const head = sceneId.split("-")[0];
  if (head === "nurse" || head === "busker" || head === "baker") return head;
  if (/^p\d/.test(sceneId)) return undefined;
  return "juri";
}
