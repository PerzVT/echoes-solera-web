"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatedMark, AsciiField, GestureIcon, MediaFrame, PlayPauseIcon, VolumeIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { AppIcon } from "@/components/labs/app/AppIcon";
import { clock } from "@/lib/labs/maker";
import type { Gen } from "../agent";
import { Btn, cx } from "../ui";
import shared from "./shared.module.css";
import own from "./gens.module.css";

const v = { ...shared, ...own };

type Props = {
  gens: Gen[];
  selected: number;
  approvedAll: boolean;
  onSelect: (n: number) => void;
  onTake: (n: number, take: number) => void;
  onApprove: (n: number) => void;
  onNeedsChanges: (n: number) => void;
  onPlayAll: () => void;
};

/** The selected clip as large as the stage allows, the six as 9:16 tiles beside it, and approve or needs changes under it. */
export function GenerationsView({ gens, selected, approvedAll, onSelect, onTake, onApprove, onNeedsChanges, onPlayAll }: Props) {
  const g = gens.find((x) => x.n === selected) ?? gens[0];
  const ready = gens.filter((x) => x.status === "ready").length;
  const making = gens.filter((x) => x.status === "developing").length;
  const failed = gens.filter((x) => x.status === "failed").length;
  const counts = [ready && `${ready} ready`, making && `${making} generating`, failed && `${failed} failed`].filter(Boolean).join(", ");

  return (
    <div className={v.gens}>
      <h2 className="sr-only">Generations</h2>
      <div className={v.stage}>
        <Player key={`${g.n}-${g.take}-${g.status}`} g={g} />
        {g.takes.length > 1 && (
          <ul className={v.takes} aria-label={`Generation ${g.n} takes`}>
            {g.takes.map((t, i) => (
              <li key={i}>
                <button type="button" className={v.take} aria-pressed={i === g.take} onClick={() => onTake(g.n, i)} aria-label={`${t.name}`}>
                  <Image src={t.poster} alt="" fill sizes="48px" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={v.genActions}>
          <Btn kind="secondary" icon={<Icon name="check" size={16} />} disabled={g.status !== "ready"} aria-pressed={g.approved} onClick={() => onApprove(g.n)}>
            {g.approved ? "Approved" : "Approve"}
          </Btn>
          <Btn kind="ghost" disabled={g.status === "developing"} onClick={() => onNeedsChanges(g.n)}>
            Needs changes
          </Btn>
        </div>
      </div>

      <div className={v.feed}>
        <div className={v.feedHead}>
          <p className={v.meta} aria-live="polite">
            {counts}
          </p>
          {approvedAll && (
            <Btn kind="secondary" small icon={<Icon name="play" size={14} />} onClick={onPlayAll}>
              Play episode
            </Btn>
          )}
        </div>
        <ul className={v.tiles}>
          {gens.map((x) => (
            <li key={x.n}>
              <Tile g={x} selected={x.n === g.n} onSelect={() => onSelect(x.n)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const statusWord = (g: Gen) => (g.status === "failed" ? "Failed" : g.status === "developing" ? "Generating" : g.approved ? "Approved" : "Ready");

/** One generation as a 9:16 poster. While it is being made a scan of glyphs covers it; a failed one is a dashed empty tile. */
function Tile({ g, selected, onSelect }: { g: Gen; selected: boolean; onSelect: () => void }) {
  const [seen, setSeen] = useState(g.status);
  const [arriving, setArriving] = useState(false);
  if (seen !== g.status) {
    setSeen(g.status);
    if (seen === "developing" && g.status === "ready") setArriving(true);
  }
  useEffect(() => {
    if (!arriving) return;
    const t = setTimeout(() => setArriving(false), 700);
    return () => clearTimeout(t);
  }, [arriving]);
  const take = g.takes[g.take];

  return (
    <button type="button" className={v.tile} aria-pressed={selected} onClick={onSelect} aria-label={`Generation ${g.n}, ${statusWord(g)}`}>
      <span className={v.tileArt} data-empty={g.status === "failed" || undefined}>
        {g.status === "failed" ? (
          <AppIcon name="warning" size={20} />
        ) : (
          <>
            <Image src={take.poster} alt="" fill sizes="(max-width: 767px) 30vw, 160px" />
            {(g.status === "developing" || arriving) && (
              <span className={v.develop} data-leaving={arriving || undefined}>
                <AsciiField mode="scan" cell={6} intensity={0.5} speed={1.15} className={v.glyphs} />
              </span>
            )}
          </>
        )}
        <span className={v.tileMark} data-status={g.status} data-approved={g.approved || undefined} aria-hidden="true">
          {g.status === "developing" ? <AnimatedMark variant="busy" size={14} /> : g.status === "failed" ? null : g.approved ? <Icon name="check" size={14} /> : null}
        </span>
      </span>
      <span className={v.tileCap}>
        <span>{g.n}</span>
        <span className={cx(v.count, g.status === "failed" && v.danger)}>{statusWord(g)}</span>
      </span>
    </button>
  );
}

/** The selected take: play and pause with the time, sound, and download. */
function Player({ g }: { g: Gen }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const take = g.takes[g.take];
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  if (g.status === "failed")
    return (
      <div className={cx(v.screen, v.screenEmpty)}>
        <AppIcon name="warning" size={24} />
        <p>Generation {g.n} failed</p>
      </div>
    );

  return (
    <div className={v.screen}>
      <MediaFrame fill>
        <video ref={video} src={take.src} poster={take.poster} muted={muted} playsInline loop preload="metadata" onClick={toggle} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} aria-label={`Generation ${g.n}, ${take.name}`} />
      </MediaFrame>
      {g.status === "developing" ? (
        <span className={v.develop}>
          <AsciiField mode="scan" cell={8} intensity={0.5} speed={1.15} className={v.glyphs} />
        </span>
      ) : (
        <>
          <a className={cx(v.over, v.download)} href={take.src} download={`second-chance-ep1-generation-${g.n}-${take.name.toLowerCase().replace(" ", "-")}.mp4`} aria-label={`Download generation ${g.n}`}>
            <GestureIcon name="download" size={18} />
          </a>
          <div className={v.controls}>
            <button type="button" className={v.over} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
              <PlayPauseIcon playing={playing} size={18} />
              <span className={v.time}>{clock(time)}</span>
            </button>
            <button type="button" className={v.over} onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
              <VolumeIcon muted={muted} size={18} />
            </button>
          </div>
        </>
      )}
      <p className={v.screenCap}>
        Generation {g.n}
        {g.takes.length > 1 && `, ${take.name}`}
      </p>
    </div>
  );
}
