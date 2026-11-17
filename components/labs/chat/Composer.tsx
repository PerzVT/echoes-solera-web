"use client";

import { forwardRef, useImperativeHandle, useRef, useState, type KeyboardEvent } from "react";
import { GestureIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { AppIcon } from "@/components/labs/app/AppIcon";
import type { Quote } from "./agent";
import { notionPages } from "./data";
import { useDismiss } from "./hooks";
import { Btn, IconBtn } from "./ui";
import p from "./popover.module.css";
import c from "./composer.module.css";

export type ComposerHandle = { focus: () => void };

type Props = {
  text: string;
  onText: (t: string) => void;
  quote?: Quote;
  onClearQuote: () => void;
  /** The next step, such as "Generate": a wide button under the box. */
  next: string | null;
  busy: boolean;
  onSend: (text: string) => void;
  onScript: () => void;
  onImages: () => void;
  onNotion: (chat: string, title: string) => void;
};

/**
 * The prompt box at the foot of the rail: "+" for a script, images or a Notion page, the text, and a send
 * button inside the box. When the agent waits on a step, one wide button under the box names it.
 * Enter sends, Shift+Enter is a new line.
 */
export const Composer = forwardRef<ComposerHandle, Props>(function Composer(props, ref) {
  const { text, onText, quote, onClearQuote, next, busy, onSend, onScript, onImages, onNotion } = props;
  const area = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => area.current?.focus() }), []);
  const typed = text.trim();

  const keys = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (typed && !busy) onSend(typed);
    }
  };

  return (
    <div className={c.wrap}>
      <form
        className={c.box}
        onSubmit={(e) => {
          e.preventDefault();
          if (typed && !busy) onSend(typed);
        }}
      >
        {quote && (
          <span className={c.quote}>
            <span className={c.quoteText}>{quote.label}</span>
            <IconBtn label={`Remove ${quote.label}`} className={c.quoteClose} onClick={onClearQuote}>
              <Icon name="close" size={14} />
            </IconBtn>
          </span>
        )}
        <textarea ref={area} className={c.area} value={text} rows={1} placeholder="Message Nine Lives" aria-label="Message Nine Lives" onChange={(e) => onText(e.target.value)} onKeyDown={keys} />
        <div className={c.row}>
          <Attach onScript={onScript} onImages={onImages} onNotion={onNotion} />
          <button type="submit" className={c.send} disabled={!typed || busy} aria-label="Send">
            <Icon name="up" size={18} />
          </button>
        </div>
      </form>
      {next && (
        <Btn kind="primary" wide disabled={busy} onClick={() => onSend(next)}>
          {next}
        </Btn>
      )}
    </div>
  );
});

/** "+": a script, images, or a page from Notion. */
function Attach({ onScript, onImages, onNotion }: Pick<Props, "onScript" | "onImages" | "onNotion">) {
  const [open, setOpen] = useState(false);
  const [notion, setNotion] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    setNotion(false);
  };
  useDismiss(open, panel, close, button);
  const pick = (fn: () => void) => () => {
    close();
    fn();
  };

  return (
    <span className={p.wrap}>
      <IconBtn ref={button} label="Add" aria-expanded={open} aria-haspopup="menu" onClick={() => (open ? close() : setOpen(true))}>
        <Icon name="plus" size={18} />
      </IconBtn>
      {open && (
        <div ref={panel} className={p.panel} data-place="up" role="menu" aria-label={notion ? "From Notion" : "Add"}>
          <ul className={p.menu} role="none">
            {notion ? (
              notionPages.map((n) => (
                <li key={n.chat} role="none">
                  <button type="button" role="menuitem" className={p.item} onClick={pick(() => onNotion(n.chat, n.title))}>
                    {n.title}
                  </button>
                </li>
              ))
            ) : (
              <>
                <li role="none">
                  <button type="button" role="menuitem" className={p.item} onClick={pick(onScript)}>
                    <span className={p.itemLead}>
                      <AppIcon name="file" size={16} />
                      Upload a script
                    </span>
                  </button>
                </li>
                <li role="none">
                  <button type="button" role="menuitem" className={p.item} onClick={pick(onImages)}>
                    <span className={p.itemLead}>
                      <GestureIcon name="upload" size={16} />
                      Upload images
                    </span>
                  </button>
                </li>
                <li role="none">
                  <button type="button" role="menuitem" className={p.item} onClick={() => setNotion(true)}>
                    <span className={p.itemLead}>
                      <Icon name="script" size={16} />
                      From Notion
                    </span>
                    <Icon name="arrow" size={14} />
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </span>
  );
}
