"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { ChevronIcon, GestureIcon } from "@/components/labs/fx";
import type { Media } from "@/lib/labs/styles";
import s from "./styles.module.css";

/** A chart image full screen. Escape or the close button shuts it; the arrows and arrow keys step through the chart. */
export function Lightbox({ items, index, onIndex, onClose }: { items: Media[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null && items.length > 0;
  const item = open ? items[index] : undefined;
  const many = items.length > 1;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const step = (by: number) => {
    if (index === null) return;
    onIndex((index + by + items.length) % items.length);
  };

  const onKey = (e: KeyboardEvent) => {
    if (!many) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <dialog ref={ref} className={s.lightbox} aria-label={item ? item.alt : "Image"} onClose={onClose} onKeyDown={onKey} onClick={(e) => e.target === ref.current && onClose()}>
      {item && (
        <figure className={s.lightboxFigure}>
          {/* eslint-disable-next-line @next/next/no-img-element -- full size, any ratio, already loaded on the page */}
          <img key={item.src} src={item.src} alt={item.alt} className={s.lightboxImage} />
          <figcaption className={s.lightboxCaption}>
            {item.label ?? item.alt}
            {many && (
              <span className={s.lightboxCount}>
                {index! + 1} of {items.length}
              </span>
            )}
          </figcaption>
        </figure>
      )}
      <button type="button" className={`${s.lightboxButton} ${s.lightboxClose}`} onClick={onClose} aria-label="Close" autoFocus>
        <GestureIcon name="close" size={20} />
      </button>
      {many && (
        <>
          <button type="button" className={`${s.lightboxButton} ${s.lightboxPrev}`} onClick={() => step(-1)} aria-label="Previous image">
            <ChevronIcon open={false} size={20} className={s.chevPrev} />
          </button>
          <button type="button" className={`${s.lightboxButton} ${s.lightboxNext}`} onClick={() => step(1)} aria-label="Next image">
            <ChevronIcon open={false} size={20} className={s.chevNext} />
          </button>
        </>
      )}
    </dialog>
  );
}
