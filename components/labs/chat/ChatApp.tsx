"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useReducer, useRef, useState, type DragEvent } from "react";
import { useCast } from "@/components/labs/app/CastProvider";
import { NEEDS_CHANGES, PLAY, busyLines, chips, init, nextStep, reduce, stateAt, type Action, type Quote, type Stage, type State } from "./agent";
import { CHLOE_OPTIONS, findChat, styleBySlug, type ProductionType } from "./data";
import { useFilePicker, usePhone, useReducedMotion } from "./hooks";
import { Composer, type ComposerHandle } from "./Composer";
import { QuestionCard, QuestionDialog } from "./Question";
import { Rail } from "./Rail";
import { Recents } from "./Recents";
import { TopBar } from "./TopBar";
import { Workspace } from "./Workspace";
import { GenerationsView } from "./views/GenerationsView";
import { NewChat } from "./views/NewChat";
import { PlayEpisode } from "./views/PlayEpisode";
import { PromptsView } from "./views/PromptsView";
import { ReferencesView } from "./views/ReferencesView";
import { ScreenplayView } from "./views/ScreenplayView";
import a from "./app.module.css";

type Props = {
  /** The chat's id; none on a new chat. */
  chat?: string;
  /** Opens the demo at this stage with the thread in place. */
  at?: Stage;
  /** How the script came in, when the chat has just been started. */
  file?: string;
  notion?: string;
  type?: string;
  style?: string;
};

const SCRIPT_TYPES = ".fdx,.txt,.docx,.pdf";
const isImage = (f: File) => f.type.startsWith("image/");
const words = (x: string, y: string) => x.trim().toLowerCase().replace(/[.!]+$/, "") === y.toLowerCase();

type Act = Action | { type: "replace"; state: State };
const run = (s: State, x: Act) => (x.type === "replace" ? x.state : reduce(s, x));

