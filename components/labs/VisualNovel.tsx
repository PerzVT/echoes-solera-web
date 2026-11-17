"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonLink } from "./Button";
import { Icon } from "./Icon";
import { ReplayIcon } from "./fx/AnimatedIcon";
import type { Scene } from "@/lib/labs/novel";
import styles from "./VisualNovel.module.css";

type Story = { title: string; start: string; scenes: Scene[] };
type Speed = "slow" | "normal" | "fast";
const perChar: Record<Speed, number> = { slow: 46, normal: 26, fast: 12 };

export function VisualNovel({ story, exitHref }: { story: Story; exitHref: string }) {
  const byId = useMemo(() => new Map(story.scenes.map((s) => [s.id, s])), [story]);
  const [sceneId, setSceneId] = useState(story.start);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [auto, setAuto] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [settings, setSettings] = useState(false);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [large, setLarge] = useState(false);
  const [ended, setEnded] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [turns, setTurns] = useState(0);
  const still = useRef(false);
  const panel = useRef<HTMLElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  /** Set when a press only closed Settings, so the same press does not also move the story on. */
  const swallow = useRef(false);

  const scene = byId.get(sceneId)!;
  const line = scene.lines[index];
  const typing = shown < line.text.length;
  const lastLine = index === scene.lines.length - 1;
  const choosing = !typing && lastLine && !!scene.choices?.length && !ended;

  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Reveal the line a character at a time.
  useEffect(() => {
    if (!typing) return;
    if (still.current) {
      setShown(line.text.length);
      return;
    }
    const t = setTimeout(() => setShown((n) => n + 1), perChar[speed]);
    return () => clearTimeout(t);
  }, [typing, shown, line, speed]);

  const go = useCallback((id: string) => {
    setSceneId(id);
    setIndex(0);
    setShown(0);
    setPicked(null);
  }, []);

  // A choice shows as picked for a moment, as the kit's selected state, before the scene changes.
  const choose = (next: string) => {
    if (picked) return;
    setPicked(next);
    setTimeout(() => go(next), still.current ? 0 : 220);
  };

  // Settings closes on a press anywhere outside it.
  useEffect(() => {
    if (!settings) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || settingsButton.current?.contains(t)) return;
      swallow.current = true;
      setTimeout(() => (swallow.current = false), 400);
      setSettings(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [settings]);

  const advance = useCallback(() => {
    if (ended || settings) return;
    if (typing) return setShown(line.text.length);
    if (!lastLine) {
      setIndex((i) => i + 1);
      setShown(0);
    } else if (scene.choices?.length) {
      return;
    } else if (scene.next) {
      go(scene.next);
    } else {
      setEnded(true);
      setAuto(false);
    }
  }, [ended, settings, typing, line, lastLine, scene, go]);

  // Auto moves on a little after a line finishes.
  useEffect(() => {
    if (!auto || typing || choosing || ended) return;
    const t = setTimeout(advance, 1400 + line.text.length * 28);
    return () => clearTimeout(t);
  }, [auto, typing, choosing, ended, advance, line]);

  // Lines the reader has seen in full. Skip runs through these and stops at the first new one.
  const read = useRef(new Set<string>());
  useEffect(() => {
    if (!typing) read.current.add(`${sceneId}:${index}`);
  }, [typing, sceneId, index]);

  const skip = () => {
    if (ended) return;
    const unread = scene.lines.findIndex((_, i) => i > index && !read.current.has(`${sceneId}:${i}`));
    if (typing && !read.current.has(`${sceneId}:${index}`)) {
      // A new line: Skip finishes it but does not jump past it.
      setShown(line.text.length);
      return;
    }
    if (unread !== -1) {
      setIndex(unread);
      setShown(0);
      return;
    }
    if (scene.next && read.current.has(`${scene.next}:0`)) {
      go(scene.next);
      return;
    }
    if (scene.choices?.length || scene.next) {
      setIndex(scene.lines.length - 1);
      setShown(scene.lines[scene.lines.length - 1].text.length);
      return;
    }
    if (scene.choices?.length) {
      setIndex(scene.lines.length - 1);
      setShown(scene.lines[scene.lines.length - 1].text.length);
    } else if (scene.next) {
      go(scene.next);
    } else {
      setIndex(scene.lines.length - 1);
      setShown(scene.lines[scene.lines.length - 1].text.length);
      setEnded(true);
    }
  };

  const restart = () => {
    setTurns((n) => n + 1);
    setEnded(false);
    setSettings(false);
    go(story.start);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      // Escape works from anywhere, a control inside Settings included; focus goes back to Settings.
      if (e.key === "Escape") {
        if (panel.current?.contains(el)) settingsButton.current?.focus();
        setSettings(false);
        setHidden(false);
        return;
      }
      if (el.closest("button, a, input, select")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (hidden) setHidden(false);
        else advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, hidden]);

  return (
    <main id="main" className={styles.stage} data-large={large}>
      <h1 className="sr-only">{story.title}</h1>
      {story.scenes.map((s) => (
        <div key={s.id} className={styles.scene} data-on={s.id === sceneId}>
          {/* The art covers the screen, so on a tall screen it is drawn wider than the viewport: 16:9 of its height. */}
          <Image
            src={s.art}
            alt=""
            fill
            sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
            priority={s.id === story.start}
            style={{ objectPosition: s.focus }}
          />
          {s.sprite && (
            <Image
              bare
              src={s.sprite}
              alt=""
              fill
              sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
              priority={s.id === story.start}
              style={{ objectPosition: s.focus }}
            />
          )}
        </div>
      ))}

      {/* The whole picture moves the story on, like the dialogue box in any visual novel. */}
      <button
        type="button"
        className={styles.tap}
        onClick={() => {
          if (swallow.current) swallow.current = false;
          else if (hidden) setHidden(false);
          else advance();
        }}
        aria-label={hidden ? "Show the dialogue" : "Next line"}
      />

      <div className={styles.ui} data-hidden={hidden} inert={hidden}>
        <div className={styles.fade} />
        <Link href={exitHref} className={styles.exit} aria-label="Leave the story">
          <Icon name="back" />
        </Link>
        <p className={styles.concept}>Concept sample</p>

        {choosing && (
          <ul className={styles.choices}>
            {scene.choices!.map((c) => (
              <li key={c.next}>
                <button
                  type="button"
                  onClick={() => choose(c.next)}
                  data-picked={picked === c.next}
                  disabled={!!picked && picked !== c.next}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        {!ended && (
          <div className={styles.dialogue}>
            <p className={styles.speaker}>{line.speaker}</p>
            <p className={styles.line} aria-hidden="true">
              <span>{line.text.slice(0, shown)}</span>
              <span className={styles.rest}>{line.text.slice(shown)}</span>
              {/* The tap is the reader's: shown once the line is out and nothing else is asked. */}
              {!typing && !choosing && <span className={styles.more} />}
            </p>
            <p className="sr-only" aria-live="polite">
              {line.speaker}: {line.text}
            </p>
          </div>
        )}

        {ended && (
          <div className={styles.end}>
            <p className="h2">End of the sample</p>
            <div className={styles.endActions}>
              <Button onClick={restart} icon={<ReplayIcon turn={turns} size={18} />}>
                Play again
              </Button>
              <ButtonLink href={exitHref} variant="secondary">
                Leave the story
              </ButtonLink>
            </div>
          </div>
        )}

        <nav className={styles.controls} aria-label="Reading controls">
          <button type="button" aria-pressed={auto} onClick={() => setAuto((a) => !a)} disabled={ended}>
            Auto
          </button>
          <button type="button" onClick={skip} disabled={ended}>
            Skip
          </button>
          <button type="button" onClick={() => setHidden(true)}>
            Hide
          </button>
          <button ref={settingsButton} type="button" aria-expanded={settings} onClick={() => setSettings((s) => !s)}>
            Settings
          </button>
        </nav>

        {settings && (
          <section ref={panel} className={styles.settings} aria-label="Settings">
            <fieldset>
              <legend>Text speed</legend>
              {(["slow", "normal", "fast"] as Speed[]).map((s) => (
                <label key={s}>
                  <input type="radio" name="speed" checked={speed === s} onChange={() => setSpeed(s)} />
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
              <Button variant="quiet" size="small" onClick={() => setSettings(false)}>
                Close
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
