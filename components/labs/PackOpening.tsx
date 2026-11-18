"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { Button, ButtonLink } from "./Button";
import { Card, FlockBack } from "./Card";
import { Icon } from "./Icon";
import { CardDialog } from "./cards/CardDialog";
import type { FlockCard } from "@/lib/labs/cards/flock";
import { demoLastCard } from "@/lib/labs/cards/demo";
import { cardById, cardNumber, drawPack, guaranteeActive, has, no3, numberedIn, packById, packOdds, packs, rarityName, rarityRank, slotWeights, type Pack, type PackId, type Rarity } from "@/lib/labs/cards/rules";
import { commitPack, enterDemo, finishPack, readCards, setMuted, setTurned, useCards, type Pending } from "@/lib/labs/cards/store";
import { flipCue, play, prefetchSound, silence, unlockSound, type Cue, type Playing } from "@/lib/labs/cards/sfx";
import styles from "./PackOpening.module.css";

/*
 * The opening, step by step (timings from the brief, tuned by eye):
 *  1 choose   three packs on a shelf, base odds under them, a badge where the completion pull is on
 *  2 present  the pack drops to the centre                       350 ms
 *  3 tell     light at the seam when it holds R or better         400 ms, during 2 (S shakes 300 ms)
 *  4 tear     drag along the seam, or press; the strip peels      500 ms after release
 *  5 stack    five cards rise face down, the pack falls away      450 ms
 *  6 flip     tap: the top card turns (280 ms); the next tap sends it to the row (250 ms) and turns the next
 *  7 charge   slot 5 at R or better glows and the stage dims      600 ms before it can be turned
 *  8 reveal   R 400 ms, SR 500 ms, S 900 ms; SR and S lift the duck off its art over the rarity backdrop
 *  9 marks    New ribbon, or "+N feathers" for a duplicate        300 ms
 * 10 summary  all five in a fan, the counters tick up             600 ms
 * "Show all" (after the first flip) turns the rest at 120 ms and still charges a standout last card.
 * Reduced motion: every move becomes a short cross-fade (PackOpening.module.css).
 */

type Phase = "choose" | "resume" | "pack" | "tearing" | "stack" | "summary";
const T = { present: 350, tell: 400, tear: 500, stack: 450, flip: 280, move: 250, charge: 600, mark: 300, fan: 600, showAll: 120 };
const REVEAL: Record<Rarity, number> = { C: 280, U: 280, R: 400, SR: 500, S: 900, G: 900 };
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pct = (n: number) => `${Math.round(n * 10) / 10}%`;

function best(ids: readonly string[]): Rarity {
  return ids.map((id) => cardById.get(id)!.rarity).reduce<Rarity>((a, r) => (rarityRank[r] > rarityRank[a] ? r : a), "C");
}
const revealCue = (r: Rarity): Cue => (r === "S" || r === "G" ? "reveal-secret" : r === "SR" ? "reveal-sr" : r === "R" ? "reveal-rare" : "reveal-common");

/** A sealed pack: the wrapper drawn twice and split at the package's seam (7.5%), so the strip can peel off. */
function SealedPack({ pack, tell, pull, tearing }: { pack: Pack; tell?: Rarity | null; pull?: number; tearing?: boolean }) {
  return (
    <span className={styles.pack} data-tell={tell ?? undefined} data-tearing={tearing || undefined} style={{ "--pull": pull ?? 0 } as React.CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.packBody} src={pack.front} alt="" width={888} height={1440} decoding="async" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.packStrip} src={pack.front} alt="" width={888} height={1440} decoding="async" draggable={false} aria-hidden="true" />
      <span className={styles.seam} aria-hidden="true" />
      <span className={styles.seamGlow} aria-hidden="true" />
    </span>
  );
}

