"use client";

import { useEffect, useState } from "react";
import { releaseTime, type Episode } from "@/lib/labs/series";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The time, starting from `initial` so the server and the first client paint agree, then kept current
 * on the client every 30 seconds.
 */
export function useNow(initial: number) {
  const [now, setNow] = useState(initial);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return now;
}

type Left = { n: number; unit: "day" | "hour" | "minute" };

/** What is left until an episode's release, rounded up: days, under a day hours, under an hour minutes. */
function left(e: Pick<Episode, "releases">, now: number): Left | null {
  const ms = releaseTime(e) - now;
  if (ms <= 0) return null;
  if (ms >= DAY) return { n: Math.ceil(ms / DAY), unit: "day" };
  if (ms >= HOUR) return { n: Math.ceil(ms / HOUR), unit: "hour" };
  return { n: Math.max(1, Math.ceil(ms / MINUTE)), unit: "minute" };
}

/** "Unlocks in 6 days", "Unlocks in 5 hours", "Unlocks in 1 minute". Empty once released. */
export function unlocksIn(e: Pick<Episode, "releases">, now: number) {
  const l = left(e, now);
  return l ? `Unlocks in ${l.n} ${l.unit}${l.n === 1 ? "" : "s"}` : "";
}

/** The chip's short form: "6d", "5h", "12m". */
export function unlocksShort(e: Pick<Episode, "releases">, now: number) {
  const l = left(e, now);
  return l ? `${l.n}${l.unit[0]}` : "";
}

/** "24 November", in UTC like the release itself, so every visitor and the server read the same date. */
export const releaseDay = (e: Pick<Episode, "releases">) =>
  new Date(releaseTime(e)).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });

/** "18 November 2026", for the subscription's start. */
export const longDay = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
