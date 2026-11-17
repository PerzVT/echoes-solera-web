"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button, ButtonLink } from "./Button";
import { Icon } from "./Icon";
import { ReplayIcon } from "./fx/AnimatedIcon";
import type { Line, Need, Pose, Scene, Story } from "@/lib/labs/novel";
import styles from "./VisualNovel.module.css";

type Speed = "slow" | "normal" | "fast";
const perChar: Record<Speed, number> = { slow: 40, normal: 22, fast: 10 };
/** The story opens already playing: the home hero's button is the start, so there is no title screen. */
type Phase = "play" | "end";
type Run = { warmth: number; flags: string[] };
type Entry = { who: string | null; text: string; choice?: boolean };
/** A line that passed its condition, with its place in the scene so "read" survives a different run. */
type Shown = Line & { at: number };

const fresh: Run = { warmth: 0, flags: [] };

function meets(need: Need | undefined, run: Run) {
  if (!need) return true;
  if (need.flag && ![need.flag].flat().every((f) => run.flags.includes(f))) return false;
  if (need.not && run.flags.includes(need.not)) return false;
  if (need.min !== undefined && run.warmth < need.min) return false;
  if (need.max !== undefined && run.warmth > need.max) return false;
  return true;
}

function linesFor(scene: Scene, run: Run): Shown[] {
  return scene.lines.map((l, at) => ({ ...l, at })).filter((l) => meets(l.need, run));
}

/** The pose and illustration in force at a line: the last ones set on or before it. */
function stateAt(lines: Shown[], index: number, entryPose: Pose | "away") {
  let pose = entryPose;
  let cg: string | undefined;
  for (let i = 0; i <= index && i < lines.length; i++) {
    if (lines[i].pose) pose = lines[i].pose!;
    if (lines[i].cg) cg = lines[i].cg === "none" ? undefined : lines[i].cg;
  }
  return { pose, cg };
}

