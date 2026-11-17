"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "./AppShell";
import { Button } from "@/components/labs/Button";
import btn from "@/components/labs/Button.module.css";
import { Icon } from "@/components/labs/Icon";
import { AnimatedMark, AsciiField, CheckIcon, ChevronIcon, GestureIcon, MediaFrame, PlayPauseIcon, ReplayIcon, VolumeIcon } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { AppIcon } from "./AppIcon";
import { crossfade } from "./fx/crossfade";
import m from "./fx/motion.module.css";
import { SwapText } from "./fx/SwapText";
import { BlockedAction, ConfirmDialog, EpisodeTitle, Panel, Progress, Status, Stepper, focusSoon, revealOnPhone } from "./parts";
import {
  clock,
  confirmRetry,
  failReason,
  frameFixes,
  generations as startGens,
  startingHarvest,
  type Generation,
  type Harvest,
  type Take,
} from "@/lib/labs/maker";
import s from "./maker.module.css";
import r from "./ResultsStep.module.css";

export type ResultsState = "default" | "failed" | "harvest" | "edits";

/** A trim belongs to one take: a new take starts untrimmed. */
type Trim = { take: string; range: [number, number] };
type Gen = Generation & { take: number; kept?: string; trim?: Trim };

const E = "/labs/mini-series/second-chance/episodes";
// Takes a reroll can land on: episode files that exist in public/labs/mini-series/second-chance/episodes (1 to 7).
const spare = [7, 2, 3, 4, 6, 1];
const LAST = startGens[startGens.length - 1].n;
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasClip = (g: Gen) => g.status === "Ready" || g.status === "Kept";
/** "Kept" describes the take on show: after a reroll the new take is Ready even when an older take is kept. */
const shownStatus = (g: Gen): Generation["status"] => (hasClip(g) ? (g.kept === g.takes[g.take].name ? "Kept" : "Ready") : g.status);
const trimOf = (g: Gen) => (g.trim && g.trim.take === g.takes[g.take].name ? g.trim.range : undefined);

type Reroll = { n: number; edit?: string };

