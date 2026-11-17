"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppBar } from "@/components/labs/chat/AppBar";
import { Btn } from "@/components/labs/chat/ui";
import { Icon } from "@/components/labs/Icon";
import { MoreMenu } from "./Cards";
import type { Canvas } from "./data";
import { useAnime } from "./store";
import l from "./list.module.css";

const UNDO_MS = 6000;

/** Every anime canvas as a card: its cover, its name and its episodes. New starts the flow. */
export function CanvasList() {
  const router = useRouter();
  const { canvases, renameCanvas, removeCanvas } = useAnime();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ text: string; restore: () => void } | null>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const remove = (c: Canvas) => {
    const restore = removeCanvas(c.id);
    window.clearTimeout(timer.current);
    setUndo({ text: `${c.name} deleted`, restore });
    timer.current = window.setTimeout(() => setUndo(null), UNDO_MS);
  };

  return (
    <div className={l.page}>
      <AppBar
        tool="anime"
        view="library"
        action={
          <Btn kind="primary" icon={<Icon name="plus" size={16} />} onClick={() => router.push("/app/anime/new")}>
            New
          </Btn>
        }
      />
      <main id="main" className={l.main}>
        <h1 className={l.heading}>Anime</h1>
        <ul className={l.grid}>
          {canvases.map((c) => (
            <li key={c.id}>
              <article className={l.card} aria-label={c.name}>
                <Link href={`/app/anime/${c.id}`} className={l.open} aria-label={`Open ${c.name}`}>
                  <span className={l.cover}>
                    <Image src={c.cover} alt="" fill sizes="(max-width: 767px) 100vw, 420px" />
                  </span>
                </Link>
                <div className={l.nameRow}>
                  {renaming === c.id ? (
                    <input
                      autoFocus
                      className={l.nameInput}
                      aria-label="Canvas name"
                      defaultValue={c.name}
                      onFocus={(e) => e.currentTarget.select()}
                      onBlur={(e) => {
                        const v = e.currentTarget.value.trim();
                        if (v) renameCanvas(c.id, v);
                        setRenaming(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") {
                          e.currentTarget.value = c.name;
                          e.currentTarget.blur();
                        }
                      }}
                    />
                  ) : (
                    <Link href={`/app/anime/${c.id}`} className={l.name}>
                      {c.name}
                    </Link>
                  )}
                  <MoreMenu
                    label={`${c.name} options`}
                    className={l.more}
                    items={[
                      { label: "Rename", onSelect: () => setRenaming(c.id) },
                      { label: "Delete", danger: true, onSelect: () => remove(c) },
                    ]}
                  />
                </div>
                <nav className={l.eps} aria-label={`${c.name} episodes`}>
                  {c.episodes.map((_, i) => (
                    <Link key={i} href={`/app/anime/${c.id}${i ? `?ep=${i + 1}` : ""}`} className={l.ep}>
                      Episode {i + 1}
                    </Link>
                  ))}
                </nav>
              </article>
            </li>
          ))}
        </ul>
      </main>
      {undo && (
        <div className={l.undo} role="status">
          <span>{undo.text}</span>
          <Btn
            kind="ghost"
            small
            onClick={() => {
              undo.restore();
              setUndo(null);
            }}
          >
            Undo
          </Btn>
        </div>
      )}
    </div>
  );
}
