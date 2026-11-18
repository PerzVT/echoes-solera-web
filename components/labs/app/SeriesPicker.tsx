"use client";

import { forwardRef, type ReactNode } from "react";
import { ChevronIcon } from "@/components/labs/fx";
import st from "./ScriptStep.module.css";

export const NEW_SERIES = "__new";
export const NO_SERIES = "__none";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** The series to pick from, in order. "New series" is added at the end; `none` adds a first choice for none. */
  options: { value: string; label: string }[];
  /** The first choice's label when a piece can stand alone, such as "No series". */
  none?: string;
  newName: string;
  onNewName: (name: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
  label?: string;
  /** Other controls set in the same row, before the series. */
  before?: ReactNode;
};

/**
 * The series picker in a start box's foot, the same on every tool: a select ending in "New series", and the new
 * series' name field once that is picked. The ref is the name field, for focus.
 */
export const SeriesPicker = forwardRef<HTMLInputElement, Props>(function SeriesPicker({ value, onChange, options, none, newName, onNewName, onEnter, disabled, label = "Series", before }, ref) {
  return (
    <div className={st.end}>
      {before}
      <label className={st.series}>
        <span className={st.seriesLabel}>{label}</span>
        <span className={st.selectWrap}>
          <select className={st.select} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
            {none && <option value={NO_SERIES}>{none}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            <option value={NEW_SERIES}>New series</option>
          </select>
          <ChevronIcon open={false} size={16} />
        </span>
      </label>
      {value === NEW_SERIES && (
        <input
          ref={ref}
          className={st.name}
          aria-label="Series name"
          placeholder="Series name"
          value={newName}
          disabled={disabled}
          onChange={(e) => onNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEnter?.();
          }}
        />
      )}
    </div>
  );
});
