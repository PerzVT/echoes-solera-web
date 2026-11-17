"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { ChevronIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { Btn, Pill } from "@/components/labs/chat/ui";
import { characters, places, scenes, styleBySlug, styles, type CharId, type Shot } from "./data";
import { useDismiss } from "./hooks";
import b from "./board.module.css";

type Props = {
  shot: Shot;
  n: number;
  onChange: (patch: Partial<Shot>) => void;
  onGenerate: () => void;
  onTake: (take: number) => void;
};

/** The selected shot's settings: cast, place, style, prompt and length, and the one Generate button. */
export function Panel({ shot, n, onChange, onGenerate, onTake }: Props) {
  const scene = scenes.find((s) => s.n === shot.scene)!;
  const made = shot.takes.length > 0;
  const style = styleBySlug(shot.style);
  const place = places.find((p) => p.id === shot.place)!;
  const cast = characters.filter((c) => shot.cast.includes(c.id));
  const others = characters.filter((c) => !shot.cast.includes(c.id));
  const busy = shot.status === "generating";

  return (
    <aside className={b.panel} aria-label={`Shot ${n}`}>
      <div className={b.panelBody}>
        <div className={b.panelHead}>
          <h2 className={b.shotTitle}>
            <span className={b.num}>{n}</span> {shot.label}
          </h2>
          <p className={b.scene}>
            {scene.n} {scene.heading}
          </p>
          {shot.action && <p className={b.action}>{shot.action}</p>}
        </div>

        <dl className={b.fields}>
          <div className={b.field}>
            <dt>Cast</dt>
            <dd className={b.chips}>
              {cast.map((c) => (
                <Pill key={c.id} className={b.chip} aria-label={`Remove ${c.name}`} onClick={() => onChange({ cast: shot.cast.filter((x) => x !== c.id) })}>
                  <Face src={c.face} />
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
                              onChange({ cast: [...shot.cast, c.id as CharId] });
                              close();
                            }}
                          >
                            <Face src={c.face} size={28} />
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
                label={`Place, ${place.name}`}
                trigger={(open) => (
                  <>
                    <span className={b.placeThumb}>
                      <Image src={place.thumb} alt="" fill sizes="64px" />
                    </span>
                    <span>{place.name}</span>
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
                            <Image src={p.thumb} alt="" fill sizes="96px" />
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
            <dt>Style</dt>
            <dd className={b.chips}>
              <Popover
                label={`Style, ${style.name}`}
                wide
                trigger={(open) => (
                  <>
                    <span className={b.styleThumb}>{style.card && <Image src={style.card.src} alt="" fill sizes="40px" />}</span>
                    <span>{style.name}</span>
                    <ChevronIcon open={open} size={14} />
                  </>
                )}
              >
                {(close) => (
                  <ul className={b.styles}>
                    {styles.map((s) => (
                      <li key={s.slug}>
                        <button
                          type="button"
                          className={b.style}
                          aria-pressed={s.slug === style.slug}
                          onClick={() => {
                            onChange({ style: s.slug });
                            close();
                          }}
                        >
                          <span className={b.styleArt}>{s.card && <Image src={s.card.src} alt="" fill sizes="160px" />}</span>
                          <span className={b.styleLabel}>{s.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Popover>
            </dd>
          </div>

          <div className={b.field} data-block>
            <dt>
              <label htmlFor={`prompt-${shot.id}`}>Prompt</label>
            </dt>
            <dd>
              <textarea id={`prompt-${shot.id}`} className={b.prompt} value={shot.prompt} rows={5} onChange={(e) => onChange({ prompt: e.target.value })} />
            </dd>
          </div>

          <div className={b.field}>
            <dt>Length</dt>
            <dd className={b.value}>{shot.seconds}s</dd>
          </div>
        </dl>
      </div>

      <div className={b.panelFoot}>
        <div className={b.go}>
          <Btn kind="primary" wide disabled={busy || !shot.prompt.trim()} onClick={onGenerate}>
            {busy ? "Generating" : made ? "Regenerate" : "Generate shot"}
          </Btn>
        </div>
        {shot.takes.length > 1 && (
          <ul className={b.takes} aria-label={`Shot ${n} takes`}>
            {shot.takes.map((t, i) => (
              <li key={i}>
                <button type="button" className={b.take} aria-pressed={i === shot.take} aria-label={`Take ${i + 1}`} disabled={busy} onClick={() => onTake(i)}>
                  <Image src={t.still} alt="" fill sizes="96px" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function Face({ src, size = 24 }: { src: string; size?: number }) {
  return (
    <span className={b.face} style={{ width: size, height: size }}>
      <Image src={src} alt="" fill sizes={`${size * 2}px`} />
    </span>
  );
}

/** A pill that opens a small panel under it. Escape and a press outside close it. */
function Popover({ trigger, label, wide, children }: { trigger: (open: boolean) => ReactNode; label: string; wide?: boolean; children: (close: () => void) => ReactNode }) {
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
        <div ref={panel} role="dialog" aria-label={label} className={b.pop} data-wide={wide || undefined}>
          {children(() => {
            setOpen(false);
            button.current?.focus();
          })}
        </div>
      )}
    </span>
  );
}
