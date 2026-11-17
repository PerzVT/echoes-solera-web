"use client";

import { useEffect, useRef } from "react";
import styles from "./ReadingProgress.module.css";

/** A thin bar fixed to the top of the window that fills as the page scrolls. */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
      bar.current?.style.setProperty("scale", `${ratio} 1`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.track} aria-hidden="true">
      <div ref={bar} className={styles.bar} />
    </div>
  );
}
