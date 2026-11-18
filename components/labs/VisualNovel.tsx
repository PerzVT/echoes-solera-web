"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button, ButtonLink } from "./Button";
import { Icon } from "./Icon";
import { ReplayIcon } from "./fx/AnimatedIcon";
import { NovelAudio } from "./novel/audio";
import { Gallery } from "./novel/Gallery";
import { fromLink, standInSave } from "./novel/links";
import { defaultPrefs, loadPrefs, loadProgress, loadSave, writePrefs, writeProgress, writeSave, type Prefs, type Save, type Speed } from "./novel/save";
import {
  afterChoice,
  afterScene,
  applyChoice,
  carryInto,
  choicesFor,
  freshRun,
  linesFor,
  stateAt,
  type CharId,
  type Choice,
  type Run,
  type Scene,
  type Sprite,
  type Story,
} from "@/lib/labs/novel";
import { cues, rain, sfx } from "@/lib/labs/novel/cues";
import styles from "./VisualNovel.module.css";

const perChar: Record<Speed, number> = { slow: 40, normal: 22, fast: 10 };
/**
 * boot: the first frame, before the browser's save has been read. title: a returning reader, or a link
 * to it. A first-time reader goes from boot straight into play: the home hero's button is the start.
 */
type Phase = "boot" | "title" | "play" | "end";
type Panel = null | "settings" | "log" | "gallery";
type Entry = { who: string | null; color?: string; text: string; choice?: boolean };

const firstName = (name: string) => name.split(" ")[0];

/** Every picture a scene can show: its background, its illustrations and the sprites its lines put up. */
function assetsOf(story: Story, scene: Scene | undefined) {
  const out = new Set<string>();
  if (!scene) return out;
  out.add(scene.bg);
  let who: CharId | undefined;
  let pose = "";
  for (const l of scene.lines) {
    if (l.cg && l.cg !== "none") out.add(l.cg);
    if (l.show) {
      who = l.show;
      pose = l.pose ?? Object.keys(story.cast[l.show].poses)[0];
    } else if (l.pose && l.pose !== "away") pose = l.pose;
    if (who && story.cast[who].poses[pose]) out.add(story.cast[who].poses[pose]);
  }
  return out;
}
/** The scenes a scene can lead to, so their pictures are loading before the reader gets there. */
function nextOf(scene: Scene | undefined) {
  if (!scene) return [];
  return [scene.next, ...(scene.routes ?? []).map((b) => b.next), ...(scene.choices ?? []).flatMap((c) => [c.next, ...(c.routes ?? []).map((b) => b.next)])].filter(
    (x): x is string => !!x,
  );
}