export function VisualNovel({ story, exitHref }: { story: Story; exitHref: string }) {
  const byId = useMemo(() => new Map(story.scenes.map((s) => [s.id, s])), [story]);
  const [phase, setPhase] = useState<Phase>("play");
  const [sceneId, setSceneId] = useState(story.start);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [run, setRun] = useState<Run>(fresh);
  const [entryPose, setEntryPose] = useState<Pose | "away">("away");
  const [log, setLog] = useState<Entry[]>([]);
  const [auto, setAuto] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [panel, setPanel] = useState<null | "settings" | "log">(null);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [large, setLarge] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [turns, setTurns] = useState(0);
  const still = useRef(false);
  /** Choices and the ending's actions ignore presses for a moment after they appear, so a reader tapping
      through lines does not pick the first choice or restart by accident with the same key. */
  const armedAt = useRef(0);
  const armed = () => performance.now() >= armedAt.current;
  const read = useRef(new Set<string>());
  const logged = useRef(new Set<string>());
  /** Where focus should go after the next render: the line, the first choice or the ending's first action. */
  const focusNext = useRef<null | "line" | "choice" | "end">(null);
  const lineRef = useRef<HTMLButtonElement>(null);
  const choicesRef = useRef<HTMLUListElement>(null);
  const endRef = useRef<HTMLElement>(null);
  const showRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const logButton = useRef<HTMLButtonElement>(null);
  const endLogButton = useRef<HTMLButtonElement>(null);

  const scene = byId.get(sceneId)!;
  const lines = useMemo(() => linesFor(scene, run), [scene, run]);
  const line = lines[Math.min(index, lines.length - 1)];
  const typing = phase === "play" && shown < line.text.length;
  const lastLine = index >= lines.length - 1;
  const choices = useMemo(() => (scene.choices ?? []).filter((c) => meets(c.need, run)), [scene, run]);
  const choosing = phase === "play" && !typing && lastLine && choices.length > 0;
  const { pose, cg } = stateAt(lines, index, entryPose);
  const speaker = line.who === "juri" ? story.lead.name : null;
  const readKey = `${sceneId}:${line.at}`;

  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Reveal the line a character at a time; with reduced motion, all at once.
  useEffect(() => {
    if (!typing) return;
    if (still.current || skipping) {
      setShown(line.text.length);
      return;
    }
    const t = setTimeout(() => setShown((n) => n + 1), perChar[speed]);
    return () => clearTimeout(t);
  }, [typing, shown, line, speed, skipping]);

  // Every line the reader reaches goes in the log once.
  useEffect(() => {
    if (phase !== "play") return;
    const key = `${sceneId}:${index}`;
    if (logged.current.has(key)) return;
    logged.current.add(key);
    setLog((l) => [...l, { who: speaker, text: line.text }]);
  }, [phase, sceneId, index, speaker, line]);

  const enter = useCallback(
    (id: string, nextRun: Run, carry: Pose | "away") => {
      setSceneId(id);
      setIndex(0);
      setShown(0);
      setPicked(null);
      setEntryPose(carry);
      setRun(nextRun);
    },
    [],
  );

  const finishScene = useCallback(() => {
    const route = scene.routes?.find((r) => meets(r.need, run));
    const next = route?.next ?? scene.next;
    if (next) {
      enter(next, run, pose);
      return;
    }
    setPhase("end");
    setAuto(false);
    setSkipping(false);
    focusNext.current = "end";
  }, [scene, run, pose, enter]);

  const advance = useCallback(() => {
    if (phase !== "play" || panel) return;
    if (typing) return setShown(line.text.length);
    // A line counts as read once the reader moves past it, so Skip stops at the first line never left.
    read.current.add(readKey);
    if (!lastLine) {
      setIndex((i) => i + 1);
      setShown(0);
    } else if (!choices.length) {
      finishScene();
    }
  }, [phase, panel, typing, line, lastLine, choices, finishScene, readKey]);

  const choose = (c: NonNullable<Scene["choices"]>[number]) => {
    if (picked || !armed()) return;
    read.current.add(readKey);
    setPicked(c.label);
    setLog((l) => [...l, { who: "You", text: c.label.replace(/^"|"$/g, ""), choice: true }]);
    const nextRun: Run = {
      warmth: run.warmth + (c.warmth ?? 0),
      flags: c.flag ? [...run.flags, c.flag] : run.flags,
    };
    focusNext.current = "line";
    // The picked state holds for a moment, then the story moves on.
    setTimeout(() => enter(c.next, nextRun, pose), still.current ? 0 : 240);
  };

  // Auto moves on a little after a line is out.
  useEffect(() => {
    if (!auto || skipping || typing || choosing || phase !== "play" || panel || hidden) return;
    const t = setTimeout(advance, 1000 + line.text.length * 25);
    return () => clearTimeout(t);
  }, [auto, skipping, typing, choosing, phase, panel, hidden, advance, line]);

  // Skip runs quickly through lines already read and stops at the first new line, shown in full, or a choice.
  useEffect(() => {
    if (!skipping) return;
    if (phase !== "play" || choosing || panel) return setSkipping(false);
    if (!read.current.has(readKey)) {
      setShown(line.text.length);
      return setSkipping(false);
    }
    const t = setTimeout(advance, 50);
    return () => clearTimeout(t);
  }, [skipping, phase, choosing, panel, readKey, line, advance]);

  // Focus follows the story: to the choices when they appear, to the line after a choice, to the
  // ending's actions at the end.
  useEffect(() => {
    if (choosing && !picked) {
      focusNext.current = "choice";
      armedAt.current = performance.now() + 450;
    }
  }, [choosing, picked]);
  useEffect(() => {
    if (phase === "end") armedAt.current = performance.now() + 600;
  }, [phase]);
  useEffect(() => {
    const want = focusNext.current;
    if (!want || panel || hidden) return;
    const el =
      want === "line" ? lineRef.current : want === "choice" ? choicesRef.current?.querySelector("button") : endRef.current?.querySelector("button");
    if (el) {
      el.focus({ preventScroll: true });
      focusNext.current = null;
    }
  });

  const restart = () => {
    if (phase === "end" && !armed()) return;
    setTurns((n) => n + 1);
    setPanel(null);
    setAuto(false);
    setSkipping(false);
    setLog([]);
    logged.current = new Set();
    enter(story.start, fresh, "away");
    setPhase("play");
    focusNext.current = "line";
  };

  const closePanel = useCallback(() => {
    const which = panel;
    setPanel(null);
    // Back to the control that opened it.
    requestAnimationFrame(() => {
      if (which === "settings") settingsButton.current?.focus();
      else if (phase === "end") endLogButton.current?.focus();
      else logButton.current?.focus();
    });
  }, [panel, phase]);

  const hide = () => {
    setHidden(true);
    setAuto(false);
    setSkipping(false);
    requestAnimationFrame(() => showRef.current?.focus());
  };
  const unhide = () => {
    setHidden(false);
    focusNext.current = phase === "end" ? "end" : choosing ? "choice" : "line";
  };

  // A panel moves focus in when it opens; the log opens scrolled to the latest line.
  useEffect(() => {
    if (!panel) return;
    const el = panelRef.current;
    el?.querySelector<HTMLElement>("[data-first]")?.focus();
    const list = el?.querySelector("ol");
    if (list) list.scrollTop = list.scrollHeight;
  }, [panel]);

  // The log covers the stage, so Tab and Shift+Tab stay inside it until it closes.
  const holdTab = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key !== "Tab") return;
    const all = [...e.currentTarget.querySelectorAll<HTMLElement>("button, [href], input, [tabindex]:not([tabindex='-1'])")].filter((el) => !el.hasAttribute("disabled"));
    if (!all.length) return;
    const first = all[0];
    const last = all[all.length - 1];
    const at = document.activeElement;
    if (e.shiftKey && (at === first || !e.currentTarget.contains(at))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (at === last || !e.currentTarget.contains(at))) {
      e.preventDefault();
      first.focus();
    }
  };

  // Settings closes on a press outside it.
  useEffect(() => {
    if (panel !== "settings") return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || settingsButton.current?.contains(t)) return;
      e.preventDefault();
      setPanel(null);
    };
    window.addEventListener("pointerdown", onDown, true);
    return () => window.removeEventListener("pointerdown", onDown, true);
  }, [panel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (panel) closePanel();
        else if (hidden) unhide();
        else if (skipping) setSkipping(false);
        return;
      }
      const el = e.target as HTMLElement;
      if (el.closest("button, a, input, select, textarea, [role=dialog]")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (hidden) unhide();
        else advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const bgs = useMemo(() => [...new Set(story.scenes.map((s) => s.bg))], [story]);
  const cgs = useMemo(() => [...new Set(story.scenes.flatMap((s) => s.lines.map((l) => l.cg)).filter((c): c is string => !!c && c !== "none"))], [story]);
  const poses = Object.entries(story.lead.poses).filter((e): e is [Pose, string] => !!e[1]);
  const currentBg = scene.bg;
  const focus = scene.focus ?? "50% 50%";
  const showSprite = !cg && pose !== "away" && !!story.lead.poses[pose];
  const ending = phase === "end" ? scene.ending : undefined;

  return (
    <main id="main" className={styles.stage} data-large={large} data-phase={phase} data-scene={sceneId}>
      <div className={styles.art} aria-hidden="true">
        {bgs.map((src) => (
          <div key={src} className={styles.layer} data-on={src === currentBg && !cg}>
            <Image src={src} alt="" fill sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" priority={src === byId.get(story.start)!.bg} style={{ objectPosition: focus }} />
          </div>
        ))}
        {cgs.map((src) => (
          <div key={src} className={styles.layer} data-on={src === cg}>
            <Image src={src} alt="" fill sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" style={{ objectPosition: "var(--cg-focus)" }} />
          </div>
        ))}
        <div className={styles.sprite} data-on={showSprite}>
          {poses.map(([name, src]) => (
            <div key={name} className={styles.pose} data-on={name === pose}>
              <Image bare src={src} alt="" fill sizes="(max-width: 700px) 100vw, 60vh" priority={name === "smirk"} />
            </div>
          ))}
        </div>
      </div>

      {/* A press anywhere on the picture moves the story on. Keyboard readers have the line itself. */}
      {phase === "play" && !hidden && <div className={styles.tap} onClick={advance} aria-hidden="true" />}

      {hidden && (
        <button ref={showRef} type="button" className={styles.reveal} onClick={unhide}>
          <span className="sr-only">Show the text</span>
        </button>
      )}

      <div className={styles.ui} data-hidden={hidden} inert={hidden}>
        <header className={styles.top}>
          <Link href={exitHref} className={styles.exit} aria-label="Leave the story">
            <Icon name="back" />
          </Link>
        </header>

        {phase === "play" && (
          <div className={styles.box} data-choosing={choosing}>
            <h1 className="sr-only">{story.title}</h1>
            <p className={styles.speaker} data-empty={speaker ? undefined : ""} aria-hidden={speaker ? undefined : true}>
              {speaker}
            </p>
            <button ref={lineRef} type="button" className={styles.line} data-who={line.who ?? "narration"} onClick={advance} aria-label={choosing ? "Choose below" : "Next line"} aria-describedby="vn-live">
              <span className={styles.lineText}>
                <span>{line.text.slice(0, shown)}</span>
                <span className={styles.rest} aria-hidden="true">
                  {line.text.slice(shown)}
                </span>
                {!typing && !choosing && <span className={styles.more} aria-hidden="true" />}
              </span>
            </button>
            <p id="vn-live" className="sr-only" aria-live="polite">
              {typing ? "" : speaker ? `${speaker}: ${line.text}` : line.text}
            </p>

            {choosing && (
              <ul ref={choicesRef} className={styles.choices} aria-label="Your choice">
                {choices.map((c) => (
                  <li key={c.label}>
                    <button type="button" onClick={() => choose(c)} data-picked={picked === c.label} disabled={!!picked && picked !== c.label}>
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <nav className={styles.controls} aria-label="Reading controls">
              <button ref={logButton} type="button" aria-expanded={panel === "log"} onClick={() => setPanel(panel === "log" ? null : "log")}>
                Log
              </button>
              <button type="button" aria-pressed={auto} onClick={() => setAuto((a) => !a)}>
                Auto
              </button>
              <button type="button" aria-pressed={skipping} onClick={() => setSkipping((s) => !s)} disabled={choosing}>
                Skip
              </button>
              <button type="button" onClick={hide}>
                Hide
              </button>
              <button ref={settingsButton} type="button" aria-expanded={panel === "settings"} onClick={() => setPanel(panel === "settings" ? null : "settings")}>
                Settings
              </button>
            </nav>
          </div>
        )}

        {phase === "end" && ending && (
          <section ref={endRef} className={styles.end} aria-labelledby="vn-end">
            <h2 id="vn-end" className={styles.endTitle}>
              {ending.title}
            </h2>
            <p className={styles.endText}>{ending.text}</p>
            <div className={styles.actions}>
              <Button onClick={restart} icon={<ReplayIcon turn={turns} size={18} />}>
                Play again
              </Button>
              <button ref={endLogButton} type="button" className={styles.textButton} onClick={() => setPanel("log")}>
                Read the log
              </button>
              <ButtonLink href={exitHref} variant="secondary">
                Leave
              </ButtonLink>
            </div>
          </section>
        )}

        {panel === "settings" && (
          <section ref={panelRef} className={styles.settings} role="dialog" aria-label="Settings">
            <fieldset>
              <legend>Text speed</legend>
              {(["slow", "normal", "fast"] as Speed[]).map((s) => (
                <label key={s}>
                  <input type="radio" name="speed" checked={speed === s} onChange={() => setSpeed(s)} data-first={speed === s || undefined} />
                  <span>{s[0].toUpperCase() + s.slice(1)}</span>
                </label>
              ))}
            </fieldset>
            <button type="button" role="switch" aria-checked={large} className={styles.switch} onClick={() => setLarge((l) => !l)}>
              <span>Larger text</span>
              <span className={styles.track} aria-hidden="true" />
            </button>
            <div className={styles.settingsActions}>
              <Button variant="secondary" size="small" onClick={restart}>
                Start again
              </Button>
              <Button variant="quiet" size="small" onClick={closePanel}>
                Close
              </Button>
            </div>
          </section>
        )}

        {panel === "log" && (
          <section ref={panelRef} className={styles.log} role="dialog" aria-modal="true" aria-labelledby="vn-log" onKeyDown={holdTab}>
            <div className={styles.logHead}>
              <h2 id="vn-log" className={styles.logTitle}>
                Log
              </h2>
              <Button variant="secondary" size="small" onClick={closePanel} data-first>
                Close
              </Button>
            </div>
            <ol className={styles.logList} tabIndex={0} aria-label="Lines so far">
              {log.map((e, i) => (
                <li key={i} data-choice={e.choice || undefined}>
                  {e.who && <span className={styles.logWho}>{e.who}</span>}
                  <span>{e.text}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}
