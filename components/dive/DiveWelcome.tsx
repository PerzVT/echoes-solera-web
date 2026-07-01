"use client";
import styles from "./DiveWelcome.module.css";
import type { DivePhase } from "@/lib/diveScript";
import { PixelScanVfx } from "./PixelScanVfx";

/**
 * DiveWelcome — the peak "WELCOME TO SOLER▮" moment and its violent severing.
 *
 * - phase "welcome": pixel-scan dissolve-in via VFX-JS (replaces CSS clip-path
 *   glitch). WebGL fallback → opacity fade. prefers-reduced-motion → no VFX.
 *   The glitchA/glitchB ghost layers are removed (shader provides the effect).
 * - phase "severed": RGB-split (cyan + red ghost layers) + red flash + glitch
 *   shear. Then the sequence resolves to the error screen (handled by parent).
 *
 * NOTE: the sever-moment red flash in this component is intentionally kept
 * (owner is deciding on it separately). Only the persistent status bar has
 * been de-redded in DiveStatusBar.
 */

const WELCOME = "WELCOME TO SOLER";

export function DiveWelcome({ phase }: { phase: DivePhase }) {
  const isWelcome = phase === "welcome";
  const isSevered = phase === "severed";
  const visible = isWelcome || isSevered;

  if (!visible) return null;

  return (
    <div className={styles.wrap} aria-hidden>
      {/* Red flash overlay — only during sever (kept as-is per brief) */}
      {isSevered && <div className={styles.redFlash} />}

      {isWelcome ? (
        /* Pixel-scan dissolve-in: left-to-right mode, fires on "welcome" phase.
           NOTE: the .welcomeIn CSS animation is NOT applied here — it starts at
           opacity:0 and would cause dom2canvas (VFX-JS's texture capture) to
           record a blank texture on the first frame. The pixel-scan shader IS
           the enter animation; the CSS glitch-assemble is redundant and harmful. */
        <PixelScanVfx
          active={true}
          mode={0}
          width={0.2}
          layers={3}
          speed={0.75}
          delay={0}
        >
          <div className={styles.welcome}>
            <span className={styles.main}>
              {WELCOME}
              <span className={styles.cut}>▮</span>
            </span>
          </div>
        </PixelScanVfx>
      ) : (
        /* Severed state — no VFX wrapper needed, uses CSS animations */
        <div className={`${styles.welcome} ${styles.severed}`}>
          {/* RGB-split ghost channels — sever only */}
          <span className={`${styles.ghost} ${styles.cyan}`}>
            {WELCOME}<span className={styles.cut}>▮</span>
          </span>
          <span className={`${styles.ghost} ${styles.red}`}>
            {WELCOME}<span className={styles.cut}>▮</span>
          </span>
          <span className={styles.main}>
            {WELCOME}
            <span className={styles.cut}>▮</span>
          </span>
        </div>
      )}

      {isSevered && (
        <div className={styles.severBanner}>!! SIGNAL SEVERED // CONNECTION TERMINATED !!</div>
      )}
    </div>
  );
}
