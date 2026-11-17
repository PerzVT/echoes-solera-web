"use client";

import { useRef, useState } from "react";
import { MediaFrame, PlayPauseIcon, VolumeIcon } from "@/components/labs/fx";
import s from "./styles.module.css";

/** A clip with the site's own controls: play and pause, and sound. It waits for a press and starts muted. */
export function Clip({ src, poster, label }: { src: string; poster?: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => setPlaying(false));
    else v.pause();
  };

  return (
    <span className={s.clip} data-playing={playing || undefined}>
      <MediaFrame fill key={src}>
        <video
          ref={video}
          src={src}
          poster={poster}
          muted={muted}
          loop
          playsInline
          preload="none"
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label={label}
        />
      </MediaFrame>
      <button type="button" className={s.clipPlay} onClick={toggle} aria-label={playing ? `Pause ${label}` : `Play ${label}`}>
        <PlayPauseIcon playing={playing} size={18} />
      </button>
      <button type="button" className={s.clipMute} onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
        <VolumeIcon muted={muted} size={18} />
      </button>
    </span>
  );
}
