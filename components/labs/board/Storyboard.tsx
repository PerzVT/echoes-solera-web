"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/labs/Icon";
import { AppBar } from "@/components/labs/chat/AppBar";
import { Btn } from "@/components/labs/chat/ui";
import type { Drop, MenuItem } from "./Cards";
import { allShots, type Episode, type Shot } from "./data";
import { useSteps } from "./Flow";
import { useReducedMotion } from "./hooks";
import * as ops from "./ops";
import { Panel } from "./Panel";
import { PlayEpisode } from "./PlayEpisode";
import { BoardGrid, ShotStage, ViewSwitch, type View } from "./Stage";
import { useAnime, type Target } from "./store";
import { Strip } from "./Strip";
import b from "./board.module.css";

const MAKE_MS = 2600;
const UNDO_MS = 6000;

/** What the strip, the board and the panel call to change the episode. */
export type Editor = {
  ep: Episode;
  selected: string;
  number: (id: string) => number;
  select: (id: string) => void;
  shotMenu: (id: string) => MenuItem[];
  sceneMenu: (id: string, axis: "row" | "column") => MenuItem[];
  addAt: (sceneId: string, at: number) => void;
  addScene: (after: number) => void;
  rename: (sceneId: string, heading: string) => void;
  drop: (id: string, to: Drop) => void;
};

type Props = { target: Target; name: string; episodes?: number; flow?: boolean };

export function Storyboard(props: Props) {
  const { episodeOf } = useAnime();
  const ep = episodeOf(props.target);
  if (!ep) return null;
  return <Board {...props} ep={ep} />;
}

/** A canvas from the list, opened on one of its episodes. An unknown one goes back to the list. */
export function CanvasBoard({ id, ep }: { id: string; ep: number }) {
  const router = useRouter();
  const { canvases } = useAnime();
  const canvas = canvases.find((c) => c.id === id);
  useEffect(() => {
    if (!canvas) router.replace("/app/anime");
  }, [canvas, router]);
  if (!canvas) return null;
  const i = Math.min(canvas.episodes.length - 1, Math.max(0, ep - 1));
  return <Storyboard key={`${id}-${i}`} target={{ kind: "canvas", id, ep: i }} name={canvas.name} episodes={canvas.episodes.length} />;
}

/** The new anime's storyboard, the last step of the flow. */
export function DraftBoard() {
  const { draft } = useAnime();
  return <Storyboard target={{ kind: "draft" }} name={draft.title || "New anime"} flow />;
}

