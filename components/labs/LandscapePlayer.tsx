"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { IconSwap, PlayPauseIcon, ReplayIcon, VolumeIcon } from "./fx/AnimatedIcon";
import { AnimatedMark } from "./fx/AnimatedMark";
import type { WatchItem } from "./WatchView";
import vp from "./VerticalPlayer.module.css";
import styles from "./LandscapePlayer.module.css";

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const SEEK = 5;
const nameOf = (i: WatchItem) => i.title ?? `Part ${i.number}`;

/**
 * A 16:9 player that waits for the viewer: nothing plays until they press play, and then it plays with sound.
 * With more than one item it shows a row to pick from. Keys work while focus is inside the player:
 * Space or K plays and pauses, the arrows seek 5 seconds, M mutes, F goes full screen.
 * Starting one player on a page pauses any other.
 */
export function LandscapePlayer({ items, priority = false }: { items: WatchItem[]; priority?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const [full, setFull] = useState(false);
  const [turns, setTurns] = useState(0);
  // Set when the viewer picks another item, so the new one starts by itself.
  const startNext = useRef(false);
  const item = items[current];

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
    const onFull = () => setFull(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", onFull);
    return () => document.removeEventListener("fullscreenchange", onFull);
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    setEnded(false);
    setFailed(!!v.error);
    setTime(0);
    setLength(v.readyState >= 1 && Number.isFinite(v.duration) ? v.duration : 0);
    if (startNext.current) {
      startNext.current = false;
      v.play().catch(() => setPlaying(false));
    }
  }, [item.video]);

  const readLength = (v: HTMLVideoElement) => {
    if (Number.isFinite(v.duration)) setLength(v.duration);
  };

  const toggle = useCallback(() => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      setEnded(false);
      v.play().catch(() => {});
    } else v.pause();
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

  const pick = (i: number) => {
    if (i === current) return;
    startNext.current = true;
    setPlaying(false);
    setCurrent(i);
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

  const onPlay = () => {
    setPlaying(true);
    document.querySelectorAll<HTMLVideoElement>("video[data-landscape]").forEach((other) => {
      if (other !== video.current && !other.paused) other.pause();
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target as HTMLElement;
    if (target.closest("input:not([type=range]), textarea, select, [contenteditable]")) return;
    const onControl = !!target.closest("button, a");
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

  return (
    <div className={styles.wrap}>
      <div
        ref={frame}
        className={styles.frame}
        onKeyDown={onKey}
        tabIndex={-1}
        role="group"
        aria-label={`Video player: ${nameOf(item)}`}
      >
        <video
          ref={video}
          key={item.video}
          src={item.video}
          poster={item.poster}
          preload={priority ? "metadata" : "none"}
          playsInline
          muted={muted}
          data-landscape=""
          onClick={toggle}
          onPlay={onPlay}
          onPause={() => setPlaying(false)}
          onPlaying={endWait}
          onWaiting={startWait}
          onCanPlay={endWait}
          onError={() => {
            setFailed(true);
            endWait();
          }}
          onEnded={() => {
            setPlaying(false);
            setEnded(true);
          }}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => readLength(e.currentTarget)}
          onDurationChange={(e) => readLength(e.currentTarget)}
          aria-label={nameOf(item)}
        />

        {waiting && !failed && !ended && (
          <span className={vp.spinner} role="status" aria-label="Loading">
            <AnimatedMark variant="busy" size={44} />
          </span>
        )}

        {!playing && !ended && !failed && !waiting && (
          <button
            type="button"
            className={vp.bigPlay}
            onClick={() => {
              toggle();
              // The button leaves once playback starts, so focus moves to the player and its keys keep working.
              frame.current?.focus({ preventScroll: true });
            }}
            aria-label={`Play ${nameOf(item)}`}
          >
            <Icon name="play" size={32} />
          </button>
        )}

        {failed && (
          <div className={vp.end} role="alert">
            <p className="h3">This video did not load.</p>
            <Button onClick={retry} icon={<ReplayIcon turn={turns} size={18} />}>
              Try again
            </Button>
          </div>
        )}

        {ended && (
          <div className={vp.end}>
            <Button onClick={replay} icon={<ReplayIcon turn={turns} size={18} />}>
              Watch again
            </Button>
          </div>
        )}

        <div className={vp.bar} data-hidden={ended || failed}>
          <input
            className={vp.scrub}
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
          <div className={vp.controls}>
            <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} aria-keyshortcuts="K Space">
              <PlayPauseIcon playing={playing} />
            </button>
            <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-keyshortcuts="M">
              <VolumeIcon muted={muted} />
            </button>
            <span className={vp.time}>{length ? `${clock(time)} / ${clock(length)}` : clock(item.seconds)}</span>
            <span className={vp.grow} />
            <button type="button" onClick={fullscreen} aria-label={full ? "Leave full screen" : "Full screen"} aria-keyshortcuts="F">
              <IconSwap from="fullscreen" to="shrink" on={full} />
            </button>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <ul className={styles.list}>
          {items.map((it, i) => (
            <li key={it.video}>
              <button type="button" className={styles.pick} onClick={() => pick(i)} aria-current={i === current ? "true" : undefined}>
                <span className={styles.thumb}>
                  <Image src={it.poster} alt="" width={480} height={270} sizes="(max-width: 720px) 45vw, 300px" />
                </span>
                <span className={styles.name}>{nameOf(it)}</span>
                <span className="small muted">{it.seconds} seconds</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
