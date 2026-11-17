"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/labs/Icon";
import { scenes, statusWord, type Shot } from "./data";
import { useReducedMotion } from "./hooks";
import { Thumb } from "./Thumb";
import b from "./board.module.css";

/** Every shot along the foot, grouped under its scene heading, with a New shot card closing each scene. */
export function Strip({ shots, selected, onSelect, onNew }: { shots: Shot[]; selected: string; onSelect: (id: string) => void; onNew: (scene: number) => void }) {
  const list = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(`[data-shot="${selected}"]`);
    const box = list.current;
    if (!el || !box) return;
    // Scroll the strip sideways only, so the page itself never jumps.
    const l = el.offsetLeft;
    if (l < box.scrollLeft + 16 || l + el.offsetWidth > box.scrollLeft + box.clientWidth - 16)
      box.scrollTo({ left: l - box.clientWidth / 2 + el.offsetWidth / 2, behavior: reduced ? "auto" : "smooth" });
  }, [selected, reduced]);

  return (
    <section className={b.strip} aria-label="Storyboard">
      <div ref={list} className={b.stripScroll}>
        {scenes.map((sc) => (
          <div key={sc.n} className={b.stripScene} role="group" aria-labelledby={`strip-sc-${sc.n}`}>
            <h3 id={`strip-sc-${sc.n}`} className={b.sceneHead}>
              <span>{sc.n}</span> {sc.heading}
            </h3>
            <ul className={b.stripCards}>
              {shots.map((s, i) =>
                s.scene !== sc.n ? null : (
                  <li key={s.id}>
                    <button type="button" data-shot={s.id} className={b.stripCard} aria-pressed={s.id === selected} onClick={() => onSelect(s.id)} aria-label={`Shot ${i + 1}, ${s.label}, ${statusWord[s.status]}`}>
                      <Thumb shot={s} sizes="180px" />
                      <span className={b.cardLabel}>
                        <span className={b.num}>{i + 1}</span>
                        <span className={b.cardName}>{s.label}</span>
                      </span>
                    </button>
                  </li>
                ),
              )}
              <li>
                <button type="button" className={b.newCard} onClick={() => onNew(sc.n)}>
                  <span className={b.newArt}>
                    <Icon name="plus" size={18} />
                  </span>
                  <span className={b.cardLabel}>New shot</span>
                </button>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
