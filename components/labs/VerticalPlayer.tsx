"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonLink, Button } from "./Button";
import { Icon } from "./Icon";
import { IconSwap, PlayPauseIcon, ReplayIcon, VolumeIcon } from "./fx/AnimatedIcon";
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
};

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const SEEK = 5;

/** True when a key press belongs to a field the reader is typing in. */
function typingIn(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el || !el.closest) return false;
  return el.isContentEditable || !!el.closest("input, textarea, select, [contenteditable]");
}

export function VerticalPlayer({ src, poster, label, index = 0, previous, previousLabel, next, nextLabel, seriesHref, backLabel }: Props) {
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
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    setEnded(false);
    setFailed(!!v.error);
    setTime(v.currentTime || 0);
    setLength(v.readyState >= 1 && Number.isFinite(v.duration) ? v.duration : 0);
    // A new item starts by itself when the browser allows it; otherwise the play button waits.
    v.play().catch(() => setPlaying(false));
  }, [src]);

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
  }, [toggle, seekBy, fullscreen]);

  return (
    <div className={styles.wrap}>
      <div ref={frame} className={styles.frame}>
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
          onPause={() => setPlaying(false)}
          onPlaying={endWait}
          onWaiting={startWait}
          onCanPlay={endWait}
          onLoadedData={release}
          onError={() => {
            setFailed(true);
            endWait();
          }}
          onEnded={onEnded}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => readLength(e.currentTarget)}
          onDurationChange={(e) => readLength(e.currentTarget)}
          aria-label={label}
        />
        {hold && (
          <img
            className={styles.hold}
            src={hold.poster}
            alt=""
            data-out={hold.out || undefined}
            onTransitionEnd={() => setHold((h) => (h?.out ? null : h))}
          />
        )}

        {waiting && !failed && !ended && (
          <span className={styles.spinner} role="status" aria-label="Loading">
            <AnimatedMark variant="busy" size={44} />
          </span>
        )}

        {!playing && !ended && !failed && !waiting && (
          <button type="button" className={styles.bigPlay} onClick={toggle} aria-label="Play">
            <Icon name="play" size={32} />
          </button>
        )}

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

        <div className={styles.bar} data-hidden={ended || failed}>
          <p className={styles.label}>{label}</p>
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
            <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} aria-keyshortcuts="K Space">
              <PlayPauseIcon playing={playing} />
            </button>
            <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-keyshortcuts="M">
              <VolumeIcon muted={muted} />
            </button>
            <span className={styles.time}>
              {length ? `${clock(time)} / ${clock(length)}` : "-:--"}
            </span>
            <span className={styles.grow} />
            <button type="button" onClick={fullscreen} aria-label={full ? "Leave full screen" : "Full screen"} aria-keyshortcuts="F">
              <IconSwap from="fullscreen" to="shrink" on={full} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.side}>
        {previous ? (
          <Link href={previous} scroll={false} className={styles.step} aria-label={previousLabel ? `Previous: ${previousLabel}` : "Previous"}>
            <Icon name="up" />
            <span>Previous</span>
          </Link>
        ) : (
          <span className={styles.step} aria-disabled="true">
            <Icon name="up" />
            <span>Previous</span>
          </span>
        )}
        {next ? (
          <Link href={next} scroll={false} className={styles.step} aria-label={nextLabel ? `Next: ${nextLabel}` : "Next"}>
            <Icon name="down" />
            <span>Next</span>
          </Link>
        ) : (
          <span className={styles.step} aria-disabled="true">
            <Icon name="down" />
            <span>Next</span>
          </span>
        )}
      </div>
    </div>
  );
}
