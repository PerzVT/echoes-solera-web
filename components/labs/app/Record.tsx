"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/labs/Icon";
import { Btn } from "@/components/labs/chat/ui";
import { useDialog } from "@/components/labs/chat/hooks";
import type { JobRecord } from "@/lib/labs/ai/contract";
import type { Made } from "@/lib/labs/store/types";
import { api } from "./api";
import s from "./Record.module.css";

/** What a record shows beside the picture. Anything left out is not shown: no row ever holds a placeholder. */
export type RecordInfo = {
  /** The heading: "Frame 3. Wide", "Page 2", "Generation 4". */
  title: string;
  made?: Made;
  /** The tool's name: "Storyboard", "Manga", "Mini-series", "Anime", "Cooking videos". */
  tool: string;
  /** The series or project it belongs to. */
  project?: string | null;
  /** Who saved the work it is part of, when the picture itself does not say. */
  owner?: string | null;
  /** For a retake: which take this is. */
  take?: string | null;
  /** A note on the picture shown under the heading, such as a frame's shot note. */
  note?: string | null;
  /** Facts of the tool's own, shown after the made-by row: a chef, a style, a length. */
  facts?: [string, string][];
};

type Props = {
  open: boolean;
  label: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** "page" keeps a tall page whole; "clip" a 9:16 or 16:9 video; "frame" a landscape picture. */
  shape?: "frame" | "page" | "clip";
  info: RecordInfo | null;
  /** Buttons under the record, such as Download. */
  actions?: ReactNode;
  children: ReactNode;
};

const when = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
const dollars = (n: number) => `$${n < 1 ? n.toFixed(n < 0.01 ? 4 : 3) : n.toFixed(2)}`;

/** The job behind a picture, read once per visit. */
const records = new Map<string, Promise<JobRecord | null>>();
const recordOf = (job: string) => {
  let r = records.get(job);
  if (!r) {
    r = api.jobRecord(job).catch(() => null);
    records.set(job, r);
  }
  return r;
};

/**
 * A generated picture or clip full screen, as a record: the work large on one side and, beside it (below it on a
 * phone), the prompt in full with Copy, when it was made, the model, the cost, who made it, the tool, the series or
 * project and the take. Escape, the close button or a press on the dark closes it; the arrow keys step.
 */
export function Record({ open, label, onClose, onPrev, onNext, shape = "frame", info, actions, children }: Props) {
  const ref = useDialog(open);
  const job = info?.made?.job;
  const [rec, setRec] = useState<{ job: string; data: JobRecord | null } | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!open || !job) return;
    let alive = true;
    recordOf(job).then((data) => alive && setRec({ job, data }));
    return () => {
      alive = false;
    };
  }, [open, job]);
  useEffect(() => setCopied(false), [info?.title]);

  const r = rec && rec.job === job ? rec.data : null;
  const made = info?.made;
  const prompt = r?.prompt ?? made?.prompt ?? null;
  const at = r?.finishedAt ?? made?.at ?? r?.createdAt;
  const model = made?.test ? "Test mode" : r ? (r.model ?? "Development stand-in") : null;
  const cost = made?.test ? null : r?.costUsd ?? null;
  const by = made?.by ?? r?.owner ?? info?.owner ?? null;
  const rows: [string, string][] = [];
  if (at && when(at)) rows.push(["Generated", when(at)!]);
  if (model) rows.push(["Model", model]);
  if (cost !== null) rows.push(["Cost", dollars(cost)]);
  if (by) rows.push(["Made by", by]);
  for (const f of info?.facts ?? []) rows.push(f);
  if (info?.tool) rows.push(["Tool", info.tool]);
  if (info?.project) rows.push(["Series", info.project]);
  if (info?.take) rows.push(["Take", info.take]);

  const copy = () => {
    if (!prompt) return;
    navigator.clipboard?.writeText(prompt).then(
      () => setCopied(true),
      () => {},
    );
  };

  return (
    <dialog
      ref={ref}
      className={s.dialog}
      aria-label={label}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest("textarea, input")) return;
        if (e.key === "ArrowLeft" && onPrev) onPrev();
        if (e.key === "ArrowRight" && onNext) onNext();
      }}
    >
      {open && info && (
        <div className={s.layout}>
          <div className={s.stage} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={s.media} data-shape={shape}>
              {children}
            </div>
            {onPrev && (
              <button type="button" className={s.prev} aria-label="Previous" onClick={onPrev}>
                <Icon name="back" size={20} />
              </button>
            )}
            {onNext && (
              <button type="button" className={s.next} aria-label="Next" onClick={onNext}>
                <Icon name="arrow" size={20} />
              </button>
            )}
          </div>
          <aside className={s.side} aria-label="Record">
            <div className={s.head}>
              <h2 className={s.title}>{info.title}</h2>
              {made?.test && <span className={s.test}>Test work</span>}
            </div>
            {info.note && <p className={s.note}>{info.note}</p>}
            {prompt && (
              <section className={s.prompt} aria-labelledby="record-prompt">
                <div className={s.promptHead}>
                  <h3 id="record-prompt" className={s.label}>
                    Prompt
                  </h3>
                  <Btn kind="ghost" small icon={<Icon name={copied ? "check" : "copy"} size={16} />} onClick={copy}>
                    {copied ? "Copied" : "Copy"}
                  </Btn>
                </div>
                <p className={s.promptText}>{prompt}</p>
              </section>
            )}
            {rows.length > 0 && (
              <dl className={s.rows}>
                {rows.map(([k, v]) => (
                  <div key={k} className={s.row}>
                    <dt className={s.label}>{k}</dt>
                    <dd className={s.value}>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {actions && <div className={s.actions}>{actions}</div>}
          </aside>
          <button type="button" className={s.close} aria-label="Close" onClick={onClose} autoFocus>
            <Icon name="close" size={20} />
          </button>
        </div>
      )}
    </dialog>
  );
}
