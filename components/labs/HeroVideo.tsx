"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import { useEffect, useRef, useState } from "react";
import { PlayPauseIcon } from "./fx/AnimatedIcon";
import styles from "./HeroVideo.module.css";

/**
 * A muted 16:9 loop shown whole at every width. The stage around it is filled with a blurred, dimmed copy
 * of the poster, so a tall or very wide stage never shows bare bars. It plays only while its hero is the
 * chosen one and is on screen, and it can be paused.
 */
export function HeroVideo({ src, poster, active }: { src: string; poster: string; active: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (active && !paused && onScreen) v.play().catch(() => {});
    else v.pause();
  }, [active, paused, onScreen]);

  return (
    <>
      <Image className={styles.backdrop} src={poster} alt="" fill sizes="40vw" priority={active} aria-hidden="true" />
      <video ref={video} className={styles.video} src={active ? src : undefined} poster={poster} muted loop playsInline preload="none" aria-hidden="true" />
      <button type="button" className={styles.toggle} onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play the video" : "Pause the video"}>
        <PlayPauseIcon playing={!paused} size={18} />
      </button>
    </>
  );
}
