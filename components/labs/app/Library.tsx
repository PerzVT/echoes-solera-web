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
import { Alert } from "./parts";
import { LibraryGrid } from "./LibraryGrid";
import { api } from "./api";
import type { EpisodeItem } from "./creator";
import { episodeKey, useCast } from "./CastProvider";
import l from "./Library.module.css";

function NewButton() {
  const router = useRouter();
  const { profile } = useCast();
  return (
    <Btn kind="primary" icon={<GestureIcon name="plus" size={18} />} onClick={() => router.push(profile.steps.script)}>
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

/** A saved series has no backdrop of its own; until its first episode is finished it has no cover either. */
const backdropOf = (c: SeriesCard, extra: Record<string, { backdrop: string }>) => extra[c.slug]?.backdrop ?? c.cover;

function useUndo() {
  const [undo, setUndo] = useState<Undo>(null);
  const [clear] = useState(() => () => setUndo(null));
  return { undo, setUndo, clear };
}

/** /app/library and /app/anime/library: the tool's series as cards, newest first. A card opens the series; its menu renames or deletes it. */
export function LibraryScreen() {
  const store = useCast();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const { undo, setUndo, clear } = useUndo();
  const [error, setError] = useState("");
  // A series made from a storyboard or a manga has no episode to take a picture from: its first drawn frame or page
  // stands in for it.
  const [workArt, setWorkArt] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    Promise.all([api.listStoryboards().catch(() => []), api.listMangas().catch(() => [])]).then(([boards, mangas]) => {
      if (!alive) return;
      const art: Record<string, string> = {};
      for (const t of [...boards, ...mangas]) {
        const src = "frames" in t ? t.frames.find((f) => f.image)?.image : t.pages.find((pg) => pg.image)?.image;
        if (t.seriesId && src && !art[t.seriesId]) art[t.seriesId] = src;
      }
      setWorkArt(art);
    });
    return () => {
      alive = false;
    };
  }, []);

  const save = (slug: string) => {
    const t = draft.trim();
    setRenaming(null);
    if (!t) return;
    setError("");
    store.renameSeries(slug, t).catch((e: unknown) => setError(e instanceof Error && e.message ? e.message : "The new name did not save. Try again."));
  };

  return (
    <AppShell view="library" action={<NewButton />}>
      <LibraryGrid
        shape="wide"
        error={error}
        items={store.series.map((c) => ({
          id: c.slug,
          title: c.title,
          date: c.createdAt,
          meta: store.episodesIn(c.slug).length ? `${store.episodesIn(c.slug).length} ${store.episodesIn(c.slug).length === 1 ? "episode" : "episodes"}` : null,
          covers: [backdropOf(c, store.profile.extra), c.cover, workArt[c.slug]].filter((x): x is string => Boolean(x)),
          href: store.profile.seriesHref(c.slug),
          editing:
            renaming === c.slug ? (
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
            ) : undefined,
          menu: [
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
          ],
        }))}
      />
      <UndoLine undo={undo} onDone={clear} />
    </AppShell>
  );
}

/** One series: its episodes. An episode opens its Results; its menu deletes it. */
export function SeriesEpisodes({ slug }: { slug: string }) {
  const store = useCast();
  const router = useRouter();
  const { undo, setUndo, clear } = useUndo();
  const [opening, setOpening] = useState<string | null>(null);
  const [error, setError] = useState("");
  /** A saved episode is loaded from the server first, then opens on the step it reached. */
  const openSaved = async (e: EpisodeItem) => {
    if (!e.id || opening) return;
    setOpening(e.id);
    setError("");
    try {
      router.push(await store.openSaved(e.id));
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "That episode did not open. Try again.");
      setOpening(null);
    }
  };
  const card = store.series.find((x) => x.slug === slug);
  if (!card)
    return (
      <AppShell view="library" action={<NewButton />}>
        <div className={l.page}>
          <h1 className={l.title}>Not found</h1>
          <Link href={store.profile.library} className={l.link}>
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
            {card.cover && <Image src={card.cover} alt="" fill sizes="72px" loading="eager" />}
          </span>
          <h1 className={l.title}>{card.title}</h1>
        </header>
        {error && <Alert>{error}</Alert>}
        <ul className={l.episodes}>
          {store.episodesIn(slug).map((e) => (
            <li key={e.name} className={l.cardItem}>
              <Link
                href={e.id ? store.profile.steps.results : `${store.profile.steps.results}?series=${encodeURIComponent(slug)}&episode=${encodeURIComponent(e.name)}`}
                className={l.episode}
                aria-busy={opening === e.id || undefined}
                onClick={
                  e.id
                    ? (ev) => {
                        ev.preventDefault();
                        void openSaved(e);
                      }
                    : undefined
                }
              >
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
