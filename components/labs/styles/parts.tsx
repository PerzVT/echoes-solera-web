import { MediaFrame } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { chartSlots, type ChartKey, type Media, type Style } from "@/lib/labs/styles";
import s from "./styles.module.css";

/** A named place for art. Filled when media exists; otherwise the slot keeps its name and reads "Not made yet". */
export function Slot({ name, media, sizes = "(max-width: 720px) 50vw, 25vw", className, eager }: { name: string; media?: Media; sizes?: string; className?: string; eager?: boolean }) {
  if (!media) {
    return (
      <div className={[s.slot, className].filter(Boolean).join(" ")}>
        <span className={s.slotLabel}>{name}</span>
        <span className={s.slotState}>Not made yet</span>
      </div>
    );
  }
  return (
    <figure className={[s.slot, s.filled, className].filter(Boolean).join(" ")}>
      {media.video ? (
        <MediaFrame fill key={media.src}>
          <video src={media.video} poster={media.src} muted loop playsInline controls preload="none" aria-label={media.alt} />
        </MediaFrame>
      ) : (
        <Image key={media.src} src={media.src} alt={media.alt} fill sizes={sizes} loading={eager ? "eager" : undefined} unoptimized={media.src.startsWith("blob:")} />
      )}
      <figcaption className={media.video ? `${s.slotName} ${s.slotNameTop}` : s.slotName}>{media.label ?? name}</figcaption>
    </figure>
  );
}

/** The chart's five subjects, the ones with art first so the large slot is never the empty one. */
export function orderedSlots(chart: Style["chart"]) {
  const has = (k: ChartKey) => Boolean(chart[k]);
  return [...chartSlots.filter((c) => has(c.key)), ...chartSlots.filter((c) => !has(c.key))];
}

export function Chart({ chart }: { chart: Style["chart"] }) {
  return (
    <div className={s.chart}>
      {orderedSlots(chart).map((c, i) => (
        <Slot key={c.key} name={c.label} media={chart[c.key]} eager={i < 3} sizes={i === 0 ? "(max-width: 720px) 100vw, 30vw" : "(max-width: 720px) 50vw, 20vw"} />
      ))}
    </div>
  );
}

/** The guide's text with every paragraph holding the conflicting term marked. */
export function GuideText({ text, term, id }: { text: string; term?: string; id?: string }) {
  const parts = text.split(/(\n\s*\n)/);
  return (
    <pre className={s.guide} id={id}>
      {parts.map((p, i) => (term && p.toLowerCase().includes(term.toLowerCase()) ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>))}
    </pre>
  );
}

/** Where Import keeps the file it read, so the creator opens on it. */
export const IMPORT_KEY = "nl-style-import";
export type Imported = { name: string; text: string };

export function readImported(): Imported | null {
  try {
    const raw = sessionStorage.getItem(IMPORT_KEY);
    return raw ? (JSON.parse(raw) as Imported) : null;
  } catch {
    return null;
  }
}
