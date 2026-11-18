"use client";

import { useRouter } from "next/navigation";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppShell } from "./AppShell";
import { Btn, IconBtn } from "@/components/labs/chat/ui";
import { ChevronIcon, GestureIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { useCast, useEpisode } from "./CastProvider";
import { crossfade } from "./fx/crossfade";
import m from "./fx/motion.module.css";
import { Panel, SaveAction, SaveError, Status, focusSoon, revealOnPhone, useSaveThen } from "./parts";
import { processingStages, type Block, type Note } from "@/lib/labs/maker";
import { reviseScreenplay } from "./generate";
import s from "./maker.module.css";
import p from "./ScreenplayStep.module.css";

export type Phase = "processing" | "screenplay";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ScreenplayStep({ initial }: { initial: Phase }) {
  const store = useCast();
  const [phase, setPhase] = useState<Phase>(initial);
  const [arrived, setArrived] = useState(false);
  return phase === "processing" ? (
    <Processing
      onDone={() => {
        window.history.replaceState(null, "", store.profile.steps.screenplay);
        setArrived(true);
        setPhase("screenplay");
      }}
    />
  ) : (
    <Screenplay arrived={arrived} />
  );
}

/* ---------- Processing ---------- */

/*
 * The script being read into a screenplay. The page is set as the finished screenplay from the first
 * frame, with every word still unread: a run of light glyphs in the manner of the portal's terminal.
 * A read head goes down the page and each passage resolves from glyphs into its words, left to right.
 * The face is monospace and spaces stay where they are, so a line never changes length as it resolves
 * and the page that is left when the head reaches the foot is the screenplay itself.
 */

/* Only characters that open no new line break (classes IS and AL), so the unread page wraps exactly as the read one. */
const GLYPHS = "..::==*x~";
const unreadOf = (text: string, seed: number) => text.replace(/\S/g, (_, at: number) => GLYPHS[(seed * 7 + at * 13 + ((at * at) % 5)) % GLYPHS.length]);

/** One passage is read every STEP ms and takes READ ms to resolve. The stages tick on the times the old spinner used. */
const START = 300;
const STEP = 270;
const READ = 420;
const STAGE_AT = [1400, 2800, 4200];
const END = 4900;
/** Where each stage stands under reduced motion: nothing travels, the page resolves in three parts. */
const REDUCED_AT = [500, 1000, 1500];
const REDUCED_END = 1900;
const startOf = (i: number) => START + i * STEP;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Text that is read up to a point: words, then two glyphs under the head, then glyphs not reached yet.
 * Every character has its own box from the first frame and only what is in the box changes, so reading
 * moves nothing, not even by the browser's own measure of layout shift.
 */
const Read = memo(function Read({ text, seed, done }: { text: string; seed: number; done: number }) {
  if (done >= 1) return <>{text}</>;
  const unread = unreadOf(text, seed);
  const upto = Math.round(text.length * done);
  const head = upto > 0 ? Math.min(text.length, upto + 2) : 0;
  return (
    <>
      {[...text].map((ch, i) =>
        ch === " " ? (
          " "
        ) : (
          <span key={i} className={i < upto ? undefined : i < head ? p.readHead : p.unread}>
            {i < upto ? ch : unread[i]}
          </span>
        ),
      )}
    </>
  );
});

function Processing({ onDone }: { onDone: () => void }) {
  /** Milliseconds of reading done. It drives the page, the head and the stages, so they cannot disagree. */
  const [now, setNow] = useState(0);
  const [still, setStill] = useState(false);
  const { ep } = useEpisode();
  const { profile } = useCast();
  const screenplay = ep.blocks;
  const file = ep.file ?? (ep.source ? "Your script" : profile.demoFile);
  const [headY, setHeadY] = useState(0);
  const page = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (reduced()) {
      setStill(true);
      const steps = REDUCED_AT.map((ms, i) => setTimeout(() => setNow(STAGE_AT[i] + 100), ms));
      const end = setTimeout(() => done.current(), REDUCED_END);
      return () => {
        steps.forEach(clearTimeout);
        clearTimeout(end);
      };
    }
    const t0 = performance.now();
    let frame = 0;
    let last = 0;
    const tick = (t: number) => {
      frame = requestAnimationFrame(tick);
      // Thirty updates a second is enough for text, and leaves the frame budget alone.
      if (t - last < 32) return;
      last = t;
      const at = t - t0;
      if (at >= Math.max(END, startOf(screenplay.length) + READ)) {
        cancelAnimationFrame(frame);
        done.current();
        return;
      }
      setNow(at);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stage = STAGE_AT.filter((ms) => now >= ms).length;
  /** The passage under the head, or -1 before the first and after the last. */
  const reading = now < START || now >= startOf(screenplay.length - 1) + READ ? -1 : Math.min(screenplay.length - 1, Math.floor((now - START) / STEP));
  const doneOf = (i: number) => {
    // Under reduced motion a passage is unread or read, never part way.
    if (still) return now >= startOf(i) + READ ? 1 : 0;
    return easeOut(Math.min(1, Math.max(0, (now - startOf(i)) / READ)));
  };

  // The head sits under the passage being read, and the panel follows it down. When the last one is read the page returns to its top, where the screenplay opens.
  useLayoutEffect(() => {
    const el = page.current;
    const body = el?.parentElement;
    if (!el || !body || still) return;
    if (reading < 0) {
      if (now > START) body.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const block = el.children[reading] as HTMLElement | undefined;
    if (!block) return;
    const y = block.offsetTop + block.offsetHeight;
    setHeadY(y);
    if (body.scrollHeight > body.clientHeight + 1) body.scrollTo({ top: Math.max(0, y - body.clientHeight + 96), behavior: "smooth" });
    // `now` is left out on purpose: the head moves when the passage changes, not thirty times a second.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reading, still]);

  return (
    <AppShell
      step="screenplay"
      fit
      action={
        <Btn kind="primary" disabled iconAfter={<Icon name="arrow" size={16} />}>
          Next
        </Btn>
      }
    >
      <div className={`${p.single} ${s.fill}`}>
        <Panel
          title="Reading your script"
          level={1}
          sub={file}
          busy
          flush
          foot={
            <ol className={p.stages} aria-live="polite">
              {processingStages.map((name, i) => (
                <li key={name}>
                  {i < stage ? (
                    <Status icon="check" drawn>
                      {name}
                    </Status>
                  ) : i === stage ? (
                    <Status icon="spinner">
                      <span className={p.now}>{name}</span>
                    </Status>
                  ) : (
                    <Status icon="dot">{name}</Status>
                  )}
                </li>
              ))}
            </ol>
          }
        >
          <div ref={page} className={`${p.page} ${p.reading}`} aria-hidden="true">
            {screenplay.map((b, i) => {
              const d = doneOf(i);
              if (b.kind === "heading")
                return (
                  <h2 key={b.id} className={p.heading} data-read={d > 0}>
                    <span>{b.number}</span>
                    <span>
                      <Read text={b.text} seed={i} done={d} />
                    </span>
                  </h2>
                );
              if (b.kind === "camera")
                return (
                  // The camera label is set in the body face, which is not monospace: it is lit as a whole, so nothing beside it moves.
                  <p key={b.id} className={p.camera} data-read={d > 0.5}>
                    <span>{b.text}</span>
                  </p>
                );
              return (
                <div key={b.id} className={p.passageWrap}>
                  <div className={p.passage} data-kind={b.kind}>
                    {b.kind === "dialogue" ? (
                      <>
                        <span className={p.cue}>
                          <Read text={b.cue} seed={i + 40} done={Math.min(1, d * 3)} />
                        </span>
                        <span className={p.lineText}>
                          <Read text={b.text} seed={i} done={d} />
                        </span>
                      </>
                    ) : (
                      <Read text={b.text} seed={i} done={d} />
                    )}
                  </div>
                </div>
              );
            })}
            <span className={p.scan} data-on={reading >= 0} style={{ translate: `0 ${headY}px` }} />
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

/* ---------- Screenplay ---------- */

type Composer = { block: string; type: Note["type"]; quote: string; text: string };

const textOf = (b: Block) => (b.kind === "action" || b.kind === "dialogue" ? b.text : "");
const passageId = (block: string) => `passage-${block}`;
const noteId = (id: string) => `note-${id}`;
/** The camera break a passage sits under. */
function shotIn(blocks: Block[], id: string) {
  let shot: Extract<Block, { kind: "camera" }> | undefined;
  for (const b of blocks) {
    if (b.kind === "camera") shot = b;
    if (b.id === id) return shot;
  }
  return undefined;
}
const phone = () => window.matchMedia("(max-width: 900px)").matches;

/** A passage with a suggested change pending: the words it replaces struck through, then the new words. */
function Suggested({ text, note }: { text: string; note: Note }) {
  const at = text.indexOf(note.quote);
  const [before, was, after] = at >= 0 ? [text.slice(0, at), note.quote, text.slice(at + note.quote.length)] : ["", text, ""];
  return (
    <>
      {before}
      <del className={p.was}>
        <span className="sr-only">Was: </span>
        {was}
      </del>{" "}
      <ins className={p.now}>
        <span className="sr-only">Suggested: </span>
        {note.body}
      </ins>
      {after}
    </>
  );
}

function Screenplay({ arrived }: { arrived: boolean }) {
  const router = useRouter();
  const store = useCast();
  const { ep, patch } = useEpisode();
  const screenplay = ep.blocks;
  /** Where each passage sits in the screenplay, so the comment cards follow the text. */
  const orderOf: Record<string, number> = Object.fromEntries(screenplay.map((b, i) => [b.id, i]));
  /** The shot the prompt shows before a passage is chosen: the first one. */
  const firstShot = screenplay.find((b): b is Extract<Block, { kind: "camera" }> => b.kind === "camera");
  const [texts, setTexts] = useState<Record<string, string>>(() => ep.texts ?? Object.fromEntries(screenplay.map((b) => [b.id, textOf(b)])));
  // Unsent comments survive leaving by the browser's Back button; the plain address opens with none.
  const [notes, setNotes] = useState<Note[]>(() => ep.notes ?? []);
  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [composer, setComposer] = useState<Composer | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [changed, setChanged] = useState<Set<string>>(() => new Set(ep.changed));
  const [said, setSaid] = useState("");
  const [reviseError, setReviseError] = useState("");
  /** The passage whose comment is pointed at: hovering or focusing either the card or the passage lights both. */
  const [active, setActive] = useState<string | null>(null);
  const menuFirst = useRef<HTMLButtonElement>(null);
  const pageHeading = useRef<HTMLHeadingElement>(null);
  const commentsHeading = useRef<HTMLHeadingElement>(null);
  /** The comments panel. What it shows dissolves when it changes as a whole: a comment removed, the comments sent, the rewrite back. */
  const comments = useRef<HTMLElement>(null);
  const saving = useSaveThen(store.flush);

  // The episode keeps its edits and comments, so leaving, reloading or coming back finds them.
  useEffect(() => {
    patch({ texts, notes, changed: [...changed] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texts, notes, changed]);

  // Arriving from processing, the keyboard lands on the screenplay heading rather than nowhere.
  useEffect(() => {
    if (arrived) focusSoon(() => (document.activeElement === document.body ? pageHeading.current : null));
  }, [arrived]);

  useEffect(() => {
    if (menu) menuFirst.current?.focus();
  }, [menu]);

  // A click outside the passage menu closes it.
  useEffect(() => {
    if (!menu || !selected) return;
    const close = (e: PointerEvent) => {
      const wrap = document.getElementById(passageId(selected))?.parentElement;
      if (wrap && !wrap.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu, selected]);

  /** A comment typed in the composer but not added yet goes with the others when they are sent. */
  const draft = composer && composer.text.trim() && composer.text.trim() !== (composer.type === "suggestion" ? composer.quote : "") ? composer : null;
  const draftNote = (c: Composer): Note => ({ id: `n${Date.now()}`, block: c.block, type: c.type, quote: c.quote, body: c.text.trim() });

  /** The rewrite in progress. Leaving the screen drops its answer. */
  const rewrite = useRef(0);
  useEffect(() => () => void (rewrite.current += 1), []);

  const focusPassage = (block: string) => focusSoon(() => document.getElementById(passageId(block)));

  const pick = (id: string) => {
    // On a phone the cards sit under the screenplay: a commented passage leads to its card.
    const card = notes.find((n) => n.block === id);
    if (card && !rewriting && phone()) {
      setActive(id);
      revealOnPhone(document.getElementById(noteId(card.id)));
      return;
    }
    setSelected(id);
    setMenu(true);
  };

  /** A card leads to its passage, scrolled into view inside the screenplay. */
  const showPassage = (block: string) => {
    setActive(block);
    document.getElementById(passageId(block))?.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" });
  };

  const removeNote = (n: Note) => {
    const last = notes.length === 1 && !composer;
    crossfade(comments.current);
    setNotes((all) => all.filter((x) => x.id !== n.id));
    setActive(null);
    setSaid(n.type === "comment" ? "Comment removed." : "Suggestion removed.");
    // With the last one gone the panel goes too, so the keyboard returns to the passage.
    if (last) focusPassage(n.block);
    else focusSoon(() => commentsHeading.current);
  };

  const open = (type: Note["type"]) => {
    if (!selected) return;
    const quote = texts[selected];
    setComposer({ block: selected, type, quote, text: type === "suggestion" ? quote : "" });
    setMenu(false);
  };

  const closeComposer = () => {
    if (composer) focusPassage(composer.block);
    setComposer(null);
  };

  const add = () => {
    if (!composer || !composer.text.trim()) return;
    setNotes((n) => [...n, { id: `n${Date.now()}`, block: composer.block, type: composer.type, quote: composer.quote, body: composer.text.trim() }]);
    setSaid(composer.type === "comment" ? "Comment added." : "Suggestion added.");
    closeComposer();
  };

  const send = () => {
    // A comment still in the composer goes with the others.
    const sent = draft ? [...notes, draftNote(draft)] : notes;
    crossfade(comments.current);
    setRewriting(true);
    setReviseError("");
    setNotes(sent);
    setComposer(null);
    setMenu(false);
    setSaid("Rewriting the screenplay.");
    focusSoon(() => commentsHeading.current);
    const asked = ++rewrite.current;
    void reviseScreenplay({ tool: store.tool, blocks: screenplay, texts, notes: sent, episodeId: ep.id }).then(
      ({ texts: next, blocks: rewritten, changed: marked }) => {
        if (asked !== rewrite.current) return;
        if (rewritten) patch({ blocks: rewritten });
        setTexts(next);
        crossfade(comments.current);
        setChanged((c) => new Set([...c, ...(marked ?? sent.map((n) => n.block))]));
        setNotes([]);
        setRewriting(false);
        setSaid("Comments sent. Changed passages are marked.");
        // The comments panel closes with nothing left in it: the keyboard goes to the screenplay heading rather than nowhere.
        focusSoon(() => (document.activeElement === document.body ? pageHeading.current : null));
      },
      (e: unknown) => {
        if (asked !== rewrite.current) return;
        setRewriting(false);
        setReviseError(e instanceof Error && e.message ? e.message : "The rewrite did not come back. Send the comments again.");
        setSaid("The rewrite did not come back. Send the comments again.");
      },
    );
  };

  const discard = () => {
    crossfade(comments.current);
    setNotes([]);
    setSaid("Comments discarded.");
  };

  const noted = new Set(notes.map((n) => n.block));
  const shot = (selected ? shotIn(screenplay, selected) : undefined) ?? firstShot;
  /** The cards in the order of their passages; two on one passage keep the order they were added in. */
  const ordered = [...notes].sort((a, b) => orderOf[a.block] - orderOf[b.block]);
  /** The latest suggestion on each passage, drawn in the text. */
  const suggestionOf = new Map(notes.filter((n) => n.type === "suggestion").map((n) => [n.block, n]));
  const panelOpen = notes.length > 0 || Boolean(composer) || rewriting;

  return (
    <AppShell
      step="screenplay"
      fit
      action={
        <SaveAction error={saving.error}>
          <Btn kind="primary" disabled={rewriting} loading={saving.busy} iconAfter={<Icon name="arrow" size={16} />} onClick={() => saving.go(() => router.push(store.profile.steps.cast))}>
            Next
          </Btn>
        </SaveAction>
      }
    >
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      <div className={`${p.layout} ${s.fill}`} data-panel={panelOpen}>
        <Panel
          title={ep.episode}
          sub={store.seriesTitle(ep.series) === ep.series && ep.newSeries ? ep.newSeries : store.seriesTitle(ep.series)}
          level={1}
          flush
          busy={rewriting}
          headingRef={pageHeading}
          actions={
            firstShot && (
            <Btn kind="ghost" small icon={<ChevronIcon open={showPrompt} size={16} />} aria-expanded={showPrompt} aria-controls="sp-prompt" onClick={() => setShowPrompt((v) => !v)}>
              {showPrompt ? "Hide prompt" : "Show prompt"}
            </Btn>
            )
          }
        >
          {showPrompt && shot && (
            <div id="sp-prompt" className={`${s.inset} ${p.prompt} ${m.enter}`}>
              <p className="label muted">{shot.text}</p>
              <p className="small">{shot.prompt}</p>
            </div>
          )}
          <div className={p.page} data-dim={rewriting}>
            {screenplay.map((b) => {
              if (b.kind === "heading")
                return (
                  <h2 key={b.id} className={p.heading}>
                    <span>{b.number}</span>
                    {b.text}
                  </h2>
                );
              if (b.kind === "camera")
                return (
                  <p key={b.id} className={p.camera}>
                    <span>{b.text}</span>
                  </p>
                );
              const isSel = selected === b.id;
              const menuId = `menu-${b.id}`;
              const hasNote = noted.has(b.id);
              const suggestion = suggestionOf.get(b.id);
              const words = suggestion ? <Suggested text={texts[b.id]} note={suggestion} /> : texts[b.id];
              return (
                <div key={b.id} className={p.passageWrap}>
                  <button
                    type="button"
                    id={passageId(b.id)}
                    className={p.passage}
                    data-kind={b.kind}
                    data-selected={isSel}
                    data-noted={hasNote}
                    data-active={hasNote && active === b.id}
                    data-changed={changed.has(b.id)}
                    aria-expanded={isSel && menu}
                    aria-controls={isSel && menu ? menuId : undefined}
                    disabled={rewriting}
                    onClick={() => pick(b.id)}
                    onPointerEnter={hasNote ? () => setActive(b.id) : undefined}
                    onPointerLeave={hasNote ? () => setActive(null) : undefined}
                    onFocus={hasNote ? () => setActive(b.id) : undefined}
                    onBlur={hasNote ? () => setActive(null) : undefined}
                  >
                    {b.kind === "dialogue" ? (
                      <>
                        <span className={p.cue}>{b.cue}</span>
                        <span className={p.lineText}>{words}</span>
                      </>
                    ) : (
                      words
                    )}
                    {hasNote && !suggestion && <span className="sr-only">, has a comment</span>}
                    {changed.has(b.id) && <span className={`${p.changed} ${m.fade}`}>Changed</span>}
                  </button>
                  {isSel && menu && (
                    <div
                      id={menuId}
                      className={p.menu}
                      role="group"
                      aria-label="Passage actions"
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setMenu(false);
                          focusPassage(b.id);
                        }
                      }}
                    >
                      <button ref={menuFirst} type="button" onClick={() => open("comment")}>
                        Comment
                      </button>
                      <span aria-hidden="true" />
                      <button type="button" onClick={() => open("suggestion")}>
                        Suggest
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>

        {panelOpen && (
          <Panel
            as="aside"
            title="Comments"
            panelRef={comments}
            className={m.enter}
            headingRef={commentsHeading}
            foot={
              notes.length > 0 && !rewriting ? (
                <>
                  <SaveError>{reviseError}</SaveError>
                  <Btn kind="secondary" small icon={<Icon name="send" size={16} />} onClick={send}>
                    Send comments
                  </Btn>
                  <Btn
                    kind="ghost"
                    small
                    icon={<Icon name="close" size={16} />}
                    onClick={() => {
                      const keep = Boolean(composer);
                      discard();
                      focusSoon(() => (keep ? commentsHeading.current : pageHeading.current));
                    }}
                  >
                    Discard
                  </Btn>
                </>
              ) : undefined
            }
          >
            {rewriting ? (
              <p>
                <Status icon="spinner">Rewriting the screenplay</Status>
              </p>
            ) : (
              <>
                <ul className={p.notes}>
                  {ordered.map((n) => (
                    <li
                      key={n.id}
                      id={noteId(n.id)}
                      className={`${p.note} ${m.enter}`}
                      data-active={active === n.block}
                      onPointerEnter={() => setActive(n.block)}
                      onPointerLeave={() => setActive(null)}
                    >
                      <button type="button" className={p.noteMain} onClick={() => showPassage(n.block)} onFocus={() => setActive(n.block)} onBlur={() => setActive(null)}>
                        <span className={p.noteHead}>
                          <span className={p.avatar} aria-hidden="true">
                            NL
                          </span>
                          <span>You</span>
                          <span className={p.noteType}>{n.type === "comment" ? "Comment" : "Suggested change"}</span>
                        </span>
                        {n.type === "suggestion" ? (
                          <span className={`small ${p.noteBody}`}>{n.body}</span>
                        ) : (
                          <>
                            <span className={p.quote}>{n.quote}</span>
                            <span className={`small ${p.noteBody}`}>{n.body}</span>
                          </>
                        )}
                      </button>
                      <IconBtn className={p.remove} onClick={() => removeNote(n)} label="Remove comment">
                        <GestureIcon name="close" size={16} />
                      </IconBtn>
                    </li>
                  ))}
                </ul>
                {composer && (
                  <div className={`${p.composer} ${m.enter}`}>
                    <p className="small">{composer.quote}</p>
                    <label htmlFor="composer" className="sr-only">
                      {composer.type === "comment" ? "Comment" : "Suggested text"}
                    </label>
                    <textarea
                      id="composer"
                      className={s.textarea}
                      placeholder={composer.type === "comment" ? "Write a comment" : "Write the new text"}
                      value={composer.text}
                      autoFocus
                      onChange={(e) => setComposer({ ...composer, text: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") closeComposer();
                      }}
                    />
                    <div className={s.actions}>
                      <Btn kind="secondary" small icon={<Icon name="comment" size={16} />} disabled={!draft} onClick={add}>
                        {composer.type === "comment" ? "Add comment" : "Add suggestion"}
                      </Btn>
                      <Btn kind="ghost" small icon={<Icon name="close" size={16} />} onClick={closeComposer}>
                        Cancel
                      </Btn>
                    </div>
                  </div>
                )}
              </>
            )}
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
