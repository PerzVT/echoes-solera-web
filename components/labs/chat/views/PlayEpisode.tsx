"use client";

import { useEffect, useRef, useState } from "react";
import { MediaFrame, PlayPauseIcon, VolumeIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import type { Take } from "@/lib/labs/maker";
import { useDialog } from "../hooks";
import { IconBtn } from "../ui";
import shared from "./shared.module.css";
import own from "./gens.module.css";

const v = { ...shared, ...own };

/** The approved clips one after another, in order. Escape, Close or the backdrop stops it. */
export function PlayEpisode({ open, onClose, clips }: { open: boolean; onClose: () => void; clips: (Take & { n: number })[] }) {
  const ref = useDialog(open);
  const video = useRef<HTMLVideoElement>(null);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setAt(0);
  }

  useEffect(() => {
    if (open) video.current?.play().catch(() => {});
    else video.current?.pause();
  }, [open, at]);

  const clip = clips[at];
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  return (
    <dialog ref={ref} className={v.play} aria-label="Episode 1" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      {open && clip && (
        <div className={v.playWrap}>
          <div className={v.playFrame}>
            <MediaFrame fill key={clip.src + at}>
              <video
                ref={video}
                src={clip.src}
                poster={clip.poster}
                muted={muted}
                playsInline
                onClick={toggle}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => at < clips.length - 1 && setAt(at + 1)}
                aria-label={`Generation ${clip.n}`}
              />
            </MediaFrame>
          </div>
          <div className={v.playBar}>
            <IconBtn label={playing ? "Pause" : "Play"} onClick={toggle}>
              <PlayPauseIcon playing={playing} size={18} />
            </IconBtn>
            <span className={v.time}>
              {at + 1} / {clips.length}
            </span>
            <IconBtn label={muted ? "Turn sound on" : "Turn sound off"} onClick={() => setMuted(!muted)}>
              <VolumeIcon muted={muted} size={18} />
            </IconBtn>
            <IconBtn label="Close" onClick={onClose}>
              <Icon name="close" size={18} />
            </IconBtn>
          </div>
        </div>
      )}
    </dialog>
  );
}
