"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { AsciiField, GestureIcon, Skeleton } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { Icon } from "@/components/labs/Icon";
import { Btn, IconBtn } from "@/components/labs/chat/ui";
import { useDismiss } from "@/components/labs/chat/hooks";
import type { Frame } from "./api";
import { AppIcon } from "./AppIcon";
import { storyboardStyles } from "./fixtures";
import { cancelWave, preloadWave, sendWave } from "./fx/Wave";
import { generationReady, makeStoryboard, regenerateFrame } from "./generate";
import { Alert, SaveAction, useSaveThen } from "./parts";
import { LibraryGrid } from "./LibraryGrid";
import { Record } from "./Record";
import { seriesTitle, useSeriesOptions } from "./seriesOptions";
import { SourceStart } from "./SourceStart";
import { StylePicker } from "./StylePicker";
import { titleOf, useStoryboards } from "./work";
import { WorkShell, type WorkStepDef } from "./WorkShell";
import b from "./Storyboard.module.css";

export const BOARD_STEPS: WorkStepDef[] = [
  { key: "scene", label: "Scene", href: "/app/storyboard?edit=1" },
  { key: "style", label: "Style", href: "/app/storyboard/style" },
  { key: "board", label: "Board", href: "/app/storyboard/board" },
];
const LIBRARY = "/app/storyboard/library";

const message = (e: unknown, fallback = "That did not save. Try again.") => (e instanceof Error && e.message ? e.message : fallback);

/* ---------- Scene ---------- */

/** /app/storyboard: a scene or script passage to board. Opened from the step bar (?edit=1) it shows the current board's scene. */
export function StoryboardStart({ edit }: { edit: boolean }) {
  const router = useRouter();
  const work = useStoryboards();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const editing = edit ? work.current : null;
  if (edit && work.opening) return <WorkLoading tool="storyboard" steps={BOARD_STEPS} step="scene" />;

  const submit = async (source: string, seriesId: string | null) => {
    setSending(true);
    setError("");
    sendWave();
    try {
      if (editing) {
        // A changed scene is boarded again from the start.
        if (source !== editing.source) work.patch({ source, frames: [], step: "style" });
        if (seriesId !== (editing.seriesId ?? null)) work.patch({ seriesId });
        await work.flush();
      } else {
        await work.create(titleOf(source, "Storyboard"), source, seriesId);
        work.patch({ step: "style" });
      }
      router.push("/app/storyboard/style");
    } catch (e) {
      cancelWave();
      setError(message(e));
      setSending(false);
    }
  };

  return (
    <SourceStart
      key={editing?.id ?? "new"}
      tool="storyboard"
      steps={BOARD_STEPS}
      reached={editing?.step}
      label="Scene"
      placeholder="Paste a scene or a script passage"
      initial={editing?.source}
      initialSeries={editing?.seriesId}
      sending={sending}
      error={error}
      onSubmit={submit}
    />
  );
}

/** What a step shows while the board is read back after a reload, or when there is none to show. */
function useCurrentBoard() {
  const router = useRouter();
  const work = useStoryboards();
  useEffect(() => {
    if (!work.opening && !work.current && !work.openError) router.replace("/app/storyboard");
  }, [work.opening, work.current, work.openError, router]);
  return work;
}

/* ---------- Style ---------- */

export function StoryboardStyle() {
  const router = useRouter();
  const work = useCurrentBoard();
  const saving = useSaveThen(work.flush);
  useEffect(preloadWave, []);
  const board = work.current;
  if (!board) return <WorkLoading tool="storyboard" steps={BOARD_STEPS} step="style" error={work.openError} />;
  const chosen = board.style ?? storyboardStyles[0].slug;
  return (
    <WorkShell
      tool="storyboard"
      view="create"
      steps={BOARD_STEPS}
      step="style"
      reached={board.step}
      fit
      action={
        <SaveAction error={saving.error}>
          <Btn
            kind="primary"
            loading={saving.busy}
            icon={<Icon name="generate" size={16} />}
            onClick={(e) => {
              const btn = e.currentTarget;
              // Generating draws every frame again in the chosen style.
              work.patch({ style: chosen, frames: [], step: "board" });
              const taken = saving.go(() => router.push("/app/storyboard/board"));
              sendWave(btn, { when: Promise.all([taken, generationReady()]).then((ok) => ok.every(Boolean)) });
            }}
          >
            Generate
          </Btn>
        </SaveAction>
      }
    >
      <StylePicker groups={[{ items: storyboardStyles }]} chosen={chosen} onChoose={(style) => work.patch({ style })} />
    </WorkShell>
  );
}

/* ---------- Board ---------- */

