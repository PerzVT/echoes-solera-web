"use client";

import { useEffect, useRef, useState } from "react";
import { PlayPauseIcon } from "../fx/AnimatedIcon";
import styles from "./Clip.module.css";

/**
 * A muted looping clip with the site's own pause button (the hero video's), never the browser's
 * controls. It plays only while it is on screen, and only when the reader has not asked for reduced
 * motion. Nothing downloads until it first comes into view. A clip the reader paused stays paused.
 */
export function Clip({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const held = useRef(false);
  const ours = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!held.current) v.play().catch(() => {});
        } else if (!v.paused) {
          ours.current = true;
          v.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <span className={styles.wrap}>
      <video
        ref={ref}
        className={className}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => {
          held.current = false;
          setPlaying(true);
        }}
        onPause={() => {
          held.current = !ours.current;
          ours.current = false;
          setPlaying(false);
        }}
      />
      <button type="button" className={styles.toggle} onClick={toggle} aria-label={playing ? `Pause: ${label}` : `Play: ${label}`}>
        <PlayPauseIcon playing={playing} size={18} />
      </button>
    </span>
  );
}
