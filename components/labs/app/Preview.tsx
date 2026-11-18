"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/labs/Icon";
import { useDialog } from "@/components/labs/chat/hooks";
import p from "./Preview.module.css";

type Props = {
  open: boolean;
  /** The dialog's name, read out when it opens. */
  label: string;
  onClose: () => void;
  /** Steps to the item before or after, when there is one. */
  onPrev?: () => void;
  onNext?: () => void;
  /** "page" keeps a tall manga page whole; "frame" fills the width. */
  shape?: "page" | "frame";
  children: ReactNode;
};

/** A picture full screen, over everything: Escape, the close button or a press on the dark closes it; arrow keys step. */
export function Preview({ open, label, onClose, onPrev, onNext, shape = "frame", children }: Props) {
  const ref = useDialog(open);
  return (
    <dialog
      ref={ref}
      className={p.dialog}
      aria-label={label}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" && onPrev) onPrev();
        if (e.key === "ArrowRight" && onNext) onNext();
      }}
    >
      {open && (
        <>
          <div className={p.stage} data-shape={shape} onClick={(e) => e.target === e.currentTarget && onClose()}>
            {children}
          </div>
          <button type="button" className={p.close} aria-label="Close" onClick={onClose} autoFocus>
            <Icon name="close" size={20} />
          </button>
          {onPrev && (
            <button type="button" className={p.prev} aria-label="Previous" onClick={onPrev}>
              <Icon name="back" size={20} />
            </button>
          )}
          {onNext && (
            <button type="button" className={p.next} aria-label="Next" onClick={onNext}>
              <Icon name="arrow" size={20} />
            </button>
          )}
        </>
      )}
    </dialog>
  );
}