export function PackOpening() {
  const s = useCards();
  const [phase, setPhase] = useState<Phase>("choose");
  const [pending, setPending] = useState<Pending | null>(null);
  const [landed, setLanded] = useState(false);
  const [turned, setTurnedN] = useState(0);
  const [cur, setCur] = useState(-1);
  const [charging, setCharging] = useState(false);
  const [charged, setCharged] = useState(false);
  const [revealing, setRevealing] = useState<Rarity | null>(null);
  const [marked, setMarked] = useState<Set<number>>(() => new Set());
  const [auto, setAuto] = useState(false);
  const [pull, setPull] = useState(0);
  const [announce, setAnnounce] = useState("");
  const [shown, setShown] = useState({ found: 0, secrets: 0, feathers: 0 });
  const [open, setOpen] = useState<FlockCard | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const loops = useRef<Playing[]>([]);
  const busyUntil = useRef(0);
  const focusTarget = useRef<HTMLButtonElement | null>(null);
  const moved = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const runId = useRef(0);

  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, reduced() ? Math.min(ms, 200) : ms);
    timers.current.push(id);
  };
  const stopAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    loops.current.forEach((l) => l.stop());
    loops.current = [];
  }, []);
  useEffect(() => {
    prefetchSound();
    return () => {
      stopAll();
      silence();
    };
  }, [stopAll]);

  const cards = pending?.ids.map((id) => cardById.get(id)!) ?? [];
  const pack = pending ? packById(pending.pack)! : null;
  const last = cards[4];
  const lastStandout = !!last && rarityRank[last.rarity] >= rarityRank.R;

  /** Loads the five faces before they can be turned. */
  const preload = (ids: readonly string[]) => ids.forEach((id) => (new window.Image().src = cardById.get(id)!.art));

  const begin = (p: Pending, at: Phase, turnedN = 0) => {
    stopAll();
    preload(p.ids);
    setPending(p);
    setTurnedN(turnedN);
    setCur(turnedN > 0 && turnedN < 5 ? -1 : turnedN === 5 ? 4 : -1);
    setCharging(false);
    setCharged(false);
    setRevealing(null);
    setMarked(new Set(Array.from({ length: turnedN }, (_, i) => i)));
    setAuto(false);
    setPull(0);
    setShown(p.before);
    setPhase(at);
  };

  // Links: ?demo=sr (or r, s) opens a pack part-way with a card of that rarity to come; ?pack=street opens that pack at once.
  // A pack left open by a reload is offered back, never drawn again.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const demo = ({ r: "R", sr: "SR", s: "S" } as const)[q.get("demo") ?? ""];
    if (demo) {
      const d = demoLastCard(demo);
      enterDemo(d.state);
      const p = commitPack(d.pack as PackId, d.ids);
      setTurned(p.tx, 4);
      begin({ ...p, turned: 4 }, "stack", 4);
      after(60, () => charge());
      return;
    }
    const left = readCards().pending;
    if (left) {
      setPending(left);
      setShown(left.before);
      setPhase("resume");
      return;
    }
    const want = packById(q.get("pack") ?? "");
    if (want) {
      const url = new URL(window.location.href);
      url.searchParams.delete("pack");
      window.history.replaceState(window.history.state, "", url);
      choose(want);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus follows the step once the visitor has acted, so a keyboard user is never left on a removed control.
  useEffect(() => {
    if (moved.current) focusTarget.current?.focus({ preventScroll: true });
  }, [phase]);

  const choose = (p: Pack) => {
    moved.current = true;
    unlockSound();
    const st = readCards();
    const ids = drawPack(p, st.owned);
    const committed = commitPack(p.id as PackId, ids);
    begin(committed, "pack");
    setLanded(false);
    play("pack-drop");
    const tell = best(ids);
    after(T.present, () => {
      setLanded(true);
      if (rarityRank[tell] >= rarityRank.SR) loops.current.push(play("seam-hum", 0.7));
    });
  };

  const tear = () => {
    if (phase !== "pack" || !pending) return;
    moved.current = true;
    unlockSound();
    loops.current.forEach((l) => l.stop());
    play(Math.random() < 0.5 ? "tear-1" : "tear-2");
    setPull(1);
    setPhase("tearing");
    after(T.tear, () => {
      play("stack-slide");
      setPhase("stack");
    });
  };

  // The tear by drag: the strip follows the pointer along the seam; past 55% of the pack's width it tears.
  const drag = useRef<{ x: number; w: number; id: number } | null>(null);
  const onDown = (e: RPointerEvent<HTMLButtonElement>) => {
    if (phase !== "pack") return;
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { x: e.clientX, w: r.width, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    setPull(Math.min(1, Math.abs(e.clientX - d.x) / (d.w * 0.55)));
  };
  const onUp = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    const moved = Math.abs(e.clientX - d.x);
    if (moved >= d.w * 0.55) tear();
    else if (moved < 6) tear();
    else setPull(0);
  };

  const showMark = (i: number) => {
    const r = pending!.results[i];
    after(i === 4 ? REVEAL[cards[4].rarity] : T.flip, () => {
      setMarked((m) => new Set(m).add(i));
      play(r.isNew ? "new" : "feather", 0.8);
    });
  };

  /** Turns card i: its cue, its mark, and a line for screen readers. */
  const flip = (i: number, quiet = false) => {
    const c = cards[i];
    const r = pending!.results[i];
    play(flipCue(), 0.9);
    const standout = i === 4 && rarityRank[c.rarity] >= rarityRank.R;
    if (standout) setRevealing(c.rarity);
    if (!quiet || rarityRank[c.rarity] >= rarityRank.R) after(standout ? 60 : 120, () => play(revealCue(c.rarity)));
    setCur(i);
    setTurnedN(i + 1);
    setTurned(pending!.tx, i + 1);
    showMark(i);
    setAnnounce(`Card ${i + 1} of 5: ${cardNumber(c)} ${c.name}, ${rarityName[c.rarity]}. ${r.isNew ? "New." : r.feathers ? `Duplicate, plus ${r.feathers} ${r.feathers === 1 ? "feather" : "feathers"}.` : "Duplicate."}`);
    busyUntil.current = performance.now() + (i === 4 ? REVEAL[c.rarity] : T.flip);
  };

  /** The hold before a standout last card: it glows, the stage dims, and it cannot be turned for 600 ms. */
  const charge = () => {
    setCur(-1);
    setCharging(true);
    loops.current.push(play("charge"));
    setAnnounce("The last card is glowing.");
    busyUntil.current = performance.now() + T.charge;
    after(T.charge, () => {
      setCharging(false);
      setCharged(true);
    });
  };

  const toSummary = (p: Pending | null = pending) => {
    if (!p) return;
    const pending = p;
    stopAll();
    setCur(-1);
    setRevealing(null);
    setMarked(new Set([0, 1, 2, 3, 4]));
    setTurnedN(5);
    setPhase("summary");
    finishPack(pending.tx);
    // The counters tick from before to after, one tick per new card.
    const from = pending.before;
    const to = pending.after;
    const steps = Math.max(1, to.found - from.found + (to.secrets - from.secrets));
    const each = Math.max(60, T.fan / steps);
    for (let k = 1; k <= steps; k++) {
      after(T.fan * 0.4 + k * each, () => {
        const f = k / steps;
        setShown({
          found: Math.round(from.found + (to.found - from.found) * f),
          secrets: Math.round(from.secrets + (to.secrets - from.secrets) * f),
          feathers: Math.round(from.feathers + (to.feathers - from.feathers) * f),
        });
        if (to.found + to.secrets > from.found + from.secrets) play("tick", 0.7);
      });
    }
    if (pending.completed.length || pending.goal) after(T.fan + 200, () => play("set-complete"));
    setAnnounce(
      `${pending.results.filter((r) => r.isNew).length} new. ${to.found} of 60 found, ${to.secrets} of 6 secrets, ${to.feathers} feathers.${pending.completed.map((id) => ` ${packById(id)!.name} complete.`).join("")}${pending.goal ? " The goal card is yours." : ""}`,
    );
  };

  /** One press on the table: turn the next card, charge a standout last card, or go to the summary. */
  const advance = () => {
    if (!pending || auto) return;
    moved.current = true;
    unlockSound();
    if (performance.now() < busyUntil.current) return;
    if (turned === 5) return toSummary();
    if (turned === 4 && lastStandout && !charged) return charge();
    flip(turned);
  };

  /** Turns everything left at 120 ms, then the last card with its charge and full reveal. */
  const showAll = () => {
    if (!pending || turned === 5) return;
    moved.current = true;
    setAuto(true);
    const run = ++runId.current;
    let t = 0;
    for (let i = turned; i < 4; i++) {
      after(t, () => run === runId.current && flip(i, i > turned));
      t += T.showAll;
    }
    if (lastStandout && !charged) {
      after(t + T.move, () => run === runId.current && charge());
      t += T.move + T.charge + 40;
    }
    after(t, () => {
      if (run !== runId.current) return;
      flip(4, true);
      after(REVEAL[cards[4].rarity] + T.mark, () => setAuto(false));
    });
  };

  const again = () => {
    moved.current = true;
    stopAll();
    setPending(null);
    setPhase("choose");
  };

  const toggleMute = () => {
    unlockSound();
    if (!s.muted) silence();
    setMuted(!s.muted);
  };

  const mute = (
    <button type="button" className={styles.iconBtn} onClick={toggleMute} aria-pressed={s.muted} aria-label="Mute">
      <Icon name={s.muted ? "mute" : "volume"} />
    </button>
  );
  const live = (
    <p className="sr-only" aria-live="polite">
      {announce}
    </p>
  );

  if (phase === "choose") return <Shelf onChoose={choose} firstRef={focusTarget} mute={mute} />;

  if (phase === "resume" && pending) {
    const p = packById(pending.pack)!;
    return (
      <div className={styles.wrap}>
        <div className={styles.resume}>
          <h1 className="h1">{`Your ${p.name} pack is still open`}</h1>
          <div className={styles.actions}>
            <Button
              onClick={() => {
                moved.current = true;
                begin(pending, "stack", pending.turned);
                const lastR = cardById.get(pending.ids[4])!.rarity;
                if (pending.turned === 4 && rarityRank[lastR] >= rarityRank.R) after(60, () => charge());
              }}
            >
              Resume
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                moved.current = true;
                begin(pending, "stack", 5);
                toSummary(pending);
              }}
            >
              Show all
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!pending || !pack) return null;

  const summary = phase === "summary";
  const tell = landed || phase !== "pack" ? best(pending.ids) : null;
  const stage = phase === "pack" || phase === "tearing" ? "pack" : phase;
  const label =
    phase === "pack"
      ? `Tear the ${pack.name} pack open`
      : summary
        ? "All five cards"
        : turned === 5
          ? "See all five"
          : charging
            ? "The last card is glowing"
            : `Turn over card ${turned + 1} of 5`;

  return (
    <div className={styles.wrap} data-phase={phase}>
      {live}
      <div className={styles.bar}>
        <h1 className={styles.packName}>
          {pack.name}
          <span>{`${no3(pack.range[0])} to ${no3(pack.range[1])}`}</span>
        </h1>
        <div className={styles.barRight}>
          {stage === "stack" && <span className={styles.slotCount}>{`${turned} / 5`}</span>}
          {stage === "stack" && turned > 0 && turned < 5 && (
            <Button variant="secondary" size="small" onClick={showAll} disabled={auto}>
              Show all
            </Button>
          )}
          {mute}
        </div>
      </div>

      <Table
        pending={pending}
        cards={cards}
        stage={stage}
        landed={landed}
        tearing={phase === "tearing"}
        tell={tell}
        pull={pull}
        turned={turned}
        cur={cur}
        charging={charging || (charged && turned === 4)}
        revealing={revealing}
        marked={marked}
        label={label}
        buttonRef={focusTarget}
        autoFocus={moved.current}
        onPress={phase === "pack" ? undefined : advance}
        onDown={onDown}
        onMove={onMove}
        onUp={onUp}
        onKeyTear={tear}
        onOpenCard={(c, el) => {
          opener.current = el;
          setOpen(c);
        }}
      />

      {phase === "pack" && (
        <div className={styles.actions}>
          <Button onClick={tear}>Tear it open</Button>
        </div>
      )}
      {stage === "stack" && turned === 5 && !auto && (
        <div className={styles.actions}>
          <Button onClick={() => toSummary()}>
            See all five
          </Button>
        </div>
      )}
      {summary && (
        <div className={styles.summary}>
          <div className={styles.tallies}>
            <p>
              <strong>{`${shown.found} / 60`}</strong> found
            </p>
            <p>
              <strong>{`${shown.secrets} / 6`}</strong> secrets
            </p>
            <p>
              <strong>{shown.feathers}</strong> feathers
            </p>
            {pending.completed.map((id) => (
              <p key={id} className={styles.stamp}>{`${packById(id)!.name} complete`}</p>
            ))}
            {pending.goal && <p className={styles.stamp}>Flock complete</p>}
          </div>
          <div className={styles.actions}>
            <Button onClick={again}>Open another</Button>
            <ButtonLink href="/cards" variant="secondary">
              See the collection
            </ButtonLink>
          </div>
        </div>
      )}
      <CardDialog card={open} onClose={() => setOpen(null)} returnTo={() => opener.current} />
    </div>
  );
}

