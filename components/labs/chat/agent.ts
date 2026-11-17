/**
 * The scripted agent: one reducer over the demo's stages (round 8 spec, "The demo script").
 * Every owner message goes through `say`, which matches the reply chips by their words and otherwise reads the
 * message as feedback (screenplay, review) or as "go on" (anywhere else). Work the agent does takes a short
 * `pending` step: the view shows its status lines, then dispatches `pending.done`. `stateAt` replays the
 * owner's steps with that work finished at once, so `?at=<stage>` opens with the thread already in place.
 */
import { generations, type Take } from "@/lib/labs/maker";
import { FAILS, FEEDBACK_CLIP, FEEDBACK_SCRIPT, SCRIPT_TITLE, firstTake, genCount, madeArt, newTake, quote, sceneCount, startingRefs, type Ref } from "./data";

export const stages = ["new", "script", "revised", "references", "submitted", "quote", "generating", "review", "iterating", "approved"] as const;
export type Stage = (typeof stages)[number];

export type ArtifactKey = "screenplay" | "references" | "prompts" | "generations";
export type View = "new" | ArtifactKey;
export const artifactOrder: ArtifactKey[] = ["screenplay", "references", "prompts", "generations"];
export const artifactName: Record<ArtifactKey, string> = { screenplay: "Screenplay", references: "References", prompts: "Prompts", generations: "Generations" };

/** What the owner's message is about: a passage of the screenplay or one generation. */
export type Quote = { label: string; block?: string; gen?: number };

export type Msg =
  /** `action` marks a line that only records a pressed step ("Generate"), drawn quieter than typed words. */
  | { id: number; from: "me"; text: string; file?: string; notion?: string; quote?: string; action?: boolean }
  | { id: number; from: "agent"; text: string; artifact?: ArtifactKey; thumb?: string };

export type Gen = { n: number; summary: string; prompt: string; status: "developing" | "ready" | "failed"; takes: Take[]; take: number; approved: boolean; tries: number };

export type QOption = { id: string; label: string; line?: string; thumb?: string; src?: string };
export type QStep = { question: string; options: QOption[] };
export type Question = { id: string; steps: QStep[]; images: boolean };

export type Action =
  | { type: "drop"; file?: string; notion?: string }
  | { type: "say"; text: string; quote?: Quote }
  | { type: "read" }
  | { type: "revise" }
  | { type: "refsFound" }
  | { type: "answer"; answers: (string | null)[] }
  | { type: "askMissing"; id: string }
  | { type: "make"; id: string }
  | { type: "upload"; id: string; src: string }
  | { type: "chooseSheet"; id: string; tag: string; src: string }
  | { type: "retag"; id: string; tag: string }
  | { type: "submit" }
  | { type: "promptsReady" }
  | { type: "quoteReady" }
  | { type: "land"; n: number }
  | { type: "retried"; n: number }
  | { type: "rerolled"; n: number }
  | { type: "select"; n: number }
  | { type: "pickTake"; n: number; take: number }
  | { type: "approve"; n: number }
  | { type: "view"; view: View };

export type State = {
  stage: Stage;
  msgs: Msg[];
  seq: number;
  made: ArtifactKey[];
  view: View;
  revised: boolean;
  refs: Ref[];
  question: Question | null;
  quoted: boolean;
  gens: Gen[];
  selected: number;
  pending: { status: string[]; done: Action } | null;
  /** The two Chloe sheets the references question offers, from the cast data. */
  chloe: QOption[];
};

/* Reply words. A chip sends these; typing them does the same. */
export const GO_REFS = "Go to references";
export const SUBMIT = "Submit references";
export const CHECK_QUOTE = "Check the quote";
export const GENERATE = "Generate";
export const APPROVE_ALL = "Approve all";
export const NEEDS_CHANGES = "Needs changes";
export const RETRY = `Retry generation ${FAILS}`;
export const PLAY = "Play episode";

const startGens = (): Gen[] =>
  generations.map((g) => ({ n: g.n, summary: g.summary, prompt: g.prompt, status: "developing", takes: [firstTake(g.n)], take: 0, approved: false, tries: 1 }));

export function init(chloe: QOption[]): State {
  return { stage: "new", msgs: [], seq: 0, made: [], view: "new", revised: false, refs: startingRefs, question: null, quoted: false, gens: startGens(), selected: 1, pending: null, chloe };
}

