"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent, type ReactNode, type RefObject } from "react";
import { GestureIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { AppBar, type AppStep } from "@/components/labs/chat/AppBar";
import { Btn, IconBtn } from "@/components/labs/chat/ui";
import { animeStyles, fdxText, libraryCast, styleBySlug, type CastItem, type Passage } from "./data";
import { useDismiss, useReducedMotion } from "./hooks";
import { useAnime } from "./store";
import f from "./flow.module.css";

export const STEPS = [
  { key: "script", label: "Script", href: "/app/anime/new" },
  { key: "screenplay", label: "Screenplay", href: "/app/anime/new/screenplay" },
  { key: "cast", label: "Cast", href: "/app/anime/new/cast" },
  { key: "style", label: "Style", href: "/app/anime/new/style" },
  { key: "storyboard", label: "Storyboard", href: "/app/anime/new/storyboard" },
] as const;
export type StepKey = (typeof STEPS)[number]["key"];

/** The step bar, with every step up to the furthest reached one open to reopen. Marks this step as reached. */
export function useSteps(current: StepKey, enabled = true): AppStep[] {
  const { draft, setDraft } = useAnime();
  const idx = STEPS.findIndex((s) => s.key === current);
  useEffect(() => {
    if (enabled && idx > draft.reached) setDraft({ reached: idx });
  }, [enabled, idx, draft.reached, setDraft]);
  const reached = Math.max(idx, draft.reached);
  return STEPS.map((s, i) => ({ key: s.key, label: s.label, href: s.href, state: i === idx ? "current" : i <= reached ? "done" : "todo" }));
}

export function FlowPage({ step, action, children, wide }: { step: StepKey; action?: ReactNode; children: ReactNode; wide?: boolean }) {
  const steps = useSteps(step);
  return (
    <div className={f.page} data-wide={wide || undefined}>
      <AppBar tool="anime" view="create" steps={steps} current={step} action={action} />
      <main id="main" className={f.main}>
        {children}
      </main>
    </div>
  );
}

/* ---------- 1. Start ---------- */

const SCRIPT_TYPES = ".txt,.md,.fountain,.fdx,.docx,.pdf";

export function StartStep() {
  const router = useRouter();
  const { draft, setDraft, resetDraft, submitDraft } = useAnime();
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  // A finished or half-made anime is put away when the start box opens again.
  useEffect(() => {
    if (draft.started) resetDraft();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ready = !!(draft.script.trim() || draft.file);
  const take = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setDraft({ file: file.name });
    if (/\.(txt|md|fountain)$/i.test(file.name)) file.text().then((text) => setDraft({ script: text }));
    else if (/\.fdx$/i.test(file.name)) file.text().then((xml) => setDraft({ script: fdxText(xml) }));
  };
  const submit = () => {
    if (!ready) return;
    submitDraft();
    router.push("/app/anime/new/screenplay");
  };
  const onDrop = (e: DragEvent) => {
    if (!e.dataTransfer.files.length) return;
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer.files);
  };

  return (
    <FlowPage step="script">
      <div className={f.start}>
        <h1 className={f.heading}>What do you want to make?</h1>
        <div
          className={f.box}
          data-over={over || undefined}
          onDragOver={(e) => {
            if (!e.dataTransfer.types.includes("Files")) return;
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setOver(false)}
          onDrop={onDrop}
        >
          <textarea
            ref={area}
            className={f.editor}
            aria-label="Script"
            placeholder="Type or paste a script"
            value={draft.script}
            spellCheck={false}
            onChange={(e) => setDraft({ script: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
          />
          <div className={f.boxFoot}>
            <input ref={input} type="file" accept={SCRIPT_TYPES} hidden onChange={(e) => take(e.target.files)} />
            {draft.file ? (
              <span className={f.fileChip}>
                <GestureIcon name="upload" size={16} />
                <span className={f.fileName}>{draft.file}</span>
                <IconBtn label={`Remove ${draft.file}`} onClick={() => setDraft({ file: "" })}>
                  <Icon name="close" size={16} />
                </IconBtn>
              </span>
            ) : (
              <Btn kind="ghost" icon={<GestureIcon name="upload" size={16} />} onClick={() => input.current?.click()}>
                Upload a file
              </Btn>
            )}
            <div className={f.submit}>
              <Btn kind="primary" disabled={!ready} onClick={submit}>
                Submit
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </FlowPage>
  );
}

/* ---------- 2 and 3. Processing, then the screenplay ---------- */

const STAGES = ["Reading the script", "Finding scenes and shots", "Listing cast and places"];
const PROCESS_MS = 3000;
const GLYPHS = "..::==*x~";
const unread = (s: string, seed: number) => s.replace(/\S/g, (_, i: number) => GLYPHS[(seed * 7 + i * 13) % GLYPHS.length]);

function Processing({ passages, onDone }: { passages: Passage[]; onDone: () => void }) {
  const [now, setNow] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const t0 = performance.now();
    let frame = 0;
    const tick = (t: number) => {
      const at = t - t0;
      if (at >= PROCESS_MS) return done.current();
      setNow(at);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const read = Math.floor((now / (PROCESS_MS - 400)) * passages.length);
  const stage = Math.min(STAGES.length - 1, Math.floor((now / PROCESS_MS) * STAGES.length));
  return (
    <div className={f.processing}>
      <ol className={f.stages} aria-live="polite">
        {STAGES.map((s, i) => (
          <li key={s} data-state={i < stage ? "done" : i === stage ? "now" : "todo"}>
            <span className={f.stageDot} aria-hidden="true">
              {i < stage && <Icon name="check" size={12} />}
            </span>
            {s}
          </li>
        ))}
      </ol>
      <div className={f.doc} aria-hidden="true">
        {passages.map((p, i) => (
          <div key={p.id} className={f.passage} data-kind={p.kind} data-read={i < read || undefined}>
            {i < read ? <PassageText p={p} /> : <span className={f.glyph}>{unread(p.text, i)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PassageText({ p }: { p: Passage }) {
  return p.kind === "heading" ? (
    <>
      <span className={f.sceneNum}>{p.n}</span> {p.text}
    </>
  ) : (
    <>{p.text}</>
  );
}

export function ScreenplayStep() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { draft, setDraft } = useAnime();
  const processing = draft.processing && !reduced;
  useEffect(() => {
    if (draft.processing && reduced) setDraft({ processing: false });
  }, [draft.processing, reduced, setDraft]);

  return (
    <FlowPage
      step="screenplay"
      action={
        <Btn kind="primary" disabled={processing} onClick={() => router.push("/app/anime/new/cast")}>
          Next
        </Btn>
      }
    >
      <h1 className="sr-only">Screenplay</h1>
      {processing ? <Processing passages={draft.passages} onDone={() => setDraft({ processing: false })} /> : <Screenplay />}
    </FlowPage>
  );
}

function Screenplay() {
  const { draft, setDraft } = useAnime();
  const [open, setOpen] = useState<string | null>(null);
  const [text, setText] = useState("");
  const add = (passage: string) => {
    if (!text.trim()) return;
    setDraft((d) => ({ notes: [...d.notes, { id: `n-${Date.now()}`, passage, text: text.trim() }] }));
    setText("");
    setOpen(null);
  };
  return (
    <div className={f.screenplay}>
      <div className={f.sheet}>
        {draft.passages.map((p) => {
          const notes = draft.notes.filter((n) => n.passage === p.id);
          const active = open === p.id;
          return (
            <div key={p.id} className={f.row} data-active={active || notes.length > 0 || undefined}>
              <button
                type="button"
                className={f.passage}
                data-kind={p.kind}
                aria-expanded={active}
                aria-label={`Comment on: ${p.text}`}
                onClick={() => {
                  setOpen(active ? null : p.id);
                  setText("");
                }}
              >
                <PassageText p={p} />
              </button>
              {(active || notes.length > 0) && (
                <div className={f.notes}>
                  {notes.map((n) => (
                    <div key={n.id} className={f.note}>
                      <p>{n.text}</p>
                      <IconBtn label="Delete comment" onClick={() => setDraft((d) => ({ notes: d.notes.filter((x) => x.id !== n.id) }))}>
                        <Icon name="close" size={14} />
                      </IconBtn>
                    </div>
                  ))}
                  {active && (
                    <form
                      className={f.composer}
                      onSubmit={(e) => {
                        e.preventDefault();
                        add(p.id);
                      }}
                    >
                      <textarea
                        autoFocus
                        className={f.noteInput}
                        aria-label="Comment"
                        placeholder="Comment or suggest a change"
                        rows={3}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            add(p.id);
                          }
                          if (e.key === "Escape") setOpen(null);
                        }}
                      />
                      <div className={f.composerRow}>
                        <Btn kind="ghost" small onClick={() => setOpen(null)}>
                          Cancel
                        </Btn>
                        <Btn kind="secondary" small type="submit" disabled={!text.trim()}>
                          Comment
                        </Btn>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- 4. Cast ---------- */

const UNDO_MS = 6000;
const fileName = (f: File) => f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

export function CastStep() {
  const router = useRouter();
  const { draft, setDraft } = useAnime();
  const [naming, setNaming] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ text: string; cast: CastItem[] } | null>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const patch = (id: string, p: Partial<CastItem>) => setDraft((d) => ({ cast: d.cast.map((c) => (c.id === id ? { ...c, ...p } : c)) }));
  const remove = (item: CastItem) => {
    window.clearTimeout(timer.current);
    setUndo({ text: `${item.name} removed`, cast: draft.cast });
    timer.current = window.setTimeout(() => setUndo(null), UNDO_MS);
    setDraft((d) => ({ cast: d.cast.filter((c) => c.id !== item.id) }));
  };
  const add = (item: CastItem) => {
    setDraft((d) => ({ cast: [...d.cast, item] }));
    setNaming(item.id);
  };

  return (
    <FlowPage
      step="cast"
      action={
        <Btn kind="primary" onClick={() => router.push("/app/anime/new/style")}>
          Next
        </Btn>
      }
    >
      <div className={f.cast}>
        <h1 className={f.heading}>Cast and places</h1>
        <ul className={f.castGrid}>
          {draft.cast.map((c) => (
            <li key={c.id} data-kind={c.kind}>
              <CastCard
                item={c}
                naming={naming === c.id}
                onChange={(p) => patch(c.id, p)}
                onNamed={() => setNaming(null)}
                onRemove={() => remove(c)}
              />
            </li>
          ))}
          <li>
            <AddCard have={draft.cast} onAdd={add} />
          </li>
        </ul>
      </div>
      {undo && (
        <div className={f.undo} role="status">
          <span>{undo.text}</span>
          <Btn
            kind="ghost"
            small
            onClick={() => {
              setDraft({ cast: undo.cast });
              setUndo(null);
            }}
          >
            Undo
          </Btn>
        </div>
      )}
    </FlowPage>
  );
}

function CastArt({ item }: { item: Pick<CastItem, "src" | "kind"> }) {
  if (!item.src) return null;
  return item.src.startsWith("blob:") ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.src} alt="" />
  ) : (
    <Image key={item.src} src={item.src} alt="" fill sizes="(max-width: 767px) 50vw, 320px" className={f.cardImg} />
  );
}

/** A small library picker in a popover, for one kind of card or for both. */
function LibraryPop({ label, options, current, onPick, onClose, back }: { label: string; options: CastItem[]; current?: string; onPick: (o: CastItem) => void; onClose: () => void; back: RefObject<HTMLElement | null> }) {
  const panel = useRef<HTMLDivElement>(null);
  useDismiss(true, panel, onClose, back);
  const kinds = (["char", "place"] as const).filter((k) => options.some((o) => o.kind === k));
  return (
    <div ref={panel} className={f.pop} role="dialog" aria-label={label}>
      {kinds.map((k) => (
        <ul key={k} className={f.popGrid} data-kind={k}>
          {options
            .filter((o) => o.kind === k)
            .map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  className={f.popItem}
                  aria-pressed={o.src === current}
                  onClick={() => {
                    onPick(o);
                    onClose();
                  }}
                >
                  <span className={f.popArt} data-kind={o.kind}>
                    {o.src && <Image src={o.src} alt="" fill sizes="120px" />}
                  </span>
                  <span className={f.popName}>{o.name}</span>
                </button>
              </li>
            ))}
        </ul>
      ))}
    </div>
  );
}

function CastCard({ item, naming, onChange, onNamed, onRemove }: { item: CastItem; naming: boolean; onChange: (p: Partial<CastItem>) => void; onNamed: () => void; onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const options = libraryCast().filter((o) => o.kind === item.kind);
  const upload = () => file.current?.click();
  return (
    <article className={f.card} aria-label={item.name || "New card"}>
      <div className={f.cardArt} data-kind={item.kind} data-missing={!item.src || undefined}>
        <CastArt item={item} />
        {!item.src && (
          <Btn kind="secondary" small icon={<GestureIcon name="upload" size={16} />} onClick={upload}>
            Upload
          </Btn>
        )}
        <IconBtn label={`Remove ${item.name || "card"}`} className={f.cardRemove} onClick={onRemove}>
          <Icon name="close" size={16} />
        </IconBtn>
      </div>
      <div className={f.cardBody}>
        {naming ? (
          <input
            autoFocus
            className={f.nameInput}
            aria-label="Name"
            placeholder="Name"
            defaultValue={item.name}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={(e) => {
              const v = e.currentTarget.value.trim();
              if (v) onChange({ name: v });
              onNamed();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
            }}
          />
        ) : (
          <h2 className={f.cardName}>{item.name}</h2>
        )}
        <div className={f.cardActions}>
          <span className={f.popWrap}>
            <Btn ref={button} kind="secondary" small aria-expanded={open} onClick={() => setOpen(!open)}>
              Choose from library
            </Btn>
            {open && <LibraryPop label={`Library for ${item.name}`} options={options} current={item.src} onPick={(o) => onChange({ src: o.src })} onClose={() => setOpen(false)} back={button} />}
          </span>
          {item.src && (
            <Btn kind="ghost" small onClick={upload}>
              Upload
            </Btn>
          )}
          <input
            ref={file}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const x = e.target.files?.[0];
              if (x) onChange({ src: URL.createObjectURL(x) });
            }}
          />
        </div>
      </div>
    </article>
  );
}

/** The last card in the row: adds a character or place from the library, or an uploaded image, then asks for its name. */
function AddCard({ have, onAdd }: { have: CastItem[]; onAdd: (c: CastItem) => void }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<CastItem["kind"]>("char");
  const options = libraryCast().filter((o) => !have.some((h) => h.id === o.id));
  const pickFile = (k: CastItem["kind"]) => {
    setKind(k);
    setOpen(false);
    file.current?.click();
  };
  return (
    <div className={f.addCard}>
      <span className={f.popWrap}>
        <button ref={button} type="button" className={f.addButton} aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name="plus" size={20} />
          <span>Add</span>
        </button>
        {open && (
          <AddPop
            options={options}
            onPick={onAdd}
            onUpload={pickFile}
            onClose={() => setOpen(false)}
            back={button}
          />
        )}
      </span>
      <input
        ref={file}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const x = e.target.files?.[0];
          if (x) onAdd({ id: `up-${Date.now().toString(36)}`, kind, name: fileName(x), src: URL.createObjectURL(x) });
          e.target.value = "";
        }}
      />
    </div>
  );
}

function AddPop({ options, onPick, onUpload, onClose, back }: { options: CastItem[]; onPick: (o: CastItem) => void; onUpload: (k: CastItem["kind"]) => void; onClose: () => void; back: RefObject<HTMLElement | null> }) {
  const panel = useRef<HTMLDivElement>(null);
  useDismiss(true, panel, onClose, back);
  return (
    <div ref={panel} className={f.pop} data-add role="dialog" aria-label="Add to cast">
      {options.length > 0 &&
        (["char", "place"] as const)
          .filter((k) => options.some((o) => o.kind === k))
          .map((k) => (
            <ul key={k} className={f.popGrid} data-kind={k}>
              {options
                .filter((o) => o.kind === k)
                .map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      className={f.popItem}
                      onClick={() => {
                        onPick(o);
                        onClose();
                      }}
                    >
                      <span className={f.popArt} data-kind={o.kind}>
                        {o.src && <Image src={o.src} alt="" fill sizes="120px" />}
                      </span>
                      <span className={f.popName}>{o.name}</span>
                    </button>
                  </li>
                ))}
            </ul>
          ))}
      <div className={f.popUploads}>
        <Btn kind="ghost" small icon={<GestureIcon name="upload" size={16} />} onClick={() => onUpload("char")}>
          Upload a character
        </Btn>
        <Btn kind="ghost" small icon={<GestureIcon name="upload" size={16} />} onClick={() => onUpload("place")}>
          Upload a place
        </Btn>
      </div>
    </div>
  );
}

/* ---------- 5. Style ---------- */

export function StyleStep() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { draft, setDraft, startDraft } = useAnime();
  const chosen = styleBySlug(draft.style);
  const clip = chosen.review?.clip ?? chosen.chart.example?.video;
  const still = chosen.review?.still ?? chosen.card?.src;
  return (
    <FlowPage
      step="style"
      wide
      action={
        <Btn
          kind="primary"
          onClick={() => {
            startDraft(reduced);
            router.push("/app/anime/new/storyboard");
          }}
        >
          Generate
        </Btn>
      }
    >
      <div className={f.style}>
        <section className={f.styleList} aria-labelledby="style-h">
          <h1 id="style-h" className={f.heading}>
            Style
          </h1>
          <ul className={f.styleGrid}>
            {animeStyles.map((s) => (
              <li key={s.slug}>
                <button type="button" className={f.styleTile} aria-pressed={s.slug === chosen.slug} onClick={() => setDraft({ style: s.slug })}>
                  <span className={f.styleArt}>{s.card && <Image src={s.card.src} alt="" fill sizes="(max-width: 767px) 45vw, 220px" />}</span>
                  <span className={f.styleName}>{s.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <aside className={f.preview} aria-label={`${chosen.name}, preview`}>
          <div className={f.previewArt}>
            {clip ? (
              <video key={clip} src={clip} poster={still} autoPlay={!reduced} muted loop playsInline aria-label={chosen.name} />
            ) : (
              still && <Image key={still} src={still} alt={chosen.name} fill sizes="420px" />
            )}
          </div>
          <h2 className={f.previewName}>{chosen.name}</h2>
        </aside>
      </div>
    </FlowPage>
  );
}
