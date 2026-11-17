"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ButtonLink, Button } from "./Button";
import { Icon } from "./Icon";
import { IconSwap, ReplayIcon, VolumeIcon } from "./fx/AnimatedIcon";
import { AnimatedMark } from "./fx/AnimatedMark";
import styles from "./VerticalPlayer.module.css";

type Props = {
  src: string;
  poster: string;
  label: string;
  /** The item's place in its list. A higher number than the last one slides in from below, a lower one from above. */
  index?: number;
  /** Where the neighbouring items live. Undefined at either end. */
  previous?: string;
  previousLabel?: string;
  next?: string;
  nextLabel?: string;
  seriesHref: string;
  backLabel: string;
  /** Drawn over the poster in place of the video, for an episode that is not open to this visitor. */
  locked?: ReactNode;
  /** Seconds to start from, for resuming. Applied once per item. */
  start?: number;
  /** Called as the item plays, with the position and length in seconds. `done` is true on pause or end. */
  onProgress?: (time: number, length: number, done: boolean) => void;
  /** What one item is called, such as "Episode". When set, a line over the title says whether it is playing. */
  kind?: string;
  /** The words on the start button when the visitor is part way through, such as "Continue episode 3". */
  resumeLabel?: string;
  /** The title a share carries. Defaults to the item's label. */
  shareTitle?: string;
};

/* The share mark from the design file, drawn at its 22 px size. */
function ShareIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 13.75V2.75M14.67 6.42 11 2.75 7.33 6.42M4.58 11v6.42c0 1.01.82 1.83 1.84 1.83h9.16c1.02 0 1.84-.82 1.84-1.83V11" />
    </svg>
  );
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const SEEK = 5;

/** True when a key press belongs to a field the reader is typing in. */
function typingIn(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el || !el.closest) return false;
  return el.isContentEditable || !!el.closest("input, textarea, select, [contenteditable]");
}

