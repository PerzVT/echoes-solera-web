"use client";

import Link from "next/link";
import { Picture as Image } from "../fx/Picture";
import { Icon } from "../Icon";
import { useAccess } from "../access/store";
import { releaseDay, unlocksIn, useNow } from "../access/timer";
import { isEarly } from "@/lib/labs/series";
import type { SeriesOutline } from "@/lib/labs/manga/outline";
import { chapterProgress, chapterState } from "./progress";
import styles from "./series.module.css";

const padded = (n: number) => String(n).padStart(2, "0");

/**
 * The chapters of a series as cards: cover, number, title, page count and state. Read chapters carry a tick,
 * one in progress a bar, an early-access chapter its lock and timer, an announced chapter its date. Every card
 * opens the chapter's page, which shows the reader, the lock screen or the announcement.
 */
export function ChapterCards({ series, now: serverNow }: { series: SeriesOutline; now: number }) {
  const access = useAccess();
  const now = useNow(serverNow);

  return (
    <ol className={styles.cards}>
      {series.chapters.map((c) => {
        const state = chapterState(c, access, series.slug, now);
        const p = chapterProgress(access, series.slug, c.number);
        const early = state !== "coming" && state !== "locked" && isEarly(c, now);
        const status =
          state === "read"
            ? "Read"
            : state === "reading"
              ? "In progress"
              : state === "locked"
                ? unlocksIn(c, now)
                : state === "coming"
                  ? `Out ${releaseDay(c)}`
                  : early
                    ? "Early access"
                    : "";
        const meta = [c.pageCount > 0 && `${c.pageCount} pages`, status].filter(Boolean).join(" · ");
        return (
          <li key={c.number}>
            <Link href={`/manga/${series.slug}/${c.number}${state === "reading" && p && p.page > 1 ? `?p=${p.page}` : ""}`} className={styles.card} data-state={state} aria-label={`Chapter ${c.number}: ${c.title}${meta ? `, ${meta}` : ""}`}>
              <span className={styles.thumb}>
                <Image src={c.thumb} alt="" width={480} height={720} sizes="(max-width: 720px) 88px, 300px" />
                <span className={styles.number} aria-hidden="true">
                  {padded(c.number)}
                </span>
                {(state === "locked" || state === "read") && (
                  <span className={styles.mark} aria-hidden="true">
                    <Icon name={state === "locked" ? "lock" : "check"} size={16} />
                  </span>
                )}
                {state === "reading" && p && (
                  <span className={styles.track} aria-hidden="true">
                    <span style={{ width: `${(p.page / p.pages) * 100}%` }} />
                  </span>
                )}
              </span>
              <span className={styles.cardText} aria-hidden="true">
                <span className={styles.cardTitle}>{c.title}</span>
                <span className={styles.cardMeta}>
                  {state === "locked" && <Icon name="lock" size={14} />}
                  {meta}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
