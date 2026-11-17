"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import { Clip } from "./Clip";
import s from "./styles.module.css";

/** A style-library direction under review: its still and its clip side by side. The clip waits for a press and starts muted. */
export function Review({ name, still, clip, onOpen }: { name: string; still: string; clip: string; /** Opens the still full screen. */ onOpen?: () => void }) {
  return (
    <div className={s.review}>
      <figure className={s.reviewItem}>
        <span className={s.reviewFrame}>
          {onOpen ? (
            <button type="button" className={s.slotOpen} onClick={onOpen} aria-label={`${name}, still, full screen`}>
              <Image src={still} alt={`${name}, still`} fill loading="eager" sizes="(max-width: 720px) 50vw, 30vw" />
            </button>
          ) : (
            <Image src={still} alt={`${name}, still`} fill loading="eager" sizes="(max-width: 720px) 50vw, 30vw" />
          )}
        </span>
        <figcaption className={s.reviewCaption}>Still</figcaption>
      </figure>
      <figure className={s.reviewItem}>
        <span className={s.reviewFrame}>
          <Clip src={clip} poster={still} label={`${name}, clip`} />
        </span>
        <figcaption className={s.reviewCaption}>Clip</figcaption>
      </figure>
    </div>
  );
}
