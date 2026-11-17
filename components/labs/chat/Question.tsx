"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/labs/Icon";
import type { Question } from "./agent";
import { useDialog } from "./hooks";
import { Btn, IconBtn, cx } from "./ui";
import q from "./question.module.css";

type CardProps = {
  question: Question;
  /** "dock": above the composer. "modal": a centred dialog, or a sheet on a phone. */
  mode: "dock" | "modal";
  onAnswer: (answers: (string | null)[]) => void;
  /** Docked with images: opens the larger view. */
  onExpand?: () => void;
};

/**
 * The agent's question, after Unify's docked card: "1 / 2", the question, numbered options (each may carry a
 * thumbnail and one line), an "Other" field, Skip and Next. Number keys pick an option. Focus lands on the card.
 */
export function QuestionCard({ question, mode, onAnswer, onExpand }: CardProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(() => question.steps.map(() => null));
  const [other, setOther] = useState("");
  const card = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const s = question.steps[step];
  const last = step === question.steps.length - 1;
  const picked = answers[step];

  useEffect(() => {
    first.current?.focus({ preventScroll: mode === "dock" });
  }, [step, mode]);

  const go = (value: string | null) => {
    const next = answers.map((x, i) => (i === step ? value : x));
    setAnswers(next);
    setOther("");
    if (last) onAnswer(next);
    else setStep(step + 1);
  };

  const keys = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    const n = Number(e.key);
    if (n >= 1 && n <= s.options.length) {
      e.preventDefault();
      setAnswers(answers.map((x, i) => (i === step ? s.options[n - 1].id : x)));
    }
  };

  const images = s.options.some((o) => o.thumb);
  const value = other.trim() || picked;

  return (
    <div ref={card} className={cx(q.card, mode === "modal" && q.modal)} role="group" aria-labelledby={`${question.id}-q`} onKeyDown={keys}>
      <div className={q.head}>
        <span className={q.count}>
          {step + 1} / {question.steps.length}
        </span>
        {onExpand && images && (
          <IconBtn label="Show larger" onClick={onExpand}>
            <Icon name="fullscreen" size={16} />
          </IconBtn>
        )}
      </div>
      <h2 id={`${question.id}-q`} className={q.question}>
        {s.question}
      </h2>
      <ul className={cx(q.options, images && mode === "modal" && q.optionTiles)}>
        {s.options.map((o, i) => (
          <li key={o.id}>
            <button ref={i === 0 ? first : undefined} type="button" className={q.option} aria-pressed={picked === o.id} onClick={() => setAnswers(answers.map((x, j) => (j === step ? o.id : x)))}>
              {o.thumb && (
                <span className={q.thumb}>
                  <Image src={o.thumb} alt="" fill sizes={mode === "modal" ? "(max-width: 767px) 45vw, 280px" : "48px"} />
                </span>
              )}
              <span className={q.num} aria-hidden="true">
                {i + 1}
              </span>
              <span className={q.text}>
                <span className={q.label}>{o.label}</span>
                {o.line && <span className={q.line}>{o.line}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <input className={q.other} value={other} onChange={(e) => setOther(e.target.value)} placeholder="Other" aria-label="Other" onKeyDown={(e) => e.key === "Enter" && other.trim() && go(other.trim())} />
      <div className={q.actions}>
        <Btn kind="ghost" onClick={() => go(null)}>
          Skip
        </Btn>
        <Btn kind="primary" disabled={!value} onClick={() => go(value)}>
          {last ? "Done" : "Next"}
        </Btn>
      </div>
    </div>
  );
}

/** The question as a dialog over the workspace; on a phone, a sheet at the foot. Escape docks it in the rail. */
export function QuestionDialog({ question, onAnswer, onClose }: { question: Question | null; onAnswer: (a: (string | null)[]) => void; onClose: () => void }) {
  const ref = useDialog(Boolean(question));
  return (
    <dialog ref={ref} className={q.dialog} aria-label="Question" onClose={onClose}>
      {question && <QuestionCard key={question.id} question={question} mode="modal" onAnswer={onAnswer} />}
    </dialog>
  );
}
