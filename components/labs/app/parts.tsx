"use client";

import { Picture } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ComponentProps, type CSSProperties, type DragEvent, type ReactNode, type Ref } from "react";
import { Button } from "@/components/labs/Button";
import { Icon } from "@/components/labs/Icon";
import { AnimatedMark, CheckIcon, ChevronIcon, GestureIcon } from "@/components/labs/fx";
import { AppIcon } from "./AppIcon";
import { Crumbs } from "./AppShell";
import m from "./fx/motion.module.css";
import { useCast } from "./CastProvider";
import { EPISODE, STEPS, recentScripts } from "@/lib/labs/maker";
import s from "./maker.module.css";

/** Header trail: Series, the series (a link), then the page. Defaults to the series and episode being worked on. */
export function EpisodeTitle({ series, page, seriesHref }: { series?: string; page?: ReactNode; seriesHref?: string }) {
  const { working } = useCast();
  const name = series ?? working.title;
  const href = seriesHref ?? `/app/series/${working.slug}`;
  useEffect(() => {
    if (!series) shown = { title: working.title, slug: working.slug, episode: working.episode };
  }, [series, working]);
  // The style screens name "Styles" as their parent; the shell already puts Series in front of it.
  const top = seriesHref && !seriesHref.startsWith("/app/series") ? [] : [{ label: "Series", href: "/app" }];
  return <Crumbs items={[...top, { label: name, href }, { label: page ?? working.episode }]} />;
}

/** The series and episode the header last showed. A route skeleton is drawn outside the cast provider, so it reads them from here. */
let shown = { title: EPISODE.series, slug: "second-chance", episode: EPISODE.episode };

/** The header trail for a route skeleton: the series and episode as the header last showed them. */
export function TitleSkeleton({ series, page }: { series?: string; page?: ReactNode }) {
  return <Crumbs items={[{ label: "Series", href: "/app" }, { label: series ?? shown.title, href: `/app/series/${shown.slug}` }, { label: page ?? shown.episode }]} />;
}

type StepItem = { key: string; label: string; href?: string };

type StepperProps = {
  /** The current step's key. */
  current: string;
  /** Defaults to the four steps of an episode. */
  steps?: readonly StepItem[];
  label?: string;
  /** For steps that are views of one page: every step other than the current one is a button. */
  onSelect?: (key: string) => void;
  /** In a loading skeleton: the stepper holds the step the person came from, so it moves on when the page arrives. */
  pending?: boolean;
};

/** The step each stepper last settled on, by label. It outlives a route change, which is how a step can be seen to move on. */
const lastStep = new Map<string, string>();

/**
 * The one stepper. Done steps carry a tick and go back; the current one carries the shoulder.
 * Every step can be opened at any time: a link on an episode, a button with onSelect (the style creator).
 * When the current step changes, here or across a route change, the shoulder comes in from the side it left
 * and the steps just finished draw their ticks. Steps that were already done stay as they are.
 */
export function Stepper({ current, steps = STEPS, label = "Episode steps", onSelect, pending }: StepperProps) {
  const [shown, setShown] = useState<{ key: string; from?: string }>(() => {
    const last = lastStep.get(label);
    return pending ? { key: last ?? current } : { key: current, from: last };
  });
  if (!pending && shown.key !== current) setShown({ key: current, from: shown.key });
  useEffect(() => {
    if (!pending) lastStep.set(label, current);
  }, [pending, label, current]);

  const index = (key?: string) => steps.findIndex((x) => x.key === key);
  const at = index(shown.key);
  const was = index(shown.from);
  const move = was >= 0 && was !== at ? (at > was ? "forward" : "back") : undefined;
  return (
    <nav aria-label={label}>
      <ol className={s.steps}>
        {steps.map((step, i) => {
          const fresh = move === "forward" && i >= was;
          const inner = (
            <>
              {i < at ? (
                <span className={s.stepTick} style={fresh ? ({ "--i": i - was } as CSSProperties) : undefined}>
                  {fresh ? <CheckIcon size={16} /> : <Icon name="check" size={16} />}
                </span>
              ) : (
                <span className={s.num}>{i + 1}</span>
              )}
              <span className={s.stepLabel}>{step.label}</span>
              {i < at && <span className="sr-only">, done</span>}
            </>
          );
          let node: ReactNode;
          if (i === at)
            node = (
              <span className={s.step} aria-current="step" data-move={move}>
                {inner}
              </span>
            );
          else if (onSelect)
            node = (
              <button type="button" className={s.step} onClick={() => onSelect(step.key)}>
                {inner}
              </button>
            );
          else if (step.href)
            node = (
              <Link href={step.href} className={s.step}>
                {inner}
              </Link>
            );
          else node = <span className={s.step}>{inner}</span>;
          return <li key={step.key}>{node}</li>;
        })}
      </ol>
    </nav>
  );
}

