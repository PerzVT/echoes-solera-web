"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import { useEffect, useRef, useState } from "react";
import styles from "./lab.module.css";

/**
 * A muted, looping clip that fills its tile. It loads and plays only while the tile is on screen, and
 * not at all under reduced motion, where the poster stands in for it.
 */
export function LoopClip({ src, poster, sizes, focus }: { src: string; poster: string; sizes: string; focus?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(true);
  const [onScreen, setOnScreen] = useState(false);
  const [armed, setArmed] = useState(false);

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
    const io = new IntersectionObserver(
      ([e]) => {
        setOnScreen(e.isIntersecting);
        if (e.isIntersecting) setArmed(true);
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (armed && onScreen && !still) v.play().catch(() => {});
    else v.pause();
  }, [armed, onScreen, still]);

  const style = focus ? { objectPosition: focus } : undefined;
  return (
    <>
      <Image className={styles.tileMedia} src={poster} alt="" fill sizes={sizes} style={style} />
      <video
        ref={video}
        className={styles.tileMedia}
        src={armed && !still ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        style={style}
      />
    </>
  );
}
