"use client";

import { screenplay, type Block } from "@/lib/labs/maker";
import type { Quote } from "../agent";
import { REVISED_BLOCKS, SCRIPT_TITLE, genCount, sceneCount } from "../data";
import shared from "./shared.module.css";
import own from "./doc.module.css";

const v = { ...shared, ...own };

const short = (text: string) => (text.length > 32 ? `${text.slice(0, 32).trimEnd()}...` : text);

/**
 * The screenplay as a document. After a revision the changed passages show the old words struck and the new
 * words in the accent. Pressing a passage quotes it into the composer, so the next message is about it.
 */
export function ScreenplayView({ revised, onQuote }: { revised: boolean; onQuote: (q: Quote) => void }) {
  return (
    <article className={v.doc} aria-labelledby="sp-title">
      <header className={v.docHead}>
        <h2 id="sp-title" className={v.docTitle}>
          {SCRIPT_TITLE}
        </h2>
        <p className={v.meta}>
          {sceneCount} scenes, {genCount} generations{revised && <span className={v.changed}>, 2 passages changed</span>}
        </p>
      </header>
      <div className={v.script}>
        {screenplay.map((b) => (
          <Passage key={b.id} b={b} revised={revised && REVISED_BLOCKS.includes(b.id)} onQuote={onQuote} />
        ))}
      </div>
    </article>
  );
}

function Passage({ b, revised, onQuote }: { b: Block; revised: boolean; onQuote: (q: Quote) => void }) {
  if (b.kind === "heading")
    return (
      <h3 className={v.scene}>
        <span>{b.number}</span>
        {b.text}
      </h3>
    );
  if (b.kind === "camera") return <p className={v.shot}>{b.text}</p>;
  const now = revised ? b.rewrite : b.text;
  const words = revised ? (
    <>
      <del className={v.del}>{b.text}</del> <ins className={v.ins}>{b.rewrite}</ins>
    </>
  ) : (
    b.text
  );
  return (
    <button type="button" className={b.kind === "dialogue" ? v.dialogue : v.action} onClick={() => onQuote({ label: `On: ${short(now)}`, block: b.id })} aria-label={`Quote: ${now}`}>
      {b.kind === "dialogue" && <span className={v.cue}>{b.cue}</span>}
      <span>{words}</span>
    </button>
  );
}