export function ResultsStep({ initial }: { initial: ResultsState }) {
  const [gens, setGens] = useState<Gen[]>(() =>
    startGens.map((g) => ({ ...g, takes: [...g.takes], take: 0, kept: g.status === "Kept" ? g.takes[0].name : undefined })),
  );
  const [selected, setSelected] = useState(initial === "failed" ? 6 : 1);
  const [harvesting, setHarvesting] = useState(initial === "harvest");
  const [edits, setEdits] = useState(initial === "edits");
  const [harvests, setHarvests] = useState<Harvest[]>(initial === "harvest" ? startingHarvest : []);
  const [retry, setRetry] = useState(false);
  const [rerolling, setRerolling] = useState<Reroll | null>(null);
  const [playAll, setPlayAll] = useState(false);
  /** The generation whose clip has just arrived, for a moment: its panel reveals the clip instead of cutting to it. */
  const [landed, setLanded] = useState<number | null>(null);
  const [said, setSaid] = useState("");
  const spareAt = useRef(0);
  const side = useRef<HTMLElement>(null);
  const sideHeading = useRef<HTMLHeadingElement>(null);

  const g = gens.find((x) => x.n === selected)!;
  const update = (n: number, fn: (x: Gen) => Gen) => setGens((all) => all.map((x) => (x.n === n ? fn(x) : x)));

  /** A clip has arrived: the list says so for screen readers, and the tile and the panel reveal it. */
  const arrive = (n: number) => {
    setLanded(n);
    setSaid(`Generation ${n} is ready.`);
  };
  useEffect(() => {
    if (landed === null) return;
    const t = setTimeout(() => setLanded(null), 1000);
    return () => clearTimeout(t);
  }, [landed]);

  // Generation 5 is still being made when the page opens; it lands a little later.
  useEffect(() => {
    const t = setTimeout(() => {
      update(5, (x) => (x.status === "Generating" ? { ...x, status: "Ready" } : x));
      arrive(5);
    }, 15000);
    return () => clearTimeout(t);
  }, []);

  const run = (n: number, after: (x: Gen) => Gen) => {
    update(n, (x) => ({ ...x, status: "Generating" }));
    setTimeout(
      () => {
        update(n, (x) => {
          const y = after(x);
          return { ...y, status: "Ready" };
        });
        arrive(n);
      },
      reduced() ? 1500 : 3200,
    );
  };

  const reroll = (n: number) => {
    setEdits(false);
    setHarvesting(false);
    // The panel now shows "Generating": keep the keyboard on its heading.
    focusSoon(() => sideHeading.current);
    run(n, (x) => {
      const i = spare[spareAt.current++ % spare.length];
      const next: Take = { name: `Take ${x.takes.length + 1}`, src: `${E}/${i}.mp4`, poster: `${E}/${i}.webp` };
      return { ...x, takes: [next, ...x.takes], take: 0 };
    });
  };

  const ready = gens.filter(hasClip);
  /** Frames that were there when the page opened stay put; one harvested now lands. */
  const startingCount = initial === "harvest" ? startingHarvest.length : 0;
  const take = g.takes[g.take];
  const trim = trimOf(g);
  const pending = rerolling ? gens.find((x) => x.n === rerolling.n) : undefined;

  return (
    <AppShell
      section="/app"
      title={<EpisodeTitle />}
      bar={
        <>
          {hasClip(g) ? (
            // A plain link, built as the shared button is: a download is not a navigation.
            <a className={`${btn.btn} ${btn.primary}`} href={take.src} download={`second-chance-ep1-generation-${g.n}-take-${g.takes.length - g.take}.mp4`}>
              <span className={btn.wash} aria-hidden="true" />
              <span className={btn.icon}>
                <GestureIcon name="download" size={18} />
              </span>
              <span className={btn.label}>Download generation {g.n}</span>
            </a>
          ) : (
            <BlockedAction id="download-why" label={`Download generation ${g.n}`} reason={`Generation ${g.n} has no clip yet.`} />
          )}
          {ready.length ? (
            <Button variant="secondary" icon={<Icon name="play" size={16} />} onClick={() => setPlayAll(true)}>
              Play episode
            </Button>
          ) : (
            <BlockedAction id="play-why" variant="secondary" icon={<Icon name="play" size={16} />} label="Play episode" reason="No generation has a clip yet." />
          )}
          <span className={s.divider} aria-hidden="true" />
          <Stepper current="results" />
        </>
      }
    >
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      <div className={`${s.split} ${s.fill} ${r.split}`}>
        <Panel title="Generations" level={1}>
          <Progress label="Generations with a clip" items={gens.map((x) => ({ name: `Generation ${x.n}`, done: hasClip(x) }))} />
          <ul className={r.tiles}>
            {gens.map((x) => (
              <li key={x.n}>
                <GenTile
                  g={x}
                  selected={x.n === selected}
                  onSelect={() => {
                    if (x.n !== selected) crossfade(side.current, { dy: x.n > selected ? 6 : -6 });
                    setSelected(x.n);
                    setHarvesting(false);
                    setEdits(false);
                    requestAnimationFrame(() => revealOnPhone(side.current));
                  }}
                />
              </li>
            ))}
          </ul>

          {harvests.length > 0 && (
            <section aria-labelledby="frames-title" className={r.frames}>
              <h2 id="frames-title" className={s.label} tabIndex={-1}>
                Continuity frames
              </h2>
              <ul className={r.frameList}>
                {harvests.map((h, i) => (
                  <li key={`${h.gen}-${h.time}-${i}`} className={`${r.frame} ${i >= startingCount ? m.land : ""}`}>
                    <span className={`${s.thumb} ${r.frameArt}`}>
                      <Image src={h.poster} alt="" fill sizes="64px" />
                    </span>
                    <span className={r.frameText}>
                      <span>
                        Generation {h.gen}, {clock(h.time)}
                      </span>
                      <span className={s.cardSub}>
                        {h.fixes}, feeds generation {h.feeds}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Panel>

        <Panel
          as="aside"
          panelRef={side}
          headingRef={sideHeading}
          className={r.side}
          title={`Generation ${g.n}`}
          sub={trim ? `${g.summary}. ${take.name} trimmed to ${clock(trim[0])} to ${clock(trim[1])}.` : g.summary}
        >
          {g.status === "Failed" ? (
            <Failed g={g} onRetry={() => setRetry(true)} />
          ) : g.status === "Generating" ? (
            <Making g={g} />
          ) : (
            <Selected
              key={`${g.n}-${take.src}`}
              g={g}
              arrived={landed === g.n}
              onSaid={setSaid}
              harvesting={harvesting}
              setHarvesting={setHarvesting}
              edits={edits}
              setEdits={setEdits}
              onTake={(i) => update(g.n, (x) => ({ ...x, take: i }))}
              onKeep={() => update(g.n, (x) => (x.kept === take.name ? { ...x, kept: undefined } : { ...x, kept: take.name }))}
              onTrim={(t) => update(g.n, (x) => ({ ...x, trim: t ? { take: take.name, range: t } : undefined }))}
              onReroll={(edit) => setRerolling({ n: g.n, edit })}
              onHarvest={(h) => {
                setHarvests((all) => [...all, h]);
                setHarvesting(false);
                focusSoon(() => document.getElementById("frames-title"));
              }}
            />
          )}
        </Panel>
      </div>

      <ConfirmDialog
        open={Boolean(rerolling)}
        onClose={() => setRerolling(null)}
        onConfirm={() => {
          if (rerolling) reroll(rerolling.n);
          setRerolling(null);
        }}
        title={`Reroll generation ${rerolling?.n ?? g.n}`}
        makes={pending ? `Generation ${pending.n}, Take ${pending.takes.length + 1}${rerolling?.edit ? `, with this change: ${rerolling.edit}` : ", from the same prompt"}` : ""}
        confirmLabel={rerolling?.edit ? "Reroll with this change" : "Reroll"}
      />

      <ConfirmDialog
        open={retry}
        onClose={() => setRetry(false)}
        onConfirm={() => {
          setRetry(false);
          // "Try again" leaves with the failed state: keep the keyboard on the panel heading, as a reroll does.
          focusSoon(() => sideHeading.current);
          run(6, (x) => ({ ...x, attempt: "Second" }));
        }}
        title={confirmRetry.title}
        makes={confirmRetry.makes}
        confirmLabel="Try generation 6 again"
      />

      <PlayAll open={playAll} onClose={() => setPlayAll(false)} clips={ready.map((x) => ({ n: x.n, ...(x.takes.find((t) => t.name === x.kept) ?? x.takes[x.take]) }))} />
    </AppShell>
  );
}

/**
 * Over a clip that is still being made: glyph noise in the manner of the portal, with a band of density crossing it.
 * The poster shows dimly through it. One still frame under reduced motion.
 */
function Developing({ cell = 8 }: { cell?: number }) {
  return <AsciiField mode="scan" cell={cell} intensity={0.5} speed={1.15} className={r.developing} />;
}

/**
 * One generation in the list. While it is being made the poster is dimmed under a scan of glyphs; when the clip
 * arrives that cover is drawn off the tile from the top, once, and the poster is left.
 */
function GenTile({ g, selected, onSelect }: { g: Gen; selected: boolean; onSelect: () => void }) {
  const [seen, setSeen] = useState(g.status);
  const [arriving, setArriving] = useState(false);
  if (seen !== g.status) {
    setSeen(g.status);
    if (seen === "Generating" && g.status === "Ready") setArriving(true);
  }
  useEffect(() => {
    if (!arriving) return;
    const t = setTimeout(() => setArriving(false), 900);
    return () => clearTimeout(t);
  }, [arriving]);
  const poster = g.takes[g.take].poster;

  return (
    <button type="button" className={s.tile} aria-pressed={selected} onClick={onSelect}>
      <span className={`${s.tileArt} ${r.tileArt}`} data-status={g.status} data-empty={g.status === "Failed" || undefined}>
        {g.status === "Failed" ? (
          <span className={r.noClip}>
            <img src="/labs/app/empty/no-clip.svg" alt="" width={80} height={70} />
            No clip
          </span>
        ) : (
          <>
            <Image src={poster} alt="" fill sizes="(max-width: 900px) 30vw, 120px" />
            {(g.status === "Generating" || arriving) && (
              <span className={r.develop} data-leaving={arriving || undefined}>
                <Developing />
              </span>
            )}
          </>
        )}
      </span>
      <span className={s.tileName}>Generation {g.n}</span>
      <GenStatus g={g} />
    </button>
  );
}

/** The state of the take on show. The words change in place; a tick is drawn when the state has just been reached, and stays still otherwise. */
function GenStatus({ g }: { g: Gen }) {
  const status = shownStatus(g);
  const [seen, setSeen] = useState(status);
  const [changes, setChanges] = useState(0);
  if (seen !== status) {
    setSeen(status);
    setChanges(changes + 1);
  }
  return (
    <span className={s.status} data-tone={status === "Failed" ? "danger" : undefined}>
      {status === "Failed" ? (
        <AppIcon name="warning" size={16} />
      ) : status === "Generating" ? (
        <AnimatedMark variant="busy" size={16} />
      ) : (
        <span key={changes} className={s.ok}>
          {changes ? <CheckIcon size={16} /> : <Icon name="check" size={16} />}
        </span>
      )}
      <SwapText>{status}</SwapText>
    </span>
  );
}

function PromptBox({ text }: { text: string }) {
  return (
    <div className={`${s.inset} ${m.enter}`}>
      <p className="label muted">Prompt</p>
      <p className="small">{text}</p>
    </div>
  );
}

/** "Show prompt" and its kind: a quiet button whose chevron turns with what it opens. */
function Disclose({ open, onToggle, children }: { open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <Button variant="quiet" size="small" icon={<ChevronIcon open={open} size={16} />} aria-expanded={open} onClick={onToggle}>
      {children}
    </Button>
  );
}

function Failed({ g, onRetry }: { g: Gen; onRetry: () => void }) {
  const [prompt, setPrompt] = useState(false);
  return (
    <>
      <div className={r.failed} role="status">
        <p className={r.failedTitle}>Failed</p>
        <p className="small">{failReason}</p>
      </div>
      <dl className={s.facts}>
        <div>
          <dt>Attempt</dt>
          <dd>{g.attempt}</dd>
        </div>
        <div>
          <dt>Take</dt>
          <dd>None</dd>
        </div>
      </dl>
      <p className="small muted">Trying again is a new attempt. It is confirmed before it runs.</p>
      <div className={s.actions}>
        <Button variant="secondary" size="small" onClick={onRetry}>
          Try again
        </Button>
        <Disclose open={prompt} onToggle={() => setPrompt((v) => !v)}>
          {prompt ? "Hide prompt" : "Show prompt"}
        </Disclose>
      </div>
      {prompt && <PromptBox text={g.prompt} />}
    </>
  );
}

/** A generation being made: the frame the clip will fill is already in its place, developing, so nothing moves when the clip arrives. */
function Making({ g }: { g: Gen }) {
  const [prompt, setPrompt] = useState(false);
  const poster = g.takes[g.take]?.poster;
  return (
    <>
      <div className={r.head}>
        <div className={r.player}>
          {poster && <Image src={poster} alt="" fill sizes="180px" />}
          <span className={r.develop}>
            <Developing cell={10} />
          </span>
        </div>
        <div className={r.info}>
          <p role="status">
            <Status icon="spinner">Generating</Status>
          </p>
          <p className="small muted">The clip shows here when it is ready.</p>
          <div className={r.stack}>
            <Disclose open={prompt} onToggle={() => setPrompt((v) => !v)}>
              {prompt ? "Hide prompt" : "Show prompt"}
            </Disclose>
          </div>
        </div>
      </div>
      {prompt && <PromptBox text={g.prompt} />}
    </>
  );
}

type SelectedProps = {
  g: Gen;
  /** The clip has just arrived: the frame reveals it once. */
  arrived: boolean;
  onSaid: (text: string) => void;
  harvesting: boolean;
  setHarvesting: (v: boolean) => void;
  edits: boolean;
  setEdits: (v: boolean) => void;
  onTake: (i: number) => void;
  onKeep: () => void;
  onTrim: (t: [number, number] | undefined) => void;
  onReroll: (edit?: string) => void;
  onHarvest: (h: Harvest) => void;
};

function Selected({ g, arrived, onSaid, harvesting, setHarvesting, edits, setEdits, onTake, onKeep, onTrim, onReroll, onHarvest }: SelectedProps) {
  const take = g.takes[g.take];
  const trim = trimOf(g);
  const feeds = g.n < LAST ? g.n + 1 : undefined;
  const video = useRef<HTMLVideoElement>(null);
  const useFrame = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  /** Held for the length of the reveal, so it finishes even though `arrived` is only true for a moment. */
  const [reveal] = useState(arrived);
  const [time, setTime] = useState(harvesting ? 14 : 0);
  const [length, setLength] = useState(0);
  const [prompt, setPrompt] = useState(false);
  const [trimming, setTrimming] = useState<[number, number] | null>(null);
  const [fixes, setFixes] = useState<string[]>(["Pose"]);
  const [source, setSource] = useState(false);
  const [note, setNote] = useState("");

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  useEffect(() => {
    if (harvesting) video.current?.pause();
  }, [harvesting]);

  const seek = (t: number) => {
    const v = video.current;
    if (v) v.currentTime = t;
    setTime(t);
  };

  const kept = g.kept === take.name;

  return (
    <>
      <div className={r.head}>
        <div className={r.player}>
          <MediaFrame fill>
          <video
            ref={video}
            src={take.src}
            poster={take.poster}
            muted={muted}
            playsInline
            preload="metadata"
            onClick={harvesting ? undefined : toggle}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onLoadedMetadata={(e) => {
              setLength(e.currentTarget.duration);
              if (harvesting) e.currentTarget.currentTime = time;
              else if (trim) e.currentTarget.currentTime = trim[0];
            }}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (!harvesting) setTime(v.currentTime);
              if (trim && v.currentTime >= trim[1]) {
                v.pause();
                v.currentTime = trim[0];
              }
            }}
            aria-label={`Generation ${g.n}, ${take.name}`}
          />
          </MediaFrame>
          {reveal && (
            <span className={r.develop} data-leaving="true">
              <Developing cell={10} />
            </span>
          )}
          {!harvesting && (
            <>
              <button type="button" className={r.play} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
                <PlayPauseIcon playing={playing} size={18} />
                <span>{clock(time)}</span>
              </button>
              <button type="button" className={r.mute} onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
                <VolumeIcon muted={muted} size={18} />
              </button>
            </>
          )}
        </div>
        <div className={r.info}>
          <div>
            <p className={s.label} id="takes-label">
              Takes
            </p>
            <div className={r.takes} role="group" aria-labelledby="takes-label">
              {g.takes.map((t, i) => (
                <button key={t.name} type="button" className={s.chip} aria-pressed={i === g.take} onClick={() => onTake(i)}>
                  {i === g.take && <CheckIcon size={16} />}
                  {t.name}
                  {g.kept === t.name && <span className="sr-only">, kept</span>}
                </button>
              ))}
            </div>
          </div>
          <div className={r.stack}>
            <Disclose open={prompt} onToggle={() => setPrompt((v) => !v)}>
              {prompt ? "Hide prompt" : "Show prompt"}
            </Disclose>
            {!harvesting && feeds && (
              <Button ref={useFrame} variant="quiet" size="small" onClick={() => setHarvesting(true)}>
                Use a frame
              </Button>
            )}
          </div>
        </div>
      </div>

      {prompt && <PromptBox text={g.prompt} />}

      {harvesting ? (
        <div className={`${r.mode} ${m.enter}`}>
          <div className={r.scrub}>
            <span>{clock(time)}</span>
            <input
              type="range"
              min={0}
              max={length || 25}
              step={0.1}
              value={time}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Frame time"
              aria-valuetext={clock(time)}
              style={{ "--p": `${(time / (length || 25)) * 100}%` } as React.CSSProperties}
            />
            <span>{length ? clock(length) : ""}</span>
          </div>
          {time === 0 && <p className={s.hint}>The frame is at 0:00. Move the slider to the frame you want.</p>}
          <fieldset className={s.fieldset}>
            <legend className={s.label}>This frame fixes</legend>
            <div className={s.chips}>
              {frameFixes.map((f) => {
                const on = fixes.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    className={s.chip}
                    aria-pressed={on}
                    onClick={() => setFixes((all) => (on ? all.filter((x) => x !== f) : [...all, f]))}
                  >
                    {on && <CheckIcon size={16} />}
                    {f}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className={s.actions}>
            {fixes.length ? (
              <Button
                variant="secondary"
                size="small"
                onClick={() =>
                  onHarvest({ gen: g.n, time: Math.floor(time), fixes: fixes.join(", "), feeds: feeds ?? g.n, poster: take.poster })
                }
              >
                Use for continuity
              </Button>
            ) : (
              <>
                <Button variant="secondary" size="small" aria-disabled="true" aria-describedby="harvest-why">
                  Use for continuity
                </Button>
                <span id="harvest-why" className={s.reason}>
                  Choose what the frame fixes.
                </span>
              </>
            )}
            <Disclose open={source} onToggle={() => setSource((v) => !v)}>
              Source details
            </Disclose>
            <Button
              variant="quiet"
              size="small"
              onClick={() => {
                setHarvesting(false);
                focusSoon(() => useFrame.current);
              }}
            >
              Cancel
            </Button>
          </div>
          {source && (
            <dl className={`${s.facts} ${m.enter}`}>
              <div>
                <dt>Source</dt>
                <dd>
                  Generation {g.n}, {take.name}
                </dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{time.toFixed(1)} seconds</dd>
              </div>
              <div>
                <dt>File</dt>
                <dd>{take.src.split("/").pop()}</dd>
              </div>
              {feeds && (
                <div>
                  <dt>Feeds</dt>
                  <dd>Generation {feeds}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      ) : (
        <div className={`${r.mode} ${m.fade}`}>
          <div className={s.actions}>
            {/* The tick has its place whether or not the take is kept, so keeping it moves nothing: the tick draws on, and off. */}
            <Button
              variant="secondary"
              size="small"
              aria-pressed={kept}
              icon={
                <span className={r.keepTick}>
                  <Icon name="check" size={16} />
                  <CheckIcon shown={kept} size={16} />
                </span>
              }
              onClick={() => {
                onSaid(kept ? `${take.name} of generation ${g.n} is no longer kept.` : `${take.name} of generation ${g.n} kept.`);
                onKeep();
              }}
            >
              Keep this take
            </Button>
            <Disclose open={Boolean(trimming)} onToggle={() => setTrimming(trimming ? null : (trim ?? [0, length || 25]))}>
              Trim
            </Disclose>
          </div>
          {trimming && (
            <div className={`${s.inset} ${r.trim} ${m.enter}`}>
              <label>
                <span className="small">Start {clock(trimming[0])}</span>
                <input
                  type="range"
                  data-edge="start"
                  style={{ "--p": `${(trimming[0] / (length || 25)) * 100}%` } as React.CSSProperties}
                  min={0}
                  max={length || 25}
                  step={0.1}
                  value={trimming[0]}
                  aria-valuetext={clock(trimming[0])}
                  onChange={(e) => {
                    const v = Math.min(Number(e.target.value), trimming[1] - 1);
                    setTrimming([v, trimming[1]]);
                    seek(v);
                  }}
                />
              </label>
              <label>
                <span className="small">End {clock(trimming[1])}</span>
                <input
                  type="range"
                  data-edge="end"
                  style={{ "--p": `${(trimming[1] / (length || 25)) * 100}%` } as React.CSSProperties}
                  min={0}
                  max={length || 25}
                  step={0.1}
                  value={trimming[1]}
                  aria-valuetext={clock(trimming[1])}
                  onChange={(e) => {
                    const v = Math.max(Number(e.target.value), trimming[0] + 1);
                    setTrimming([trimming[0], v]);
                    seek(v);
                  }}
                />
              </label>
              <div className={s.actions}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    // The whole clip is no trim at all.
                    const whole = trimming[0] <= 0.05 && trimming[1] >= (length || 25) - 0.05;
                    onTrim(whole ? undefined : trimming);
                    setTrimming(null);
                  }}
                >
                  Save trim
                </Button>
                {trim && (
                  <Button
                    variant="quiet"
                    size="small"
                    onClick={() => {
                      onTrim(undefined);
                      setTrimming(null);
                    }}
                  >
                    Remove trim
                  </Button>
                )}
                <Button variant="quiet" size="small" onClick={() => setTrimming(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <hr className={r.rule} />
          <div className={s.actions}>
            <Button variant="quiet" size="small" onClick={() => onReroll()}>
              Reroll
            </Button>
            <Disclose open={edits} onToggle={() => setEdits(!edits)}>
              Reroll with edits
            </Disclose>
          </div>
          {edits && (
            <div className={`${s.field} ${m.enter}`}>
              <label htmlFor="reroll-edit" className={s.label}>
                What should change
              </label>
              <textarea
                id="reroll-edit"
                className={`${s.textarea} ${r.editBox}`}
                placeholder="Julian keeps his head down until the end of the shot."
                value={note}
                autoFocus
                onChange={(e) => setNote(e.target.value)}
              />
              <div className={s.actions}>
                {note.trim() ? (
                  <Button variant="secondary" size="small" onClick={() => onReroll(note.trim())}>
                    Reroll with this change
                  </Button>
                ) : (
                  <>
                    <Button variant="secondary" size="small" aria-disabled="true" aria-describedby="send-why">
                      Reroll with this change
                    </Button>
                    <span id="send-why" className={s.reason}>
                      Write the change first.
                    </span>
                  </>
                )}
                <Button variant="quiet" size="small" onClick={() => setEdits(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function PlayAll({ open, onClose, clips }: { open: boolean; onClose: () => void; clips: (Take & { n: number })[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [at, setAt] = useState(0);
  const [ended, setEnded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  /** Goes up each time the last clip ends, so the replay arrow turns once as "Play again" is offered. */
  const [turns, setTurns] = useState(0);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setAt(0);
      setEnded(false);
      setTime(0);
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (open && !ended) video.current?.play().catch(() => {});
  }, [open, at, ended]);

  // However the dialog closes (Close, Escape, the backdrop), the clip stops and goes back to the start.
  useEffect(() => {
    if (open) return;
    const v = video.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, [open]);

  const clip = clips[at];

  return (
    <dialog
      ref={ref}
      className={`${s.dialog} ${r.playDialog}`}
      aria-label="Episode 1, ready clips in order"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && clip && (
        <div className={r.playWrap}>
          <div className={r.playFrame}>
            <MediaFrame fill key={clip.src}>
              <video
                ref={video}
                src={clip.src}
                poster={clip.poster}
                muted={muted}
                playsInline
                onClick={toggle}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onLoadedMetadata={(e) => setLength(e.currentTarget.duration)}
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                onEnded={() => {
                  if (at < clips.length - 1) return setAt(at + 1);
                  setEnded(true);
                  setTurns((n) => n + 1);
                }}
                aria-label={`Generation ${clip.n}`}
              />
            </MediaFrame>
          </div>
          <div className={`${r.scrub} ${r.playBar}`}>
            <button type="button" className={r.barButton} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
              <PlayPauseIcon playing={playing} size={18} />
            </button>
            <input
              type="range"
              min={0}
              max={length || 25}
              step={0.1}
              value={Math.min(time, length || 25)}
              onChange={(e) => {
                const t = Number(e.target.value);
                if (video.current) video.current.currentTime = t;
                setTime(t);
              }}
              aria-label="Clip time"
              aria-valuetext={clock(time)}
              style={{ "--p": `${(time / (length || 25)) * 100}%` } as React.CSSProperties}
            />
            <button type="button" className={r.barButton} onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
              <VolumeIcon muted={muted} size={18} />
            </button>
          </div>
          <p className={r.playLabel}>
            Generation {clip.n}, {clip.name}
          </p>
        </div>
      )}
      <div className={s.dialogActions}>
        {ended && (
          <Button
            variant="secondary"
            icon={<ReplayIcon turn={turns} size={18} />}
            onClick={() => {
              setEnded(false);
              setAt(0);
              // With one clip the video is the same element: start it over.
              if (video.current) video.current.currentTime = 0;
            }}
          >
            Play again
          </Button>
        )}
        <Button variant="quiet" onClick={onClose}>
          Close
        </Button>
      </div>
    </dialog>
  );
}