/**
 * The table: one positioned box for the stage and the row under it. Every card is placed by a transform from
 * the measured box, so a card can travel from the stack to the middle, down to its slot in the row, and up into
 * the fan, as one element.
 */
function Table(props: {
  pending: Pending;
  cards: FlockCard[];
  stage: "pack" | "stack" | "summary" | "choose" | "resume";
  landed: boolean;
  tearing: boolean;
  tell: Rarity | null;
  pull: number;
  turned: number;
  cur: number;
  charging: boolean;
  revealing: Rarity | null;
  marked: Set<number>;
  label: string;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  /** Moves focus to the pack or the stack when it appears, once the visitor has acted. */
  autoFocus: boolean;
  onPress?: () => void;
  onDown: (e: RPointerEvent<HTMLButtonElement>) => void;
  onMove: (e: RPointerEvent<HTMLButtonElement>) => void;
  onUp: (e: RPointerEvent<HTMLButtonElement>) => void;
  onKeyTear: () => void;
  onOpenCard: (c: FlockCard, el: HTMLElement) => void;
}) {
  const { pending, cards, stage, turned, cur, marked } = props;
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const ready = w > 0;
  const { autoFocus, buttonRef } = props;
  useEffect(() => {
    if (ready && autoFocus && (stage === "pack" || stage === "stack")) buttonRef.current?.focus({ preventScroll: true });
  }, [ready, stage, autoFocus, buttonRef]);
  const gap = w < 560 ? 8 : 14;
  const miniW = Math.min(104, (w - 4 * gap) / 5);
  const miniH = miniW * 1.4;
  const rowH = miniH + 20;
  const stageH = Math.max(200, h - rowH);
  const H = Math.min(stageH * 0.94, ((w * 0.7) / 750) * 1050);
  const W = (H / 1050) * 750;
  const cx = (w - W) / 2;
  const cy = (stageH - H) / 2;
  const rowX = (w - (5 * miniW + 4 * gap)) / 2;
  const s = miniW / W;
  // The fan: five cards across the whole table, overlapping, on an arc.
  const fanW = Math.min(W * 0.78, (w - 24) / 3.4);
  const fs = fanW / W;
  const fanStep = Math.min(fanW * 0.78, (w - fanW - 16) / 4);
  const fanX0 = (w - (fanW + 4 * fanStep)) / 2;
  const fanY = Math.max(8, (h - (fanW * 1.4)) / 2 - 10);

  const place = (i: number): React.CSSProperties => {
    let x = cx;
    let y = cy;
    let sc = 1;
    let rot = 0;
    let z = 10 - i;
    if (stage === "summary") {
      x = fanX0 + i * fanStep - (W - fanW) / 2;
      y = fanY + Math.abs(i - 2) * fanW * 0.06 - (H - fanW * 1.4) / 2;
      sc = fs;
      rot = (i - 2) * 6;
      z = 20 + i;
    } else if (i < turned && i !== cur) {
      x = rowX + i * (miniW + gap) - (W - miniW) / 2;
      y = stageH + 6 - (H - miniH) / 2;
      sc = s;
      z = 1 + i;
    } else if (i === cur) {
      z = 30;
    } else {
      // Face down in the stack: each one a little lower and to the right of the one above it.
      const k = i - turned;
      x = cx + k * 3;
      y = cy + k * 4;
      if (stage === "pack") {
        y = cy + H * 0.25;
        sc = 0.9;
      }
    }
    return { transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`, zIndex: z, width: W, height: H, "--inv": sc < 0.6 ? Math.min(3, 0.75 / sc) : 1 } as React.CSSProperties;
  };

  const faceUp = (i: number) => i < turned || stage === "summary";
  const glowing = props.charging && turned === 4;

  return (
    <div ref={box} className={styles.table} data-stage={stage} data-dim={glowing || undefined} data-reveal={props.revealing ?? undefined}>
      <span className={styles.burst} aria-hidden="true" />
      <span className={styles.luma} aria-hidden="true" />
      {stage === "pack" && w > 0 && (
        <button
          ref={props.buttonRef}
          type="button"
          className={styles.packBtn}
          data-landed={props.landed || undefined}
          style={{ width: Math.min(w * 0.62, ((h * 0.9) / 1440) * 888), left: "50%", top: h * 0.02 }}
          aria-label={props.label}
          onPointerDown={props.onDown}
          onPointerMove={props.onMove}
          onPointerUp={props.onUp}
          onPointerCancel={props.onUp}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              props.onKeyTear();
            }
          }}
          onClick={(e) => e.preventDefault()}
        >
          <SealedPack pack={packById(pending.pack)!} tell={props.landed ? props.tell : null} pull={props.pull} tearing={props.tearing} />
        </button>
      )}
      {(stage === "stack" || stage === "summary" || props.tearing) &&
        w > 0 &&
        cards.map((c, i) => {
          const r = pending.results[i];
          const up = faceUp(i);
          const isCur = i === cur;
          const dur = i === 4 && rarityRank[c.rarity] >= rarityRank.R ? 900 : 280;
          const flipMs = i === 4 ? { R: 400, SR: 500, S: 900, G: 900, C: 280, U: 280 }[c.rarity] : 280;
          const lifted = isCur && i === 4 && (c.rarity === "SR" || c.rarity === "S");
          const inner = (
            <span className={styles.flipper} data-up={up || undefined} style={{ "--flip": `${flipMs}ms` } as React.CSSProperties}>
              <span className={styles.front}>
                <Card card={c} plain bare={stage !== "summary" && i < turned && i !== cur} />
                {lifted && (
                  <span className={styles.lift} data-rarity={c.rarity} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.cutout} alt="" />
                  </span>
                )}
                {marked.has(i) && (r.isNew ? <span className={styles.ribbon}>New</span> : <span className={styles.feathers}>{r.feathers ? `+${r.feathers} ${r.feathers === 1 ? "feather" : "feathers"}` : "Duplicate secret"}</span>)}
              </span>
              <span className={styles.back} data-glow={glowing && i === 4 ? c.rarity : undefined}>
                <FlockBack />
              </span>
            </span>
          );
          const common = {
            className: styles.slot,
            style: { ...place(i), "--dur": `${dur}ms` } as React.CSSProperties,
            "data-cur": isCur || undefined,
          };
          if (stage === "summary") {
            return (
              <button
                key={i}
                type="button"
                {...common}
                aria-label={`${cardNumber(c)} ${c.name}, ${rarityName[c.rarity]}${r.isNew ? ", new" : ""}`}
                onClick={(e) => props.onOpenCard(c, e.currentTarget)}
              >
                {inner}
              </button>
            );
          }
          return (
            <span key={i} {...common} aria-hidden="true">
              {inner}
            </span>
          );
        })}
      {stage === "stack" && w > 0 && (
        <button
          ref={props.buttonRef}
          type="button"
          className={styles.press}
          style={{ left: cx, top: cy, width: W, height: H }}
          aria-label={props.label}
          onClick={props.onPress}
        />
      )}
      {stage === "stack" && w > 0 && (
        <ol className={styles.row} style={{ top: stageH + 6, left: rowX, gap }} aria-label="Cards turned">
          {cards.map((c, i) => (
            <li key={i} style={{ width: miniW, height: miniH }}>
              {i < turned ? <span className="sr-only">{`${cardNumber(c)} ${c.name}`}</span> : <span className={styles.rowNo}>{i + 1}</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Step 1: three packs on a shelf with their ranges and what is found, and the odds under them. */
function Shelf({ onChoose, firstRef, mute }: { onChoose: (p: Pack) => void; firstRef: React.RefObject<HTMLButtonElement | null>; mute: React.ReactNode }) {
  const s = useCards();
  const odds = packOdds();
  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <h1 className="h1">Choose a pack</h1>
        <div className={styles.barRight}>{mute}</div>
      </div>
      <ul className={styles.shelf}>
        {packs.map((p, i) => {
          const found = numberedIn(p).filter((c) => has(s.owned, c.id)).length;
          const pull = guaranteeActive(s.owned, p);
          return (
            <li key={p.id} style={{ "--i": i } as React.CSSProperties}>
              <button
                ref={i === 0 ? firstRef : undefined}
                type="button"
                className={styles.choice}
                onClick={() => onChoose(p)}
                aria-label={`${p.name} pack, ${no3(p.range[0])} to ${no3(p.range[1])}, ${found} of 20 found${pull ? ", the last card is a secret" : ""}`}
              >
                <span className={styles.sway}>
                  <SealedPack pack={p} />
                </span>
                <span className={styles.choiceName}>{p.name}</span>
                <span className={styles.choiceMeta}>{`${found} / 20`}</span>
                {pull && <span className={styles.pullBadge}>Secret in slot 5</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <section className={styles.odds} aria-labelledby="odds-h">
        <h2 id="odds-h" className={styles.oddsTitle}>
          Odds
        </h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Slot</th>
              {(["C", "U", "R", "SR", "S"] as const).map((r) => (
                <th key={r} scope="col" title={rarityName[r]}>
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slotWeights.map((wt, i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                {(["C", "U", "R", "SR", "S"] as const).map((r) => (
                  <td key={r} data-zero={!wt[r] || undefined}>
                    {wt[r] ? `${wt[r]}%` : "0"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.oddsLine}>
          <span>{`Rare or better: ${pct(odds.rare * 100)} a pack`}</span>
          <span>{`Super rare or secret: ${pct(odds.superRare * 100)}`}</span>
        </p>
      </section>
    </div>
  );
}
