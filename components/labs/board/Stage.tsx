"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { MediaFrame, PlayPauseIcon, VolumeIcon } from "@/components/labs/fx";
import { AppIcon } from "@/components/labs/app/AppIcon";
import { Btn } from "@/components/labs/chat/ui";
import { scenes, statusWord, type Shot } from "./data";
import { useReducedMotion } from "./hooks";
import { Develop, Thumb, useArriving } from "./Thumb";
import b from "./board.module.css";

export type View = "shot" | "board";

export function ViewSwitch({ view, onView }: { view: View; onView: (v: View) => void }) {
  return (
    <div className={b.switch} role="group" aria-label="View">
      {(["shot", "board"] as const).map((v) => (
        <button key={v} type="button" className={b.switchBtn} aria-pressed={view === v} onClick={() => onView(v)}>
          {v === "shot" ? "Shot" : "Board"}
        </button>
      ))}
    </div>
  );
}

/** The selected shot as large as the stage allows, with the frames it starts and ends on under it. */
export function ShotStage({ shot, n, prev, onRetry }: { shot: Shot; n: number; prev?: Shot; onRetry: () => void }) {
  const take = shot.takes[shot.take];
  const start = prev && prev.status !== "failed" && prev.status !== "empty" ? prev.takes[prev.take] : undefined;
  const end = shot.status !== "failed" && shot.status !== "empty" ? take : undefined;
  return (
    <div className={b.shotStage}>
      <div className={b.frameBox}>
        <Frame key={shot.id} shot={shot} n={n} onRetry={onRetry} />
      </div>
      <div className={b.ends}>
        <Slot name="Start frame" still={start?.still} />
        <Slot name="End frame" still={end?.still} />
      </div>
    </div>
  );
}

function Slot({ name, still }: { name: string; still?: string }) {
  return (
    <figure className={b.slot}>
      <span className={b.slotArt} data-empty={!still || undefined}>
        {still && <Image src={still} alt="" fill sizes="120px" />}
      </span>
      <figcaption>{name}</figcaption>
    </figure>
  );
}

function Frame({ shot, n, onRetry }: { shot: Shot; n: number; onRetry: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const arriving = useArriving(shot.status);
  const take = shot.takes[shot.take];
  const cap = (
    <p className={b.cap}>
      Shot {n}
      {shot.takes.length > 1 && shot.status === "ready" && `, take ${shot.take + 1}`}
    </p>
  );

  if (shot.status === "failed" || shot.status === "empty" || (shot.status === "generating" && !take))
    return (
      <div className={b.frame} data-empty>
        {shot.status === "generating" ? (
          <Develop cell={8} />
        ) : (
          <div className={b.frameNote}>
            {shot.status === "failed" && <AppIcon name="warning" size={24} />}
            <p>{statusWord[shot.status]}</p>
            {shot.status === "failed" && (
              <Btn kind="secondary" small onClick={onRetry}>
                Try again
              </Btn>
            )}
          </div>
        )}
        {cap}
      </div>
    );

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  return (
    <div className={b.frame}>
      <MediaFrame fill>
        {take.clip ? (
          <video
            ref={video}
            src={take.clip}
            poster={take.still}
            muted={muted}
            autoPlay={!reduced && shot.status === "ready"}
            loop
            playsInline
            preload="metadata"
            onClick={toggle}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            aria-label={`Shot ${n}, ${shot.label}`}
          />
        ) : (
          <Image src={take.still} alt={`Shot ${n}, ${shot.label}`} fill sizes="(max-width: 767px) 100vw, 70vw" priority />
        )}
      </MediaFrame>
      {(shot.status === "generating" || arriving) && <Develop cell={8} leaving={arriving} />}
      {take.clip && shot.status === "ready" && (
        <div className={b.controls}>
          <button type="button" className={b.over} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
            <PlayPauseIcon playing={playing} size={18} />
          </button>
          <button type="button" className={b.over} onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
            <VolumeIcon muted={muted} size={18} />
          </button>
        </div>
      )}
      {cap}
    </div>
  );
}

/** Every shot as a printed storyboard: frame, label, action and status, grouped by scene. */
export function BoardGrid({ shots, selected, onPick }: { shots: Shot[]; selected: string; onPick: (id: string) => void }) {
  return (
    <div className={b.boardGrid}>
      {scenes.map((sc) => (
        <section key={sc.n} className={b.boardScene} aria-labelledby={`board-sc-${sc.n}`}>
          <h3 id={`board-sc-${sc.n}`} className={b.sceneHead}>
            <span>{sc.n}</span> {sc.heading}
          </h3>
          <ul className={b.boardCards}>
            {shots.map((s, i) =>
              s.scene !== sc.n ? null : (
                <li key={s.id}>
                  <button type="button" className={b.boardCard} aria-pressed={s.id === selected} onClick={() => onPick(s.id)} aria-label={`Shot ${i + 1}, ${s.label}, ${statusWord[s.status]}`}>
                    <Thumb shot={s} sizes="(max-width: 767px) 45vw, 280px" />
                    <span className={b.cardLabel}>
                      <span className={b.num}>{i + 1}</span>
                      <span className={b.cardName}>{s.label}</span>
                    </span>
                    {s.action && <span className={b.cardAction}>{s.action}</span>}
                    <span className={b.cardStatus} data-status={s.status}>
                      {statusWord[s.status]}
                    </span>
                  </button>
                </li>
              ),
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