type NewMsg = Msg extends infer M ? (M extends Msg ? Omit<M, "id"> : never) : never;
const add = (s: State, m: NewMsg): State => ({ ...s, msgs: [...s.msgs, { ...m, id: s.seq + 1 } as Msg], seq: s.seq + 1 });
const me = (s: State, text: string, quote?: Quote, action?: boolean) => add(s, { from: "me", text, quote: quote?.label, ...(action ? { action } : {}) });
const steps_ = () => [GO_REFS, SUBMIT, CHECK_QUOTE, GENERATE, APPROVE_ALL, RETRY, PLAY];
const agent = (s: State, text: string, artifact?: ArtifactKey, thumb?: string) => add(s, { from: "agent", text, artifact, thumb });
const work = (s: State, status: string[], done: Action): State => ({ ...s, pending: { status, done } });
const show = (s: State, view: ArtifactKey): State => ({ ...s, view, made: s.made.includes(view) ? s.made : artifactOrder.filter((k) => k === view || s.made.includes(k)) });
const setGen = (s: State, n: number, fn: (g: Gen) => Gen): State => ({ ...s, gens: s.gens.map((g) => (g.n === n ? fn(g) : g)) });
const same = (a: string, b: string) => a.trim().toLowerCase().replace(/[.!]+$/, "") === b.toLowerCase();

export const readyRefs = (s: State) => s.refs.filter((r) => r.src).length;
const allApproved = (s: State) => s.gens.every((g) => g.approved);

function chloeQuestion(s: State): Question {
  return {
    id: "chloe",
    images: true,
    steps: [
      { question: "Which Chloe sheet for scene 2?", options: s.chloe },
      { question: "Use it for", options: ["This scene", "Following scenes", "Project default"].map((x) => ({ id: x, label: x })) },
    ],
  };
}

function missingQuestion(r: Ref): Question {
  const prompter = r.kind === "location" ? "environment" : "prop";
  return {
    id: `missing:${r.id}`,
    images: false,
    steps: [
      {
        question: `${r.name} has no image. Make one or upload?`,
        options: [
          { id: "generate", label: `Generate with the ${prompter} prompter` },
          { id: "upload", label: "Upload" },
        ],
      },
    ],
  };
}

function approveAll(s: State): State {
  const next = { ...s, gens: s.gens.map((g) => (g.status === "ready" ? { ...g, approved: true } : g)) };
  if (allApproved(next)) return agent({ ...next, stage: "approved" }, "Episode 1 approved.", "generations");
  const left = next.gens.filter((g) => !g.approved).map((g) => g.n);
  return agent(next, `Approved the rest. Generation ${left.join(", ")} has no clip.`);
}

/** An owner message, typed or sent by a chip. */
function say(s: State, text: string, quote?: Quote): State {
  if (s.stage === "new") return reduce(s, { type: "drop", file: "reflection.fdx" });
  const words = text.trim();
  const m = me(s, text, quote, steps_().some((x) => same(words, x)));
  if (same(words, GO_REFS) && (s.stage === "script" || s.stage === "revised")) return work(m, ["Checking references in Notion", "Matching sheets to the scenes"], { type: "refsFound" });
  if (same(words, SUBMIT) && s.stage === "references") return work({ ...m, question: null }, ["Writing the prompts", `Writing ${genCount} prompts`], { type: "promptsReady" });
  if (same(words, CHECK_QUOTE) && (s.stage === "submitted" || s.stage === "quote")) return work(m, ["Asking Dreamina for a quote"], { type: "quoteReady" });
  if (same(words, GENERATE) && (s.stage === "submitted" || s.stage === "quote")) {
    const next = show({ ...m, stage: "generating", gens: startGens(), selected: 1 }, "generations");
    return agent(next, `Generating ${genCount} clips.`, "generations", next.gens[0].takes[0].poster);
  }
  if (same(words, RETRY) && s.gens.some((g) => g.status === "failed")) {
    return work(setGen(m, FAILS, (g) => ({ ...g, status: "developing", tries: g.tries + 1 })), [`Generating clip ${FAILS} again`], { type: "retried", n: FAILS });
  }
  if (same(words, APPROVE_ALL) && (s.stage === "review" || s.stage === "iterating")) return approveAll(m);

  switch (s.stage) {
    case "script":
    case "revised":
      return work(m, ["Reading your note", "Revising the screenplay"], { type: "revise" });
    case "review":
    case "iterating":
    case "approved": {
      const n = quote?.gen ?? s.selected;
      const next = setGen({ ...m, selected: n, stage: "iterating" }, n, (g) => ({ ...g, status: "developing", approved: false }));
      return work(agent(next, `Rerolling generation ${n}.`), [`Generating a new take of clip ${n}`], { type: "rerolled", n });
    }
    case "references":
      return say({ ...s, question: null }, SUBMIT);
    case "submitted":
      return say(s, CHECK_QUOTE);
    case "quote":
      return say(s, GENERATE);
    default:
      return agent(m, "The clips are still coming in.");
  }
}

