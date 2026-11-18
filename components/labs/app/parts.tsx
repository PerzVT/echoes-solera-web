"use client";

import { Picture } from "@/components/labs/fx/Picture";
import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import { Icon } from "@/components/labs/Icon";
import { AnimatedMark, CheckIcon } from "@/components/labs/fx";
import { AppIcon } from "./AppIcon";
import m from "./fx/motion.module.css";
import s from "./maker.module.css";

/** An error line: what did not happen and what to do, with an icon as well as colour. */
export function Alert({ children, id, className }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <p id={id} className={[s.alert, m.enter, className].filter(Boolean).join(" ")} role="alert">
      <AppIcon name="warning" size={16} />
      <span>{children}</span>
    </p>
  );
}

/** A save failure beside the control it belongs to. What the person typed is left as it was. */
export function SaveError({ children }: { children: ReactNode }) {
  return children ? <Alert className={s.saveError}>{children}</Alert> : null;
}

/** A step's primary action that saves first: the message on failure sits right before the button. */
export function SaveAction({ error, children }: { error?: string; children: ReactNode }) {
  return (
    <span className={s.saveAction}>
      <SaveError>{error}</SaveError>
      {children}
    </span>
  );
}

/** Saves what is waiting, then moves on. While saving the button shows its loading state; a failure stays on screen. */
export function useSaveThen(flush: () => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const go = async (then: () => void) => {
    setBusy(true);
    setError("");
    try {
      await flush();
      then();
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "That did not save. Try again.");
      setBusy(false);
    }
  };
  return { busy, error, go };
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

/** The one panel: 20px corners, a 72px header, the divider, a body that scrolls when the screen is fixed. The page heading (level 1) is set in the display face. */
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

/** Sheet art from the library, a saved upload (served by /api/creator/files, which the image optimiser cannot reach without the session) or an upload in this session (an object URL). It shows the skeleton surface until the picture has loaded. Pass eager for an image that is the first thing seen on the screen. */
export function SheetImage({ src, sizes, className, alt = "", eager }: { src: string; sizes: string; className?: string; alt?: string; eager?: boolean }) {
  return <Picture src={src} alt={alt} fill sizes={sizes} className={className} loading={eager ? "eager" : undefined} unoptimized={src.startsWith("blob:") || src.startsWith("/api/")} />;
}
