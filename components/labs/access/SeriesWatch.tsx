"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Picture as Image } from "../fx/Picture";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { VerticalPlayer } from "../VerticalPlayer";
import { isEarly, type Episode } from "@/lib/labs/series";
import { AccessSheets } from "./AccessSheets";
import { EarlyAccessBanner, useBannerSettled, useBannerShown } from "./Banner";
import { episodeKey, resumeAt, saveProgress, useAccess, watched, type AccessState } from "./store";
import type { SheetName } from "./sheets";
import { releaseDay, unlocksIn, unlocksShort, useNow } from "./timer";
import styles from "./access.module.css";

type Props = {
  slug: string;
  title: string;
  /** The genre line under the title. */
  genre?: string;
  cover: string;
  episodes: Episode[];
  /** The episode in the URL, if any. Without one the visitor's last episode of this series is shown. */
  wanted?: number;
  /** A screen opened from the URL. */
  sheet: SheetName | null;
  /** A start position from the URL, in seconds. */
  t?: number;
  /** The server's time, so release timers render the same on the server and the first client paint. */
  now: number;
  base: string;
  seriesHref: string;
  backLabel: string;
  listLabel: string;
};

const nameOf = (e: Episode) => e.title ?? `Episode ${e.number}`;
/** The chip's number: the title without "Episode", so 3.5 reads as 3.5. */
const chipOf = (e: Episode) => (e.title ?? "").replace(/^episode\s+/i, "") || String(e.number);
const padded = (x: string) => (/^\d$/.test(x) ? `0${x}` : x);
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** The episode the visitor was last on in this series, if any. */
export function lastEpisode(a: AccessState, slug: string) {
  const key = [...a.history].reverse().find((k) => k.startsWith(`${slug}:`));
  return key ? Number(key.slice(slug.length + 1)) : undefined;
}

/**
 * The watch page body from the design's Watch frame: the stage with the player and its rail, and the side
 * panel with the early-access banner, the series, the numbered episode chips and what plays next. Then the
 * early-access sheets. An episode is locked while it is before its release date and the visitor is not subscribed.
 */
