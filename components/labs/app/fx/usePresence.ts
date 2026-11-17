"use client";

import { useEffect, useState } from "react";

/**
 * Keeps the last value for a moment after it becomes null, so the thing that shows it can leave
 * instead of vanishing. `leaving` is true during that moment (the exit token, 120 ms).
 */
export function usePresence<T>(value: T | null | undefined, ms = 120): { item: T | null; leaving: boolean } {
  const [held, setHeld] = useState<T | null>(value ?? null);
  const [leaving, setLeaving] = useState(false);

  if (value != null && value !== held) {
    setHeld(value);
    if (leaving) setLeaving(false);
  } else if (value == null && held != null && !leaving) {
    setLeaving(true);
  }

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      setHeld(null);
      setLeaving(false);
    }, ms);
    return () => clearTimeout(t);
  }, [leaving, ms]);

  return { item: held, leaving };
}
