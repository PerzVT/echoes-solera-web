"use client";

import Link from "next/link";
import { forwardRef, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { AnimatedMark, CheckIcon, ChevronIcon } from "@/components/labs/fx";
import { Icon, type IconName } from "@/components/labs/Icon";
import { useDismiss } from "./hooks";
import u from "./ui.module.css";

/**
 * The chat screen's own controls: a plain rounded rectangle in three kinds, a square icon button and a pill.
 * Primary is the one strong action on screen; secondary is an outline; ghost is text that fills on hover.
 */
type Kind = "primary" | "secondary" | "ghost";

type BtnProps = Omit<ComponentProps<"button">, "className"> & {
  kind?: Kind;
  icon?: ReactNode;
  /** An icon after the label, for an action that moves on (Next). */
  iconAfter?: ReactNode;
  wide?: boolean;
  small?: boolean;
  className?: string;
  /** Work has started and not finished: the mark at work takes the icon's place and presses are ignored, as on the site's Button. */
  loading?: boolean;
  /** The work is done: a tick draws itself. Set it back to false after a moment. */
  success?: boolean;
};

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(function Btn({ kind = "secondary", icon, iconAfter, wide, small, className, loading, success, onClick, children, ...rest }, ref) {
  const state = success ? "success" : loading ? "loading" : undefined;
  const mark = state === "loading" ? <AnimatedMark variant="busy" size={16} /> : state === "success" ? <CheckIcon size={16} /> : null;
  // The mark at work takes the icon's place: before the label, or after it on a button whose only icon trails.
  const trails = !icon && Boolean(iconAfter);
  return (
    <button
      ref={ref}
      type="button"
      {...rest}
      data-state={state}
      aria-busy={loading || undefined}
      // Stays focusable while busy, so focus is not thrown away; presses do nothing.
      onClick={state ? (e) => e.preventDefault() : onClick}
      className={[u.btn, u[kind], wide && u.wide, small && u.small, className].filter(Boolean).join(" ")}
    >
      {trails ? null : (mark ?? icon)}
      {children && <span className={u.label}>{children}</span>}
      {trails ? (mark ?? iconAfter) : iconAfter}
    </button>
  );
});

type IconBtnProps = Omit<ComponentProps<"button">, "className" | "aria-label"> & { label: string; className?: string; children: ReactNode };

export const IconBtn = forwardRef<HTMLButtonElement, IconBtnProps>(function IconBtn({ label, className, children, ...rest }, ref) {
  return (
    <button ref={ref} type="button" aria-label={label} {...rest} className={[u.iconBtn, className].filter(Boolean).join(" ")}>
      {children}
    </button>
  );
});

type PillProps = Omit<ComponentProps<"button">, "className"> & { className?: string; on?: boolean };

export const Pill = forwardRef<HTMLButtonElement, PillProps>(function Pill({ className, on, children, ...rest }, ref) {
  return (
    <button ref={ref} type="button" data-on={on || undefined} {...rest} className={[u.pill, className].filter(Boolean).join(" ")}>
      {children}
    </button>
  );
});

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** The three creator tools. Each is its own screen. */
export const tools = [
  { key: "mini-series", label: "Mini-series", href: "/app", icon: "series" },
  { key: "anime", label: "Anime", href: "/app/anime", icon: "anime" },
  { key: "cooking", label: "Cooking videos", href: "/app/cooking", icon: "cooking" },
  { key: "storyboard", label: "Storyboard", href: "/app/storyboard", icon: "storyboard" },
  { key: "manga", label: "Manga", href: "/app/manga", icon: "manga" },
] as const satisfies readonly { key: string; label: string; href: string; icon: IconName }[];
export type ToolKey = (typeof tools)[number]["key"];

/** Switches between the creator tools: a compact segmented row on desktop, a menu on phones. */
export function ToolSwitch({ current }: { current: ToolKey }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useDismiss(open, panel, () => setOpen(false), button);
  const now = tools.find((t) => t.key === current) ?? tools[0];
  return (
    <nav className={u.tools} aria-label="Creator tools">
      <ul className={u.toolRow}>
        {tools.map((t) => (
          <li key={t.key}>
            <Link href={t.href} className={u.tool} aria-current={t.key === current ? "page" : undefined} title={t.label}>
              <Icon name={t.icon} size={18} />
              <span className={u.toolLabel}>{t.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <span className={u.toolMenu}>
        <button ref={button} type="button" className={u.toolButton} aria-expanded={open} aria-label={`Tool, ${now.label}`} onClick={() => setOpen(!open)}>
          <Icon name={now.icon} size={18} />
          <span className={u.toolButtonLabel}>{now.label}</span>
          <ChevronIcon open={open} size={14} />
        </button>
        {open && (
          <ul ref={panel} className={u.toolPanel}>
            {tools.map((t) => (
              <li key={t.key}>
                <Link href={t.href} className={u.toolItem} aria-current={t.key === current ? "page" : undefined} onClick={() => setOpen(false)}>
                  <Icon name={t.icon} size={20} />
                  <span className={u.toolItemLabel}>{t.label}</span>
                  {t.key === current && <Icon name="check" size={16} />}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </span>
    </nav>
  );
}
