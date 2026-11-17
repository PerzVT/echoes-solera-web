"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/labs/Icon";
import { EndCard, SceneHead, ShotCard } from "./Cards";
import { useReducedMotion } from "./hooks";
import type { Editor } from "./Storyboard";
import b from "./board.module.css";

/** Every shot along the foot in one line, grouped under editable scene headings. Scrolls sideways by wheel, trackpad, drag or its scrollbar. */
export function Strip({ ed }: { ed: Editor }) {
  const box = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [edges, setEdges] = useState({ start: false, end: false });

  // Keep the selected shot in view, moving the strip sideways only so the page never jumps.
  useEffect(() => {
    const el = box.current?.querySelector<HTMLElement>(`[data-shot="${ed.selected}"]`)?.closest("li");
    const list = box.current;
    if (!el || !list) return;
    const l = el.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
    if (l < list.scrollLeft + 24 || l + el.offsetWidth > list.scrollLeft + list.clientWidth - 24)
      list.scrollTo({ left: l - list.clientWidth / 2 + el.offsetWidth / 2, behavior: reduced ? "auto" : "smooth" });
  }, [ed.selected, reduced]);

  // Fades at the edges show there is more to either side.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, []);

  // A mouse wheel turns the strip sideways; a trackpad already scrolls it sideways on its own.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);

  // Dragging the strip's background with a mouse scrolls it; cards keep their own drag to reorder.
  const drag = useRef<{ x: number; left: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, input, [draggable=true], [role=menu]")) return;
    drag.current = { x: e.clientX, left: box.current!.scrollLeft };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !box.current) return;
    box.current.scrollLeft = d.left - (e.clientX - d.x);
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <section className={b.strip} aria-label="Shots" data-fade-start={edges.start || undefined} data-fade-end={edges.end || undefined}>
      <div ref={box} className={b.stripScroll} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <div className={b.stripRow}>
          {ed.ep.scenes.map((sc, si) => (
            <div key={sc.id} className={b.stripScene} role="group" aria-label={`Scene ${si + 1}`}>
              <SceneHead scene={sc} n={si + 1} menu={ed.sceneMenu(sc.id, "row")} onRename={(h) => ed.rename(sc.id, h)} />
              <ul className={b.stripCards}>
                {sc.shots.map((s, i) => (
                  <ShotCard
                    key={s.id}
                    shot={s}
                    n={ed.number(s.id)}
                    scene={sc}
                    index={i}
                    selected={s.id === ed.selected}
                    variant="strip"
                    menu={ed.shotMenu(s.id)}
                    onSelect={() => ed.select(s.id)}
                    onAddBefore={() => ed.addAt(sc.id, i)}
                    onDrop={ed.drop}
                    sizes="180px"
                  />
                ))}
                <EndCard scene={sc} variant="strip" onAdd={() => ed.addAt(sc.id, sc.shots.length)} onDrop={ed.drop} />
              </ul>
            </div>
          ))}
          <button type="button" className={b.addScene} onClick={() => ed.addScene(ed.ep.scenes.length - 1)}>
            <Icon name="plus" size={16} />
            Add scene
          </button>
        </div>
      </div>
    </section>
  );
}
