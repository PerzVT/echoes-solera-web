"use client";

import { useEffect, useRef } from "react";

/** Scrolls its parent row sideways so the link marked aria-current="page" sits in view. */
export function ScrollToCurrent({ current }: { current: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const row = ref.current?.parentElement;
    const link = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !link || row.scrollWidth <= row.clientWidth) return;
    row.scrollLeft = link.offsetLeft - (row.clientWidth - link.offsetWidth) / 2;
  }, [current]);
  return <span ref={ref} hidden />;
}