export function reduce(s: State, a: Action): State {
  switch (a.type) {
    case "drop": {
      const m = add({ ...s, stage: "script" }, { from: "me", text: "", file: a.file, notion: a.notion });
      return work(m, ["Reading the script", "Splitting into generations"], { type: "read" });
    }
    case "say":
      return say(s, a.text, a.quote);
    case "read":
      return agent(show({ ...s, pending: null, stage: "script" }, "screenplay"), `Read ${SCRIPT_TITLE}. ${sceneCount} scenes, ${genCount} generations.`, "screenplay");
    case "revise":
      return agent(show({ ...s, pending: null, stage: "revised", revised: true }, "screenplay"), "Changed 2 passages.", "screenplay");
    case "refsFound": {
      const next = show({ ...s, pending: null, stage: "references" }, "references");
      const said = agent(next, "Found 4 references in Notion. Cemetery and Umbrella have no image.", "references");
      return { ...said, question: chloeQuestion(s) };
    }
    case "answer": {
      const q = s.question;
      if (!q) return s;
      const cleared = { ...s, question: null };
      const picked = a.answers.map((x, i) => q.steps[i]?.options.find((o) => o.id === x)?.label ?? x).filter(Boolean) as string[];
      if (q.id === "chloe") {
        const opt = s.chloe.find((o) => o.id === a.answers[0]);
        if (!picked.length) return me(cleared, "Skipped", undefined, true);
        const m = me(cleared, picked.join(", "), undefined, true);
        if (!opt) return m;
        const chosen = reduce(m, { type: "chooseSheet", id: "chloe", tag: opt.id, src: opt.src ?? "" });
        return agent(chosen, `Chloe is ${opt.id}.`, "references", opt.thumb);
      }
      const id = q.id.replace("missing:", "");
      const r = s.refs.find((x) => x.id === id);
      if (!r || !a.answers[0]) return me(cleared, "Skipped", undefined, true);
      const m = me(cleared, picked[0], undefined, true);
      if (a.answers[0] === "upload") return m;
      const prompter = r.kind === "location" ? "environment" : "prop";
      return work(m, [`Making the ${r.name.toLowerCase()} with the ${prompter} prompter`], { type: "make", id });
    }
    case "askMissing": {
      const r = s.refs.find((x) => x.id === a.id);
      return r ? { ...s, question: missingQuestion(r) } : s;
    }
    case "make": {
      const src = madeArt[a.id];
      const r = s.refs.find((x) => x.id === a.id);
      // No art in public/ reads as this element: the slot stays empty rather than showing a wrong picture.
      if (!src) return agent(show({ ...s, pending: null }, "references"), `The prompter returned no ${r?.name.toLowerCase() ?? "image"}.`);
      const next = { ...s, pending: null, refs: s.refs.map((x) => (x.id === a.id ? { ...x, src } : x)) };
      return agent(show(next, "references"), `${r?.name ?? "Reference"} made.`, "references", src);
    }
    case "upload": {
      const r = s.refs.find((x) => x.id === a.id);
      const next = { ...s, refs: s.refs.map((x) => (x.id === a.id ? { ...x, src: a.src } : x)) };
      return agent(next, `${r?.name ?? "Reference"} added.`, "references", a.src);
    }
    case "chooseSheet":
      return { ...s, refs: s.refs.map((x) => (x.id === a.id ? { ...x, tag: a.tag, src: a.src } : x)) };
    case "retag":
      return { ...s, refs: s.refs.map((x) => (x.id === a.id ? { ...x, tag: a.tag } : x)) };
    case "submit":
      return say(s, SUBMIT);
    case "promptsReady":
      return agent(show({ ...s, pending: null, stage: "submitted" }, "prompts"), `Wrote ${genCount} prompts.`, "prompts");
    case "quoteReady":
      return agent(show({ ...s, pending: null, stage: "quote", quoted: true }, "prompts"), `${quote.provider} quote is in.`, "prompts");
    case "land": {
      const next = setGen(s, a.n, (g) => ({ ...g, status: g.n === FAILS && g.tries === 1 ? "failed" : "ready" }));
      if (s.stage !== "generating" || next.gens.some((g) => g.status === "developing")) return next;
      const failed = next.gens.filter((g) => g.status === "failed").map((g) => g.n);
      return agent({ ...next, stage: "review", selected: 1 }, failed.length ? `Clips are in. Generation ${failed.join(", ")} failed.` : "Clips are in.", "generations");
    }
    case "retried": {
      const next = setGen({ ...s, pending: null, selected: a.n }, a.n, (g) => ({ ...g, status: "ready" }));
      return agent(next, `Generation ${a.n} is in.`, "generations", next.gens[a.n - 1].takes[0].poster);
    }
    case "rerolled": {
      const next = setGen({ ...s, pending: null, selected: a.n }, a.n, (g) => ({ ...g, status: "ready", takes: [...g.takes, newTake(g.takes.length)], take: g.takes.length }));
      const g = next.gens[a.n - 1];
      return agent(show(next, "generations"), `Generation ${a.n}, ${g.takes[g.take].name.toLowerCase()}.`, "generations", g.takes[g.take].poster);
    }
    case "select":
      return { ...s, selected: a.n };
    case "pickTake":
      return setGen(s, a.n, (g) => ({ ...g, take: a.take }));
    case "approve": {
      const next = setGen(s, a.n, (g) => (g.status === "ready" ? { ...g, approved: !g.approved } : g));
      if (s.stage !== "approved" && allApproved(next)) return agent({ ...next, stage: "approved" }, "Episode 1 approved.", "generations");
      return next;
    }
    case "view":
      return { ...s, view: a.view };
  }
}