/** A filter chip: a tick and a filled pill when on. */
export function Chip({ on, onClick, children, label }: { on: boolean; onClick: () => void; children: ReactNode; label?: string }) {
  return (
    <button type="button" className={s.chip} aria-pressed={on} onClick={onClick} aria-label={label}>
      {on && <CheckIcon size={16} />}
      {children}
    </button>
  );
}

/** A filter chip that is a link, for filters kept in the address. */
export function ChipLink({ on, href, children }: { on: boolean; href: string; children: ReactNode }) {
  return (
    <Link href={href} className={s.chip} aria-current={on ? "true" : undefined} scroll={false}>
      {on && <CheckIcon size={16} />}
      {children}
    </Link>
  );
}

/** Label and value rows. A missing value reads "Not set"; pass omitEmpty to leave the row out. */
export function Facts({ rows, omitEmpty = false, fill = false }: { rows: { label: string; value?: ReactNode }[]; omitEmpty?: boolean; /** The rows come in one after another, as when a file has just been read into them. */ fill?: boolean }) {
  return (
    <dl className={fill ? `${s.facts} ${m.fillRows}` : s.facts}>
      {rows
        .filter((r) => !omitEmpty || r.value)
        .map((r, i) => (
          <div key={r.label} style={fill ? ({ "--i": i } as CSSProperties) : undefined}>
            <dt>{r.label}</dt>
            <dd data-empty={!r.value || undefined}>{r.value || "Not set"}</dd>
          </div>
        ))}
    </dl>
  );
}

/** An error line: what did not happen and what to do, with an icon as well as colour. */
export function Alert({ children, id, className }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <p id={id} className={[s.alert, m.enter, className].filter(Boolean).join(" ")} role="alert">
      <AppIcon name="warning" size={16} />
      <span>{children}</span>
    </p>
  );
}

/** On a phone the side panel sits under the list, so a choice in the list brings it into view. */
export function revealOnPhone(el: Element | null | undefined) {
  if (!el || !window.matchMedia("(max-width: 900px)").matches) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
}

/** Moves focus to an element after React has drawn it. */
export function focusSoon(get: () => HTMLElement | null | undefined) {
  requestAnimationFrame(() => requestAnimationFrame(() => get()?.focus({ preventScroll: true })));
}

