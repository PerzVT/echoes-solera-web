"use client";

import { useRouter } from "next/navigation";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppShell } from "./AppShell";
import { Button, ButtonLink } from "@/components/labs/Button";
import { AnimatedMark, ChevronIcon, GestureIcon } from "@/components/labs/fx";
import { cancelRouteSkeleton } from "@/components/labs/fx/RouteSkeleton";
import { useCast } from "./CastProvider";
import { crossfade } from "./fx/crossfade";
import m from "./fx/motion.module.css";
import { BlockedAction, EpisodeTitle, Panel, RecentScripts, Status, Stepper, focusSoon, revealOnPhone } from "./parts";
import { EPISODE, processingStages, recentScripts, screenplay, shotOf, startingNotes, type Block, type Note } from "@/lib/labs/maker";
import s from "./maker.module.css";
import p from "./ScreenplayStep.module.css";

export type Phase = "processing" | "screenplay" | "comments";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ScreenplayStep({ initial }: { initial: Phase }) {
  const [phase, setPhase] = useState<Phase>(initial);
  const [arrived, setArrived] = useState(false);
  return phase === "processing" ? (
    <Processing
      onDone={() => {
        window.history.replaceState(null, "", "/app/episode/screenplay");
        setArrived(true);
        setPhase("screenplay");
      }}
    />
  ) : (
    <Screenplay seeded={phase === "comments"} arrived={arrived} />
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
  const [file, setFile] = useState(EPISODE.file);
  const [headY, setHeadY] = useState(0);
  const page = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    try {
      const f = sessionStorage.getItem("maker-script");
      if (f) setFile(f);
    } catch {}
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
      if (at >= END) {
        cancelAnimationFrame(frame);
        done.current();
        return;
      }
      setNow(at);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
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
      section="/app"
      title={<EpisodeTitle />}
      bar={<Stepper current="script" />}
      actions={
        <>
          {/* Loading keeps the label and the fill; a second press does nothing. */}
          <Button loading icon={<AnimatedMark variant="busy" size={18} tone="mono" />} aria-describedby="processing-why">
            Processing script
          </Button>
          <span id="processing-why" className="sr-only">
            The script is being read.
          </span>
        </>
      }
    >
      <div className={`${s.split} ${s.fill}`}>
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
        <RecentScripts />
      </div>
    </AppShell>
  );
}

/* ---------- Screenplay ---------- */

type Composer = { block: string; type: Note["type"]; quote: string; text: string };

const textOf = (b: Block) => (b.kind === "action" || b.kind === "dialogue" ? b.text : "");
const passageId = (block: string) => `passage-${block}`;
const noteId = (id: string) => `note-${id}`;
/** Where each passage sits in the screenplay, so the comment cards follow the text. */
const orderOf = Object.fromEntries(screenplay.map((b, i) => [b.id, i]));
/** The shot the prompt shows before a passage is chosen: the first one. */
const firstShot = screenplay.find((b): b is Extract<Block, { kind: "camera" }> => b.kind === "camera");
const scriptTitle = recentScripts[0].title;
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

