"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatedMark, AsciiField, GestureIcon, MediaFrame, PlayPauseIcon, VolumeIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { MoreMenu } from "../board/Cards";
import { Btn, IconBtn } from "../chat/ui";
import { chefSrc, clock, seconds, styleBySlug, type Video } from "./data";
import { useDialog, useFinePointer } from "./hooks";
import f from "./feed.module.css";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const fileName = (v: Video) => `shoujo-supper-${v.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.mp4`;

type Props = {
  videos: Video[];
  onUse: (v: Video) => void;
  /** Deletes a video and returns what puts it back. */
  onDelete: (v: Video) => () => void;
};

const UNDO_MS = 6000;

/** The videos as large 9:16 tiles, newest first, and a viewer that opens one large. */
export function Feed({ videos, onUse, onDelete }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ text: string; restore: () => void } | null>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const ready = videos.filter((v) => v.status === "ready");
  const current = ready.find((v) => v.id === open) ?? null;
  const remove = (v: Video) => {
    const restore = onDelete(v);
    window.clearTimeout(timer.current);
    setUndo({ text: `${v.title} deleted`, restore });
    timer.current = window.setTimeout(() => setUndo(null), UNDO_MS);
  };

  return (
    <section className={f.feed} aria-labelledby="feed-title">
      <h1 id="feed-title" className={f.title}>
        Cooking videos
      </h1>
      <ul className={f.grid}>
        {videos.map((v) => (
          <li key={v.id}>
            <Tile v={v} onOpen={() => setOpen(v.id)} onDelete={() => remove(v)} />
          </li>
        ))}
      </ul>
      <Viewer
        list={ready}
        current={current}
        onMove={setOpen}
        onClose={() => setOpen(null)}
        onUse={(v) => {
          setOpen(null);
          onUse(v);
        }}
        onDelete={(v) => {
          setOpen(null);
          remove(v);
        }}
      />
      {undo && (
        <div className={f.undo} role="status">
          <span>{undo.text}</span>
          <Btn
            kind="ghost"
            small
            onClick={() => {
              undo.restore();
              setUndo(null);
            }}
          >
            Undo
          </Btn>
        </div>
      )}
    </section>
  );
}

/** One video. Hover plays it in place (muted); the small controls play and unmute it; a press opens the viewer. */
function Tile({ v, onOpen, onDelete }: { v: Video; onOpen: () => void; onDelete: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const fine = useFinePointer();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [seen, setSeen] = useState(v.status);
  const [arriving, setArriving] = useState(false);
  if (seen !== v.status) {
    setSeen(v.status);
    if (seen === "developing" && v.status === "ready") setArriving(true);
  }
  useEffect(() => {
    if (!arriving) return;
    const t = setTimeout(() => setArriving(false), 700);
    return () => clearTimeout(t);
  }, [arriving]);

  const developing = v.status === "developing";
  const play = () => video.current?.play().catch(() => {});
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) play();
    else el.pause();
  };

  return (
    <article
      className={f.tile}
      onPointerEnter={() => fine && !developing && play()}
      onPointerLeave={() => fine && video.current?.pause()}
      aria-label={`${v.title}, ${v.chef}${developing ? ", Generating" : ""}`}
    >
      <div className={f.art}>
        {developing ? (
          <Image src={v.poster} alt="" fill sizes="(max-width: 767px) 50vw, 260px" />
        ) : (
          <MediaFrame fill>
            <video ref={video} src={v.video} poster={v.poster} muted={muted} playsInline loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
          </MediaFrame>
        )}
        {(developing || arriving) && (
          <span className={f.develop} data-leaving={arriving || undefined}>
            <AsciiField mode="scan" cell={7} intensity={0.5} speed={1.15} className={f.glyphs} />
          </span>
        )}
        {developing ? (
          <span className={f.busy} aria-hidden="true">
            <AnimatedMark variant="busy" size={14} />
          </span>
        ) : (
          <>
            <button type="button" className={f.open} onClick={onOpen} aria-label={`Open ${v.title}`} />
            <div className={f.controls}>
              <button type="button" className={f.over} onClick={toggle} aria-label={playing ? `Pause ${v.title}` : `Play ${v.title}`}>
                <PlayPauseIcon playing={playing} size={16} />
              </button>
              <button type="button" className={f.over} onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-pressed={!muted}>
                <VolumeIcon muted={muted} size={16} />
              </button>
            </div>
          </>
        )}
      </div>
      <div className={f.cap}>
        <span className={f.capRow}>
          <span className={f.capTitle}>{v.title}</span>
          {!developing && <MoreMenu label={`${v.title} options`} className={f.more} items={[{ label: "Delete", danger: true, onSelect: onDelete }]} />}
        </span>
        <span className={f.capMeta}>
          <span>{v.chef}</span>
          <span className={cx(developing && f.status)}>{developing ? "Generating" : clock(v.seconds)}</span>
        </span>
      </div>
    </article>
  );
}

