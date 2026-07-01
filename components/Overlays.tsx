"use client";
/**
 * Overlays — fixed-position vignette, scanline, and grain layers.
 * Ported from the approved artifact (lines 82-95, 165-167).
 * All layers are purely cosmetic: pointer-events: none.
 */
import styles from "./Overlays.module.css";

export function Overlays() {
  return (
    <>
      <div className={styles.vignette} />
      <div className={styles.scan} />
      <div className={styles.grain} />
    </>
  );
}
