"use client";

import { useEffect, useRef, useState } from "react";
import { GestureIcon, MediaFrame, PlayPauseIcon, VolumeIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { LibraryGrid } from "@/components/labs/app/LibraryGrid";
import { Record } from "@/components/labs/app/Record";
import { Btn } from "../chat/ui";
import { clock, seconds, styleBySlug, type Video } from "./data";
import f from "./feed.module.css";

const fileName = (v: Video) => `shoujo-supper-${v.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.mp4`;

type Props = {
  videos: Video[];
  onUse: (v: Video) => void;
  /** Deletes a video and returns what puts it back. */
  onDelete: (v: Video) => () => void;
};

const UNDO_MS = 6000;

/** The cooking Library: the videos as cards, newest first, each opening full screen as its record. */
export function Feed({ videos, onUse, onDelete }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ text: string; restore: () => void } | null>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const ready = videos.filter((v) => v.status === "ready");
  const at = ready.findIndex((v) => v.id === open);
  const current = at >= 0 ? ready[at] : null;
  const remove = (v: Video) => {
    const restore = onDelete(v);
    window.clearTimeout(timer.current);
    setUndo({ text: `${v.title} deleted`, restore });
    timer.current = window.setTimeout(() => setUndo(null), UNDO_MS);
  };

  return (
    <>
      <LibraryGrid
        shape="clip"
        items={ready.map((v) => ({
          id: v.id,
          title: v.title,
          date: v.made?.at,
          meta: v.chef,
          covers: [v.poster],
          onOpen: () => setOpen(v.id),
          menu: [{ label: "Delete", run: () => remove(v) }],
        }))}
      />
      <Record
        open={Boolean(current)}
        shape="clip"
        label={current?.title ?? "Video"}
        onClose={() => setOpen(null)}
        onPrev={at > 0 ? () => setOpen(ready[at - 1].id) : undefined}
        onNext={at >= 0 && at < ready.length - 1 ? () => setOpen(ready[at + 1].id) : undefined}
        info={
          current
            ? {
                title: current.title,
                made: current.made,
                tool: "Cooking videos",
                project: current.made ? null : "Shoujo Supper",
                facts: [
                  ["Chef", current.chef],
                  ["Style", styleBySlug(current.style).name],
                  ["Length", seconds(current.seconds)],
                ],
              }
            : null
        }
        actions={
          current && (
            <>
              <Btn
                kind="primary"
                icon={<Icon name="create" size={16} />}
                onClick={() => {
                  setOpen(null);
                  onUse(current);
                }}
              >
                Use these settings
              </Btn>
              <a className={f.download} href={current.video} download={fileName(current)}>
                <GestureIcon name="download" size={16} />
                Download
              </a>
              <Btn
                kind="ghost"
                icon={<Icon name="close" size={16} />}
                onClick={() => {
                  setOpen(null);
                  remove(current);
                }}
              >
                Delete
              </Btn>
            </>
          )
        }
      >
        {current && <BigPlayer key={current.id} v={current} />}
      </Record>
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
    </>
  );
}

function BigPlayer({ v }: { v: Video }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };
  return (
    <div className={f.recordScreen}>
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
