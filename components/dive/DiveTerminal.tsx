"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./DiveTerminal.module.css";
import type { DivePhase } from "@/hooks/useDiveSequence";

/**
 * DiveTerminal — sparse monospace terminal text typed directly on the black
 * void (phases "black" + "autofill"). No panel, no box — text on the void.
 *
 * Lines reveal sequentially with a typing feel; the access key auto-fills as
 * masked dots during the "autofill" phase. Fades out as the scene awakens.
 */

type Line = { text: string; cls?: string };

const BLACK_LINES: Line[] = [
  { text: "> establishing connection ......... ok" },
  { text: "> S.I.M.U LINK ................... established" },
  { text: "> locating world instance: SOLERA" },
];

const AUTH_LINES: Line[] = [
  { text: "> identity ........................ ADVENTURER" },
];

const KEY_LENGTH = 12;

export function DiveTerminal({ phase }: { phase: DivePhase }) {
  // how many of the static lines are revealed
  const [revealed, setRevealed] = useState(0);
  // how many masked chars of the access key have filled
  const [keyFilled, setKeyFilled] = useState(0);
  const [authed, setAuthed] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reveal the black-phase lines one by one
  useEffect(() => {
    if (phase !== "black" && phase !== "autofill") return;
    const timers = timersRef.current;
    BLACK_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealed((r) => Math.max(r, i + 1)), 350 + i * 480));
    });
    return () => {
      timers.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [phase]);

  // Auto-fill the masked access key during the autofill phase
  useEffect(() => {
    if (phase !== "autofill") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= KEY_LENGTH; i++) {
      timers.push(setTimeout(() => setKeyFilled(i), 250 + i * 95));
    }
    timers.push(setTimeout(() => setAuthed(true), 250 + KEY_LENGTH * 95 + 350));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Visible only during black/autofill; fades out once the scene awakens
  const visible = phase === "black" || phase === "autofill";

  return (
    <div className={`${styles.terminal} ${visible ? styles.show : styles.hide}`} aria-hidden>
      {BLACK_LINES.map((l, i) => (
        <div key={i} className={`${styles.line} ${i < revealed ? styles.lineShow : ""}`}>
          {l.text}
        </div>
      ))}

      {phase === "autofill" && (
        <>
          {AUTH_LINES.map((l, i) => (
            <div key={`a${i}`} className={`${styles.line} ${styles.lineShow}`}>
              {l.text}
            </div>
          ))}
          <div className={`${styles.line} ${styles.lineShow}`}>
            {"> access key ..................... "}
            <span className={styles.key}>
              {"●".repeat(keyFilled)}
              <span className={styles.keyEmpty}>
                {"·".repeat(Math.max(0, KEY_LENGTH - keyFilled))}
              </span>
            </span>
            <span className={styles.auto}>{keyFilled >= KEY_LENGTH ? " [auto]" : ""}</span>
          </div>
          <div className={`${styles.line} ${styles.lineShow} ${styles.authing}`}>
            {authed ? "" : "> authenticating"}
            {authed && <span className={styles.desync}>{"> S.I.M.U DESYNC ERROR"}</span>}
            {!authed && <span className={styles.caret}>_</span>}
          </div>
        </>
      )}
    </div>
  );
}
