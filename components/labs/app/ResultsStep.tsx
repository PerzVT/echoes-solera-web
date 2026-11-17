"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatedMark, AsciiField, MediaFrame, PlayPauseIcon, VolumeIcon } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { Icon } from "@/components/labs/Icon";
import { Btn, cx } from "@/components/labs/chat/ui";
import { clock, retakes, type Take } from "@/lib/labs/maker";
import { AppShell } from "./AppShell";
import { useCast } from "./CastProvider";
import { revealOnPhone } from "./parts";
import { generationsFor, type Gen as Saved } from "./script";
import r from "./ResultsStep.module.css";

/** "new" arrives from Generate: every clip is still developing. */
export type ResultsState = "new" | "default";

type Decision = "approved" | "denied";
type Gen = Saved & { developing: boolean };

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const statusOf = (g: Gen) => (g.developing ? "Generating" : g.decision === "approved" ? "Approved" : g.decision === "denied" ? "Denied" : "Ready");

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
  const [gens, setGens] = useState<Gen[]>(() => (ep.gens ?? generationsFor(ep.blocks, !ep.isNew)).map((g) => ({ ...g, developing: initial === "new" })));
  // Takes and decisions belong to the episode, so a reload or a later visit finds them.
  useEffect(() => {
    store.patch(key, { gens: gens.map((g) => ({ n: g.n, block: g.block, summary: g.summary, takes: g.takes, decision: g.decision })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gens]);
  const [selected, setSelected] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [said, setSaid] = useState("");
  const retakeAt = useRef(0);
  const timers = useRef<number[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const update = (n: number, fn: (g: Gen) => Gen) => setGens((all) => all.map((g) => (g.n === n ? fn(g) : g)));
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, reduced() ? Math.min(ms, 600) : ms));

  // From Generate: the clips come in one after another, in order.
  useEffect(() => {
    if (initial !== "new") return;
    gens.forEach((g, i) =>
      later(() => {
        update(g.n, (x) => ({ ...x, developing: false }));
        setSaid(`Generation ${g.n} is ready.`);
      }, 1400 + i * 1100),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const g = gens.find((x) => x.n === selected)!;
  const take = g.takes[0];
  const decided = gens.every((x) => !x.developing && x.decision);

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
    update(n, (x) => ({ ...x, developing: true, decision: undefined }));
    setFeedback(null);
    setSaid(`Generation ${n} is being made again.`);
    later(() => {
      const next = retakes[retakeAt.current++ % retakes.length];
      update(n, (x) => ({ ...x, developing: false, takes: [{ ...next, name: `Take ${x.takes.length + 1}` }, ...x.takes] }));
      setSaid(`A new take of generation ${n} is ready.`);
    }, 2600);
  };

  // A new episode is added to its series on Finish. An episode already in the Library is saved as it goes, so Done only goes back.
  const finish = () => {
    if (ep.isNew) {
      store.finish(key, gens[0].takes[0].poster);
      router.push("/app/library");
    } else router.push(`/app/series/${ep.series}`);
  };

  return (
    <AppShell
      step="results"
      view={ep.isNew ? "create" : "library"}
      fit
      action={
        <Btn kind="primary" disabled={ep.isNew ? !decided : gens.some((x) => x.developing)} onClick={finish}>
          {ep.isNew ? "Finish" : "Done"}
        </Btn>
      }
    >
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
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
                    <Image src={x.takes[0].poster} alt="" fill sizes="56px" />
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
          <Player key={`${g.n}-${take.src}-${g.developing}`} g={g} take={take} />
          <div className={r.under}>
            <div className={r.caption}>
              <h2 className={r.genTitle}>
                Generation {g.n}
                {g.takes.length > 1 && <span className={r.takeName}>{take.name}</span>}
              </h2>
              <p className={r.rowSub}>{g.summary}</p>
            </div>
            <div className={r.actions}>
              <Btn kind={g.decision === "approved" ? "primary" : "secondary"} icon={<Icon name="check" size={16} />} aria-pressed={g.decision === "approved"} disabled={g.developing} onClick={() => decide("approved")}>
                {g.decision === "approved" ? "Approved" : "Approve"}
              </Btn>
              <Btn kind="secondary" className={cx(g.decision === "denied" && r.denied)} icon={<Icon name="close" size={16} />} aria-pressed={g.decision === "denied"} disabled={g.developing} onClick={() => decide("denied")}>
                {g.decision === "denied" ? "Denied" : "Deny"}
              </Btn>
              <Btn kind="ghost" aria-expanded={feedback !== null} disabled={g.developing} onClick={() => setFeedback(feedback === null ? "" : null)}>
                Retry with feedback
              </Btn>
            </div>
            {feedback !== null && (
              <div className={r.feedback}>
                <label htmlFor="retry-feedback" className="sr-only">
                  Feedback
                </label>
                <textarea
                  id="retry-feedback"
                  className={r.feedbackBox}
                  placeholder="Julian keeps his head down until the end of the shot"
                  value={feedback}
                  autoFocus
                  onChange={(e) => setFeedback(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) retry();
                    if (e.key === "Escape") setFeedback(null);
                  }}
                />
                <div className={r.feedbackActions}>
                  <Btn kind="ghost" small onClick={() => setFeedback(null)}>
                    Cancel
                  </Btn>
                  <Btn kind="secondary" small disabled={!feedback.trim()} onClick={retry}>
                    Send
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/** The selected take, large: plays muted on a loop, with play and pause and sound. While it is being made, glyphs scan over its poster. */
function Player({ g, take }: { g: Gen; take: Take }) {
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

  if (g.developing)
    return (
      <div className={r.screen}>
        <Image src={take.poster} alt="" fill sizes="420px" />
        <span className={r.develop}>
          <AsciiField mode="scan" cell={8} intensity={0.5} speed={1.15} className={r.glyphs} />
        </span>
      </div>
    );

  return (
    <div className={r.screen}>
      <MediaFrame fill>
        <video
          ref={video}
          src={take.src}
          poster={take.poster}
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
        <button type="button" className={r.over} onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
          <VolumeIcon muted={muted} size={18} />
        </button>
      </div>
    </div>
  );
}