/** The board: numbered frames with their shot notes. Frames reorder by dragging or from their menu, take a new title and note, and can be drawn again one at a time. */
export function StoryboardBoard() {
  const router = useRouter();
  const work = useCurrentBoard();
  const series = useSeriesOptions();
  const saving = useSaveThen(work.flush);
  const board = work.current;
  const frames = board?.frames ?? [];
  const [making, setMaking] = useState(false);
  const [makeError, setMakeError] = useState("");
  const [redrawing, setRedrawing] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<number | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [said, setSaid] = useState("");
  /** The frames as they come in while the board is made: the plan first, then each picture as it is drawn. */
  const [progress, setProgress] = useState<Frame[] | null>(null);
  const [redrawError, setRedrawError] = useState("");
  const asked = useRef("");
  /** Bumped by Try again, so a failed first draw runs again. */
  const [tries, setTries] = useState(0);
  const alive = useRef(true);
  const stop = useRef<AbortController | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      // Stopped only when the screen is really left: a remount straight after (React's development check) keeps it going.
      window.setTimeout(() => !alive.current && stop.current?.abort(), 0);
    };
  }, []);

  // A board with no frames yet is drawn as soon as it opens, also after a reload part way.
  const id = board?.id;
  const empty = Boolean(board) && frames.length === 0;
  useEffect(() => {
    if (!board || !empty || asked.current === board.id) return;
    asked.current = board.id;
    setMaking(true);
    setMakeError("");
    setProgress(null);
    stop.current?.abort();
    const s = new AbortController();
    stop.current = s;
    makeStoryboard({ source: board.source, style: board.style ?? storyboardStyles[0].slug, onFrames: (f) => alive.current && setProgress(f) }, s.signal).then(
      ({ frames: made }) => {
        if (!alive.current) return;
        work.patch({ frames: made, step: "board" });
        setProgress(null);
        setMaking(false);
        setSaid("The board is ready.");
      },
      (e: unknown) => {
        if (!alive.current || s.signal.aborted) return;
        cancelWave();
        setProgress(null);
        setMaking(false);
        setMakeError(message(e, "The board did not come back. Try again."));
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, empty, tries]);

  if (!board) return <WorkLoading tool="storyboard" steps={BOARD_STEPS} step="board" error={work.openError} />;

  const setFrames = (next: Frame[]) => work.patch({ frames: next });
  const edit = (fid: string, p: Partial<Frame>) => setFrames(frames.map((f) => (f.id === fid ? { ...f, ...p } : f)));
  const move = (fid: string, to: number) => {
    const from = frames.findIndex((f) => f.id === fid);
    if (from < 0 || to < 0 || to >= frames.length || from === to) return;
    const next = [...frames];
    const [f] = next.splice(from, 1);
    next.splice(to, 0, f);
    setFrames(next);
    setSaid(`Frame moved to ${to + 1}.`);
  };
  const remove = (fid: string) => {
    setFrames(frames.filter((f) => f.id !== fid));
    setSaid("Frame removed.");
  };
  const redraw = (f: Frame) => {
    setRedrawing((s) => new Set(s).add(f.id));
    setRedrawError("");
    setSaid(`Drawing frame ${frames.indexOf(f) + 1} again.`);
    regenerateFrame({ frame: f, style: board.style ?? storyboardStyles[0].slug, source: board.source })
      .then(({ frame }) => {
        if (!alive.current) return;
        // Applied to the board as it is now, so edits made meanwhile stay.
        const latest = work.current?.frames ?? [];
        work.patch({ frames: latest.map((x) => (x.id === f.id ? { ...x, image: frame.image, made: frame.made } : x)) });
        setSaid("Frame drawn again.");
      })
      .catch((e: unknown) => {
        if (!alive.current) return;
        setSaid("That frame did not come back. Try again.");
        setRedrawError(message(e, "That frame did not come back. Try again."));
      })
      .finally(() => alive.current && setRedrawing((s) => (s.delete(f.id), new Set(s))));
  };
  const again = () => {
    asked.current = "";
    work.patch({ frames: [] });
    setTries((t) => t + 1);
  };

  const onDrop = (e: DragEvent, to: number) => {
    e.preventDefault();
    if (dragging) move(dragging, to);
    setDragging(null);
  };

  const viewed = viewing !== null ? frames[viewing] : undefined;

  return (
    <WorkShell
      tool="storyboard"
      view="create"
      steps={BOARD_STEPS}
      step="board"
      reached="board"
      action={
        <SaveAction error={saving.error}>
          <Btn kind="primary" icon={<Icon name="check" size={16} />} disabled={making || frames.length === 0} loading={saving.busy} onClick={() => void saving.go(() => router.push(LIBRARY))}>
            Done
          </Btn>
        </SaveAction>
      }
    >
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      <div className={b.page}>
        <header className={b.head}>
          <h1 className={b.title}>{board.title}</h1>
          <div className={b.headActions}>
            <Export title={board.title} frames={frames} disabled={making || frames.length === 0} />
          </div>
        </header>
        {makeError && (
          <div className={b.failed}>
            <Alert>{makeError}</Alert>
            <Btn kind="secondary" icon={<Icon name="replay" size={16} />} onClick={again}>
              Try again
            </Btn>
          </div>
        )}
        {redrawError && <Alert>{redrawError}</Alert>}
        {making && progress ? (
          <ol className={b.grid} aria-busy="true" aria-label="Frames">
            {progress.map((f, i) => (
              <li key={f.id} className={b.card}>
                <div className={b.art}>
                  {f.image ? (
                    <Image src={f.image} alt="" fill sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  ) : (
                    <AsciiField mode="scan" cell={7} intensity={0.5} speed={1.15} className={b.glyphs} />
                  )}
                  <span className={b.num}>{i + 1}</span>
                </div>
                <div className={b.cardHead}>
                  <p className={b.frameTitle}>{f.title}</p>
                </div>
                <p className={b.note}>{f.note}</p>
              </li>
            ))}
          </ol>
        ) : making ? (
          <ol className={b.grid} aria-busy="true" aria-label="Frames">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className={b.card}>
                <div className={b.art}>
                  <AsciiField mode="scan" cell={7} intensity={0.5} speed={1.15} className={b.glyphs} />
                </div>
                <Skeleton width="40%" height={20} radius={6} index={i} />
                <Skeleton height={44} radius={6} index={i} />
              </li>
            ))}
          </ol>
        ) : (
          <ol className={b.grid} aria-label="Frames">
            {frames.map((f, i) => (
              <li
                key={f.id}
                className={b.card}
                data-dragging={dragging === f.id || undefined}
                draggable
                onDragStart={(e) => {
                  if ((e.target as HTMLElement).closest("input, textarea")) return e.preventDefault();
                  setDragging(f.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDragging(null)}
                onDragOver={(e) => {
                  if (!dragging) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => onDrop(e, i)}
              >
                <button type="button" className={b.art} onClick={() => setViewing(i)} aria-label={`Frame ${i + 1}, full screen`}>
                  <Image src={f.image} alt="" fill sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 33vw" loading={i < 6 ? "eager" : undefined} />
                  <span className={b.num}>{i + 1}</span>
                  {redrawing.has(f.id) && (
                    <span className={b.develop}>
                      <AsciiField mode="scan" cell={7} intensity={0.5} speed={1.15} className={b.glyphs} />
                    </span>
                  )}
                </button>
                <div className={b.cardHead}>
                  <input className={b.frameTitle} aria-label={`Frame ${i + 1} title`} value={f.title} placeholder="Shot" onChange={(e) => edit(f.id, { title: e.target.value })} />
                  <Btn kind="ghost" small loading={redrawing.has(f.id)} icon={<Icon name="replay" size={16} />} onClick={() => redraw(f)}>
                    Regenerate
                  </Btn>
                  <FrameMenu
                    n={i + 1}
                    first={i === 0}
                    last={i === frames.length - 1}
                    onEarlier={() => move(f.id, i - 1)}
                    onLater={() => move(f.id, i + 1)}
                    onRemove={() => remove(f.id)}
                  />
                </div>
                <textarea className={b.note} aria-label={`Frame ${i + 1} shot note`} value={f.note} rows={3} onChange={(e) => edit(f.id, { note: e.target.value })} />
              </li>
            ))}
          </ol>
        )}
      </div>
      <Record
        open={Boolean(viewed)}
        label={viewed ? `Frame ${(viewing ?? 0) + 1}` : "Frame"}
        onClose={() => setViewing(null)}
        onPrev={viewing !== null && viewing > 0 ? () => setViewing(viewing - 1) : undefined}
        onNext={viewing !== null && viewing < frames.length - 1 ? () => setViewing(viewing + 1) : undefined}
        info={
          viewed
            ? { title: `Frame ${(viewing ?? 0) + 1}. ${viewed.title}`, note: viewed.note, made: viewed.made, tool: "Storyboard", project: seriesTitle(series, board.seriesId) ?? board.title, owner: board.owner }
            : null
        }
      >
        {viewed && <Image src={viewed.image} alt={viewed.note} fill sizes="(max-width: 900px) 100vw, 70vw" />}
      </Record>
    </WorkShell>
  );
}

function FrameMenu({ n, first, last, onEarlier, onLater, onRemove }: { n: number; first: boolean; last: boolean; onEarlier: () => void; onLater: () => void; onRemove: () => void }) {
  const items = [
    !first && { label: "Move earlier", run: onEarlier },
    !last && { label: "Move later", run: onLater },
    { label: "Remove", run: onRemove },
  ].filter(Boolean) as { label: string; run: () => void }[];
  return <Menu label={`More for frame ${n}`} items={items} />;
}

/** A "more" button and its menu. */
export function Menu({ label, items, icon }: { label: string; items: { label: string; run: () => void }[]; icon?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useDismiss(open, panel, () => setOpen(false), button);
  return (
    <span className={b.more}>
      <IconBtn ref={button} label={label} aria-expanded={open} onClick={() => setOpen(!open)}>
        {icon ?? <AppIcon name="more" size={20} />}
      </IconBtn>
      {open && (
        <ul ref={panel} className={b.menu}>
          {items.map((it) => (
            <li key={it.label}>
              <button
                type="button"
                className={b.menuItem}
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

/** Export: the board printed (or saved as a PDF from the print dialog), or its shot list as a CSV file. */
function Export({ title, frames, disabled }: { title: string; frames: Frame[]; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useDismiss(open, panel, () => setOpen(false), button);
  const csv = () => {
    const cell = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rows = [["Frame", "Title", "Shot note", "Picture"], ...frames.map((f, i) => [String(i + 1), f.title, f.note, new URL(f.image, location.href).href])];
    const blob = new Blob([rows.map((r) => r.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/[^\w\- ]+/g, "").trim() || "storyboard"}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  return (
    <span className={b.more}>
      <Btn ref={button} kind="secondary" disabled={disabled} icon={<GestureIcon name="download" size={18} />} aria-expanded={open} onClick={() => setOpen(!open)}>
        Export
      </Btn>
      {open && (
        <ul ref={panel} className={b.menu} data-wide="">
          <li>
            <button
              type="button"
              className={b.menuItem}
              onClick={() => {
                setOpen(false);
                requestAnimationFrame(() => window.print());
              }}
            >
              PDF
            </button>
          </li>
          <li>
            <button
              type="button"
              className={b.menuItem}
              onClick={() => {
                setOpen(false);
                csv();
              }}
            >
              Shot list (CSV)
            </button>
          </li>
        </ul>
      )}
    </span>
  );
}

/* ---------- Library ---------- */

/** /app/storyboard/library: saved storyboards as cards. A card opens its board; its menu deletes it. */
export function StoryboardLibrary() {
  const router = useRouter();
  const work = useStoryboards();
  const series = useSeriesOptions();
  const [error, setError] = useState("");
  const [opening, setOpening] = useState<string | null>(null);
  const open = async (id: string) => {
    setOpening(id);
    setError("");
    try {
      const t = await work.open(id);
      router.push(t.step === "board" ? "/app/storyboard/board" : t.step === "style" ? "/app/storyboard/style" : "/app/storyboard?edit=1");
    } catch (e) {
      setError(message(e, "That storyboard did not open. Try again."));
      setOpening(null);
    }
  };
  return (
    <WorkShell
      tool="storyboard"
      view="library"
      steps={BOARD_STEPS}
      action={
        <Btn
          kind="primary"
          icon={<GestureIcon name="plus" size={18} />}
          onClick={() => {
            work.clear();
            router.push("/app/storyboard");
          }}
        >
          New
        </Btn>
      }
    >
      <LibraryGrid
        shape="wide"
        loading={!work.listed}
        error={error}
        items={work.list.map((t) => {
          const style = storyboardStyles.find((s) => s.slug === t.style) ?? storyboardStyles[0];
          return {
            id: t.id,
            title: t.title,
            date: t.createdAt,
            meta: seriesTitle(series, t.seriesId),
            // Every drawn frame in turn, so one picture that fails to load gives way to the next; a board not drawn
            // yet shows its style's picture.
            covers: [...t.frames.map((f) => f.image).filter(Boolean), style.card?.src].filter((x): x is string => Boolean(x)),
            busy: opening === t.id,
            onOpen: () => void open(t.id),
            menu: [{ label: "Delete", run: () => void work.remove(t.id).catch((e: unknown) => setError(message(e, "That did not delete. Try again."))) }],
          };
        })}
        empty={
          <Link href="/app/storyboard" className={b.emptyLink} onClick={() => work.clear()}>
            New storyboard
          </Link>
        }
      />
    </WorkShell>
  );
}

/** The top bar and a quiet body while a record is read back; an error line if it could not be. */
export function WorkLoading({ tool, steps, step, error }: { tool: "storyboard" | "manga"; steps: WorkStepDef[]; step?: string; error?: string }) {
  return (
    <WorkShell tool={tool} view={step ? "create" : "library"} steps={steps} step={step}>
      <div className={b.page}>
        {error ? (
          <>
            <Alert>{error}</Alert>
            <Link href={tool === "storyboard" ? LIBRARY : "/app/manga/library"} className={b.emptyLink}>
              Library
            </Link>
          </>
        ) : (
          <div className={b.loading} aria-busy="true" aria-label="Loading">
            <Skeleton width={280} height={40} radius={8} />
            <div className={b.grid}>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} ratio="16 / 9" radius={14} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </WorkShell>
  );
}
