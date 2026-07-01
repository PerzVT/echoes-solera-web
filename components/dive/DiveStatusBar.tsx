"use client";
import styles from "./DiveStatusBar.module.css";
import type { DivePhase } from "@/lib/diveScript";

/**
 * DiveStatusBar — a techy status footer bar in the duotone/dithered "tech panel"
 * vocabulary (// -separated mono labels, colored status states, pixel-glyph
 * accents). Matches the reference design. Present from the dive's start; its
 * right-side state shifts with the phase, going red on sever/error.
 */

const STATE_BY_PHASE: Record<DivePhase, { label: string; alert: boolean }> = {
  black:    { label: "LINK-INIT",  alert: false },
  autofill: { label: "AUTH-RUN",   alert: false },
  awaken:   { label: "SYNC-OK",    alert: false },
  welcome:  { label: "WORLD-RDY",  alert: false },
  severed:  { label: "SEVERED",    alert: true  },
  error:    { label: "AUTH-FAIL",  alert: true  },
};

export function DiveStatusBar({ phase }: { phase: DivePhase }) {
  const { label, alert } = STATE_BY_PHASE[phase];
  return (
    <div className={`${styles.bar} ${alert ? styles.alert : ""}`} aria-hidden>
      <div className={styles.left}>
        <span className={styles.brand}>SOLERA://AUTH-LINK</span>
        <span className={styles.sep}>/</span>
        <span className={styles.dim}>NODE-04</span>
        <span className={styles.sep}>/</span>
        <span className={styles.dim}>SEQ DELTA-9</span>
        <span className={styles.sep}>/</span>
        <span className={alert ? styles.stateAlert : styles.dim}>
          {alert ? "00 INTEGRITY" : "01 INSTANCE"}
        </span>
      </div>
      <div className={styles.right}>
        <span className={styles.glyph}>▚▚</span>
        <span className={alert ? styles.stateAlert : styles.state}>{label}</span>
        <span className={styles.glyph}>▚▚</span>
      </div>
    </div>
  );
}