export function SeriesWatch({ slug, title, genre, cover, episodes, wanted, sheet: fromUrl, t, now: serverNow, base, seriesHref, backLabel, listLabel }: Props) {
  const access = useAccess();
  const now = useNow(serverNow);
  const banner = useBannerShown();
  const settled = useBannerSettled();
  const isOpen = (e: Episode) => access.subscribed || !isEarly(e, now);

  // Without an episode in the URL the visitor picks up where they were: the same episode part way through,
  // or the one after it once it is watched.
  const last = lastEpisode(access, slug);
  const lastDone = last !== undefined && watched(access.progress[episodeKey(slug, last)]);
  const after = lastDone ? episodes.find((e) => e.number === last + 1) : undefined;
  const resumeNumber = wanted ?? after?.number ?? last;
  const item = episodes.find((e) => e.number === resumeNumber) ?? episodes[0];
  const key = episodeKey(slug, item.number);
  const next = episodes.find((e) => e.number === item.number + 1);
  const previous = episodes.find((e) => e.number === item.number - 1);
  const open = isOpen(item);
  const href = (n: number) => `${base}?ep=${n}#watch`;

  // The sheet follows the URL when it changes, and local actions otherwise.
  const [sheet, setSheet] = useState<SheetName | null>(fromUrl);
  const [urlSheet, setUrlSheet] = useState(fromUrl);
  if (urlSheet !== fromUrl) {
    setUrlSheet(fromUrl);
    setSheet(fromUrl);
  }
  const closeSheet = useCallback(() => {
    setSheet(null);
    // Drop the screen from the address so a reload lands on the page, not the sheet.
    const url = new URL(window.location.href);
    if (url.searchParams.has("state")) {
      url.searchParams.delete("state");
      window.history.replaceState(window.history.state, "", url);
    }
  }, []);

  // Subscribing clears every lock at once; the player mounts the episode and starts it. The button that
  // opened the sheet may be gone, so focus moves to the episode in the list.
  const onSubscribed = () =>
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-episode="${item.number}"]`)?.focus({ preventScroll: true }));
  // After a cancel the Subscribed control is replaced by a Subscribe button, in the banner or the row; focus goes there.
  const onCancelled = () => requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-access-control]")?.focus({ preventScroll: true }));

  const onProgress = useCallback((time: number, length: number, done: boolean) => saveProgress(key, time, length, done), [key]);
  const start = t ?? resumeAt(access.progress[key]);

  return (
    <>
      <div className={styles.watch}>
        <div id="watch" className={styles.stage}>
          <VerticalPlayer
            src={item.video}
            poster={item.poster}
            label={nameOf(item)}
            index={item.number}
            kind="Episode"
            shareTitle={`${title}, ${nameOf(item)}`}
            resumeLabel={`Continue ${nameOf(item).replace(/^Episode/, "episode")}`}
            previous={previous && href(previous.number)}
            previousLabel={previous && nameOf(previous)}
            next={next && href(next.number)}
            nextLabel={next && nameOf(next)}
            seriesHref={seriesHref}
            backLabel={backLabel}
            start={start}
            onProgress={onProgress}
            locked={
              open ? undefined : (
                <div className={styles.locked}>
                  <span className={styles.lockMark}>
                    <Icon name="lock" size={26} />
                  </span>
                  <p className="h2">{unlocksIn(item, now)}</p>
                  <p className={styles.lockMeta}>{releaseDay(item)}</p>
                  <p className={styles.lockLine}>Subscribers can watch it now.</p>
                  <Button onClick={() => setSheet("subscribe")}>Subscribe</Button>
                  <button type="button" className={styles.textButton} onClick={() => setSheet("how")}>
                    How early access works
                  </button>
                </div>
              )
            }
          />
        </div>

        <aside className={styles.panel} aria-label={title}>
          <header className={styles.head}>
            <Image className={styles.poster} src={cover} alt="" width={112} height={168} sizes="56px" priority />
            <div className={styles.headText}>
              <h1 className="h2">{title}</h1>
              {genre && <p className="small muted">{genre}</p>}
            </div>
          </header>

          <h2 className={styles.tab}>{listLabel}</h2>

          <div className={styles.panelBody}>
            <EarlyAccessBanner layout="panel" onOpen={setSheet} />

            <ol className={styles.chips}>
              {episodes.map((e) => {
                const p = access.progress[episodeKey(slug, e.number)];
                const locked = !isOpen(e);
                const done = watched(p);
                const extra = [locked && `early access, ${unlocksIn(e, now).toLowerCase()}`, done && "watched", !done && p && p.t >= 3 && `${clock(Math.max(0, p.d - p.t))} left`]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <li key={e.number}>
                    <Link
                      href={href(e.number)}
                      scroll={false}
                      className={styles.chip}
                      data-episode={e.number}
                      data-locked={locked || undefined}
                      aria-current={e.number === item.number ? "true" : undefined}
                      aria-label={extra ? `${nameOf(e)}, ${extra}` : nameOf(e)}
                    >
                      <span>{chipOf(e)}</span>
                      {locked && (
                        <span className={styles.chipTimer} aria-hidden="true">
                          <Icon name="lock" size={12} />
                          {unlocksShort(e, now)}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>

            {access.subscribed ? (
              <div className={styles.purse}>
                <Button variant="quiet" size="small" icon={<Icon name="check" size={16} />} onClick={() => setSheet("manage")} aria-label="Subscribed, manage subscription" data-access-control>
                  Subscribed
                </Button>
              </div>
            ) : (
              // Before the browser state is read the row is there too, hidden in CSS unless the banner is off,
              // so a visitor who dismissed the banner sees the row from the first paint.
              (!banner || !settled) && (
                <div className={styles.purse} data-fallback={settled ? undefined : ""}>
                  <Button variant="quiet" size="small" onClick={() => setSheet("subscribe")} data-access-control>
                    Subscribe
                  </Button>
                  <Button variant="quiet" size="small" onClick={() => setSheet("how")}>
                    How early access works
                  </Button>
                </div>
              )
            )}

            {next && (
              <div className={styles.upNext}>
                <h3 className="label muted">Up next</h3>
                <Link href={href(next.number)} scroll={false} className={styles.nextRow}>
                  <span className={styles.nextNumber}>{padded(chipOf(next))}</span>
                  <Image className={styles.nextThumb} src={next.poster} alt="" width={112} height={199} sizes="56px" />
                  <span className={styles.nextText}>
                    <span className={styles.nextTitle}>{nameOf(next)}</span>
                    <span className="small muted">{isOpen(next) ? clock(next.seconds) : unlocksIn(next, now)}</span>
                  </span>
                  <span className={styles.nextEnd} aria-hidden="true">
                    <Icon name={isOpen(next) ? "play" : "lock"} size={20} />
                  </span>
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      <AccessSheets sheet={sheet} onChange={setSheet} onClose={closeSheet} onSubscribed={onSubscribed} onCancelled={onCancelled} />
    </>
  );
}
