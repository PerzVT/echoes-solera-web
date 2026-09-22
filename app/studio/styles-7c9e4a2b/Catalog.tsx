"use client";

import { styles } from "./styleData";
import s from "./catalog.module.css";

export default function Catalog() {
  return <main className={s.shell} aria-label="Style videos">
    <div className={s.grid}>
      {styles.map(style => <section className={s.style} key={style.id} id={style.id} aria-labelledby={`${style.id}-title`}>
        <h2 id={`${style.id}-title`}>{style.title}</h2>
        <video
          src={style.video}
          poster={style.poster}
          controls
          playsInline
          preload="none"
          aria-label={style.title}
          onPlay={event => {
            const current = event.currentTarget;
            current.closest("main")?.querySelectorAll("video").forEach(video => {
              if (video !== current) video.pause();
            });
          }}
        />
      </section>)}
    </div>
  </main>;
}
