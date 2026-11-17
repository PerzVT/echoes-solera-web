"use client";

import { useLayoutEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/labs/Icon";
import { reviewWord, statusWord, type Scene, type Shot } from "./data";
import { useDismiss } from "./hooks";
import { Thumb } from "./Thumb";
import b from "./board.module.css";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** The few glyphs the storyboard needs beyond the brand set, on the same grid (24px, 1.75 stroke). */
const glyphs = {
  more: "M5 12h.01M12 12h.01M19 12h.01",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  copy: "M8 8h12v12H8ZM16 8V4H4v12h4",
  minus: "M5 12h14",
} as const;
export function Glyph({ name, size = 18 }: { name: keyof typeof glyphs; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === "more" ? 3 : 1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={glyphs[name]} />
    </svg>
  );
}

export type MenuItem = { label: string; onSelect: () => void; disabled?: boolean; danger?: boolean };

/** A small "more" button and its menu. The menu is fixed to the window so a scrolling strip never clips it. */
export function MoreMenu({ label, items, className }: { label: string; items: MenuItem[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useDismiss(open, panel, () => setOpen(false), button);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = button.current?.getBoundingClientRect();
      if (!r) return;
      const h = panel.current?.offsetHeight ?? 240;
      const up = r.bottom + h + 8 > window.innerHeight && r.top > h + 8;
      setPos({ top: up ? r.top - h - 4 : r.bottom + 4, left: Math.max(8, Math.min(window.innerWidth - 248, r.right - 240)), up });
    };
    place();
    const close = () => setOpen(false);
    // A scroll moves the menu with its button; it closes only once the button has left the window.
    const follow = () => {
      const r = button.current?.getBoundingClientRect();
      if (!r || r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) close();
      else place();
    };
    window.addEventListener("resize", close);
    document.addEventListener("scroll", follow, true);
    return () => {
      window.removeEventListener("resize", close);
      document.removeEventListener("scroll", follow, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        className={cx(b.more, className)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        data-open={open || undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <Glyph name="more" size={16} />
      </button>
      {open &&
        createPortal(
        <div ref={panel} role="menu" aria-label={label} className={b.menuPop} style={pos ? { top: pos.top, left: pos.left } : { visibility: "hidden" }}>
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              className={b.menuItem}
              data-danger={it.danger || undefined}
              disabled={it.disabled}
              onClick={() => {
                setOpen(false);
                it.onSelect();
              }}
            >
              {it.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}

export type Drop = { sceneId: string; at: number };

type CardProps = {
  shot: Shot;
  n: number;
  scene: Scene;
  index: number;
  selected: boolean;
  variant: "strip" | "board";
  menu: MenuItem[];
  onSelect: () => void;
  onAddBefore: () => void;
  onDrop: (id: string, to: Drop) => void;
  sizes: string;
};

export const DRAG_TYPE = "application/x-nine-lives-shot";

/** One shot card: its frame, number and label, a "more" menu, an add control on its left edge, and a drag handle in the card itself. */
export function ShotCard({ shot, n, scene, index, selected, variant, menu, onSelect, onAddBefore, onDrop, sizes }: CardProps) {
  const [over, setOver] = useState<"before" | "after" | null>(null);
  const [dragging, setDragging] = useState(false);
  const side = (e: DragEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    return e.clientX < r.left + r.width / 2 ? "before" : "after";
  };
  return (
    <li
      className={cx(b.cardItem, variant === "strip" ? b.stripItem : b.boardItem)}
      data-drop={over ?? undefined}
      data-dragging={dragging || undefined}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOver(side(e));
      }}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setOver(null)}
      onDrop={(e) => {
        const id = e.dataTransfer.getData(DRAG_TYPE);
        const where = side(e);
        setOver(null);
        if (!id) return;
        e.preventDefault();
        onDrop(id, { sceneId: scene.id, at: where === "before" ? index : index + 1 });
      }}
    >
      <button type="button" className={b.addBefore} aria-label={`Add a shot before shot ${n}`} onClick={onAddBefore}>
        <Icon name="plus" size={14} />
      </button>
      <div
        className={cx(b.card, variant === "strip" ? b.stripCard : b.boardCard)}
        aria-current={selected || undefined}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(DRAG_TYPE, shot.id);
          e.dataTransfer.effectAllowed = "move";
          setDragging(true);
        }}
        onDragEnd={() => setDragging(false)}
      >
        <button type="button" data-shot={shot.id} className={b.cardPick} aria-pressed={selected} onClick={onSelect} aria-label={`Shot ${n}, ${shot.label}, ${shot.review ? reviewWord[shot.review] : statusWord[shot.status]}`}>
          <Thumb shot={shot} sizes={sizes} />
          <span className={b.cardLabel}>
            <span className={b.num}>{n}</span>
            <span className={b.cardName}>{shot.label}</span>
          </span>
          {variant === "board" && shot.action && <span className={b.cardAction}>{shot.action}</span>}
          {variant === "board" && (
            <span className={b.cardStatus} data-status={shot.review ?? shot.status}>
              {shot.review ? reviewWord[shot.review] : statusWord[shot.status]}
            </span>
          )}
        </button>
        <MoreMenu label={`Shot ${n} options`} items={menu} className={b.cardMore} />
      </div>
    </li>
  );
}

/** The card closing each scene: adds a shot at its end, and takes a dropped shot there. */
export function EndCard({ scene, variant, onAdd, onDrop }: { scene: Scene; variant: "strip" | "board"; onAdd: () => void; onDrop: (id: string, to: Drop) => void }) {
  const [over, setOver] = useState(false);
  return (
    <li
      className={cx(b.cardItem, variant === "strip" ? b.stripItem : b.boardItem)}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        const id = e.dataTransfer.getData(DRAG_TYPE);
        setOver(false);
        if (!id) return;
        e.preventDefault();
        onDrop(id, { sceneId: scene.id, at: scene.shots.length });
      }}
    >
      <button type="button" className={cx(b.newCard, variant === "board" && b.newCardBoard)} data-over={over || undefined} onClick={onAdd}>
        <span className={b.newArt}>
          <Icon name="plus" size={18} />
        </span>
        <span className={b.cardLabel}>New shot</span>
      </button>
    </li>
  );
}

/** A scene's heading, edited in place, and its menu. */
export function SceneHead({ scene, n, menu, onRename, children }: { scene: Scene; n: number; menu: MenuItem[]; onRename: (heading: string) => void; children?: ReactNode }) {
  return (
    <div className={b.sceneHead}>
      <span className={b.sceneNum}>{n}</span>
      {children}
      <input
        className={b.sceneInput}
        aria-label={`Scene ${n} heading`}
        value={scene.heading}
        size={Math.max(8, scene.heading.length + 2)}
        spellCheck={false}
        onChange={(e) => onRename(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
      <MoreMenu label={`Scene ${n} options`} items={menu} className={b.sceneMore} />
    </div>
  );
}
