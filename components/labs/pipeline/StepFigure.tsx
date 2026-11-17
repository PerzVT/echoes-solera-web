import { Picture as Image } from "@/components/labs/fx/Picture";
import type { StepFigure as Figure } from "@/lib/labs/pipeline";
import { Clip } from "./Clip";
import s from "./pipeline.module.css";

/** The evidence beside a step: a script excerpt, reference sheets, a still or the clip. */
export function StepFigure({ figure, compact = false }: { figure: Figure; compact?: boolean }) {
  if (figure.kind === "script") {
    return (
      <figure className={s.fig}>
        <div className={s.paper}>
          <p className={s.screenplay}>{figure.text}</p>
        </div>
        <figcaption className={s.caption}>The scene as the script gives it.</figcaption>
      </figure>
    );
  }
  if (figure.kind === "sheets") {
    return (
      <figure className={s.fig}>
        <div className={s.sheets}>
          {figure.images.map((im) => (
            <div key={im.src} className={s.sheet}>
              <Image src={im.src} alt={im.alt} width={900} height={675} sizes={compact ? "(max-width: 900px) 100vw, 640px" : "(max-width: 900px) 100vw, 40vw"} />
            </div>
          ))}
        </div>
        <figcaption className={s.caption}>{figure.caption}</figcaption>
      </figure>
    );
  }
  if (figure.kind === "still") {
    return (
      <figure className={`${s.fig} ${s.portrait}`}>
        <div className={s.frame}>
          <Image src={figure.src} alt={figure.alt} fill sizes="(max-width: 900px) 70vw, 320px" />
        </div>
        <figcaption className={s.caption}>{figure.caption}</figcaption>
      </figure>
    );
  }
  return (
    <figure className={`${s.fig} ${s.portrait}`}>
      <Clip className={s.clip} src={figure.src} poster={figure.poster} label={figure.label} />
      <figcaption className={s.caption}>{figure.caption}</figcaption>
    </figure>
  );
}
