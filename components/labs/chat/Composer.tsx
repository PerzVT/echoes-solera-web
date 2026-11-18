"use client";

import { forwardRef, useId, useRef, useState, type ComponentProps, type DragEvent, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "@/components/labs/Button";
import { GestureIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import c from "./Composer.module.css";

/** The file slot. The composer owns the hidden input and the drop target; the caller owns the file. */
export type ComposerAttachment = {
  /** The input's accept list, such as ".txt,.docx,.fdx,.pdf". */
  accept: string;
  /** The attached file's name, or empty for none. */
  file?: string;
  /** Files picked or dropped. The caller checks the type and keeps what it wants. */
  onAttach: (files: File[]) => void;
  onRemove: () => void;
  /** The attach button's label. Defaults to "Upload a file". */
  label?: string;
  multiple?: boolean;
};

export type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called by the send button, Enter (or Ctrl/Cmd+Enter with submitOn "mod-enter"). Left out, the composer has no send control. */
  onSubmit?: () => void;
  /** The text field's accessible name. */
  label: string;
  placeholder?: string;
  /** The send button's text. Defaults to "Submit". */
  submitLabel?: string;
  attachment?: ComposerAttachment;
  /** Other ways to bring material in, set beside the attach button (use ComposerTool). */
  tools?: ReactNode;
  /** Controls in the foot, after the attach button: a tool, style or series picker. */
  leading?: ReactNode;
  /** The whole composer is out of use: the field and every control. */
  disabled?: boolean;
  /** Whether sending is allowed. Defaults to: there is text or a file. */
  ready?: boolean;
  /** Sent and waiting: the field is read-only, the send button shows the band at work. */
  sending?: boolean;
  /** A message under the text, shown in the danger colour. Empty for none. */
  error?: string;
  /** "large" for a start screen (a tall writing area), "compact" for a field among others. */
  size?: "large" | "compact";
  /** "enter": Enter sends, Shift+Enter makes a new line. "mod-enter": Enter makes a new line, Ctrl/Cmd+Enter sends. */
  submitOn?: "enter" | "mod-enter";
  autoFocus?: boolean;
  id?: string;
  className?: string;
};

/**
 * The prompt box: one rounded surface holding the attached file, the text, an error line and a foot with attach,
 * the caller's controls and send. The writing area has a fixed height and scrolls inside, so the box never grows
 * while typing. Escape leaves the field.
 */
export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  {
    value,
    onChange,
    onSubmit,
    label,
    placeholder,
    submitLabel = "Submit",
    attachment,
    tools,
    leading,
    disabled = false,
    ready,
    sending = false,
    error,
    size = "large",
    submitOn = "enter",
    autoFocus,
    id,
    className,
  },
  ref,
) {
  const auto = useId();
  const fieldId = id ?? `composer-${auto}`;
  const errorId = `${fieldId}-error`;
  const input = useRef<HTMLInputElement>(null);
  const attachBtn = useRef<HTMLButtonElement>(null);
  const [over, setOver] = useState(false);

  const file = attachment?.file || "";
  const canSend = !disabled && !sending && (ready ?? Boolean(value.trim() || file));
  const send = () => {
    if (canSend) onSubmit?.();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.currentTarget.blur();
      return;
    }
    if (e.key !== "Enter" || e.nativeEvent.isComposing || !onSubmit) return;
    const mod = e.metaKey || e.ctrlKey;
    if (submitOn === "enter" ? !e.shiftKey : mod) {
      e.preventDefault();
      send();
    }
  };

  const take = (list: FileList | null) => {
    if (list?.length) attachment?.onAttach(Array.from(list));
  };
  const drop = attachment && !disabled && !sending;
  const onDragOver = (e: DragEvent) => {
    if (!drop || !e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    setOver(true);
  };
  const onDragLeave = (e: DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
  };
  const onDrop = (e: DragEvent) => {
    if (!drop || !e.dataTransfer.files.length) return;
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer.files);
  };

  const state = disabled ? "disabled" : sending ? "sending" : error ? "error" : undefined;
  const hasFoot = Boolean(attachment || tools || leading || onSubmit);

  return (
    <div
      className={[c.box, c[size], className].filter(Boolean).join(" ")}
      data-state={state}
      data-over={over || undefined}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {file && (
        <div className={c.files}>
          <span className={c.chip}>
            <span className={c.chipIcon} aria-hidden="true">
              <Icon name="script" size={16} />
            </span>
            <span className={c.chipName} title={file}>
              {file}
            </span>
            <button
              type="button"
              className={c.chipRemove}
              aria-label={`Remove ${file}`}
              disabled={disabled || sending}
              onClick={() => {
                attachment?.onRemove();
                requestAnimationFrame(() => attachBtn.current?.focus());
              }}
            >
              <Icon name="close" size={14} />
            </button>
          </span>
        </div>
      )}
      <label htmlFor={fieldId} className="sr-only">
        {label}
      </label>
      <textarea
        ref={ref}
        id={fieldId}
        className={c.text}
        placeholder={placeholder}
        value={value}
        spellCheck={false}
        autoFocus={autoFocus}
        disabled={disabled}
        readOnly={sending}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {error && (
        <p id={errorId} className={c.error} role="alert">
          {error}
        </p>
      )}
      {hasFoot && (
        <div className={c.foot}>
          {attachment && (
            <>
              <input ref={input} type="file" accept={attachment.accept} multiple={attachment.multiple} hidden onChange={(e) => (take(e.target.files), (e.target.value = ""))} />
              <button ref={attachBtn} type="button" className={c.attach} disabled={disabled || sending} onClick={() => input.current?.click()}>
                <GestureIcon name="upload" size={18} />
                <span className={c.attachLabel}>{attachment.label ?? "Upload a file"}</span>
              </button>
            </>
          )}
          {tools}
          {leading && <div className={c.leading}>{leading}</div>}
          {onSubmit && (
            <Button className={c.send} disabled={!canSend && !sending} loading={sending} onClick={send} iconAfter={<Icon name="arrow" size={18} />}>
              {submitLabel}
            </Button>
          )}
        </div>
      )}
      {over && (
        <div className={c.dropping} aria-hidden="true">
          <GestureIcon name="upload" size={28} active />
        </div>
      )}
      {sending && <span className={c.band} aria-hidden="true" />}
    </div>
  );
});

/** A button in the composer's foot, drawn like "Upload a file": another way to bring material in. */
export const ComposerTool = forwardRef<HTMLButtonElement, Omit<ComponentProps<"button">, "className"> & { icon: ReactNode }>(function ComposerTool({ icon, children, ...rest }, ref) {
  return (
    <button ref={ref} type="button" {...rest} className={c.attach}>
      {icon}
      <span className={c.attachLabel}>{children}</span>
    </button>
  );
});
