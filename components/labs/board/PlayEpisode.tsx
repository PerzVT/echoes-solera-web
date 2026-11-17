"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MediaFrame, PlayPauseIcon, VolumeIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { IconBtn } from "@/components/labs/chat/ui";
import type { Shot } from "./data";
import { useDialog } from "./hooks";
import b from "./board.module.css";

/** The ready shots one after another: a clip plays through, a still holds for the shot's length. Escape, Close or the backdrop stops it. */
export function PlayEpisode({ open, onClose, shots, title }: { open: boolean; onClose: () => void; shots: Shot[]; title: string }) {
  const ref = useDialog(open);
  const video = useRef<HTMLVideoElement>(null);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setAt(0);
      setPlaying(true);
    }
  }

  const shot = shots[at];
  const take = shot?.takes[shot.take];
  const last = shots.length - 1;
  const next = () => (at < last ? setAt(at + 1) : setPlaying(false));
  const clip = take?.clip;
  const hold = (shot?.seconds ?? 0) * 1000;

  useEffect(() => {
    if (!open || hold === 0) return;
    if (clip) {
      if (playing) video.current?.play().catch(() => {});
      else video.current?.pause();
      return;
    }
    if (!playing) return;
    const t = setTimeout(() => (at < last ? setAt(at + 1) : setPlaying(false)), hold);
    return () => clearTimeout(t);
  }, [open, at, last, clip, hold, playing]);

  return (
    <dialog ref={ref} className={b.play} aria-label={title} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      {open && shot && take && (
        <div className={b.playWrap}>
          <div className={b.playFrame}>
            <MediaFrame fill key={shot.id + at}>
              {take.clip ? (
                <video ref={video} src={take.clip} poster={take.still} muted={muted} playsInline onEnded={next} onClick={() => setPlaying(!playing)} aria-label={`Shot ${at + 1}, ${shot.label}`} />
              ) : (
                <Image src={take.still} alt={`Shot ${at + 1}, ${shot.label}`} fill sizes="(max-width: 767px) 100vw, 960px" />
              )}
            </MediaFrame>
          </div>
          <div className={b.playBar}>
            <IconBtn label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>
              <PlayPauseIcon playing={playing} size={18} />
            </IconBtn>
            <ol className={b.playCount} aria-label={`Shot ${at + 1}, ${shot.label}`}>
              {shots.map((s, i) => (
                <li key={s.id} data-state={i < at ? "done" : i === at ? "now" : undefined}>
                  <button type="button" aria-label={`Play from shot ${i + 1}`} onClick={() => setAt(i)} />
                </li>
              ))}
            </ol>
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