/** Finishes the agent's work at once: what `?at=` and reduced motion use. */
export function settle(s: State): State {
  let next = s;
  while (next.pending) next = reduce({ ...next }, next.pending.done);
  return next;
}

const landAll = (s: State) => s.gens.reduce((acc, g) => (g.status === "developing" ? reduce(acc, { type: "land", n: g.n }) : acc), s);

/** The owner's steps up to each stage, in order. */
const steps: [Stage, (s: State) => State][] = [
  ["script", (s) => settle(reduce(s, { type: "drop", file: "reflection.fdx" }))],
  ["revised", (s) => settle(reduce(s, { type: "say", text: FEEDBACK_SCRIPT, quote: { label: "On: ELENA watches from behind the tree...", block: "a3" } }))],
  ["references", (s) => settle(reduce(s, { type: "say", text: GO_REFS }))],
  [
    "submitted",
    (s) => {
      const opt = s.chloe[1];
      const answered = reduce(s, { type: "answer", answers: [opt?.id ?? null, "Following scenes"] });
      return settle(reduce(answered, { type: "say", text: SUBMIT }));
    },
  ],
  ["quote", (s) => settle(reduce(s, { type: "say", text: CHECK_QUOTE }))],
  ["generating", (s) => reduce(s, { type: "say", text: GENERATE })],
  ["review", (s) => landAll(s)],
  ["iterating", (s) => settle(reduce(reduce(s, { type: "select", n: 4 }), { type: "say", text: FEEDBACK_CLIP, quote: { label: "Generation 4", gen: 4 } }))],
  ["approved", (s) => reduce(settle(reduce(s, { type: "say", text: RETRY })), { type: "say", text: APPROVE_ALL })],
];

export function stateAt(stage: Stage, chloe: QOption[]): State {
  let s = init(chloe);
  for (const [name, step] of steps) {
    s = step(s);
    if (name === stage) break;
  }
  // The review opens on generation 1, as the spec has it.
  if (stage === "review") s = { ...s, selected: 1 };
  return s;
}

/** The alternatives to the composer's main action: never the main action itself. */
export function chips(s: State, quote?: Quote): string[] {
  const next = nextStep(s);
  return replies(s, quote).filter((c) => c !== next);
}

function replies(s: State, quote?: Quote): string[] {
  if (s.pending || s.question) return [];
  switch (s.stage) {
    case "script":
      return [FEEDBACK_SCRIPT, GO_REFS];
    case "revised":
      return [GO_REFS];
    case "references":
      return [SUBMIT];
    case "submitted":
      return [CHECK_QUOTE, GENERATE];
    case "quote":
      return [GENERATE];
    case "review":
    case "iterating":
      if (quote?.gen) return [FEEDBACK_CLIP];
      return [APPROVE_ALL, NEEDS_CHANGES, ...(s.gens.some((g) => g.status === "failed") ? [RETRY] : [])];
    case "approved":
      return [PLAY];
    default:
      return [];
  }
}

/** The composer's main action when the box is empty: the next step, if there is one. */
export function nextStep(s: State): string | null {
  if (s.pending || s.question) return null;
  switch (s.stage) {
    case "script":
    case "revised":
      return GO_REFS;
    case "references":
      return SUBMIT;
    case "submitted":
    case "quote":
      return GENERATE;
    case "review":
    case "iterating":
      return s.gens.some((g) => g.status === "developing") ? null : APPROVE_ALL;
    case "approved":
      return PLAY;
    default:
      return null;
  }
}

/** The one status line while the agent works. */
export function busyLines(s: State): string[] | null {
  if (s.pending) return s.pending.status;
  const making = s.gens.filter((g) => g.status === "developing").length;
  if (s.stage === "generating" && making) return [`Generating ${making} clip${making === 1 ? "" : "s"}`];
  return null;
}