/** One video large, its settings beside it, previous and next, download, and use these settings. */
function Viewer({ list, current, onMove, onClose, onUse, onDelete }: { list: Video[]; current: Video | null; onMove: (id: string) => void; onClose: () => void; onUse: (v: Video) => void; onDelete: (v: Video) => void }) {
  const dialog = useDialog(!!current, onClose);
  const i = current ? list.findIndex((v) => v.id === current.id) : -1;
  const prev = i > 0 ? list[i - 1] : null;
  const next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;

  useEffect(() => {
    if (!current) return;
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("video")) return;
      if (e.key === "ArrowLeft" && prev) onMove(prev.id);
      if (e.key === "ArrowRight" && next) onMove(next.id);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [current, prev, next, onMove]);

  return (
    <dialog ref={dialog} className={f.viewer} aria-labelledby="viewer-title" onClose={onClose}>
      {current && (
        <div className={f.sheet}>
          <div className={f.stage}>
            <BigPlayer key={current.id} v={current} />
          </div>
          <div className={f.side}>
            <div className={f.sideHead}>
              <div className={f.nav}>
                <IconBtn label="Previous video" disabled={!prev} onClick={() => prev && onMove(prev.id)}>
                  <span className={f.flip}>
                    <Icon name="arrow" size={18} />
                  </span>
                </IconBtn>
                <IconBtn label="Next video" disabled={!next} onClick={() => next && onMove(next.id)}>
                  <Icon name="arrow" size={18} />
                </IconBtn>
              </div>
              <IconBtn label="Close" onClick={onClose}>
                <Icon name="close" size={18} />
              </IconBtn>
            </div>
            <h2 id="viewer-title" className={f.vTitle}>
              {current.title}
            </h2>
            <dl className={f.settings}>
              <div>
                <dt>Chef</dt>
                <dd className={f.chefVal}>
                  {chefSrc(current.chef) && (
                    <span className={f.avatar}>
                      <Image src={chefSrc(current.chef)!} alt="" fill sizes="48px" />
                    </span>
                  )}
                  {current.chef}
                </dd>
              </div>
              <div>
                <dt>Style</dt>
                <dd>{styleBySlug(current.style).name}</dd>
              </div>
              <div>
                <dt>Length</dt>
                <dd>{seconds(current.seconds)}</dd>
              </div>
            </dl>
            <div className={f.actions}>
              <Btn kind="primary" icon={<Icon name="create" size={16} />} onClick={() => onUse(current)}>
                Use these settings
              </Btn>
              <a className={f.download} href={current.video} download={fileName(current)}>
                <GestureIcon name="download" size={16} />
                Download
              </a>
              <Btn kind="ghost" className={f.delete} icon={<Icon name="close" size={16} />} onClick={() => onDelete(current)}>
                Delete
              </Btn>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

function BigPlayer({ v }: { v: Video }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };
  return (
    <div className={f.screen}>
      <MediaFrame fill>
        <video ref={video} src={v.video} poster={v.poster} muted={muted} playsInline loop autoPlay preload="auto" onClick={toggle} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} aria-label={v.title} />
      </MediaFrame>
      <div className={f.screenControls}>
        <button type="button" className={f.over} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          <PlayPauseIcon playing={playing} size={18} />
          <span className={f.time}>{clock(time)}</span>
        </button>
        <button type="button" className={f.over} onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
          <VolumeIcon muted={muted} size={18} />
        </button>
      </div>
    </div>
  );
}