/** The creator as one screen: the top bar, the agent's rail at the left and the work at the right. */
export function ChatApp({ chat, at, file, notion, type: givenType, style: givenStyle }: Props) {
  const router = useRouter();
  const cast = useCast().get("second-chance");
  const chloe = useMemo(
    () =>
      CHLOE_OPTIONS.map((tag) => cast.sheets.find((s) => s.tag === tag))
        .filter((s) => s !== undefined)
        .map((s) => ({ id: s.tag, label: s.tag, line: s.variant, thumb: s.src, src: s.src })),
    [cast],
  );
  const [state, dispatch] = useReducer(run, null, () => {
    if (!chat) return init(chloe);
    if (at && at !== "new") return stateAt(at, chloe);
    return reduce(init(chloe), { type: "drop", file: notion ? undefined : (file ?? "reflection.fdx"), notion });
  });

  const { group, chat: row } = findChat(chat ?? "");
  const [type, setType] = useState<ProductionType>((givenType as ProductionType) || group.type);
  const [style, setStyle] = useState(() => styleBySlug(givenStyle));
  const [text, setText] = useState("");
  const [quote, setQuote] = useState<Quote | undefined>();
  const [modal, setModal] = useState(true);
  const [questionId, setQuestionId] = useState(state.question?.id);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [line, setLine] = useState(0);
  const composer = useRef<ComposerHandle>(null);
  const uploadFor = useRef<string | null>(null);
  const phone = usePhone();
  const reduced = useReducedMotion();

  // A new question opens large again.
  if (state.question?.id !== questionId) {
    setQuestionId(state.question?.id);
    setModal(true);
  }

  // On a phone, when the agent makes something the sheet goes down so the work shows.
  const last = state.msgs[state.msgs.length - 1];
  const [seenMsg, setSeenMsg] = useState(last?.id);
  if (last?.id !== seenMsg) {
    setSeenMsg(last?.id);
    if (last?.from === "agent" && last.artifact) setExpanded(false);
  }

  /* The agent's work: its status lines change, then the step it was doing lands. */
  const pending = state.pending;
  useEffect(() => {
    if (!pending) return;
    if (reduced) {
      dispatch(pending.done);
      return;
    }
    const total = 1500 + Math.min(pending.status.length - 1, 2) * 500;
    const each = total / pending.status.length;
    const timers = pending.status.map((_, i) => window.setTimeout(() => setLine(i), i * each));
    timers.push(window.setTimeout(() => dispatch(pending.done), total));
    return () => timers.forEach(clearTimeout);
  }, [pending, reduced]);

  /* Clips arrive one by one while the episode generates. */
  const developing = state.stage === "generating" ? state.gens.find((g) => g.status === "developing")?.n : undefined;
  useEffect(() => {
    if (developing === undefined) return;
    const t = window.setTimeout(() => dispatch({ type: "land", n: developing }), reduced ? 0 : 1800);
    return () => clearTimeout(t);
  }, [developing, reduced]);

  const start = (params: Record<string, string>, id = "second-chance-1") => {
    const q = new URLSearchParams({ ...params, type, style: style.slug });
    router.push(`/app/c/${id}?${q}`);
  };

  const pickImages = useFilePicker("image/*", (files) => addImages(files));
  const pickScript = useFilePicker(SCRIPT_TYPES, (files) => addScript(files[0]));

  function addScript(f: File | undefined) {
    if (!f) return;
    if (!chat) return start({ file: f.name });
    dispatch({ type: "replace", state: reduce(init(chloe), { type: "drop", file: f.name }) });
  }
  function addImages(files: File[]) {
    const img = files.find(isImage);
    if (!img) return;
    const id = uploadFor.current ?? state.refs.find((r) => !r.src)?.id;
    uploadFor.current = null;
    if (id) dispatch({ type: "upload", id, src: URL.createObjectURL(img) });
  }
  const fromNotion = (id: string, title: string) => start({ notion: title }, id);

  /* On a phone the work leaves room at its foot for the collapsed sheet, whatever it holds. */
  const root = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = railRef.current;
    if (!el || !phone || expanded) return;
    const ro = new ResizeObserver(() => root.current?.style.setProperty("--sheet", `${el.offsetHeight}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, [phone, expanded]);

  const focusComposer = () => window.setTimeout(() => composer.current?.focus(), 0);

  function send(words_: string) {
    if (!chat) {
      start({ file: "reflection.fdx" });
      return;
    }
    if (words(words_, PLAY)) return setPlaying(true);
    if (words(words_, NEEDS_CHANGES)) {
      setQuote({ label: `Generation ${state.selected}`, gen: state.selected });
      dispatch({ type: "view", view: "generations" });
      return focusComposer();
    }
    dispatch({ type: "say", text: words_, quote });
    setText("");
    setQuote(undefined);
  }

  function answer(answers: (string | null)[]) {
    const q = state.question;
    if (q?.id.startsWith("missing:") && answers[0] === "upload") {
      uploadFor.current = q.id.replace("missing:", "");
      pickImages();
    }
    dispatch({ type: "answer", answers });
    // On a phone, focusing the box would open the keyboard over the board the answer just changed: the sheet's handle takes focus instead.
    if (!phone) focusComposer();
    else window.setTimeout(() => railRef.current?.querySelector<HTMLElement>("button[aria-expanded]")?.focus({ preventScroll: true }), 0);
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = [...e.dataTransfer.files];
    if (!files.length) return;
    if (files.some(isImage) && chat) addImages(files);
    else addScript(files.find((f) => !isImage(f)) ?? files[0]);
  };

  const busy = busyLines(state);
  const busyLine = busy ? busy[Math.min(line, busy.length - 1)] : null;
  const imagesQuestion = Boolean(state.question && (state.question.images || phone));
  const asModal = imagesQuestion && modal;
  const approvedAll = state.gens.every((g) => g.approved);

  const view = (() => {
    switch (state.view) {
      case "new":
        return <NewChat type={type} style={style} onType={setType} onStyle={setStyle} onScript={pickScript} onNotion={fromNotion} dragging={dragging} />;
      case "screenplay":
        return (
          <ScreenplayView
            revised={state.revised}
            onQuote={(q) => {
              setQuote(q);
              if (phone) setExpanded(true);
              focusComposer();
            }}
          />
        );
      case "references":
        return (
          <ReferencesView
            refs={state.refs}
            onRetag={(id, tag) => dispatch({ type: "retag", id, tag })}
            onSheet={(id, tag, src) => dispatch({ type: "chooseSheet", id, tag, src })}
            onUpload={(id) => {
              uploadFor.current = id;
              pickImages();
            }}
            onGenerate={(id) => dispatch({ type: "askMissing", id })}
          />
        );
      case "prompts":
        return <PromptsView gens={state.gens} quoted={state.quoted} />;
      case "generations":
        return (
          <GenerationsView
            gens={state.gens}
            selected={state.selected}
            approvedAll={approvedAll}
            onSelect={(n) => dispatch({ type: "select", n })}
            onTake={(n, take) => dispatch({ type: "pickTake", n, take })}
            onApprove={(n) => dispatch({ type: "approve", n })}
            onNeedsChanges={(n) => {
              dispatch({ type: "select", n });
              setQuote({ label: `Generation ${n}`, gen: n });
              if (phone) setExpanded(true);
              focusComposer();
            }}
            onPlayAll={() => setPlaying(true)}
          />
        );
    }
  })();

  return (
    <div
      ref={root}
      className={a.app}
      data-phone-open={(phone && expanded) || undefined}
      onDragOver={(e) => {
        e.preventDefault();
        if (!dragging) setDragging(true);
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDragging(false)}
      onDrop={onDrop}
    >
      <TopBar current={chat} series={chat ? group.series : undefined} title={chat ? row.label : undefined} type={type} style={style} onType={setType} onStyle={setStyle} />

      <aside ref={railRef} className={a.rail} aria-label="Nine Lives agent">
        <Rail
          msgs={state.msgs}
          empty={chat ? undefined : <Recents />}
          busy={busyLine}
          onOpen={(k) => {
            dispatch({ type: "view", view: k });
            setExpanded(false);
          }}
          chips={chat ? chips(state, quote) : []}
          onChip={send}
          question={state.question && !asModal ? <QuestionCard key={state.question.id} question={state.question} mode="dock" onAnswer={answer} onExpand={state.question.images ? () => setModal(true) : undefined} /> : null}
          composer={
            <Composer
              ref={composer}
              text={text}
              onText={setText}
              quote={quote}
              onClearQuote={() => setQuote(undefined)}
              next={chat ? nextStep(state) : null}
              busy={Boolean(state.pending)}
              onSend={send}
              onScript={pickScript}
              onImages={pickImages}
              onNotion={fromNotion}
            />
          }
          phone={phone}
          expanded={expanded}
          onExpanded={setExpanded}
        />
      </aside>

      <main id="main" tabIndex={-1} className={a.work} data-view={state.view}>
        <Workspace made={state.made} view={state.view} onView={(k) => dispatch({ type: "view", view: k })}>
          {view}
        </Workspace>
      </main>

      <QuestionDialog question={asModal ? state.question : null} onAnswer={answer} onClose={() => setModal(false)} />
      <PlayEpisode
        open={playing}
        onClose={() => setPlaying(false)}
        clips={state.gens.filter((g) => g.status === "ready").map((g) => ({ n: g.n, ...g.takes[g.take] }))}
      />
    </div>
  );
}
