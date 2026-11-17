"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Reveal.module.css";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Props = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  /** The element to render. Defaults to a div. */
  as?: ElementType;
  /** Bring the direct children in one after another instead of the block as a whole. */
  stagger?: boolean;
  /** Extra wait before the first item, in ms. */
  delay?: number;
};

/**
 * Brings a section in the first time it scrolls into view: 12px up and a fade over 600 ms, once.
 * Server HTML and script-less pages show the content as it is. On mount, anything already in the
 * viewport is left alone, so nothing above the fold ever hides; only content still below the fold is
 * held back, and it is released when a fifth of it (or 80px) has entered. Under reduced motion it does nothing.
 */
export function Reveal({ children, as: Tag = "div", stagger = false, delay = 0, className, style, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "wait" | "in">("idle");

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setState("wait");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setState("in");
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      {...rest}
      ref={ref}
      className={[styles.reveal, className].filter(Boolean).join(" ")}
      data-reveal={state === "idle" ? undefined : state}
      data-stagger={stagger ? "" : undefined}
      style={delay ? ({ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties) : style}
    >
      {children}
    </Tag>
  );
}
