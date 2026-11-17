"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { VolumeIcon } from "./fx/AnimatedIcon";
import styles from "./AdSamples.module.css";

export type Sample = { title: string; detail: string; video: string; poster: string; /** False for a cut with no sound track. */ sound: boolean };

/**
 * Vertical ad samples. Each loops without sound while it is on screen and stops when it leaves.
 * Sound comes on only when asked, for one sample at a time. With reduced motion nothing plays until pressed.
 */
export function AdSamples({ samples }: { samples: Sample[] }) {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState<boolean[]>(() => samples.map(() => false));
  const [audible, setAudible] = useState<number | null>(null);
  /** Samples the visitor paused: scrolling back does not restart them. */
  const held = useRef<Set<number>>(new Set());
  const still = useRef(false);

  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          const i = videos.current.indexOf(v);
          if (i < 0) continue;
          if (!e.isIntersecting) v.pause();
          else if (!still.current && !held.current.has(i)) v.play().catch(() => {});
        }
      },
      { threshold: 0.5 },
    );
    videos.current.forEach((v) => v && io.observe(v));
    return () => io.disconnect();
  }, []);

  // Keep the elements in step with the state: only the chosen sample is ever unmuted.
  useEffect(() => {
    videos.current.forEach((v, j) => v && (v.muted = audible !== j));
  }, [audible]);

  const mark = (i: number, on: boolean) => setPlaying((p) => p.map((x, j) => (j === i ? on : x)));

  const toggle = (i: number) => {
    const v = videos.current[i];
    if (!v) return;
    if (v.paused) {
      held.current.delete(i);
      v.play().catch(() => {});
    } else {
      held.current.add(i);
      v.pause();
    }
  };

  const sound = (i: number) => {
    const v = videos.current[i];
    if (!v) return;
    if (audible === i) {
      setAudible(null);
      return;
    }
    setAudible(i);
    held.current.delete(i);
    videos.current.forEach((o, j) => o && (o.muted = j !== i));
    // Sound starts the clip from the top, so it is heard from the first beat.
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  return (
    <ul className={styles.row}>
      {samples.map((s, i) => (
        <li key={s.video}>
          <div className={styles.frame}>
            <video
              ref={(el) => {
                videos.current[i] = el;
              }}
              src={s.video}
              poster={s.poster}
              playsInline
              loop
              muted={audible !== i}
              preload="metadata"
              onPlay={() => mark(i, true)}
              onPause={() => mark(i, false)}
            />
            <button type="button" className={styles.hit} onClick={() => toggle(i)} aria-label={`${playing[i] ? "Pause" : "Play"} ${s.title}`}>
              <span className={styles.play} data-shown={!playing[i]}>
                <Icon name="play" size={26} />
              </span>
            </button>
            {s.sound && (
              <button type="button" className={styles.sound} onClick={() => sound(i)}>
                <VolumeIcon muted={audible !== i} size={18} />
                <span>{audible === i ? "Sound off" : "Sound on"}</span>
              </button>
            )}
          </div>
          <p className={styles.title}>{s.title}</p>
          <p className="small muted">{s.detail}</p>
        </li>
      ))}
    </ul>
  );
}
