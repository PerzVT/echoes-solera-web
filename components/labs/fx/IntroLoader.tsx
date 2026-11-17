"use client";

import { useEffect, useRef } from "react";
import { AnimatedMark, type Material } from "./AnimatedMark";
import { INTRO_ATTR as ATTR } from "./introScript";
import styles from "./IntroLoader.module.css";

/* The fill shifts through these as it wipes in and lands on the last: pigment paper, the studio's own material. */
const INTRO_MATERIALS: Material[] = ["08-liquid-blue", "04-pigment-paper"];

/**
 * The first-visit intro, built like the one on perz.dev: one logo fills from the left over a ghost of
 * itself, a line grows along the bottom edge, the sheet lifts. The page is already rendered underneath;
 * CSS does all of it. The inline script (introScript) decides whether it shows and takes it
 * away: after it has played, or at once on a press, Escape or Tab. Without script it is never shown.
 */
export function IntroLoader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>(".nl");
    if (!root) return;
    // Covers arriving by client navigation from outside the labs layout, where the inline script did not run.
    root.setAttribute("data-nl-js", "");
    if (!root.hasAttribute(ATTR)) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      if (reduced.matches) root.removeAttribute(ATTR);
    };
    const dismiss = () => root.removeAttribute(ATTR);
    window.addEventListener("pagehide", dismiss);
    reduced.addEventListener("change", onMotion);
    return () => {
      window.removeEventListener("pagehide", dismiss);
      reduced.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <div ref={ref} className={styles.intro} aria-hidden="true">
      <div className={styles.logo}>
        <AnimatedMark variant="reveal" material={INTRO_MATERIALS} size="100%" />
      </div>
      <div className={styles.line} />
    </div>
  );
}
