"use client";

import Link from "next/link";
import { forwardRef, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { AnimatedMark, CheckIcon, ChevronIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
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
  wide?: boolean;
  small?: boolean;
  className?: string;
  /** Work has started and not finished: the mark at work takes the icon's place and presses are ignored, as on the site's Button. */
  loading?: boolean;
  /** The work is done: a tick draws itself. Set it back to false after a moment. */
  success?: boolean;
};

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(function Btn({ kind = "secondary", icon, wide, small, className, loading, success, onClick, children, ...rest }, ref) {
  const state = success ? "success" : loading ? "loading" : undefined;
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
      {state === "loading" ? <AnimatedMark variant="busy" size={16} /> : state === "success" ? <CheckIcon size={16} /> : icon}
      {children && <span className={u.label}>{children}</span>}
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
  { key: "mini-series", label: "Mini-series", href: "/app" },
  { key: "anime", label: "Anime", href: "/app/anime" },
  { key: "cooking", label: "Cooking videos", href: "/app/cooking" },
] as const;
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
            <Link href={t.href} className={u.tool} aria-current={t.key === current ? "page" : undefined}>
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
      <span className={u.toolMenu}>
        <button ref={button} type="button" className={u.toolButton} aria-expanded={open} aria-label={`Tool, ${now.label}`} onClick={() => setOpen(!open)}>
          {now.label}
          <ChevronIcon open={open} size={14} />
        </button>
        {open && (
          <ul ref={panel} className={u.toolPanel}>
            {tools.map((t) => (
              <li key={t.key}>
                <Link href={t.href} className={u.toolItem} aria-current={t.key === current ? "page" : undefined} onClick={() => setOpen(false)}>
                  {t.label}
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
