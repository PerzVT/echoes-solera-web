"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Loop.module.css";

/**
 * A short silent loop from the film. It plays while on screen, stays on its poster for viewers who ask
 * for reduced motion.
 */
export function Loop({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setReduced(true);
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!reduced && onScreen) v.play().catch(() => {});
    else v.pause();
  }, [reduced, onScreen]);

  return (
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
  );
}
