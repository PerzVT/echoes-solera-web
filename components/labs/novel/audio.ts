import { defaultLoop, loopSeconds } from "@/lib/labs/novel/cues";

const FADE = 1.2;

type Voice = { src: string; source: AudioBufferSourceNode; gain: GainNode };

/**
 * The novel's sound: one music loop with cross-fades, one rain loop, and one-shot cues, over Web Audio.
 * Nothing is fetched or played until `unlock()` runs inside the reader's first press or key. Loops are
 * decoded buffers cut to their declared length, so they come round on the beat rather than on MP3
 * padding. A hidden tab suspends the whole context; nothing plays while nobody can hear it.
 */
export class NovelAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private music: Voice | null = null;
  private rain: Voice | null = null;
  private wantMusic: string | undefined;
  private wantRain = 0;
  private rainSrc = "";
  private rainPending = false;
  private volume = 0.7;
  private muted = false;
  private onVisibility = () => this.syncVisibility();

  get unlocked() {
    return !!this.ctx;
  }

  /** Call from inside a user gesture. Safe to call again. */
  unlock() {
    if (this.ctx) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.level();
    this.master.connect(this.ctx.destination);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.syncVisibility();
    this.applyMusic();
    this.applyRain();
  }

  setVolume(volume: number, muted: boolean) {
    this.volume = volume;
    this.muted = muted;
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(this.level(), this.ctx.currentTime, 0.05);
  }

  /** The loop for the current scene. The same file keeps playing; a new one cross-fades in. */
  setMusic(src: string | undefined) {
    if (src === this.wantMusic) return;
    this.wantMusic = src;
    this.applyMusic();
  }

  /** Rain under the scene, 0 for none. One loop only: a change of level ramps it, never starts a second. */
  setRain(src: string, level: number) {
    this.rainSrc = src;
    if (level === this.wantRain) return;
    this.wantRain = level;
    this.applyRain();
  }

  /** A one-shot cue. Dropped while locked or hidden, so cues never pile up and play late. */
  cue(src: string, gain = 0.8) {
    const ctx = this.ctx;
    if (!ctx || !this.master || document.hidden || ctx.state !== "running") return;
    void this.load(src).then((buf) => {
      if (!buf || !this.master || ctx.state !== "running") return;
      const source = ctx.createBufferSource();
      const g = ctx.createGain();
      g.gain.value = gain;
      source.buffer = buf;
      source.connect(g).connect(this.master);
      source.start();
    });
  }

  dispose() {
    document.removeEventListener("visibilitychange", this.onVisibility);
    void this.ctx?.close();
    this.ctx = null;
    this.music = this.rain = null;
  }

  private level() {
    return this.muted ? 0 : this.volume;
  }

  private syncVisibility() {
    if (!this.ctx) return;
    if (document.hidden) void this.ctx.suspend();
    else void this.ctx.resume();
  }

  private load(src: string) {
    let p = this.buffers.get(src);
    if (!p && this.ctx) {
      const ctx = this.ctx;
      p = fetch(src)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((b) => ctx.decodeAudioData(b))
        .catch(() => null);
      this.buffers.set(src, p);
    }
    return p ?? Promise.resolve(null);
  }

  private startLoop(src: string, buf: AudioBuffer, target: number): Voice | null {
    const ctx = this.ctx;
    if (!ctx || !this.master) return null;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buf;
    source.loop = true;
    const length = loopSeconds[src.split("/").pop() ?? ""] ?? defaultLoop;
    source.loopEnd = Math.min(length, buf.duration);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(target, ctx.currentTime + FADE);
    source.connect(gain).connect(this.master);
    source.start();
    return { src, source, gain };
  }

  private fadeOut(v: Voice | null) {
    const ctx = this.ctx;
    if (!v || !ctx) return;
    v.gain.gain.cancelScheduledValues(ctx.currentTime);
    v.gain.gain.setValueAtTime(v.gain.gain.value, ctx.currentTime);
    v.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE);
    v.source.stop(ctx.currentTime + FADE + 0.05);
  }

  private applyMusic() {
    if (!this.ctx) return;
    const want = this.wantMusic;
    if (this.music?.src === want) return;
    this.fadeOut(this.music);
    this.music = null;
    if (!want) return;
    void this.load(want).then((buf) => {
      // The scene may have moved on while the file loaded.
      if (!buf || this.wantMusic !== want || this.music?.src === want) return;
      this.music = this.startLoop(want, buf, 0.55);
    });
  }

  private applyRain() {
    const ctx = this.ctx;
    if (!ctx) return;
    const level = this.wantRain * 0.4;
    if (this.rain) {
      if (level > 0) {
        this.rain.gain.gain.cancelScheduledValues(ctx.currentTime);
        this.rain.gain.gain.setValueAtTime(this.rain.gain.gain.value, ctx.currentTime);
        this.rain.gain.gain.linearRampToValueAtTime(level, ctx.currentTime + FADE);
      } else {
        this.fadeOut(this.rain);
        this.rain = null;
      }
      return;
    }
    if (level <= 0 || !this.rainSrc || this.rainPending) return;
    const src = this.rainSrc;
    this.rainPending = true;
    void this.load(src).then((buf) => {
      this.rainPending = false;
      if (!buf || this.rain || this.wantRain <= 0) return;
      this.rain = this.startLoop(src, buf, this.wantRain * 0.4);
    });
  }
}