/** One segment per item, filled when that item is done. */
export function Progress({ items, label }: { items: { name: string; done: boolean }[]; label: string }) {
  return (
    <ol className={s.progress} aria-label={label}>
      {items.map((it) => (
        <li key={it.name} data-done={it.done}>
          <span className="sr-only">
            {it.name}: {it.done ? "done" : "not done"}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Status({ children, icon, tone, drawn }: { children: ReactNode; icon?: "check" | "warning" | "spinner" | "dot"; tone?: "danger"; /** The tick draws itself: for a state that has just been reached. */ drawn?: boolean }) {
  return (
    <span className={s.status} data-tone={tone}>
      {icon === "spinner" ? (
        // Work in progress is the mark at work, the same sign everywhere in the creator.
        <AnimatedMark variant="busy" size={16} />
      ) : icon === "check" ? (
        <span className={s.ok}>{drawn ? <CheckIcon size={16} /> : <Icon name="check" size={16} />}</span>
      ) : (
        icon && <AppIcon name={icon} size={16} />
      )}
      {children}
    </span>
  );
}

/** A blocked main action with its reason written beside it. It stays reachable by Tab, so the reason is read with it. */
export function BlockedAction({ label, reason, id, variant, size, icon }: { label: string; reason: ReactNode; id: string; variant?: "secondary"; size?: "small"; icon?: ReactNode }) {
  return (
    <span className={s.barGroup}>
      <Button variant={variant} size={size} icon={icon} aria-disabled="true" aria-describedby={id}>
        {label}
      </Button>
      <span id={id} className={s.reason}>
        {reason}
      </span>
    </span>
  );
}

type PanelProps = {
  /** "section" for the main work, "aside" for the side panel. */
  as?: "section" | "aside";
  title: ReactNode;
  /** The page heading lives in the main panel. */
  level?: 1 | 2;
  sub?: ReactNode;
  /** Quiet actions at the right of the header. */
  actions?: ReactNode;
  /** A pinned row under the body, for the panel's own main action. */
  foot?: ReactNode;
  /** Rows run edge to edge with no body padding. */
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
  busy?: boolean;
  /** Lets a screen move focus to the heading after it swaps what the panel shows. */
  headingRef?: Ref<HTMLHeadingElement>;
  /** For a panel a screen brings into view on a phone. */
  panelRef?: Ref<HTMLElement>;
  children: ReactNode;
};

/** The one panel: 20px corners, a 72px header, the notched divider, a body that scrolls when the screen is fixed. The page heading (level 1) is set in the display face. */
export function Panel({ as = "section", title, level = 2, sub, actions, foot, flush, className, bodyClassName, busy, headingRef, panelRef, children }: PanelProps) {
  const id = useId();
  const Tag = as;
  const H = level === 1 ? "h1" : "h2";
  return (
    <Tag ref={panelRef} className={[s.card, className].filter(Boolean).join(" ")} aria-labelledby={id} aria-busy={busy || undefined}>
      <div className={s.panelHead}>
        <div className={s.panelHeadText} data-move>
          <H id={id} ref={headingRef} tabIndex={headingRef ? -1 : undefined} className={level === 1 ? s.pageTitle : s.panelTitle}>
            {title}
          </H>
          {sub && <p className={s.panelSub}>{sub}</p>}
        </div>
        {actions && <div className={s.panelActions}>{actions}</div>}
      </div>
      <hr className={s.notch} />
      <div className={[s.panelBody, bodyClassName].filter(Boolean).join(" ")} data-flush={flush || undefined} data-move>
        {children}
      </div>
      {foot && <div className={s.panelFoot}>{foot}</div>}
    </Tag>
  );
}

/** An empty place: what it is, and one next step. */
export function Empty({ art, children, action }: { art?: "upload-script" | "no-results" | "no-clip" | "failed"; children: ReactNode; action?: ReactNode }) {
  return (
    <div className={s.empty}>
      {art && <img src={`/labs/app/empty/${art}.svg`} alt="" width={160} height={140} />}
      <p>{children}</p>
      {action}
    </div>
  );
}

/** The error for files that are not images, or "" when there are none. `what` names the thing that must be an image. */
export function notImages(other: File[], what = "Sheets are") {
  if (!other.length) return "";
  const names = other.map((f) => f.name).join(", ");
  return `${names} ${other.length > 1 ? "are not images and were" : "is not an image and was"} not added. ${what} image files.`;
}

/** Splits dropped or chosen files into the images and the rest. */
export function splitImages(files: File[]) {
  return {
    images: files.filter((f) => f.type.startsWith("image/")),
    other: files.filter((f) => !f.type.startsWith("image/")),
  };
}

type DropProps = {
  title: string;
  hint?: string;
  button: string;
  /** The button's accessible name when the visible label needs more context. */
  buttonLabel?: string;
  accept: string;
  multiple?: boolean;
  compact?: boolean;
  onFiles: (files: File[]) => void;
  /** The button's own ref, so a screen can return focus to it. */
  buttonRef?: Ref<HTMLButtonElement>;
  children?: ReactNode;
};

/** A real drop zone: drag files onto it, or press the button to choose them. */
export function Dropzone({ title, hint, button, buttonLabel, accept, multiple, compact, onFiles, buttonRef, children }: DropProps) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    // Every dropped file is passed on, so a screen that takes one can say what it left out.
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };
  return (
    <div
      className={s.drop}
      data-over={over}
      data-compact={compact || undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      {compact ? (
        <span className={s.dropLine}>
          <GestureIcon name="upload" active={over} />
          {title}
        </span>
      ) : (
        <>
          <GestureIcon name="upload" active={over} />
          <p className={s.dropTitle}>{title}</p>
          {hint && <p className="small muted">{hint}</p>}
        </>
      )}
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <Button ref={buttonRef} variant="secondary" size="small" onClick={() => input.current?.click()} aria-label={buttonLabel}>
        {button}
      </Button>
      {children}
    </div>
  );
}

/** A file input opened from any button: returns a function that opens it. */
export function useFilePicker(accept: string, onFiles: (files: File[]) => void, multiple = true) {
  const input = useRef<HTMLInputElement>(null);
  const handler = useRef(onFiles);
  useEffect(() => {
    handler.current = onFiles;
  }, [onFiles]);
  const node = (
    <input
      ref={input}
      type="file"
      accept={accept}
      multiple={multiple}
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(e) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length) handler.current(files);
        e.target.value = "";
      }}
    />
  );
  return { open: () => input.current?.click(), node };
}

/** Sheet art from the library or from an upload in this session (an object URL). It shows the skeleton surface until the picture has loaded. Pass eager for an image that is the first thing seen on the screen. */
export function SheetImage({ src, sizes, className, alt = "", eager }: { src: string; sizes: string; className?: string; alt?: string; eager?: boolean }) {
  return <Picture src={src} alt={alt} fill sizes={sizes} className={className} loading={eager ? "eager" : undefined} unoptimized={src.startsWith("blob:")} />;
}

export function RecentScripts() {
  return (
    <Panel title="Recent scripts" flush>
      <ul className={s.rows}>
        {recentScripts.map((r, i) => {
          const body = (
            <>
              <span className={s.rowNum} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={s.rowText}>
                <span>{r.title}</span>
                <Status icon={r.state === "Processed" ? "check" : "dot"}>{r.state}</Status>
              </span>
              <span className={s.cardSub}>{r.date}</span>
            </>
          );
          return (
            <li key={r.title}>
              {r.href ? (
                <Link href={r.href} className={s.row}>
                  {body}
                </Link>
              ) : (
                <div className={s.row}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

type UndoProps = { text: string; onUndo: () => void; onDismiss: () => void; undoRef?: Ref<HTMLButtonElement>; /** The line is on its way out (see usePresence). */ leaving?: boolean };

/**
 * The line that follows a removal. It is fixed at the foot of the work area, where it stays in view
 * whatever the scroll, until it is dismissed, replaced by a newer removal or 12 seconds pass.
 */
export function UndoLine({ text, onUndo, onDismiss, undoRef, leaving }: UndoProps) {
  const done = useRef(onDismiss);
  useEffect(() => {
    done.current = onDismiss;
  }, [onDismiss]);
  useEffect(() => {
    const t = setTimeout(() => done.current(), 12000);
    return () => clearTimeout(t);
  }, [text]);
  return (
    <div className={s.undo} role="status" data-leaving={leaving || undefined} inert={leaving || undefined}>
      <span>{text}</span>
      <Button ref={undoRef} variant="secondary" size="small" onClick={onUndo}>
        Undo
      </Button>
      <Button variant="quiet" size="small" onClick={onDismiss} aria-label="Dismiss">
        <GestureIcon name="close" size={16} />
      </Button>
    </div>
  );
}

type ConfirmProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  makes: string;
  confirmLabel: string;
  /** The confirmed work has started and the screen is about to change: the button shows it and takes no second press. */
  busy?: boolean;
  /** More label and value rows after Makes. */
  facts?: { label: string; value: ReactNode }[];
};

/** Says what will be made before anything is submitted. One confirm button. */
export function ConfirmDialog({ open, onClose, onConfirm, title, makes, confirmLabel, busy, facts = [] }: ConfirmProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const { working } = useCast();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className={s.dialog} aria-labelledby={id} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <h2 id={id} className="h2">
        {title}
      </h2>
      <p className="muted small">
        {working.title}, {working.episode}
      </p>
      <dl className={s.facts}>
        <div>
          <dt>Makes</dt>
          <dd>{makes}</dd>
        </div>
        {facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      <div className={s.dialogActions}>
        <Button variant="quiet" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onConfirm} loading={busy}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}

/** A select with the shared chevron, which turns while the list is open. */
export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <span className={s.selectWrap}>
      <select className={[s.select, className].filter(Boolean).join(" ")} {...rest}>
        {children}
      </select>
      <ChevronIcon open={false} size={16} />
    </span>
  );
}
