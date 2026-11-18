import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { CheckIcon } from "./fx/AnimatedIcon";
import styles from "./Button.module.css";

/**
 * primary is the shouldered shape: the one main action on a screen or dialog, never two on one screen.
 * secondary (outline), solid (filled) and quiet (text that fills on hover) are plain rounded rectangles on the
 * container radius scale.
 */
export type Variant = "primary" | "secondary" | "solid" | "quiet";
type Common = {
  variant?: Variant;
  size?: "default" | "small";
  children: ReactNode;
  className?: string;
  /** An icon before the label. */
  icon?: ReactNode;
  /** An icon after the label. It moves 3px along on hover, so use it for arrows. */
  iconAfter?: ReactNode;
};

function cls(variant: Variant, size: string, extra?: string) {
  return [styles.btn, variant === "primary" ? "" : styles.rounded, styles[variant], size === "small" ? styles.small : "", extra].filter(Boolean).join(" ");
}

/* The wash is a layer cut to the button's shape. On hover one band of pigment crosses it; while a button is
   loading the band keeps crossing. A shouldered button also carries its focus ring, drawn with its own
   silhouette (Button.module.css). */
export function ButtonInner({ icon, iconAfter, children, shoulder }: Pick<Common, "icon" | "iconAfter" | "children"> & { shoulder: boolean }) {
  return (
    <>
      {shoulder && <span className={styles.ring} aria-hidden="true" />}
      <span className={styles.wash} aria-hidden="true" />
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
      {iconAfter && <span className={`${styles.icon} ${styles.after}`}>{iconAfter}</span>}
    </>
  );
}

const ignore = (e: MouseEvent) => e.preventDefault();

export function ButtonLink({
  variant = "primary",
  size = "default",
  className,
  icon,
  iconAfter,
  children,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, "className">) {
  return (
    <Link className={cls(variant, size, className)} {...rest}>
      <ButtonInner icon={icon} iconAfter={iconAfter} shoulder={variant === "primary"}>
        {children}
      </ButtonInner>
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "default",
  className,
  icon,
  iconAfter,
  loading = false,
  success = false,
  onClick,
  children,
  ...rest
}: Common &
  Omit<ComponentProps<"button">, "className"> & {
    /** Work has started and has not finished. The label stays, a band of pigment keeps crossing the shape, and presses are ignored. */
    loading?: boolean;
    /** The work is done. The label gives way to a tick that draws itself. Set it back to false after a moment. */
    success?: boolean;
  }) {
  const state = success ? "success" : loading ? "loading" : undefined;
  return (
    <button
      type="button"
      {...rest}
      className={cls(variant, size, className)}
      data-state={state}
      aria-busy={loading || undefined}
      // Stays focusable while busy, so focus is not thrown to the top of the page; presses do nothing.
      onClick={state && onClick ? ignore : onClick}
    >
      <ButtonInner icon={icon} iconAfter={iconAfter} shoulder={variant === "primary"}>
        {children}
      </ButtonInner>
      {success && (
        <span className={styles.done} aria-hidden="true">
          <CheckIcon size={20} />
        </span>
      )}
    </button>
  );
}

/** A button's classes, for an element that cannot be a Button or ButtonLink, such as a plain <a>. Pair it with ButtonInner. */
export const buttonClass = (variant: Variant = "primary", size: "default" | "small" = "default", extra?: string) => cls(variant, size, extra);