export function VisualNovel({ story, exitHref }: { story: Story; exitHref: string }) {
  const byId = useMemo(() => new Map(story.scenes.map((s) => [s.id, s])), [story]);
  const cgIdOf = useMemo(() => new Map(story.cgs.map((c) => [c.src, c.id])), [story]);
  const [phase, setPhase] = useState<Phase>("boot");
  const [sceneId, setSceneId] = useState(story.start);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [run, setRun] = useState<Run>(freshRun);
  const [entry, setEntry] = useState<Sprite>(null);
  const [entryCg, setEntryCg] = useState<string | undefined>();
  const [prevScene, setPrevScene] = useState<string | undefined>();
  const [log, setLog] = useState<Entry[]>([]);
  const [auto, setAuto] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [picked, setPicked] = useState<string | null>(null);
  const [turns, setTurns] = useState(0);
  const [saved, setSaved] = useState<Save | null>(null);
  const [seenCgs, setSeenCgs] = useState<string[]>([]);
  const [endings, setEndings] = useState<string[]>([]);
  const still = useRef(false);
  /** A linked state is for showing; nothing it does is written to the reader's browser until they start over. */
  const preview = useRef(false);
  /** Choices and the ending's actions ignore presses for a moment after they appear, so a reader tapping
      through lines does not pick the first choice or restart by accident with the same key. */
  const armedAt = useRef(0);
  const armed = () => performance.now() >= armedAt.current;
  const read = useRef(new Set<string>());
  const logged = useRef(new Set<string>());
  const cued = useRef("");
  const audio = useRef<NovelAudio | null>(null);
  /** Where focus should go after the next render: the line, the first choice, the ending's or title's first action. */
  const focusNext = useRef<null | "line" | "choice" | "end" | "title">(null);
  const lineRef = useRef<HTMLButtonElement>(null);
  const choicesRef = useRef<HTMLUListElement>(null);
  const endRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const showRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const logButton = useRef<HTMLButtonElement>(null);
  const endLogButton = useRef<HTMLButtonElement>(null);
  const galleryOpener = useRef<HTMLButtonElement | null>(null);

  const scene = byId.get(sceneId)!;
  // A narration line that is one whole quote is the reader speaking: it gets the "You" name plate.
  const lines = useMemo(
    () =>
      linesFor(scene, run).map((l) =>
        !l.who && /^"[^"]*"$/.test(l.text) ? { ...l, text: l.text.slice(1, -1), you: true } : l,
      ),
    [scene, run],
  );
  const line = lines[Math.min(index, lines.length - 1)];
  const typing = phase === "play" && shown < line.text.length;
  const lastLine = index >= lines.length - 1;
  const choices = useMemo(() => choicesFor(scene, run), [scene, run]);
  const choosing = phase === "play" && !typing && lastLine && choices.length > 0;
  const { sprite, cg } = stateAt(story, lines, index, entry, entryCg);
  const member = line.who ? story.cast[line.who] : null;
  const you = "you" in line;
  const speaker = member ? firstName(member.name) : you ? "You" : null;
  const readKey = `${sceneId}:${line.at}`;
  const { speed, large } = prefs;

  const persistProgress = useCallback(() => {
    if (preview.current) return;
    writeProgress({ v: 1, cgs: seenCgs, endings, read: [...read.current] });
  }, [seenCgs, endings]);

  // Boot: read the browser once, then open on the title (a save, or a link to it), a linked state, or the opening.
  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = loadPrefs();
    setPrefs(p);
    const progress = loadProgress();
    read.current = new Set(progress.read);
    setSeenCgs(progress.cgs);
    setEndings(progress.endings);
    const save = loadSave();
    const link = fromLink(story, window.location.search);
    const a = new NovelAudio();
    a.setVolume(p.volume, p.muted);
    audio.current = a;
    if (link) preview.current = true;
    if (link?.kind === "title") {
      setSaved(save ?? standInSave());
      setPhase("title");
      if (link.gallery) setPanel("gallery");
      else focusNext.current = "title";
    } else if (link) {
      resume(link.save);
    } else if (save) {
      setSaved(save);
      setPhase("title");
      focusNext.current = "title";
    } else {
      setPhase("play");
      focusNext.current = "line";
    }
    return () => a.dispose();
    // Runs once: the story and its link are fixed for the life of the page.
  }, []);

  // Sound waits for the reader's first press or key on the page.
  useEffect(() => {
    const unlock = () => audio.current?.unlock();
    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, []);

  useEffect(() => {
    audio.current?.setVolume(prefs.volume, prefs.muted);
  }, [prefs.volume, prefs.muted]);

  // Music and rain follow the scene; the title plays the opening's theme under the rain.
  useEffect(() => {
    const a = audio.current;
    if (!a || phase === "boot") return;
    if (phase === "title") {
      a.setMusic(byId.get(story.start)?.music);
      a.setRain(sfx.rain, 0.5);
    } else {
      a.setMusic(scene.music);
      a.setRain(sfx.rain, rain[sceneId] ?? 0);
    }
  }, [phase, scene, sceneId, byId, story.start]);

  // A line's sound cue plays once when the line comes up, and not while skipping past it.
  useEffect(() => {
    if (phase !== "play" || cued.current === readKey) return;
    cued.current = readKey;
    const cue = cues[readKey];
    if (cue && !skipping) audio.current?.cue(cue);
  }, [phase, readKey, skipping]);

  // One automatic save, at every line, so Continue lands where the reader left off.
  useEffect(() => {
    if (preview.current || (phase !== "play" && phase !== "end")) return;
    const s: Save = { v: 1, scene: sceneId, index, run, entry, entryCg, phase };
    writeSave(s);
    setSaved(s);
  }, [phase, sceneId, index, run, entry, entryCg]);

  // An illustration counts as found once it is on screen; an ending once its card is.
  useEffect(() => {
    if (phase !== "play" || !cg) return;
    const id = cgIdOf.get(cg);
    if (id && !seenCgs.includes(id)) setSeenCgs((c) => [...c, id]);
  }, [phase, cg, cgIdOf, seenCgs]);
  useEffect(() => {
    if (phase === "end" && scene.ending && !endings.includes(sceneId)) setEndings((e) => [...e, sceneId]);
  }, [phase, scene, sceneId, endings]);
  useEffect(() => {
    if (phase !== "boot") persistProgress();
  }, [seenCgs, endings, sceneId, phase, persistProgress]);
  useEffect(() => {
    const keep = () => persistProgress();
    window.addEventListener("pagehide", keep);
    return () => window.removeEventListener("pagehide", keep);
  }, [persistProgress]);

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
    setLog((l) => [...l, { who: speaker, color: member?.color, text: line.text }]);
  }, [phase, sceneId, index, speaker, member, line]);

  /** Puts the player at a saved place. */
  function resume(s: Save) {
    const target = byId.get(s.scene);
    if (!target) return;
    const r: Run = { ...freshRun(), ...s.run, warmth: { ...freshRun().warmth, ...s.run.warmth } };
    const count = linesFor(target, r).length;
    setSceneId(s.scene);
    setIndex(Math.min(Math.max(0, s.index), count - 1));
    setShown(s.phase === "end" ? Number.MAX_SAFE_INTEGER : 0);
    setRun(r);
    setEntry(s.entry ?? null);
    setEntryCg(s.entryCg);
    setPrevScene(undefined);
    setPicked(null);
    setLog([]);
    logged.current = new Set();
    setPhase(s.phase);
    focusNext.current = s.phase === "end" ? "end" : "line";
  }

  const enter = useCallback(
    (id: string, nextRun: Run, carry: Sprite, carryCg: string | undefined) => {
      setPrevScene(sceneId);
      setSceneId(id);
      setIndex(0);
      setShown(0);
      setPicked(null);
      setEntry(carry);
      setEntryCg(carryCg);
      setRun(nextRun);
    },
    [sceneId],
  );

  const finishScene = useCallback(() => {
    const next = afterScene(scene, run);
    if (next) {
      enter(next, run, carryInto(scene, byId.get(next), sprite), cg);
      return;
    }
    setPhase("end");
    setAuto(false);
    setSkipping(false);
    focusNext.current = "end";
  }, [scene, run, sprite, cg, enter, byId]);

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

  const choose = (c: Choice) => {
    if (picked || !armed()) return;
    read.current.add(readKey);
    setPicked(c.label);
    audio.current?.cue(sfx.choice, 0.6);
    setLog((l) => [...l, { who: "You", text: c.label.replace(/^"|"$/g, ""), choice: true }]);
    // The choice's warmth and flag are applied once, then its branches are read against the result.
    const applied = applyChoice(run, c);
    const next = afterChoice(c, applied);
    const carry = carryInto(scene, byId.get(next), sprite);
    // Written now, with the next scene, so leaving during the pause below cannot replay the choice.
    if (!preview.current) writeSave({ v: 1, scene: next, index: 0, run: applied, entry: carry, entryCg: cg, phase: "play" });
    focusNext.current = "line";
    // The picked state holds for a moment, then the story moves on.
    setTimeout(() => enter(next, applied, carry, cg), still.current ? 0 : 240);
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
  // ending's actions at the end, to Continue on the title.
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
      want === "line"
        ? lineRef.current
        : want === "choice"
          ? choicesRef.current?.querySelector("button")
          : (want === "end" ? endRef : titleRef).current?.querySelector<HTMLElement>("button, a");
    if (el) {
      el.focus({ preventScroll: true });
      focusNext.current = null;
    }
  });

  /** A new run from the opening. The gallery and the lines already read are kept. */
  const restart = () => {
    if (phase === "end" && !armed()) return;
    preview.current = false;
    setTurns((n) => n + 1);
    setPanel(null);
    setAuto(false);
    setSkipping(false);
    setLog([]);
    logged.current = new Set();
    cued.current = "";
    setSceneId(story.start);
    setPrevScene(undefined);
    setIndex(0);
    setShown(0);
    setPicked(null);
    setEntry(null);
    setEntryCg(undefined);
    setRun(freshRun());
    setPhase("play");
    focusNext.current = "line";
  };

  const closePanel = useCallback(() => {
    const which = panel;
    setPanel(null);
    // Back to the control that opened it.
    requestAnimationFrame(() => {
      if (which === "settings") settingsButton.current?.focus();
      else if (which === "gallery") galleryOpener.current?.focus();
      else if (phase === "end") endLogButton.current?.focus();
      else logButton.current?.focus();
    });
  }, [panel, phase]);

  const openGallery = (from: HTMLButtonElement) => {
    galleryOpener.current = from;
    setPanel("gallery");
  };

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

  const setPref = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    setPrefs((p) => {
      const next = { ...p, [key]: value };
      writePrefs(next);
      return next;
    });

  // A panel moves focus in when it opens; the log opens scrolled to the latest line.
  useEffect(() => {
    if (!panel) return;
    const el = panelRef.current;
    el?.querySelector<HTMLElement>("[data-first]")?.focus();
    const list = el?.querySelector("ol");
    if (list) list.scrollTop = list.scrollHeight;
  }, [panel]);

  // The log and gallery cover the stage, so Tab and Shift+Tab stay inside them until they close.
  const holdTab = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key !== "Tab") return;
    const all = [...e.currentTarget.querySelectorAll<HTMLElement>("button, [href], input, [tabindex]:not([tabindex='-1'])")].filter(
      (el) => !el.hasAttribute("disabled") && !el.closest("[inert]"),
    );
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

  // Only the pictures near the reader are mounted: the scene before (so it can fade out), this one, and
  // the ones it leads to (so they are loaded before they are needed).
  const mounted = useMemo(() => {
    const out = new Set<string>();
    if (phase === "title" || phase === "boot") {
      for (const s of assetsOf(story, byId.get(story.start))) out.add(s);
      return out;
    }
    for (const id of [prevScene, sceneId, ...nextOf(scene)]) for (const s of assetsOf(story, id ? byId.get(id) : undefined)) out.add(s);
    if (cg) out.add(cg);
    if (entryCg) out.add(entryCg);
    if (entry) out.add(story.cast[entry.who].poses[entry.pose]);
    return out;
  }, [phase, prevScene, sceneId, scene, story, byId, cg, entry, entryCg]);
  const bgs = [...new Set(story.scenes.map((s) => s.bg))].filter((s) => mounted.has(s));
  const cgSrcs = story.cgs.map((c) => c.src).filter((s) => mounted.has(s));
  const spriteSrcs = Object.values(story.cast).flatMap((m) => Object.values(m.poses)).filter((s) => mounted.has(s));
  const spriteSrc = sprite ? story.cast[sprite.who].poses[sprite.pose] : undefined;
  const focus = scene.focus ?? "50% 50%";
  const cgFocus = story.cgs.find((c) => c.src === cg)?.focus ?? "50% 45%";
  const showSprite = phase === "play" && !cg && !!spriteSrc;
  const ending = phase === "end" ? scene.ending : undefined;
  const startBg = byId.get(story.start)!.bg;
  const onTitle = phase === "title";
  const playing = phase === "play" || phase === "end";

  return (
    <main
      id="main"
      className={styles.stage}
      data-large={large}
      data-phase={phase}
      data-scene={sceneId}
      data-who={sprite?.who}
      style={{ ["--cg-focus" as string]: cgFocus }}
    >
      <div className={styles.art} aria-hidden="true">
        {bgs.map((src) => (
          <div key={src} className={styles.layer} data-on={playing && src === scene.bg && !cg}>
            <Image src={src} alt="" fill sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" priority={src === startBg} style={{ objectPosition: focus }} />
          </div>
        ))}
        {cgSrcs.map((src) => (
          <div key={src} className={styles.layer} data-on={playing && src === cg}>
            <Image src={src} alt="" fill sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" style={{ objectPosition: "var(--cg-focus)" }} />
          </div>
        ))}
        {(onTitle || phase === "boot") && (
          <div className={styles.layer} data-on={onTitle} data-cover="">
            <Image src={story.cover} alt="" fill sizes="100vw" priority />
          </div>
        )}
        <div className={styles.sprite} data-on={showSprite}>
          {spriteSrcs.map((src) => (
            <div key={src} className={styles.pose} data-on={src === spriteSrc}>
              <Image bare src={src} alt="" fill sizes="(max-width: 899px) 100vw, (max-height: 480px) 60vw, 70vh" />
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

        {onTitle && (
          <section ref={titleRef} className={styles.title} aria-labelledby="vn-title">
            <h1 id="vn-title" className={styles.titleName}>
              {story.title}
            </h1>
            <div className={styles.actions}>
              {saved ? (
                <Button onClick={() => resume(saved)} iconAfter={<Icon name="arrow" />}>
                  Continue
                </Button>
              ) : (
                <Button onClick={restart} iconAfter={<Icon name="arrow" />}>
                  Start
                </Button>
              )}
              {saved && (
                <Button variant="secondary" onClick={restart} icon={<Icon name="replay" />}>
                  Start over
                </Button>
              )}
              <Button variant="secondary" onClick={(e) => openGallery(e.currentTarget)}>
                Gallery
              </Button>
            </div>
          </section>
        )}

        {phase === "play" && (
          <div className={styles.box} data-choosing={choosing}>
            <h1 className="sr-only">{story.title}</h1>
            <p
              className={styles.speaker}
              data-empty={speaker ? undefined : ""}
              aria-hidden={speaker ? undefined : true}
              style={member ? { color: member.color } : undefined}
            >
              {speaker}
            </p>
            <button
              ref={lineRef}
              type="button"
              className={styles.line}
              data-who={line.who ?? (you ? "you" : "narration")}
              onClick={advance}
              aria-label={choosing ? "Choose below" : "Next line"}
              aria-describedby="vn-live"
            >
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
              <Button variant="secondary" onClick={(e) => openGallery(e.currentTarget)}>
                Gallery
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
                  <input type="radio" name="speed" checked={speed === s} onChange={() => setPref("speed", s)} data-first={speed === s || undefined} />
                  <span>{s[0].toUpperCase() + s.slice(1)}</span>
                </label>
              ))}
            </fieldset>
            <button type="button" role="switch" aria-checked={large} className={styles.switch} onClick={() => setPref("large", !large)}>
              <span>Larger text</span>
              <span className={styles.track} aria-hidden="true" />
            </button>
            <div className={styles.volume}>
              <label htmlFor="vn-volume">Volume</label>
              <div className={styles.volumeRow}>
                <button
                  type="button"
                  className={styles.mute}
                  aria-pressed={prefs.muted}
                  aria-label={prefs.muted ? "Unmute" : "Mute"}
                  onClick={() => setPref("muted", !prefs.muted)}
                >
                  <Icon name={prefs.muted ? "mute" : "volume"} />
                </button>
                <input
                  id="vn-volume"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(prefs.volume * 100)}
                  aria-valuetext={prefs.muted ? "Muted" : `${Math.round(prefs.volume * 100)}%`}
                  onChange={(e) => {
                    setPref("volume", Number(e.target.value) / 100);
                    if (prefs.muted) setPref("muted", false);
                  }}
                />
              </div>
            </div>
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
                  {e.who && (
                    <span className={styles.logWho} style={e.color ? { color: e.color } : undefined}>
                      {e.who}
                    </span>
                  )}
                  <span>{e.text}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {panel === "gallery" && <Gallery story={story} cgs={seenCgs} endings={endings} panelRef={panelRef} onClose={closePanel} holdTab={holdTab} />}
      </div>
    </main>
  );
}
