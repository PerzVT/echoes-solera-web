"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedMark } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { Btn, IconBtn } from "@/components/labs/chat/ui";
import { episode, initialShots, type Shot } from "./data";
import { useReducedMotion } from "./hooks";
import { Panel } from "./Panel";
import { PlayEpisode } from "./PlayEpisode";
import { BoardGrid, ShotStage, ViewSwitch, type View } from "./Stage";
import { Strip } from "./Strip";
import b from "./board.module.css";

const tools = [
  { href: "/app", name: "Mini-series" },
  { href: "/app/cooking", name: "Cooking", more: " videos" },
  { href: "/app/anime", name: "Anime" },
];

const MAKE_MS = 4000;

/** The anime storyboard: the shot panel at the left, the selected shot on the stage, every shot along the foot. */
export function BoardApp() {
  const [shots, setShots] = useState<Shot[]>(initialShots);
  const [selected, setSelected] = useState("s3");
  const [view, setView] = useState<View>("shot");
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const index = Math.max(0, shots.findIndex((s) => s.id === selected));
  const shot = shots[index];
  const ready = shots.filter((s) => s.status === "ready" && s.takes.length > 0);

  const patch = useCallback((id: string, p: Partial<Shot> | ((s: Shot) => Partial<Shot>)) => setShots((all) => all.map((s) => (s.id === id ? { ...s, ...(typeof p === "function" ? p(s) : p) } : s))), []);

  /** Ready, with a new take drawn from the shot's art, selected. `add` false finishes a take already under way. */
  const finish = useCallback(
    (id: string, add = true) => {
      timers.current.delete(id);
      patch(id, (s) => {
        if (!add) return { status: "ready" };
        const art = s.next[s.takes.length % s.next.length] ?? s.takes[s.take];
        return { status: "ready", takes: [...s.takes, art], take: s.takes.length };
      });
    },
    [patch],
  );

  const generate = (id: string) => {
    if (reduced) return finish(id);
    patch(id, { status: "generating" });
    timers.current.set(
      id,
      setTimeout(() => finish(id), MAKE_MS),
    );
  };

  // The shot that was already generating when the page opened finishes on its own.
  useEffect(() => {
    const all = timers.current;
    const t = setTimeout(() => finish("s5", false), reduced ? 0 : 9000);
    return () => {
      clearTimeout(t);
      all.forEach(clearTimeout);
    };
  }, [finish, reduced]);

  const addShot = (scene: number) => {
    const id = `new-${Date.now()}`;
    setShots((all) => {
      const at = all.findLastIndex((s) => s.scene === scene);
      const like = all[at];
      const art = all.filter((s) => s.scene === scene && s.takes.length > 0).map((s) => s.takes[s.take]);
      const fresh: Shot = { id, scene, label: "NEW SHOT", action: "", cast: [], place: like.place, style: like.style, prompt: "", seconds: 4, takes: [], take: 0, status: "empty", next: art.length ? art : like.next };
      return [...all.slice(0, at + 1), fresh, ...all.slice(at + 1)];
    });
    setSelected(id);
    setView("shot");
  };

  // Left and right arrows walk the shots, except while typing or inside a dialog.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable], dialog, [role=dialog]")) return;
      e.preventDefault();
      setSelected((cur) => {
        const i = shots.findIndex((s) => s.id === cur);
        const j = Math.min(shots.length - 1, Math.max(0, i + (e.key === "ArrowRight" ? 1 : -1)));
        return shots[j].id;
      });
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [shots]);

  return (
    <div className={b.app} data-view={view}>
      <header className={b.top}>
        <Link href="/" className={b.markLink} aria-label="Nine Lives home">
          <AnimatedMark variant="still" size={26} />
        </Link>
        <nav className={b.tools} aria-label="Tools">
          {tools.map((t) => (
            <Link key={t.href} href={t.href} className={b.tool} aria-current={t.href === "/app/anime" ? "page" : undefined}>
              {t.name}
              {t.more && <span className={b.toolMore}>{t.more}</span>}
            </Link>
          ))}
        </nav>
        <h1 className={b.title}>{episode.title}</h1>
        <div className={b.topEnd}>
          <Btn kind="primary" className={b.playWide} icon={<Icon name="play" size={14} />} disabled={ready.length === 0} onClick={() => setPlaying(true)}>
            Play episode
          </Btn>
          <IconBtn label="Play episode" className={b.playNarrow} disabled={ready.length === 0} onClick={() => setPlaying(true)}>
            <Icon name="play" size={18} />
          </IconBtn>
        </div>
      </header>

      <Panel key={shot.id} shot={shot} n={index + 1} onChange={(p) => patch(shot.id, p)} onGenerate={() => generate(shot.id)} onTake={(take) => patch(shot.id, { take })} />

      <main className={b.stage} id="main">
        <div className={b.stageBar}>
          <ViewSwitch view={view} onView={setView} />
        </div>
        {view === "shot" ? (
          <ShotStage shot={shot} n={index + 1} prev={shots[index - 1]} onRetry={() => generate(shot.id)} />
        ) : (
          <BoardGrid
            shots={shots}
            selected={shot.id}
            onPick={(id) => {
              setSelected(id);
              setView("shot");
            }}
          />
        )}
      </main>

      <Strip shots={shots} selected={shot.id} onSelect={setSelected} onNew={addShot} />

      <PlayEpisode open={playing} onClose={() => setPlaying(false)} shots={ready} title={episode.title} />
    </div>
  );
}
