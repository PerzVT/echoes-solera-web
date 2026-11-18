"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatedMark, AsciiField, MediaFrame, PlayPauseIcon, VolumeIcon } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { Icon } from "@/components/labs/Icon";
import { Btn, cx } from "@/components/labs/chat/ui";
import { clock, type Take } from "@/lib/labs/maker";
import { AppShell } from "./AppShell";
import { useCast } from "./CastProvider";
import { makeClip, plannedClips, retakeClip } from "./generate";
import { Alert, SaveAction, revealOnPhone } from "./parts";
import { Record } from "./Record";
import type { Gen as Saved } from "./script";
import r from "./ResultsStep.module.css";

/** "new" arrives from Generate: every clip is still developing. */
export type ResultsState = "new" | "default";

type Decision = "approved" | "denied";
type Gen = Saved & { developing: boolean; /** Why the last take did not come back. */ error?: string };

const statusOf = (g: Gen) => (g.developing ? "Generating" : g.decision === "approved" ? "Approved" : g.decision === "denied" ? "Denied" : g.error ? "Failed" : "Ready");

/** Results: the clips, the selected one large, and for each Approve, Deny or Retry with feedback. */
export function ResultsStep({ initial, open }: { initial: ResultsState; open?: string }) {
  const router = useRouter();
  const store = useCast();
  // An episode opened from the Library becomes the one the flow works on, so the other steps show its work too.
  const key = open ?? store.current;
  const ep = store.episodeOf(key);
  useEffect(() => {
    if (open) store.setCurrent(open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const [gens, setGens] = useState<Gen[]>(() => (ep.gens ?? (ep.id || ep.isNew ? [] : plannedClips(store.tool, ep.blocks, true))).map((g) => ({ ...g, developing: initial === "new" })));
  // Takes and decisions belong to the episode, so a reload or a later visit finds them.
  useEffect(() => {
    store.patch(key, { gens: gens.map((g) => ({ n: g.n, block: g.block, summary: g.summary, takes: g.takes, decision: g.decision, prompt: g.prompt, references: g.references })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gens]);
  const [selected, setSelected] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [said, setSaid] = useState("");
  const [full, setFull] = useState(false);
  const retakeAt = useRef(0);
  const alive = useRef(true);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    alive.current = true;
    return () => void (alive.current = false);
  }, []);
  const style = ep.style ?? "";

  const update = (n: number, fn: (g: Gen) => Gen) => setGens((all) => all.map((g) => (g.n === n ? fn(g) : g)));

  /** Takes still being made; leaving the screen stops them. */
  const stops = useRef(new Set<AbortController>());
  useEffect(() => () => stops.current.forEach((c) => c.abort()), []);
  const failure = (e: unknown, fallback: string) => (e instanceof Error && e.name !== "AbortError" && e.message ? e.message : fallback);

  /** Makes a generation's first take. A take already there (or the empty slot a new generation starts with) is replaced. */
  const make = (g: Gen, index: number) => {
    const stop = new AbortController();
    stops.current.add(stop);
    update(g.n, (x) => ({ ...x, developing: true, error: undefined }));
    makeClip({ tool: store.tool, gen: g, style, index, episodeId: ep.id }, stop.signal)
      .then(
        ({ take }) => {
          if (!alive.current) return;
          update(g.n, (x) => ({ ...x, developing: false, takes: [take, ...x.takes.filter((t) => (t.src || t.poster) && (t.src !== take.src || t.poster !== take.poster))] }));
          setSaid(`Generation ${g.n} is ready.`);
        },
        (e: unknown) => {
          if (!alive.current || stop.signal.aborted) return;
          update(g.n, (x) => ({ ...x, developing: false, error: failure(e, "This generation did not come back. Try again.") }));
          setSaid(`Generation ${g.n} did not come back.`);
        },
      )
      .finally(() => stops.current.delete(stop));
  };

  // From Generate: every clip is made, and each comes in as it is ready.
  useEffect(() => {
    if (initial !== "new") return;
    gens.forEach((g, index) => make(g, index));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const g = gens.find((x) => x.n === selected) ?? gens[0];
  const take = g?.takes[0];
  /** Nothing made yet: the first take failed before anything came back. */
  const empty = !take?.src && !take?.poster;
  const decided = gens.length > 0 && gens.every((x) => !x.developing && x.decision);

  const decide = (d: Decision) => {
    const undo = g.decision === d;
    update(g.n, (x) => ({ ...x, decision: undo ? undefined : d }));
    setFeedback(null);
    setSaid(undo ? `Generation ${g.n} is undecided.` : `Generation ${g.n} ${d}.`);
    // The next clip still waiting for a decision comes up, so the person can go down the list.
    const next = gens.find((x) => x.n !== g.n && !x.developing && !x.decision);
    if (next && !undo) setSelected(next.n);
  };

  const retry = () => {
    if (!feedback?.trim()) return;
    const n = g.n;
    update(n, (x) => ({ ...x, developing: true, decision: undefined, error: undefined }));
    setFeedback(null);
    setSaid(`Generation ${n} is being made again.`);
    const stop = new AbortController();
    stops.current.add(stop);
    retakeClip({ tool: store.tool, gen: g, style, feedback, attempt: retakeAt.current++, episodeId: ep.id }, stop.signal)
      .then(
        ({ take }) => {
          if (!alive.current) return;
          update(n, (x) => ({ ...x, developing: false, takes: [take, ...x.takes.filter((t) => t.src || t.poster)] }));
          setSaid(`A new take of generation ${n} is ready.`);
        },
        (e: unknown) => {
          if (!alive.current || stop.signal.aborted) return;
          update(n, (x) => ({ ...x, developing: false, error: failure(e, "The new take did not come back. Try again.") }));
          setSaid(`The new take of generation ${n} did not come back.`);
        },
      )
      .finally(() => stops.current.delete(stop));
  };

  // A new episode is added to its series on Finish. An episode already in the Library is saved as it goes, so Done only goes back.
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");
  const finish = async () => {
    if (!ep.isNew) return router.push(store.profile.seriesHref(ep.series));
    setFinishing(true);
    setFinishError("");
    try {
      await store.finish(key, gens[0]?.takes[0]?.poster ?? "");
      router.push(store.profile.library);
    } catch (e) {
      setFinishError(e instanceof Error && e.message ? e.message : "That did not save. Try again.");
      setFinishing(false);
    }
  };

  return (
    <AppShell
      step="results"
      view={ep.isNew ? "create" : "library"}
      fit
      action={
        <SaveAction error={finishError}>
          <Btn kind="primary" icon={<Icon name={ep.isNew ? "save" : "check"} size={16} />} disabled={ep.isNew ? !decided : gens.some((x) => x.developing)} loading={finishing} onClick={finish}>
            {ep.isNew ? "Finish" : "Done"}
          </Btn>
        </SaveAction>
      }
    >
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      {!g ? (
        <div className={r.list}>
          <h1 className={r.title}>Results</h1>
          <p className={r.none}>No generations yet.</p>
        </div>
      ) : (
      <div className={r.layout}>
        <section className={r.list} aria-labelledby="gens-title">
          <h1 id="gens-title" className={r.title}>
            Results
          </h1>
          <ul className={r.rows}>
            {gens.map((x) => (
              <li key={x.n}>
                <button
                  type="button"
                  className={r.row}
                  aria-pressed={x.n === selected}
                  onClick={() => {
                    setSelected(x.n);
                    setFeedback(null);
                    requestAnimationFrame(() => revealOnPhone(stage.current));
                  }}
                >
                  <span className={r.thumb}>
                    {x.takes[0].poster && <Image src={x.takes[0].poster} alt="" fill sizes="56px" />}
                    {x.developing && (
                      <span className={r.develop}>
                        <AsciiField mode="scan" cell={5} intensity={0.5} speed={1.15} className={r.glyphs} />
                      </span>
                    )}
                  </span>
                  <span className={r.rowText}>
                    <span className={r.rowName}>Generation {x.n}</span>
                    <span className={r.rowSub}>{x.summary}</span>
                  </span>
                  <span className={r.status} data-status={statusOf(x).toLowerCase()}>
                    {x.developing ? <AnimatedMark variant="busy" size={14} /> : x.decision === "approved" ? <Icon name="check" size={14} /> : x.decision === "denied" ? <Icon name="close" size={14} /> : null}
                    {statusOf(x)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className={r.stage} ref={stage}>
          <Player key={`${g.n}-${take.src}-${g.developing}`} g={g} take={take} onFull={() => setFull(true)} />
          <div className={r.under}>
            <div className={r.caption}>
              <h2 className={r.genTitle}>
                Generation {g.n}
                {g.takes.length > 1 && <span className={r.takeName}>{take.name}</span>}
              </h2>
              <p className={r.rowSub}>{g.summary}</p>
            </div>
            <div className={r.actions}>
              <Btn kind={g.decision === "approved" ? "primary" : "secondary"} icon={<Icon name="check" size={16} />} aria-pressed={g.decision === "approved"} disabled={g.developing || empty} onClick={() => decide("approved")}>
                {g.decision === "approved" ? "Approved" : "Approve"}
              </Btn>
              <Btn kind="secondary" className={cx(g.decision === "denied" && r.denied)} icon={<Icon name="close" size={16} />} aria-pressed={g.decision === "denied"} disabled={g.developing || empty} onClick={() => decide("denied")}>
                {g.decision === "denied" ? "Denied" : "Deny"}
              </Btn>
              {empty ? (
                <Btn kind="ghost" icon={<Icon name="replay" size={16} />} disabled={g.developing} onClick={() => make(g, gens.indexOf(g))}>
                  Try again
                </Btn>
              ) : (
                <Btn kind="ghost" icon={<Icon name="replay" size={16} />} aria-expanded={feedback !== null} disabled={g.developing} onClick={() => setFeedback(feedback === null ? "" : null)}>
                  Retry with feedback
                </Btn>
              )}
            </div>
            {g.error && !g.developing && <Alert>{g.error}</Alert>}
            {feedback !== null && (
              <div className={r.feedback}>
                <label htmlFor="retry-feedback" className="sr-only">
                  Feedback
                </label>
                <textarea
                  id="retry-feedback"
                  className={r.feedbackBox}
                  placeholder={store.profile.feedbackHint}
                  value={feedback}
                  autoFocus
                  onChange={(e) => setFeedback(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) retry();
                    if (e.key === "Escape") setFeedback(null);
                  }}
                />
                <div className={r.feedbackActions}>
                  <Btn kind="ghost" small icon={<Icon name="close" size={16} />} onClick={() => setFeedback(null)}>
                    Cancel
                  </Btn>
                  <Btn kind="secondary" small icon={<Icon name="send" size={16} />} disabled={!feedback.trim()} onClick={retry}>
                    Send
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
      {g && take && (
        <Record
          open={full && !g.developing && Boolean(take.src)}
          shape="clip"
          label={`Generation ${g.n}`}
          onClose={() => setFull(false)}
          onPrev={gens.indexOf(g) > 0 ? () => setSelected(gens[gens.indexOf(g) - 1].n) : undefined}
          onNext={gens.indexOf(g) < gens.length - 1 ? () => setSelected(gens[gens.indexOf(g) + 1].n) : undefined}
          info={{
            title: `Generation ${g.n}`,
            made: take.made ?? (g.prompt ? { at: "", prompt: g.prompt } : undefined),
            note: g.summary,
            tool: store.tool === "anime" ? "Anime" : "Mini-series",
            project: store.series.find((c) => c.slug === ep.series)?.title ?? ep.newSeries ?? null,
            take: g.takes.length > 1 ? `${take.name}, ${g.takes.length - g.takes.indexOf(take)} of ${g.takes.length}` : null,
          }}
        >
          <Player key={`full-${g.n}-${take.src}`} g={g} take={take} big />
        </Record>
      )}
    </AppShell>
  );
}

/** The selected take, large: plays muted on a loop, with play and pause and sound. While it is being made, glyphs scan over its poster. */
function Player({ g, take, onFull, big }: { g: Gen; take: Take; onFull?: () => void; big?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  if (g.developing || !take.src)
    return (
      <div className={r.screen}>
        {take.poster && <Image src={take.poster} alt="" fill sizes="420px" />}
        {g.developing && (
          <span className={r.develop}>
            <AsciiField mode="scan" cell={8} intensity={0.5} speed={1.15} className={r.glyphs} />
          </span>
        )}
      </div>
    );

  return (
    <div className={r.screen} data-big={big || undefined}>
      <MediaFrame fill>
        <video
          ref={video}
          src={take.src}
          poster={take.poster || undefined}
          crossOrigin="anonymous"
          muted={muted}
          autoPlay
          playsInline
          loop
          preload="metadata"
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          aria-label={`Generation ${g.n}, ${take.name}`}
        />
      </MediaFrame>
      <div className={r.controls}>
        <button type="button" className={r.over} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          <PlayPauseIcon playing={playing} size={18} />
          <span className={r.time}>{clock(time)}</span>
        </button>
        <span className={r.overs}>
          <button type="button" className={r.over} onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
            <VolumeIcon muted={muted} size={18} />
          </button>
          {onFull && (
            <button type="button" className={r.over} onClick={onFull} aria-label="Full screen">
              <Icon name="fullscreen" size={18} />
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
