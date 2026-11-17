"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { Btn, IconBtn, Pill } from "@/components/labs/chat/ui";
import { Glyph } from "./Cards";
import type { CastItem, Scene, Shot } from "./data";
import { useDismiss } from "./hooks";
import b from "./board.module.css";

type Props = {
  shot: Shot;
  n: number;
  scene: Scene;
  /** The canvas's cast and places: what the chips offer. */
  cast: CastItem[];
  onChange: (patch: Partial<Shot>) => void;
  onMake: () => void;
  onReview: (r: Shot["review"]) => void;
  onRetry: (feedback: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

const MIN_S = 1;
const MAX_S = 20;

/** The selected shot, every part of it editable in place: label, action, cast, place, prompt and length; then approve, deny or retry. */
export function Panel({ shot, n, scene, cast: all, onChange, onMake, onReview, onRetry, onDuplicate, onDelete }: Props) {
  const people = all.filter((c) => c.kind === "char");
  const places = all.filter((c) => c.kind === "place");
  const place = places.find((p) => p.id === shot.place);
  const cast = people.filter((c) => shot.cast.includes(c.id));
  const others = people.filter((c) => !shot.cast.includes(c.id));
  const busy = shot.status === "generating";
  const ready = shot.status === "ready" && shot.takes.length > 0;
  const [retry, setRetry] = useState(false);
  const [feedback, setFeedback] = useState("");

  return (
    <aside className={b.panel} aria-label={`Shot ${n}`}>
      <div className={b.panelBody}>
        <div className={b.panelHead}>
          <div className={b.titleRow}>
            <span className={b.titleNum}>{n}</span>
            <AutoText className={b.shotTitle} label="Shot label" value={shot.label} onChange={(label) => onChange({ label })} single />
            <div className={b.headTools}>
              <IconBtn label={`Duplicate shot ${n}`} onClick={onDuplicate}>
                <Glyph name="copy" />
              </IconBtn>
              <IconBtn label={`Delete shot ${n}`} onClick={onDelete}>
                <Glyph name="trash" />
              </IconBtn>
            </div>
          </div>
          <p className={b.scene}>{scene.heading}</p>
          <AutoText className={b.action} label="Action" placeholder="What happens in this shot" value={shot.action} onChange={(action) => onChange({ action })} />
        </div>

        <dl className={b.fields}>
          <div className={b.field}>
            <dt>Cast</dt>
            <dd className={b.chips}>
              {cast.map((c) => (
                <Pill key={c.id} className={b.chip} aria-label={`Remove ${c.name}`} onClick={() => onChange({ cast: shot.cast.filter((x) => x !== c.id) })}>
                  <Face src={c.src} />
                  <span>{c.name}</span>
                  <Icon name="close" size={14} />
                </Pill>
              ))}
              {others.length > 0 && (
                <Popover
                  label="Add cast"
                  trigger={() => (
                    <>
                      <Icon name="plus" size={14} />
                      <span>Add</span>
                    </>
                  )}
                >
                  {(close) => (
                    <ul className={b.menu}>
                      {others.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            className={b.item}
                            onClick={() => {
                              onChange({ cast: [...shot.cast, c.id] });
                              close();
                            }}
                          >
                            <Face src={c.src} size={28} />
                            {c.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Popover>
              )}
            </dd>
          </div>

          <div className={b.field}>
            <dt>Place</dt>
            <dd className={b.chips}>
              <Popover
                label={place ? `Place, ${place.name}` : "Place"}
                trigger={(open) => (
                  <>
                    <span className={b.placeThumb}>{place?.src && <Image src={place.src} alt="" fill sizes="64px" />}</span>
                    <span>{place?.name ?? "Choose"}</span>
                    <ChevronIcon open={open} size={14} />
                  </>
                )}
              >
                {(close) => (
                  <ul className={b.menu}>
                    {places.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className={b.item}
                          aria-pressed={p.id === shot.place}
                          onClick={() => {
                            onChange({ place: p.id });
                            close();
                          }}
                        >
                          <span className={b.placeThumb} data-big>
                            {p.src && <Image src={p.src} alt="" fill sizes="96px" />}
                          </span>
                          <span className={b.itemName}>{p.name}</span>
                          {p.id === shot.place && <Icon name="check" size={16} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Popover>
            </dd>
          </div>

          <div className={b.field}>
            <dt id={`len-${shot.id}`}>Length</dt>
            <dd>
              <div className={b.stepper} role="group" aria-labelledby={`len-${shot.id}`}>
                <IconBtn label="Shorter" disabled={shot.seconds <= MIN_S} onClick={() => onChange({ seconds: Math.max(MIN_S, shot.seconds - 1) })}>
                  <Glyph name="minus" size={16} />
                </IconBtn>
                <output className={b.stepValue} aria-live="polite">
                  {shot.seconds} s
                </output>
                <IconBtn label="Longer" disabled={shot.seconds >= MAX_S} onClick={() => onChange({ seconds: Math.min(MAX_S, shot.seconds + 1) })}>
                  <Icon name="plus" size={16} />
                </IconBtn>
              </div>
            </dd>
          </div>

          <div className={b.field} data-block>
            <dt>
              <label htmlFor={`prompt-${shot.id}`}>Prompt</label>
            </dt>
            <dd>
              <textarea id={`prompt-${shot.id}`} className={b.prompt} value={shot.prompt} rows={4} onChange={(e) => onChange({ prompt: e.target.value })} />
            </dd>
          </div>
        </dl>

        {shot.takes.length > 1 && (
          <ul className={b.takes} aria-label={`Shot ${n} takes`}>
            {shot.takes.map((t, i) => (
              <li key={i}>
                <button type="button" className={b.take} aria-pressed={i === shot.take} aria-label={`Take ${i + 1}`} disabled={busy} onClick={() => onChange({ take: i })}>
                  <Image src={t.still} alt="" fill sizes="96px" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={b.panelFoot}>
        {ready ? (
          <>
            <div className={b.review}>
              <Btn kind="secondary" className={b.approve} aria-pressed={shot.review === "approved"} icon={<Icon name="check" size={16} />} onClick={() => onReview(shot.review === "approved" ? undefined : "approved")}>
                {shot.review === "approved" ? "Approved" : "Approve"}
              </Btn>
              <Btn kind="secondary" className={b.deny} aria-pressed={shot.review === "denied"} icon={<Icon name="close" size={16} />} onClick={() => onReview(shot.review === "denied" ? undefined : "denied")}>
                {shot.review === "denied" ? "Denied" : "Deny"}
              </Btn>
            </div>
            {retry ? (
              <form
                className={b.retry}
                onSubmit={(e) => {
                  e.preventDefault();
                  onRetry(feedback.trim());
                  setFeedback("");
                  setRetry(false);
                }}
              >
                <textarea
                  autoFocus
                  className={b.prompt}
                  aria-label="Feedback for the new take"
                  placeholder="What should change?"
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                    if (e.key === "Escape") setRetry(false);
                  }}
                />
                <div className={b.retryRow}>
                  <Btn kind="ghost" small onClick={() => setRetry(false)}>
                    Cancel
                  </Btn>
                  <Btn kind="secondary" small type="submit">
                    Send
                  </Btn>
                </div>
              </form>
            ) : (
              <Btn kind="ghost" wide onClick={() => setRetry(true)}>
                Retry with feedback
              </Btn>
            )}
          </>
        ) : (
          <Btn kind="secondary" wide disabled={busy || !shot.prompt.trim()} onClick={onMake}>
            {busy ? "Generating" : shot.status === "failed" ? "Try again" : "Generate shot"}
          </Btn>
        )}
      </div>
    </aside>
  );
}

/** Text edited where it sits: looks like the heading or line it is, grows with what is typed. */
function AutoText({ value, onChange, label, className, placeholder, single }: { value: string; onChange: (v: string) => void; label: string; className?: string; placeholder?: string; single?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      className={`${b.inline} ${className ?? ""}`}
      aria-label={label}
      placeholder={placeholder}
      value={value}
      spellCheck={false}
      onChange={(e) => onChange(single ? e.target.value.replace(/\n/g, " ") : e.target.value)}
      onKeyDown={(e) => {
        if (single && e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    />
  );
}

/** A round face crop; an empty circle for someone with no art yet. */
export function Face({ src, size = 24 }: { src?: string; size?: number }) {
  return (
    <span className={b.face} data-close style={{ width: size, height: size }}>
      {src && <Image src={src} alt="" fill sizes={`${size * 2}px`} />}
    </span>
  );
}

/** A pill that opens a small panel under it. Escape and a press outside close it. */
function Popover({ trigger, label, children }: { trigger: (open: boolean) => ReactNode; label: string; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useDismiss(open, panel, () => setOpen(false), button);
  return (
    <span className={b.popWrap}>
      <Pill ref={button} aria-expanded={open} aria-haspopup="dialog" aria-label={label} onClick={() => setOpen(!open)}>
        {trigger(open)}
      </Pill>
      {open && (
        <div ref={panel} role="dialog" aria-label={label} className={b.pop}>
          {children(() => {
            setOpen(false);
            button.current?.focus();
          })}
        </div>
      )}
    </span>
  );
}
