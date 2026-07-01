// lib/cueEngine.ts

export interface Cue {
  id: string;
  after: string;
  trigger?: "complete" | "start";
  delay?: number;
  duration?: number;
}

type Cleanup = (() => void) | void;
type CueStartHandler = () => Cleanup;
type CueCompleteHandler = () => void;

export class CueEngine {
  private script: Cue[];
  private active = new Set<string>();
  private completed = new Set<string>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private cleanups = new Map<string, () => void>();
  private startHandlers = new Map<string, CueStartHandler>();
  private completeHandlers = new Map<string, CueCompleteHandler[]>();
  private onChange: (() => void) | null = null;

  constructor(script: Cue[]) {
    this.script = script;
  }

  setOnChange(fn: () => void) {
    this.onChange = fn;
  }

  onCueStart(id: string, fn: CueStartHandler) {
    this.startHandlers.set(id, fn);
  }

  onCueComplete(id: string, fn: CueCompleteHandler) {
    const existing = this.completeHandlers.get(id) || [];
    existing.push(fn);
    this.completeHandlers.set(id, existing);
  }

  start() {
    this.fireTrigger("START", "complete");
    this.fireTrigger("START", "start");
  }

  completeCue(id: string) {
    if (!this.active.has(id)) return;
    // Cancel duration timer if it exists
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.active.delete(id);
    this.completed.add(id);
    // Run cleanup from the start handler
    const cleanup = this.cleanups.get(id);
    if (cleanup) {
      cleanup();
      this.cleanups.delete(id);
    }
    // Notify completion listeners
    const handlers = this.completeHandlers.get(id);
    if (handlers) handlers.forEach(fn => fn());
    // Fire downstream cues triggered by this cue's completion
    this.fireTrigger(id, "complete");
    this.onChange?.();
  }

  isActive(id: string): boolean {
    return this.active.has(id);
  }

  isComplete(id: string): boolean {
    return this.completed.has(id);
  }

  reset() {
    // Cancel all timers
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
    // Run all cleanups
    for (const cleanup of this.cleanups.values()) cleanup();
    this.cleanups.clear();
    // Clear state
    this.active.clear();
    this.completed.clear();
    this.onChange?.();
  }

  destroy() {
    this.reset();
    this.startHandlers.clear();
    this.completeHandlers.clear();
    this.onChange = null;
  }

  private fireTrigger(triggerId: string, event: "start" | "complete") {
    for (const cue of this.script) {
      if (cue.after !== triggerId) continue;
      const cueEvent = cue.trigger || "complete";
      if (cueEvent !== event) continue;
      const delay = cue.delay || 0;
      if (delay > 0) {
        const timerId = setTimeout(() => {
          this.timers.delete(`delay-${cue.id}`);
          this.startCue(cue);
        }, delay);
        this.timers.set(`delay-${cue.id}`, timerId);
      } else {
        this.startCue(cue);
      }
    }
  }

  private startCue(cue: Cue) {
    this.active.add(cue.id);
    // Fire "start" triggers for downstream cues
    this.fireTrigger(cue.id, "start");
    // Run the start handler
    const handler = this.startHandlers.get(cue.id);
    if (handler) {
      const cleanup = handler();
      if (cleanup) this.cleanups.set(cue.id, cleanup);
    }
    this.onChange?.();
    // Schedule completion after duration (if set)
    if (cue.duration !== undefined && cue.duration > 0) {
      // Safety margin: if the cue hasn't completed by 1.5x duration, force it
      const timerId = setTimeout(() => {
        this.timers.delete(cue.id);
        if (this.active.has(cue.id)) {
          this.completeCue(cue.id);
        }
      }, cue.duration);
      this.timers.set(cue.id, timerId);
    } else if (cue.duration === undefined) {
      // Instant cue: complete immediately
      this.completeCue(cue.id);
    }
  }
}