export function VerticalPlayer({
  src,
  poster,
  label,
  index = 0,
  previous,
  previousLabel,
  next,
  nextLabel,
  seriesHref,
  backLabel,
  locked,
  start = 0,
  onProgress,
  kind,
  resumeLabel,
  shareTitle,
}: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const again = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const [full, setFull] = useState(false);
  const [turns, setTurns] = useState(0);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef(0);
  useEffect(() => () => clearTimeout(copiedTimer.current), []);
  // Which way the new item arrives: 1 from below (a later item), -1 from above, 0 on first load.
  const [came, setCame] = useState({ index, dir: 0 });
  if (came.index !== index) setCame({ index, dir: index > came.index ? 1 : -1 });
  // On an item change the outgoing poster stays over the stage until the incoming picture has painted,
  // then fades, so the change never cuts through a black frame.
  const [seen, setSeen] = useState(poster);
  const [hold, setHold] = useState<{ poster: string; out: boolean } | null>(null);
  if (seen !== poster) {
    setHold({ poster: seen, out: false });
    setSeen(poster);
  }
  const release = useCallback(() => setHold((h) => (h && !h.out ? { ...h, out: true } : h)), []);
  // The busy mark only shows when a wait has lasted 400 ms, so a local load never flashes it.
  const waitTimer = useRef(0);
  const startWait = () => {
    clearTimeout(waitTimer.current);
    waitTimer.current = window.setTimeout(() => setWaiting(true), 400);
  };
  const endWait = () => {
    clearTimeout(waitTimer.current);
    setWaiting(false);
  };
  useEffect(() => () => clearTimeout(waitTimer.current), []);
  useEffect(() => {
    if (!hold || hold.out) return;
    const img = new Image();
    img.onload = () => requestAnimationFrame(release);
    img.src = poster;
    const give = window.setTimeout(release, 1500);
    return () => clearTimeout(give);
  }, [hold, poster, release]);

  useEffect(() => {
    const onFull = () => setFull(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", onFull);
    return () => document.removeEventListener("fullscreenchange", onFull);
  }, []);

  // The video is in the server HTML, so its metadata can arrive before React listens for it.
  // Read what is already known on mount; loadedmetadata and durationchange cover the rest.
  // The resume position is applied once per item, as soon as both it and the metadata are known.
  const resumed = useRef("");
  const applyStart = useCallback(() => {
    const v = video.current;
    if (!v || !start || resumed.current === src || v.readyState < 1) return;
    resumed.current = src;
    if (v.currentTime < 1) {
      v.currentTime = start;
      setTime(start);
    }
  }, [src, start]);
  useEffect(applyStart, [applyStart]);
  const report = useRef(onProgress);
  useEffect(() => {
    report.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    const v = video.current;
    if (!v || locked) return;
    setEnded(false);
    setFailed(!!v.error);
    setTime(v.currentTime || 0);
    setLength(v.readyState >= 1 && Number.isFinite(v.duration) ? v.duration : 0);
    // A new item starts by itself when the browser allows it; otherwise the play button waits.
    v.play().catch(() => setPlaying(false));
    // An unlock mounts the video, so the lock state is a dependency.
  }, [src, !!locked]);

  const readLength = (v: HTMLVideoElement) => {
    if (Number.isFinite(v.duration)) setLength(v.duration);
  };

  const toggle = useCallback(() => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = video.current;
    if (!v) return;
    const end = Number.isFinite(v.duration) ? v.duration : v.currentTime + delta;
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), end);
    setTime(v.currentTime);
  }, []);

  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else frame.current?.requestFullscreen?.().catch(() => {});
  }, []);

  // The address without an open screen. The system share sheet where there is one, otherwise the clipboard.
  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("state");
    url.hash = "";
    if (navigator.share) {
      await navigator.share({ title: shareTitle ?? label, url: url.toString() }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const replay = () => {
    const v = video.current;
    if (!v) return;
    v.currentTime = 0;
    setEnded(false);
    setTurns((n) => n + 1);
    v.play().catch(() => {});
  };

  const retry = () => {
    const v = video.current;
    if (!v) return;
    setFailed(false);
    setTurns((n) => n + 1);
    v.load();
    v.play().catch(() => {});
  };

  const onEnded = () => {
    const v = video.current;
    if (v) report.current?.(v.duration, v.duration, true);
    if (next) router.push(next, { scroll: false });
    else setEnded(true);
  };

  // After the last item, focus lands on Watch again.
  useEffect(() => {
    if (ended) again.current?.focus();
  }, [ended]);

  // Space or K plays and pauses, the arrows seek 5 seconds, M mutes, F goes full screen.
  // Keys typed into a field are left alone, and so is Space on a focused button or link.
  useEffect(() => {
    if (locked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || typingIn(e.target)) return;
      const onControl = !!(e.target as HTMLElement | null)?.closest?.("button, a, summary");
      switch (e.key) {
        case " ":
          if (onControl) return;
          e.preventDefault();
          toggle();
          break;
        case "k":
        case "K":
          e.preventDefault();
          toggle();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekBy(-SEEK);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekBy(SEEK);
          break;
        case "m":
        case "M":
          e.preventDefault();
          setMuted((m) => !m);
          break;
        case "f":
        case "F":
          e.preventDefault();
          fullscreen();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, seekBy, fullscreen, locked]);

  return (
    <div className={styles.wrap}>
      <div ref={frame} className={styles.frame}>
        {locked ? (
          <>
            <img key={`lock-${src}`} className={styles.lockedPoster} src={poster} alt="" data-enter={came.dir || undefined} />
            {locked}
          </>
        ) : (
        <video
          ref={video}
          key={src}
          src={src}
          poster={poster}
          playsInline
          muted={muted}
          data-enter={came.dir || undefined}
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={(e) => {
            setPlaying(false);
            const v = e.currentTarget;
            if (!v.ended) report.current?.(v.currentTime, v.duration, true);
          }}
          onPlaying={endWait}
          onWaiting={startWait}
          onCanPlay={endWait}
          onLoadedData={release}
          onError={() => {
            setFailed(true);
            endWait();
          }}
          onEnded={onEnded}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            setTime(v.currentTime);
            if (!v.paused) report.current?.(v.currentTime, v.duration, false);
          }}
          onLoadedMetadata={(e) => {
            readLength(e.currentTarget);
            applyStart();
          }}
          onDurationChange={(e) => readLength(e.currentTarget)}
          aria-label={label}
        />
        )}
        {hold && (
          <img
            className={styles.hold}
            src={hold.poster}
            alt=""
            data-out={hold.out || undefined}
            onTransitionEnd={() => setHold((h) => (h?.out ? null : h))}
          />
        )}

        {waiting && !failed && !ended && !locked && (
          <span className={styles.spinner} role="status" aria-label="Loading">
            <AnimatedMark variant="busy" size={44} />
          </span>
        )}

        {!playing && !ended && !failed && !waiting && !locked && (resumeLabel && time >= 3 ? (
          <span className={styles.resume}>
            <Button onClick={toggle} icon={<Icon name="play" size={18} />}>
              {resumeLabel}
            </Button>
          </span>
        ) : (
          <button type="button" className={styles.bigPlay} onClick={toggle} aria-label="Play">
            <Icon name="play" size={32} />
          </button>
        ))}

        {failed && (
          <div className={styles.end} role="alert">
            <p className="h3">This video did not load.</p>
            <Button onClick={retry} icon={<ReplayIcon turn={turns} size={18} />}>
              Try again
            </Button>
          </div>
        )}

        {ended && (
          <div className={styles.end}>
            <p className="h3">That is the last episode.</p>
            <div className={styles.endActions}>
              <Button ref={again} onClick={replay} icon={<ReplayIcon turn={turns} size={18} />}>
                Watch again
              </Button>
              <ButtonLink href={seriesHref} variant="secondary">
                {backLabel}
              </ButtonLink>
            </div>
          </div>
        )}

        <div className={styles.bar} data-hidden={ended || failed || !!locked}>
          <div className={styles.caption}>
            {kind && (
              <p className={styles.status}>
                {playing ? "Playing" : "Paused"}
                {label.toLowerCase().startsWith(kind.toLowerCase()) ? "" : `, ${kind} ${index}`}
              </p>
            )}
            <p className={styles.label}>{label}</p>
          </div>
          <input
            className={styles.scrub}
            type="range"
            min={0}
            max={length || 0}
            step={0.1}
            value={Math.min(time, length || 0)}
            disabled={!length}
            onChange={(e) => {
              const v = video.current;
              if (v) v.currentTime = Number(e.target.value);
              setTime(Number(e.target.value));
            }}
            aria-label="Seek"
            aria-valuetext={`${clock(time)} of ${clock(length)}`}
            style={{ "--p": length ? `${(Math.min(time, length) / length) * 100}%` : "0%" } as React.CSSProperties}
          />
          <div className={styles.controls}>
            <div className={styles.group}>
              <Button className={styles.pause} onClick={toggle} aria-keyshortcuts="K Space">
                {playing ? "Pause" : "Play"}
              </Button>
              <button type="button" className={styles.iconButton} onClick={() => setMuted((m) => !m)} aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-keyshortcuts="M">
                <VolumeIcon muted={muted} />
              </button>
            </div>
            <div className={styles.group}>
              <button type="button" className={styles.iconButton} onClick={fullscreen} aria-label={full ? "Leave full screen" : "Full screen"} aria-keyshortcuts="F">
                <IconSwap from="fullscreen" to="shrink" on={full} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.side}>
        {previous ? (
          <Link href={previous} scroll={false} className={styles.step} aria-label={previousLabel ? `Previous: ${previousLabel}` : "Previous"}>
            <Icon name="up" size={22} />
            <span>Previous</span>
          </Link>
        ) : (
          <span className={styles.step} aria-disabled="true">
            <Icon name="up" size={22} />
            <span>Previous</span>
          </span>
        )}
        <button type="button" className={styles.step} onClick={share} aria-label={copied ? "Link copied" : "Share"}>
          <ShareIcon />
          <span aria-live="polite">{copied ? "Copied" : "Share"}</span>
        </button>
        {next ? (
          <Link href={next} scroll={false} className={styles.step} aria-label={nextLabel ? `Next: ${nextLabel}` : "Next"}>
            <Icon name="down" size={22} />
            <span>Next</span>
          </Link>
        ) : (
          <span className={styles.step} aria-disabled="true">
            <Icon name="down" size={22} />
            <span>Next</span>
          </span>
        )}
      </div>
    </div>
  );
}