function Screenplay({ seeded, arrived }: { seeded: boolean; arrived: boolean }) {
  const router = useRouter();
  const store = useCast();
  const memoKey = `screenplay:notes:${seeded ? "comments" : "plain"}`;
  const [texts, setTexts] = useState<Record<string, string>>(() => Object.fromEntries(screenplay.map((b) => [b.id, textOf(b)])));
  // Unsent comments survive leaving by the browser's Back button; the plain address opens with none.
  const [notes, setNotes] = useState<Note[]>(() => store.kept<Note[]>(memoKey) ?? (seeded ? startingNotes : []));
  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [composer, setComposer] = useState<Composer | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const [said, setSaid] = useState("");
  /** The passage whose comment is pointed at: hovering or focusing either the card or the passage lights both. */
  const [active, setActive] = useState<string | null>(null);
  /** Where the person tried to go with comments unsent. */
  const [leaving, setLeaving] = useState<{ href: string; from: HTMLElement | null } | null>(null);
  const menuFirst = useRef<HTMLButtonElement>(null);
  const leaveFirst = useRef<HTMLButtonElement>(null);
  const pageHeading = useRef<HTMLHeadingElement>(null);
  const commentsHeading = useRef<HTMLHeadingElement>(null);
  /** The comments panel. What it shows dissolves when it changes as a whole: a comment removed, the comments sent, the rewrite back. */
  const comments = useRef<HTMLElement>(null);
  const after = useRef<string | null>(null);

  useEffect(() => {
    store.keep(memoKey, notes);
  }, [store, memoKey, notes]);

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

  /** A comment typed in the composer but not added yet: it counts as unsent, so leaving asks first. */
  const draft = composer && composer.text.trim() && composer.text.trim() !== (composer.type === "suggestion" ? composer.quote : "") ? composer : null;
  const draftNote = (c: Composer): Note => ({ id: `n${Date.now()}`, block: c.block, type: c.type, quote: c.quote, body: c.text.trim() });
  const unsentCount = notes.length + (draft ? 1 : 0);

  // Every way out by a link (the stepper, the rail, Continue) asks first while comments are unsent.
  const unsent = unsentCount > 0 && !rewriting;
  useEffect(() => {
    if (!unsent) return;
    const guard = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      // The window's capture phase runs before any listener on the document, so the route skeleton never hears this click
      // and cannot lay itself over the question asked here. Any skeleton already pending is dropped as well.
      e.preventDefault();
      e.stopImmediatePropagation();
      cancelRouteSkeleton();
      setLeaving({ href: url.pathname + url.search, from: a });
      focusSoon(() => leaveFirst.current);
    };
    window.addEventListener("click", guard, true);
    return () => window.removeEventListener("click", guard, true);
  }, [unsent]);

  /** The rewrite in progress, so leaving the screen stops it and it can never move a person who has gone elsewhere. */
  const rewrite = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(rewrite.current), []);
  // While the rewrite runs, a link to anywhere else, or Back, is the person's new choice: the destination they had picked is dropped.
  useEffect(() => {
    if (!rewriting) return;
    const moved = (e: Event) => {
      const a = e.type === "click" ? ((e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null) : null;
      if (e.type === "popstate" || (a && new URL(a.href, location.href).pathname !== location.pathname)) after.current = null;
    };
    window.addEventListener("click", moved, true);
    window.addEventListener("popstate", moved);
    return () => {
      window.removeEventListener("click", moved, true);
      window.removeEventListener("popstate", moved);
    };
  }, [rewriting]);

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

  const send = (then?: string) => {
    // A comment still in the composer goes with the others.
    const sent = draft ? [...notes, draftNote(draft)] : notes;
    crossfade(comments.current);
    setRewriting(true);
    setNotes(sent);
    setComposer(null);
    setMenu(false);
    setLeaving(null);
    setSaid("Rewriting the screenplay.");
    after.current = then ?? null;
    focusSoon(() => commentsHeading.current);
    const here = location.pathname;
    clearTimeout(rewrite.current);
    rewrite.current = window.setTimeout(
      () => {
        setTexts((t) => {
          const next = { ...t };
          for (const n of sent) {
            if (n.type === "suggestion") {
              next[n.block] = next[n.block].includes(n.quote) ? next[n.block].replace(n.quote, n.body) : n.body;
            } else {
              const b = screenplay.find((x) => x.id === n.block);
              if (b && (b.kind === "action" || b.kind === "dialogue")) next[n.block] = b.rewrite;
            }
          }
          return next;
        });
        crossfade(comments.current);
        setChanged((c) => new Set([...c, ...sent.map((n) => n.block)]));
        setNotes([]);
        setRewriting(false);
        setSaid("Comments sent. Changed passages are marked.");
        // The comments panel closes with nothing left in it: the keyboard goes to the screenplay heading rather than nowhere.
        focusSoon(() => (document.activeElement === document.body ? pageHeading.current : null));
        // Only from the page the comments were sent on: never pull someone back who has moved on.
        if (after.current && location.pathname === here) router.push(after.current);
      },
      reduced() ? 1200 : 2600,
    );
  };

  const discard = (then?: string) => {
    crossfade(comments.current);
    setNotes([]);
    // Leaving drops the half-written comment too; discarding the list from its own panel keeps what is being written.
    if (then) setComposer(null);
    setLeaving(null);
    setSaid("Comments discarded.");
    if (then) router.push(then);
  };

  const noted = new Set(notes.map((n) => n.block));
  const shot = (selected ? shotOf(selected) : undefined) ?? firstShot;
  /** The cards in the order of their passages; two on one passage keep the order they were added in. */
  const ordered = [...notes].sort((a, b) => orderOf[a.block] - orderOf[b.block]);
  /** The latest suggestion on each passage, drawn in the text. */
  const suggestionOf = new Map(notes.filter((n) => n.type === "suggestion").map((n) => [n.block, n]));
  const panelOpen = notes.length > 0 || Boolean(composer) || rewriting;

  let action;
  if (leaving)
    action = (
      <div className={`${s.barGroup} ${m.enter}`} role="group" aria-labelledby="leave-why">
        <span id="leave-why" className={s.reason}>
          {unsentCount > 1 ? "Your comments are not sent." : "Your comment is not sent."}
        </span>
        <Button ref={leaveFirst} variant="secondary" size="small" onClick={() => send(leaving.href)}>
          Send comments
        </Button>
        <Button variant="quiet" size="small" onClick={() => discard(leaving.href)}>
          Discard comments
        </Button>
        <Button
          variant="quiet"
          size="small"
          onClick={() => {
            const from = leaving.from;
            setLeaving(null);
            focusSoon(() => (from && document.contains(from) ? from : null));
          }}
        >
          Stay here
        </Button>
      </div>
    );
  else if (rewriting) action = <BlockedAction id="continue-why" label="Continue to references" reason="Rewriting the screenplay." />;
  else if (notes.length > 0)
    // Unsent comments make sending the next step; going on stays one press away and asks first.
    action = (
      <div className={s.barGroup}>
        <ButtonLink variant="secondary" href="/app/episode/references">
          Continue to references
        </ButtonLink>
        <Button onClick={() => send()}>Send comments</Button>
      </div>
    );
  else action = <ButtonLink href="/app/episode/references">Continue to references</ButtonLink>;

  return (
    <AppShell
      section="/app"
      title={<EpisodeTitle />}
      bar={<Stepper current="screenplay" />}
      actions={action}
    >
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      <div className={`${p.layout} ${s.fill}`} data-panel={panelOpen}>
        <Panel
          title={scriptTitle}
          level={1}
          flush
          busy={rewriting}
          headingRef={pageHeading}
          actions={
            <Button variant="quiet" size="small" icon={<ChevronIcon open={showPrompt} size={16} />} aria-expanded={showPrompt} aria-controls="sp-prompt" onClick={() => setShowPrompt((v) => !v)}>
              {showPrompt ? "Hide prompt" : "Show prompt"}
            </Button>
          }
        >
          {showPrompt && shot && (
            <div id="sp-prompt" className={`${s.inset} ${p.prompt} ${m.enter}`}>
              <p className="label muted">Prompt for {shot.text}</p>
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
                <Button
                  variant="quiet"
                  size="small"
                  onClick={() => {
                    const keep = Boolean(composer);
                    discard();
                    focusSoon(() => (keep ? commentsHeading.current : pageHeading.current));
                  }}
                >
                  Discard comments
                </Button>
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
                      <Button variant="quiet" size="small" className={p.remove} onClick={() => removeNote(n)} aria-label="Remove comment">
                        <GestureIcon name="close" size={16} />
                      </Button>
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
                      {composer.text.trim() && composer.text.trim() !== (composer.type === "suggestion" ? composer.quote : "") ? (
                        <Button variant="secondary" size="small" onClick={add}>
                          {composer.type === "comment" ? "Add comment" : "Add suggestion"}
                        </Button>
                      ) : (
                        <BlockedAction
                          id="composer-why"
                          variant="secondary"
                          size="small"
                          label={composer.type === "comment" ? "Add comment" : "Add suggestion"}
                          reason={composer.type === "comment" ? "Write the comment first." : "Change the text first."}
                        />
                      )}
                      <Button variant="quiet" size="small" onClick={closeComposer}>
                        Cancel
                      </Button>
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
