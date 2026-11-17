import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { CheckIcon } from "./fx/AnimatedIcon";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "quiet";
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
  return [styles.btn, styles[variant], size === "small" ? styles.small : "", extra].filter(Boolean).join(" ");
}

/* The wash is a layer cut to the shouldered shape. On hover one band of pigment crosses it; while a
   button is loading the band keeps crossing. */
function Inner({ icon, iconAfter, children }: Pick<Common, "icon" | "iconAfter" | "children">) {
  return (
    <>
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
      <Inner icon={icon} iconAfter={iconAfter}>
        {children}
      </Inner>
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
      <Inner icon={icon} iconAfter={iconAfter}>
        {children}
      </Inner>
      {success && (
        <span className={styles.done} aria-hidden="true">
          <CheckIcon size={20} />
        </span>
      )}
    </button>
  );
}
