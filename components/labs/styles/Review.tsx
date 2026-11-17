"use client";

import { useRef, useState } from "react";
import { PlayPauseIcon } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import s from "./styles.module.css";

/** A style-library direction under review: its still and its clip side by side. The clip waits for a press and starts muted. */
export function Review({ name, still, clip }: { name: string; still: string; clip: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    const v = video.current;
    if (!v) return;
    v.muted = true;
    setStarted(true);
    void v.play().catch(() => setStarted(false));
  };

  return (
    <div className={s.review}>
      <figure className={s.reviewItem}>
        <span className={s.reviewFrame}>
          <Image src={still} alt={`${name}, still`} fill loading="eager" sizes="(max-width: 720px) 50vw, 24vw" />
        </span>
        <figcaption className={s.reviewCaption}>Still</figcaption>
      </figure>
      <figure className={s.reviewItem}>
        <span className={s.reviewFrame}>
          <video
            ref={video}
            src={clip}
            poster={still}
            muted
            loop
            playsInline
            preload="none"
            controls={started}
            aria-label={`${name}, clip`}
          />
          {!started && (
            <button type="button" className={s.reviewPlay} onClick={play} aria-label={`Play the ${name} clip`}>
              <span className={s.reviewPlayIcon}>
                <PlayPauseIcon playing={false} size={24} />
              </span>
            </button>
          )}
        </span>
        <figcaption className={s.reviewCaption}>Clip</figcaption>
      </figure>
    </div>
  );
}
