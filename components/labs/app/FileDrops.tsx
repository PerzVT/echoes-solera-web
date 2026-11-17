"use client";

import { useEffect, useRef } from "react";

const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

/**
 * A file dropped anywhere in the creator but outside a drop zone. Without this the browser opens the file in
 * place of the page, and the session, which is held only in memory, is lost. A screen that takes files passes
 * `onFiles` and gets the drop as if it had landed on its zone; elsewhere the drop is swallowed.
 * Zones handle their own drops first: React's listeners sit below the document, and a drop a zone took is
 * already `defaultPrevented` when it gets here.
 */
export function FileDrops({ onFiles }: { onFiles?: (files: File[]) => void }) {
  const take = useRef(onFiles);
  useEffect(() => {
    take.current = onFiles;
  }, [onFiles]);

  useEffect(() => {
    const over = (e: DragEvent) => {
      if (!hasFiles(e) || e.defaultPrevented) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = take.current ? "copy" : "none";
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e) || e.defaultPrevented) return;
      e.preventDefault();
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length) take.current?.(files);
    };
    document.addEventListener("dragover", over);
    document.addEventListener("drop", drop);
    return () => {
      document.removeEventListener("dragover", over);
      document.removeEventListener("drop", drop);
    };
  }, []);

  return null;
}
