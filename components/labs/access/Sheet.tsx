"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "../Icon";
import styles from "./access.module.css";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * A modal sheet on the native dialog element: the rest of the page is inert while it is open, so
 * Tab stays inside. Escape, the close button and a press on the backdrop close it, and focus goes
 * back to whatever had it before.
 */
export function Sheet({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      const active = document.activeElement as HTMLElement | null;
      opener.current = active && active !== document.body ? active : null;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  // Each screen in the sheet puts focus on its main control; a screen change inside an open sheet does too.
  useEffect(() => {
    const d = ref.current;
    if (!open || !d) return;
    d.scrollTop = 0;
    const target = d.querySelector<HTMLElement>("[data-autofocus]") ?? d.querySelector<HTMLElement>("button");
    target?.focus({ preventScroll: true });
  }, [open, title]);

  // Closing for any reason (Escape included) hands control back to the page and restores focus.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClosed = () => {
      const back = opener.current;
      opener.current = null;
      close.current();
      if (back?.isConnected) back.focus({ preventScroll: true });
    };
    d.addEventListener("close", onClosed);
    return () => d.removeEventListener("close", onClosed);
  }, []);

  return (
    <dialog
      ref={ref}
      className={styles.sheet}
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      onKeyDown={(e) => {
        // The page behind is inert, but Tab would still leave for the browser's own controls: wrap it.
        if (e.key !== "Tab") return;
        const items = [...e.currentTarget.querySelectorAll<HTMLElement>("button, a[href], input:not([type='radio']), input[type='radio']:checked, select, textarea, [tabindex]:not([tabindex='-1'])")].filter(
          (el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0,
        );
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
    >
      <div className={styles.sheetBody}>
        <header className={styles.sheetHead}>
          <h2 className="h2">{title}</h2>
          <button type="button" className={styles.close} onClick={() => ref.current?.close()} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </header>
        {open && children}
      </div>
    </dialog>
  );
}
