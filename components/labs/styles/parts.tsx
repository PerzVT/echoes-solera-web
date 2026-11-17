import { Facts } from "@/components/labs/app/parts";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { chartSlots, ruleFields, type ChartKey, type Media, type RuleKey, type Style } from "@/lib/labs/styles";
import { Clip } from "./Clip";
import s from "./styles.module.css";

type SlotProps = {
  name: string;
  media?: Media;
  sizes?: string;
  className?: string;
  eager?: boolean;
  /** Opens the image full screen. A clip keeps its own controls instead. */
  onOpen?: () => void;
};

/** A named place for art. Filled when media exists; otherwise a dashed tile with the name alone. */
export function Slot({ name, media, sizes = "(max-width: 720px) 50vw, 25vw", className, eager, onOpen }: SlotProps) {
  if (!media) {
    return (
      <div className={[s.slot, className].filter(Boolean).join(" ")}>
        <span className={s.slotLabel}>{name}</span>
      </div>
    );
  }
  const caption = media.label ?? name;
  if (media.video) {
    return (
      <figure className={[s.slot, s.filled, className].filter(Boolean).join(" ")}>
        <Clip src={media.video} poster={media.src} label={media.alt} />
        <figcaption className={`${s.slotName} ${s.slotNameTop}`}>{caption}</figcaption>
      </figure>
    );
  }
  const image = <Image key={media.src} src={media.src} alt={media.alt} fill sizes={sizes} loading={eager ? "eager" : undefined} unoptimized={media.src.startsWith("blob:")} />;
  return (
    <figure className={[s.slot, s.filled, className].filter(Boolean).join(" ")}>
      {onOpen ? (
        <button type="button" className={s.slotOpen} onClick={onOpen} aria-label={`${caption}, full screen`}>
          {image}
        </button>
      ) : (
        image
      )}
      <figcaption className={s.slotName}>{caption}</figcaption>
    </figure>
  );
}

/** The chart's subjects that have art, in chart order, and the ones still empty. */
export function splitSlots(chart: Style["chart"]) {
  const has = (k: ChartKey) => Boolean(chart[k]);
  return { filled: chartSlots.filter((c) => has(c.key)), empty: chartSlots.filter((c) => !has(c.key)) };
}

/** The chart's still images in the order the chart draws them, each named by its subject: what the full-screen view steps through. */
export function chartImages(chart: Style["chart"]): Media[] {
  const out: Media[] = [];
  for (const c of splitSlots(chart).filled) {
    const m = chart[c.key]!;
    if (m.video || out.some((x) => x.src === m.src && x.alt === m.alt)) continue;
    out.push({ ...m, label: m.label ?? c.label });
  }
  return out;
}

/**
 * The style chart. Subjects with art share the space and the first is the largest. Subjects without art are
 * small dashed tiles after them, so an empty slot is never a large tile.
 */
export function Chart({ chart, onOpen, className }: { chart: Style["chart"]; onOpen?: (media: Media) => void; className?: string }) {
  const { filled, empty } = splitSlots(chart);
  return (
    <div className={[s.chartWrap, className].filter(Boolean).join(" ")}>
      {filled.length > 0 && (
        <div className={s.chartArt} data-count={filled.length}>
          {filled.map((c, i) => {
            const media = chart[c.key]!;
            return (
              <Slot
                key={c.key}
                name={c.label}
                media={media}
                eager={i < 3}
                sizes={i === 0 ? "(max-width: 720px) 100vw, 40vw" : "(max-width: 720px) 50vw, 25vw"}
                onOpen={onOpen && !media.video ? () => onOpen(media) : undefined}
              />
            );
          })}
        </div>
      )}
      {empty.length > 0 && (
        <div className={s.chartEmpty}>
          {empty.map((c) => (
            <Slot key={c.key} name={c.label} />
          ))}
        </div>
      )}
    </div>
  );
}

/** The rules as read-only rows, only the ones that hold a value. Editing happens on the Rules step. */
export function RulesList({ rules }: { rules: Partial<Record<RuleKey, string>> }) {
  return <Facts rows={ruleFields.filter((f) => rules[f.key]?.trim()).map((f) => ({ label: f.label, value: rules[f.key] }))} />;
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
