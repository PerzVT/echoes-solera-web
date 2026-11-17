"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { ChevronIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { pickerStyles, productionTypes, type ProductionType } from "./data";
import { useDismiss } from "./hooks";
import { Pill, cx } from "./ui";
import type { Style } from "@/lib/labs/styles";
import p from "./popover.module.css";

type Place = "down" | "up";

/** A pill that opens a small panel under (or over) it. Escape and a press outside close it. */
export function Popover({ trigger, label, place = "down", align = "start", wide, children, pillClass }: { trigger: (open: boolean) => ReactNode; label: string; place?: Place; align?: "start" | "end"; wide?: boolean; pillClass?: string; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);
  useDismiss(open, panel, close, button);
  return (
    <span className={p.wrap}>
      <Pill ref={button} className={pillClass} aria-expanded={open} aria-haspopup="dialog" aria-label={label} onClick={() => setOpen(!open)}>
        {trigger(open)}
      </Pill>
      {open && (
        <div ref={panel} role="dialog" aria-label={label} className={cx(p.panel, wide && p.wide)} data-place={place} data-align={align}>
          {children(() => {
            close();
            button.current?.focus();
          })}
        </div>
      )}
    </span>
  );
}

export function TypeControl({ value, onChange, place, align, compact }: { value: ProductionType; onChange: (t: ProductionType) => void; place?: Place; align?: "start" | "end"; compact?: boolean }) {
  return (
    <Popover
      label={`Production type, ${value}`}
      place={place}
      align={align}
      pillClass={compact ? p.compact : undefined}
      trigger={(open) => (
        <>
          <span>{value}</span>
          <ChevronIcon open={open} size={14} />
        </>
      )}
    >
      {(close) => (
        <ul className={p.menu}>
          {productionTypes.map((t) => (
            <li key={t}>
              <button
                type="button"
                className={p.item}
                aria-pressed={t === value}
                onClick={() => {
                  onChange(t);
                  close();
                }}
              >
                <span>{t}</span>
                {t === value && <Icon name="check" size={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  );
}

export function StyleThumb({ style, size = 20 }: { style: Style; size?: number }) {
  return (
    <span className={p.thumb} style={{ width: size, height: size }}>
      {style.card && <Image src={style.card.src} alt="" fill sizes={`${size * 2}px`} />}
    </span>
  );
}

export function StyleControl({ value, onChange, place, align, compact }: { value: Style; onChange: (s: Style) => void; place?: Place; align?: "start" | "end"; compact?: boolean }) {
  return (
    <Popover
      label={`Style, ${value.name}`}
      place={place}
      align={align}
      wide
      pillClass={compact ? p.compact : undefined}
      trigger={() => (
        <>
          <StyleThumb style={value} />
          <span className={p.styleName}>{value.name}</span>
        </>
      )}
    >
      {(close) => (
        <StyleGrid
          value={value}
          onPick={(s) => {
            onChange(s);
            close();
          }}
        />
      )}
    </Popover>
  );
}

/** Style tiles: image, name under it, the chosen one ringed. "In use" styles come first. */
export function StyleGrid({ value, onPick, limit }: { value: Style; onPick: (s: Style) => void; limit?: number }) {
  const list = limit ? pickerStyles.slice(0, limit) : pickerStyles;
  return (
    <ul className={p.styles}>
      {list.map((s) => (
        <li key={s.slug}>
          <button type="button" className={p.style} aria-pressed={s.slug === value.slug} onClick={() => onPick(s)}>
            <span className={p.styleArt}>{s.card && <Image src={s.card.src} alt="" fill sizes="160px" />}</span>
            <span className={p.styleLabel}>{s.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** On a phone: one control in the top bar that opens a sheet with both the production type and the style. */
export function SettingsControl({ type, style, onType, onStyle }: { type: ProductionType; style: Style; onType: (t: ProductionType) => void; onStyle: (s: Style) => void }) {
  return (
    <Popover label={`Settings, ${type}, ${style.name}`} align="end" wide pillClass={p.thumbPill} trigger={() => <StyleThumb style={style} size={28} />}>
      {(close) => (
        <div className={p.sheet}>
          <h2 className={p.sheetLabel}>Type</h2>
          <div className={p.segment} role="radiogroup" aria-label="Type">
            {productionTypes.map((t) => (
              <button key={t} type="button" role="radio" aria-checked={t === type} className={p.segmentItem} onClick={() => onType(t)}>
                {t}
              </button>
            ))}
          </div>
          <h2 className={p.sheetLabel}>Style</h2>
          <StyleGrid
            value={style}
            onPick={(s) => {
              onStyle(s);
              close();
            }}
          />
        </div>
      )}
    </Popover>
  );
}
