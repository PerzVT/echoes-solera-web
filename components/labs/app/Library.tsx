"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { GestureIcon } from "@/components/labs/fx";
import { Btn, IconBtn } from "@/components/labs/chat/ui";
import { useDismiss } from "@/components/labs/chat/hooks";
import type { SeriesCard } from "@/lib/labs/maker";
import { AppIcon } from "./AppIcon";
import { AppShell } from "./AppShell";
import { episodeKey, useCast } from "./CastProvider";
import { seriesExtra } from "./creator";
import l from "./Library.module.css";

function NewButton() {
  const router = useRouter();
  return (
    <Btn kind="primary" icon={<GestureIcon name="plus" size={18} />} onClick={() => router.push("/app")}>
      New
    </Btn>
  );
}

/** A card's "more" button and its menu. */
function More({ label, items }: { label: string; items: { label: string; run: () => void }[] }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useDismiss(open, panel, () => setOpen(false), button);
  return (
    <span className={l.more}>
      <IconBtn ref={button} label={label} className={l.moreButton} aria-expanded={open} onClick={() => setOpen(!open)}>
        <AppIcon name="more" size={20} />
      </IconBtn>
      {open && (
        <ul ref={panel} className={l.menu}>
          {items.map((it) => (
            <li key={it.label}>
              <button
                type="button"
                className={l.menuItem}
                onClick={() => {
                  setOpen(false);
                  it.run();
                }}
              >
                {it.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

type Undo = { text: string; back: () => void } | null;

/** The line that follows a delete: what went, and Undo. It goes by itself after a few seconds. */
function UndoLine({ undo, onDone }: { undo: Undo; onDone: () => void }) {
  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(onDone, 6000);
    return () => clearTimeout(t);
  }, [undo, onDone]);
  return (
    <div className={l.undo} role="status" data-shown={Boolean(undo)}>
      {undo && (
        <>
          <span className={l.undoText}>{undo.text}</span>
          <Btn
            kind="ghost"
            small
            onClick={() => {
              undo.back();
              onDone();
            }}
          >
            Undo
          </Btn>
        </>
      )}
    </div>
  );
}

const backdropOf = (c: SeriesCard) => seriesExtra[c.slug]?.backdrop ?? c.cover;

function useUndo() {
  const [undo, setUndo] = useState<Undo>(null);
  const [clear] = useState(() => () => setUndo(null));
  return { undo, setUndo, clear };
}

/** /app/library: the mini-series as cards. A card opens the series; its menu renames or deletes it. */
export function LibraryScreen() {
  const store = useCast();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const { undo, setUndo, clear } = useUndo();

  const save = (slug: string) => {
    const t = draft.trim();
    if (t) store.renameSeries(slug, t);
    setRenaming(null);
  };

  return (
    <AppShell view="library" action={<NewButton />}>
      <div className={l.page}>
        <h1 className={l.title}>Library</h1>
        <ul className={l.series}>
          {store.series.map((c, i) => {
            const art = (
              <>
                <span className={l.backdrop} aria-hidden="true">
                  <Image src={backdropOf(c)} alt="" fill sizes="(max-width: 767px) 100vw, 50vw" loading={i < 3 ? "eager" : undefined} />
                </span>
                <span className={l.cover}>
                  <Image src={c.cover} alt="" fill sizes="(max-width: 767px) 72px, 104px" loading="eager" />
                </span>
              </>
            );
            return (
              <li key={c.slug} className={l.cardItem}>
                {renaming === c.slug ? (
                  <div className={l.card}>
                    {art}
                    <input
                      className={l.rename}
                      aria-label="Series name"
                      value={draft}
                      autoFocus
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => save(c.slug)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") save(c.slug);
                        if (e.key === "Escape") setRenaming(null);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <Link href={`/app/series/${c.slug}`} className={l.card}>
                      {art}
                      <span className={l.name}>{c.title}</span>
                    </Link>
                    <More
                      label={`More for ${c.title}`}
                      items={[
                        {
                          label: "Rename",
                          run: () => {
                            setDraft(c.title);
                            setRenaming(c.slug);
                          },
                        },
                        {
                          label: "Delete",
                          run: () => {
                            store.deleteSeries(c.slug, false);
                            setUndo({ text: `${c.title} deleted`, back: () => store.deleteSeries(c.slug, true) });
                          },
                        },
                      ]}
                    />
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <UndoLine undo={undo} onDone={clear} />
    </AppShell>
  );
}

/** One series: its episodes. An episode opens its Results; its menu deletes it. */
export function SeriesEpisodes({ slug }: { slug: string }) {
  const store = useCast();
  const { undo, setUndo, clear } = useUndo();
  const card = store.series.find((x) => x.slug === slug);
  if (!card)
    return (
      <AppShell view="library" action={<NewButton />}>
        <div className={l.page}>
          <h1 className={l.title}>Not found</h1>
          <Link href="/app/library" className={l.link}>
            Library
          </Link>
        </div>
      </AppShell>
    );
  return (
    <AppShell view="library" action={<NewButton />}>
      <div className={l.page}>
        <header className={l.head}>
          <span className={l.headCover}>
            <Image src={card.cover} alt="" fill sizes="72px" loading="eager" />
          </span>
          <h1 className={l.title}>{card.title}</h1>
        </header>
        <ul className={l.episodes}>
          {store.episodesIn(slug).map((e) => (
            <li key={e.name} className={l.cardItem}>
              <Link href={`/app/episode/results?series=${encodeURIComponent(slug)}&episode=${encodeURIComponent(e.name)}`} className={l.episode}>
                <span className={l.poster}>{e.poster && <Image src={e.poster} alt="" fill sizes="(max-width: 767px) 45vw, 240px" />}</span>
                <span className={l.episodeName}>{e.name}</span>
              </Link>
              <More
                label={`More for ${e.name}`}
                items={[
                  {
                    label: "Delete",
                    run: () => {
                      const key = episodeKey(slug, e.name);
                      store.deleteEpisode(key, false);
                      setUndo({ text: `${e.name} deleted`, back: () => store.deleteEpisode(key, true) });
                    },
                  },
                ]}
              />
            </li>
          ))}
        </ul>
      </div>
      <UndoLine undo={undo} onDone={clear} />
    </AppShell>
  );
}
