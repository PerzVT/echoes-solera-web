"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GestureIcon } from "./fx/AnimatedIcon";
import styles from "./CoverCarousel.module.css";

export type Cover = { title: string; src: string; href: string };

/**
 * A row of series covers along the foot of a hero. It scrolls sideways with snap points, by touch, wheel
 * or keyboard; on a mouse-driven screen two arrow buttons page it. It never moves on its own.
 */
export function CoverCarousel({ covers, eager = false, label = "Series" }: { covers: Cover[]; eager?: boolean; label?: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });
  const slide = useRef(0);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEnds({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      cancelAnimationFrame(slide.current);
      ro.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [measure]);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const aim = Math.min(max, Math.max(0, el.scrollLeft + dir * el.clientWidth * 0.8));
    // Land on a cover's edge, so the snap points have nothing left to correct when the slide ends.
    const first = el.firstElementChild as HTMLElement | null;
    const edges = [...el.children].map((li) => (li as HTMLElement).offsetLeft - (first?.offsetLeft ?? 0));
    const to = aim >= max - 2 ? max : edges.reduce((best, x) => (Math.abs(x - aim) < Math.abs(best - aim) ? x : best), 0);
    const from = el.scrollLeft;
    cancelAnimationFrame(slide.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollLeft = to;
      return;
    }
    // A directional slide over 380 ms, fast at the start and settling: the same move as perz.dev's carousels.
    el.style.scrollSnapType = "none";
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 380);
      el.scrollLeft = from + (to - from) * (1 - Math.pow(1 - k, 4));
      if (k < 1) slide.current = requestAnimationFrame(step);
      else el.style.scrollSnapType = "";
    };
    slide.current = requestAnimationFrame(step);
  };

  return (
    <div className={styles.carousel} role="region" aria-label={label} data-start={ends.start} data-end={ends.end}>
      <ul ref={track} className={styles.track}>
        {covers.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className={styles.cover} title={c.title}>
              <Image src={c.src} alt={c.title} width={280} height={420} sizes="(max-width: 900px) 96px, 140px" loading={eager ? "eager" : "lazy"} />
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.arrows}>
        <button type="button" onClick={() => page(-1)} disabled={ends.start} aria-label="Earlier covers">
          <GestureIcon name="back" size={18} />
        </button>
        <button type="button" onClick={() => page(1)} disabled={ends.end} aria-label="Later covers">
          <GestureIcon name="arrow" size={18} />
        </button>
      </div>
    </div>
  );
}
