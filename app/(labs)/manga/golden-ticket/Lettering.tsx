import type { CSSProperties } from "react";
import styles from "./lettering.module.css";

/**
 * One piece of lettering over a page. Positions are percentages of the page, so the lettering scales
 * with the art; type is sized against the page's width (container units), with a floor that stays
 * readable on a phone.
 */
export type Letter = {
  kind: "speech" | "narration" | "sfx" | "inset";
  text: string;
  /** Left edge, top edge and width, in percent of the page. */
  x: number;
  y: number;
  w?: number;
  /** Speech only: where the tail leaves the balloon, in percent of its width; `up` points it at the top. */
  tail?: { at: number; up?: boolean; flip?: boolean };
  /** Sound effects only: rotation in degrees and size relative to the default. */
  rotate?: number;
  scale?: number;
};

export function Lettering({ letters }: { letters: Letter[] }) {
  return (
    <div className={styles.layer}>
      {letters.map((l, i) => {
        const style = {
          left: `${l.x}%`,
          top: `${l.y}%`,
          maxWidth: l.w ? `${l.w}%` : undefined,
          "--rot": l.rotate ? `${l.rotate}deg` : undefined,
          "--sfx-scale": l.scale,
          "--tail-at": l.tail ? `${l.tail.at}%` : undefined,
        } as CSSProperties;
        return (
          <p key={i} className={`${styles.letter} ${styles[l.kind]}`} style={style}>
            {l.text}
            {l.kind === "speech" && l.tail && (
              <svg
                className={styles.tail}
                data-up={l.tail.up ? "" : undefined}
                data-flip={l.tail.flip ? "" : undefined}
                viewBox="0 0 20 22"
                aria-hidden="true"
              >
                <path d="M1 0 L19 0 L5 21 Z" className={styles.tailFill} />
                <path d="M1 0 L5 21 L19 0" className={styles.tailLine} />
              </svg>
            )}
          </p>
        );
      })}
    </div>
  );
}
