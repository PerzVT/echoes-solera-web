"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import { useEffect, useRef, useState } from "react";
import styles from "./HeroVideo.module.css";

/**
 * A muted loop that covers its stage edge to edge. It plays only while its hero is the chosen one and is
 * on screen, and not at all under reduced motion, where the poster stands in for it.
 */
export function HeroVideo({ src, poster, active }: { src: string; poster: string; active: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // The source is set the first time the hero plays and then kept, so leaving pauses the loop and coming
  // back resumes it where it stopped instead of reloading from the start.
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (active && !still && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setStarted(true);
  }, [active, still]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (active && !still && onScreen && started) v.play().catch(() => {});
    else v.pause();
  }, [active, still, onScreen, started]);

  return (
    <>
      <Image className={styles.poster} src={poster} alt="" fill sizes="100vw" priority={active} aria-hidden="true" />
      <video ref={video} className={styles.video} src={started ? src : undefined} poster={poster} muted loop playsInline preload="none" aria-hidden="true" />
    </>
  );
}
