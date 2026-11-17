"use client";

import { useEffect, useRef, useState } from "react";
import { PlayPauseIcon } from "@/components/labs/fx/AnimatedIcon";
import styles from "./Loop.module.css";

/**
 * A short silent loop from the film. It plays while on screen, stays on its poster for viewers who ask
 * for reduced motion, and has a pause button.
 */
export function Loop({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!paused && onScreen) v.play().catch(() => {});
    else v.pause();
  }, [paused, onScreen]);

  return (
    <>
      <video
        ref={video}
        className={`${styles.video} ${className ?? ""}`}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
      />
      <button type="button" className={styles.toggle} onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play the loop" : "Pause the loop"}>
        <PlayPauseIcon playing={!paused} size={18} />
      </button>
    </>
  );
}