function Board({ target, name, episodes = 1, flow, ep }: Props & { ep: Episode }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { update, make, startDraft, finishDraft, draft, castOf } = useAnime();
  const shots = useMemo(() => allShots(ep), [ep]);
  const [selected, setSelected] = useState(() => shots[0]?.id ?? "");
  const [view, setView] = useState<View>("shot");
  const [playing, setPlaying] = useState(false);
  const [undo, setUndo] = useState<{ text: string; ep: Episode; select: string } | null>(null);
  const undoTimer = useRef<number>(0);

  // The new anime starts filling in as soon as its storyboard opens, even when reached straight from the address bar.
  useEffect(() => {
    if (flow && !draft.started) startDraft(reduced);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const current = shots.find((s) => s.id === selected) ?? shots[0];
  const at = current ? ops.find(ep, current.id) : null;
  const numbers = useMemo(() => new Map(shots.map((s, i) => [s.id, i + 1])), [shots]);
  const number = useCallback((id: string) => numbers.get(id) ?? 0, [numbers]);
  const edit = useCallback((f: (e: Episode) => Episode) => update(target, f), [update, target]);

  const remember = (text: string, before: Episode, select: string) => {
    window.clearTimeout(undoTimer.current);
    setUndo({ text, ep: before, select });
    undoTimer.current = window.setTimeout(() => setUndo(null), UNDO_MS);
  };
  useEffect(() => () => window.clearTimeout(undoTimer.current), []);

  const removeShot = (id: string) => {
    const i = shots.findIndex((s) => s.id === id);
    if (i < 0) return;
    const nextSel = shots[i + 1]?.id ?? shots[i - 1]?.id ?? "";
    remember(`Shot ${i + 1} deleted`, ep, id);
    edit((e) => ops.deleteShot(e, id));
    setSelected(nextSel);
  };
  const removeScene = (id: string) => {
    const si = ep.scenes.findIndex((s) => s.id === id);
    if (si < 0) return;
    remember(`Scene ${si + 1} deleted`, ep, selected);
    const gone = new Set(ep.scenes[si].shots.map((s) => s.id));
    if (gone.has(selected)) setSelected(shots.find((s) => !gone.has(s.id))?.id ?? "");
    edit((e) => ops.deleteScene(e, id));
  };
  const addAt = (sceneId: string, i: number) => {
    const r = ops.addShot(ep, sceneId, i);
    edit(() => r.e);
    setSelected(r.id);
  };
  const duplicate = (id: string) => {
    const r = ops.duplicateShot(ep, id);
    edit(() => r.e);
    setSelected(r.id);
  };
  const generate = (id: string) => make(target, id, reduced ? 1 : MAKE_MS);

  const ed: Editor = {
    ep,
    selected: current?.id ?? "",
    number,
    select: setSelected,
    addAt,
    addScene: (after) => edit((e) => ops.addScene(e, after).e),
    rename: (id, h) => edit((e) => ops.renameScene(e, id, h)),
    drop: (id, to) => {
      const f = ops.find(ep, id);
      if (!f) return;
      // The target index counts the shots without the one moving.
      const k = f.scene.id === to.sceneId && f.i < to.at ? to.at - 1 : to.at;
      edit((e) => ops.moveShot(e, id, to.sceneId, k));
      setSelected(id);
    },
    shotMenu: (id) => {
      const f = ops.find(ep, id);
      return [
        { label: "Duplicate", onSelect: () => duplicate(id) },
        { label: "Move left", disabled: !ops.canNudge(ep, id, -1), onSelect: () => edit((e) => ops.nudgeShot(e, id, -1)) },
        { label: "Move right", disabled: !ops.canNudge(ep, id, 1), onSelect: () => edit((e) => ops.nudgeShot(e, id, 1)) },
        ...ep.scenes
          .map((sc, si) => ({ sc, si }))
          .filter(({ sc }) => sc.id !== f?.scene.id)
          .map(({ sc, si }) => ({ label: `Move to scene ${si + 1}`, onSelect: () => edit((e) => ops.moveShot(e, id, sc.id, sc.shots.length)) })),
        { label: "Delete", danger: true, onSelect: () => removeShot(id) },
      ];
    },
    sceneMenu: (id, axis) => {
      const si = ep.scenes.findIndex((s) => s.id === id);
      return [
        { label: "Add shot", onSelect: () => addAt(id, ep.scenes[si].shots.length) },
        { label: "Add scene after", onSelect: () => edit((e) => ops.addScene(e, si).e) },
        { label: axis === "row" ? "Move left" : "Move up", disabled: si === 0, onSelect: () => edit((e) => ops.moveScene(e, id, -1)) },
        { label: axis === "row" ? "Move right" : "Move down", disabled: si === ep.scenes.length - 1, onSelect: () => edit((e) => ops.moveScene(e, id, 1)) },
        { label: "Delete scene", danger: true, onSelect: () => removeScene(id) },
      ];
    },
  };

  // Arrows walk the shots; Delete removes the selected one. Never while typing or inside a menu or dialog.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable], dialog, [role=dialog], [role=menu]")) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const i = shots.findIndex((s) => s.id === current?.id);
        const j = Math.min(shots.length - 1, Math.max(0, i + (e.key === "ArrowRight" ? 1 : -1)));
        if (shots[j]) setSelected(shots[j].id);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && current) {
        e.preventDefault();
        removeShot(current.id);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const playable = shots.filter((s) => s.status === "ready" && s.takes.length > 0 && s.review !== "denied");
  const allReviewed = flow && shots.length > 0 && shots.every((s) => s.review);
  const steps = useSteps("storyboard", !!flow);

  const play = (
    <Btn kind={allReviewed ? "secondary" : "primary"} icon={<Icon name="play" size={14} />} disabled={playable.length === 0} onClick={() => setPlaying(true)}>
      Play episode
    </Btn>
  );
  const action = allReviewed ? (
    <>
      {play}
      <Btn
        kind="primary"
        onClick={() => {
          finishDraft();
          router.push("/app/anime");
        }}
      >
        Finish
      </Btn>
    </>
  ) : (
    play
  );

  return (
    <div className={b.app} data-view={view}>
      <AppBar tool="anime" view={flow ? "create" : "library"} title={name} steps={flow ? steps : undefined} current={flow ? "storyboard" : undefined} action={action} />
      <div className={b.body}>
        {current && at ? (
          <Panel
            key={current.id}
            shot={current}
            n={number(current.id)}
            scene={at.scene}
            cast={castOf(target)}
            onChange={(p) => edit((e) => ops.patchShot(e, current.id, p))}
            onMake={() => generate(current.id)}
            onReview={(review) => edit((e) => ops.patchShot(e, current.id, { review }))}
            onRetry={() => generate(current.id)}
            onDuplicate={() => duplicate(current.id)}
            onDelete={() => removeShot(current.id)}
          />
        ) : (
          <aside className={b.panel} aria-label="Shot">
            <div className={b.panelBody}>
              <Btn kind="secondary" onClick={() => (ep.scenes[0] ? addAt(ep.scenes[0].id, 0) : edit((e) => ops.addScene(e, -1).e))}>
                {ep.scenes[0] ? "New shot" : "Add scene"}
              </Btn>
            </div>
          </aside>
        )}

        <main className={b.stage} id="main">
          <div className={b.stageBar}>
            {episodes > 1 && !flow ? (
              <nav className={b.switch} aria-label="Episodes">
                {Array.from({ length: episodes }, (_, i) => (
                  <Link key={i} href={target.kind === "canvas" ? `/app/anime/${target.id}${i ? `?ep=${i + 1}` : ""}` : "#"} replace scroll={false} className={b.switchBtn} aria-current={target.kind === "canvas" && target.ep === i ? "page" : undefined}>
                    Episode {i + 1}
                  </Link>
                ))}
              </nav>
            ) : (
              <span />
            )}
            <ViewSwitch view={view} onView={setView} />
          </div>
          {view === "shot" ? (
            <ShotStage shot={current} n={current ? number(current.id) : 0} onMake={() => current && generate(current.id)} />
          ) : (
            <BoardGrid
              ed={ed}
              onOpen={(id) => {
                setSelected(id);
                setView("shot");
              }}
            />
          )}
        </main>

        {view === "shot" && <Strip ed={ed} />}
      </div>

      {undo && (
        <div className={b.undo} role="status">
          <span>{undo.text}</span>
          <Btn
            kind="ghost"
            small
            onClick={() => {
              const u = undo;
              edit(() => u.ep);
              setSelected(u.select);
              setUndo(null);
            }}
          >
            Undo
          </Btn>
        </div>
      )}

      <PlayEpisode open={playing} onClose={() => setPlaying(false)} shots={playable} title={name} />
    </div>
  );
}

export type { Shot };
