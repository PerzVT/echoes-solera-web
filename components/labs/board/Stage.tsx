"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { MediaFrame, PlayPauseIcon, VolumeIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { AppIcon } from "@/components/labs/app/AppIcon";
import { Btn } from "@/components/labs/chat/ui";
import { reviewWord, statusWord, type Shot } from "./data";
import { EndCard, SceneHead, ShotCard } from "./Cards";
import { useReducedMotion } from "./hooks";
import type { Editor } from "./Storyboard";
import { Develop, useArriving } from "./Thumb";
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

/** The selected shot as large as the stage allows. */
export function ShotStage({ shot, n, onMake }: { shot?: Shot; n: number; onMake: () => void }) {
  return <div className={b.shotStage}>{shot ? <Frame key={shot.id} shot={shot} n={n} onMake={onMake} /> : <div className={b.frame} data-empty />}</div>;
}

function Frame({ shot, n, onMake }: { shot: Shot; n: number; onMake: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const arriving = useArriving(shot.status);
  const take = shot.takes[shot.take];
  const cap = (
    <p className={b.cap} data-review={shot.review}>
      Shot {n}
      {shot.takes.length > 1 && shot.status === "ready" && `, take ${shot.take + 1}`}
      {shot.review && `, ${reviewWord[shot.review].toLowerCase()}`}
    </p>
  );

  if (shot.status === "failed" || shot.status === "empty" || (shot.status === "generating" && !take))
    return (
      <div className={b.frame} data-empty>
        {shot.status === "generating" ? (
          <Develop cell={8} />
        ) : (
          <div className={b.frameNote} data-status={shot.status}>
            {shot.status === "failed" && <AppIcon name="warning" size={24} />}
            <p>{statusWord[shot.status]}</p>
            <Btn kind="secondary" small onClick={onMake}>
              {shot.status === "failed" ? "Try again" : "Generate shot"}
            </Btn>
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
    <div className={b.frame} data-review={shot.review}>
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

/** Every shot as a printed storyboard, scene under scene, scrolling down through all of them. */
export function BoardGrid({ ed, onOpen }: { ed: Editor; onOpen: (id: string) => void }) {
  return (
    <div className={b.boardGrid}>
      {ed.ep.scenes.map((sc, si) => (
        <section key={sc.id} className={b.boardScene} aria-label={`Scene ${si + 1}`}>
          <SceneHead scene={sc} n={si + 1} menu={ed.sceneMenu(sc.id, "column")} onRename={(h) => ed.rename(sc.id, h)} />
          <ul className={b.boardCards}>
            {sc.shots.map((s, i) => (
              <ShotCard
                key={s.id}
                shot={s}
                n={ed.number(s.id)}
                scene={sc}
                index={i}
                selected={s.id === ed.selected}
                variant="board"
                menu={ed.shotMenu(s.id)}
                onSelect={() => (s.id === ed.selected ? onOpen(s.id) : ed.select(s.id))}
                onAddBefore={() => ed.addAt(sc.id, i)}
                onDrop={ed.drop}
                sizes="(max-width: 767px) 45vw, 280px"
              />
            ))}
            <EndCard scene={sc} variant="board" onAdd={() => ed.addAt(sc.id, sc.shots.length)} onDrop={ed.drop} />
          </ul>
        </section>
      ))}
      <button type="button" className={b.addScene} data-board="" onClick={() => ed.addScene(ed.ep.scenes.length - 1)}>
        <Icon name="plus" size={16} />
        Add scene
      </button>
    </div>
  );
}
