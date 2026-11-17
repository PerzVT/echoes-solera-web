"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./MediaFrame.module.css";

type Props = {
  /** One `next/image`, `<img>` or `<video poster>`. */
  children: ReactNode;
  /** CSS aspect-ratio that reserves the box, for example "2 / 3". Leave it out when the parent already sizes the frame. */
  ratio?: string;
  radius?: number | string;
  /** Stretch over the nearest positioned ancestor instead of taking part in layout. */
  fill?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Shows a skeleton until the media inside has loaded, then fades the media in over 220 ms. The box is
 * sized by `ratio` or by its parent, so nothing shifts. Without script the media is simply visible:
 * the hidden state only applies once the document is marked as scripted (see introScript).
 */
export function MediaFrame({ children, ratio, radius, fill, className, style }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLImageElement | HTMLVideoElement>("img, video");
    if (!el) {
      setLoaded(true);
      return;
    }
    const done = () => setLoaded(true);
    if (el instanceof HTMLImageElement) {
      if (el.complete && el.naturalWidth > 0) return done();
      el.addEventListener("load", done);
      // A broken image still has to show its alt text.
      el.addEventListener("error", done);
      return () => {
        el.removeEventListener("load", done);
        el.removeEventListener("error", done);
      };
    }
    if (el.readyState >= 2) return done();
    let probe: HTMLImageElement | undefined;
    if (el.poster) {
      probe = new Image();
      probe.onload = done;
      probe.onerror = done;
      probe.src = el.poster;
      if (probe.complete) done();
    }
    el.addEventListener("loadeddata", done);
    el.addEventListener("error", done);
    return () => {
      if (probe) probe.onload = probe.onerror = null;
      el.removeEventListener("loadeddata", done);
      el.removeEventListener("error", done);
    };
  }, []);

  return (
    <span
      ref={ref}
      className={[styles.frame, fill ? styles.fill : "", className].filter(Boolean).join(" ")}
      data-loaded={loaded}
      data-sized={ratio || fill ? "" : undefined}
      style={{ aspectRatio: ratio, "--mf-r": typeof radius === "number" ? `${radius}px` : radius, ...style } as CSSProperties}
    >
      <span className={styles.wait} aria-hidden="true" />
      <span className={styles.media}>{children}</span>
    </span>
  );
}
