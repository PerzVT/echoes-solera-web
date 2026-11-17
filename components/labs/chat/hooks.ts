"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";

function useMedia(query: string) {
  return useSyncExternalStore(
    (on) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", on);
      return () => m.removeEventListener("change", on);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const usePhone = () => useMedia("(max-width: 767px)");
export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

/** Calls `onClose` on Escape or a press outside `ref`, while `open`. Focus goes back to `back` on Escape. */
export function useDismiss(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void, back?: RefObject<HTMLElement | null>) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close.current();
      back?.current?.focus();
    };
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || back?.current?.contains(t)) return;
      close.current();
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", down);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", down);
    };
  }, [open, ref, back]);
}

/** Opens and closes a native dialog with `open`. */
export function useDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return ref;
}

/** A file picker that is not on screen: `open()` shows the system dialog. */
export function useFilePicker(accept: string, onFiles: (files: File[]) => void) {
  const handler = useRef(onFiles);
  useEffect(() => {
    handler.current = onFiles;
  });
  const input = useRef<HTMLInputElement | null>(null);
  return () => {
    if (!input.current) {
      const el = document.createElement("input");
      el.type = "file";
      el.multiple = true;
      el.addEventListener("change", () => {
        if (el.files?.length) handler.current([...el.files]);
        el.value = "";
      });
      input.current = el;
    }
    input.current.accept = accept;
    input.current.click();
  };
}
