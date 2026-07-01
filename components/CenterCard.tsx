"use client";
import React from "react";
import { CONTENT } from "@/lib/content";
import styles from "./CenterCard.module.css";

interface CenterCardProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * CenterCard — the AUTHENTICATION ERROR card
 *
 * Renders the `.center-card` div with:
 *   - <h1> heading from CONTENT.heading
 *   - <p> body with CONTENT.highlight wrapped in <span class="hl">
 *
 * The cardRef is attached to the root div so the boot hook (useBootSequence)
 * can call card.classList.add("on") / remove("on") and card.style.opacity="1"
 * to drive the signalLock animation.
 *
 * useCursorGlitch may also add/remove the "glitching" class on the same element.
 */
export function CenterCard({ cardRef }: CenterCardProps) {
  // Split body on highlight to inject the span — no dangerouslySetInnerHTML
  const [before, after] = CONTENT.body.split(CONTENT.highlight);

  return (
    <div ref={cardRef} className={styles.centerCard}>
      <h1>{CONTENT.heading}</h1>
      <p>
        {before}
        <span className={styles.hl}>{CONTENT.highlight}</span>
        {after}
      </p>
    </div>
  );
}
