"use client";

import { useEffect, useState } from "react";
import m from "./motion.module.css";

/** A short text that changes in place, such as a state label: the old one lifts out as the new one comes in. Nothing around it moves. */
export function SwapText({ children, className }: { children: string; className?: string }) {
  const [shown, setShown] = useState<{ now: string; was: string | null }>({ now: children, was: null });
  if (shown.now !== children) setShown({ now: children, was: shown.now });

  useEffect(() => {
    if (shown.was === null) return;
    const t = setTimeout(() => setShown((x) => ({ now: x.now, was: null })), 220);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <span className={[m.swapText, className].filter(Boolean).join(" ")}>
      {shown.was !== null && (
        <span key={`was-${shown.was}`} className={m.swapOut} aria-hidden="true">
          {shown.was}
        </span>
      )}
      <span key={shown.now} className={shown.was !== null ? m.swapIn : undefined}>
        {shown.now}
      </span>
    </span>
  );
}
