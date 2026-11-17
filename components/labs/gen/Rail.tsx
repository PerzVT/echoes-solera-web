"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { GestureIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import type { Style } from "@/lib/labs/styles";
import { Btn, IconBtn } from "../chat/ui";
import { chefs, genStyles, lengthOf, searchRecipes, seconds, type Recipe } from "./data";
import { useDialog } from "./hooks";
import g from "./gen.module.css";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export type RecipeState = { mode: "search" | "custom"; picked: Recipe | null; text: string };

/** The recipe the settings hold: the picked one, or a pasted one once it has a title line. */
export function chosenRecipe(s: RecipeState): Recipe | null {
  if (s.mode === "search") return s.picked;
  const title = s.text.split("\n")[0].trim();
  return title ? { key: `custom:${title}`, title, custom: true } : null;
}

type Props = {
  recipe: RecipeState;
  onRecipe: (s: RecipeState) => void;
  chef: string | null;
  onChef: (name: string) => void;
  style: Style;
  onStyle: (s: Style) => void;
  onGenerate: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
};

/** The settings: recipe, chef, style and the length the recipe sets, with Generate at the foot. */
export function Rail({ recipe, onRecipe, chef, onChef, style, onStyle, onGenerate, scrollRef }: Props) {
  const chosen = chosenRecipe(recipe);
  const ready = !!chosen && !!chef;
  const why = useId();

  return (
    <aside className={g.rail} aria-label="Settings">
      <div ref={scrollRef} className={g.railScroll}>
        <RecipeField state={recipe} onChange={onRecipe} />
        <ChefField value={chef} onChange={onChef} />
        <StyleField value={style} onChange={onStyle} />
        <section className={g.field} aria-labelledby="f-length">
          <dl className={g.length}>
            <dt id="f-length" className={g.fieldLabel}>
              Length
            </dt>
            <dd>{seconds(lengthOf(chosen))}</dd>
          </dl>
        </section>
      </div>
      <div className={g.foot}>
        <Btn
          kind="primary"
          wide
          className={g.generate}
          aria-disabled={!ready || undefined}
          aria-describedby={ready ? undefined : why}
          onClick={() => ready && onGenerate()}
        >
          Generate
        </Btn>
        {!ready && (
          <span id={why} className="sr-only">
            {!chosen && !chef ? "Choose a recipe and a chef first" : !chosen ? "Choose a recipe first" : "Choose a chef first"}
          </span>
        )}
      </div>
    </aside>
  );
}

function DishIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

function Thumb({ r }: { r: Recipe }) {
  return <span className={g.thumb}>{r.release ? <Image src={r.release.dish} alt="" fill sizes="80px" /> : <DishIcon />}</span>;
}

function RecipeField({ state, onChange }: { state: RecipeState; onChange: (s: RecipeState) => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const focusNext = useRef<"search" | "custom" | null>(null);
  const results = searchRecipes(q);

  useEffect(() => {
    if (focusNext.current === "search") input.current?.focus();
    if (focusNext.current === "custom") area.current?.focus();
    focusNext.current = null;
  });

  const change = () => {
    focusNext.current = "search";
    onChange({ ...state, mode: "search", picked: null });
  };

  return (
    <section className={g.field} aria-labelledby="f-recipe">
      <h2 id="f-recipe" className={g.fieldLabel}>
        Recipe
      </h2>
      {state.mode === "search" && state.picked ? (
        <div className={g.picked}>
          <Thumb r={state.picked} />
          <span className={g.rowTitle}>{state.picked.title}</span>
          <Btn kind="ghost" small onClick={change}>
            Change
          </Btn>
        </div>
      ) : state.mode === "custom" ? (
        <div className={g.custom}>
          <textarea
            ref={area}
            className={g.area}
            aria-label="Your recipe"
            placeholder="Paste a recipe"
            rows={7}
            value={state.text}
            onChange={(e) => onChange({ ...state, text: e.target.value })}
          />
          <Btn kind="ghost" small icon={<GestureIcon name="search" size={16} />} onClick={change}>
            Search recipes
          </Btn>
        </div>
      ) : (
        <>
          <label className={g.search}>
            <GestureIcon name="search" size={18} />
            <span className="sr-only">Search recipes</span>
            <input ref={input} type="search" placeholder="Search recipes" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
          </label>
          <ul className={g.results} aria-label="Recipes">
            <li>
              <button
                type="button"
                className={g.row}
                onClick={() => {
                  focusNext.current = "custom";
                  onChange({ ...state, mode: "custom" });
                }}
              >
                <span className={g.thumb}>
                  <Icon name="plus" size={18} />
                </span>
                <span className={g.rowTitle}>Add your own</span>
              </button>
            </li>
            {results.map((r) => (
              <li key={r.key}>
                <button type="button" className={g.row} onClick={() => onChange({ ...state, mode: "search", picked: r })}>
                  <Thumb r={r} />
                  <span className={g.rowTitle}>{r.title}</span>
                </button>
              </li>
            ))}
            {results.length === 0 && <li className={g.none}>No recipes found</li>}
          </ul>
        </>
      )}
    </section>
  );
}

function ChefField({ value, onChange }: { value: string | null; onChange: (name: string) => void }) {
  return (
    <section className={g.field} aria-labelledby="f-chef">
      <h2 id="f-chef" className={g.fieldLabel}>
        Chef
      </h2>
      <ul className={g.chefs}>
        {chefs.map((c) => (
          <li key={c.name}>
            <button type="button" className={g.chef} aria-pressed={c.name === value} onClick={() => onChange(c.name)}>
              <span className={g.chefArt}>
                <Image src={c.src} alt="" fill sizes="96px" />
              </span>
              <span className={g.chefName}>{c.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StyleTile({ s, on, onPick, big }: { s: Style; on: boolean; onPick: () => void; big?: boolean }) {
  return (
    <button type="button" className={cx(g.style, big && g.styleBig)} aria-pressed={on} onClick={onPick} data-slug={s.slug}>
      <span className={g.styleArt}>{s.card && <Image src={s.card.src} alt="" fill sizes={big ? "180px" : "120px"} />}</span>
      <span className={g.styleName}>{s.name}</span>
    </button>
  );
}

function StyleField({ value, onChange }: { value: Style; onChange: (s: Style) => void }) {
  const [open, setOpen] = useState(false);
  const row = useRef<HTMLUListElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useDialog(open, () => setOpen(false));

  useEffect(() => {
    const el = row.current?.querySelector<HTMLElement>(`[data-slug="${value.slug}"]`);
    const list = row.current;
    if (!el || !list) return;
    const left = el.offsetLeft - list.offsetLeft;
    if (left < list.scrollLeft || left + el.offsetWidth > list.scrollLeft + list.clientWidth) list.scrollTo({ left: left - 16, behavior: "smooth" });
  }, [value.slug]);

  return (
    <section className={g.field} aria-labelledby="f-style">
      <div className={g.fieldHead}>
        <h2 id="f-style" className={g.fieldLabel}>
          Style
        </h2>
        <Btn ref={opener} kind="ghost" small aria-haspopup="dialog" onClick={() => setOpen(true)}>
          All styles
        </Btn>
      </div>
      <ul ref={row} className={g.styles}>
        {genStyles.map((s) => (
          <li key={s.slug}>
            <StyleTile s={s} on={s.slug === value.slug} onPick={() => onChange(s)} />
          </li>
        ))}
      </ul>
      <dialog ref={dialog} className={g.styleDialog} aria-labelledby="d-styles" onClose={() => setOpen(false)}>
        <div className={g.styleSheet}>
          <div className={g.sheetHead}>
            <h2 id="d-styles" className={g.sheetTitle}>
              Styles
            </h2>
            <IconBtn label="Close" onClick={() => setOpen(false)}>
              <Icon name="close" size={18} />
            </IconBtn>
          </div>
          <ul className={g.styleGrid}>
            {genStyles.map((s) => (
              <li key={s.slug}>
                <StyleTile
                  s={s}
                  big
                  on={s.slug === value.slug}
                  onPick={() => {
                    onChange(s);
                    setOpen(false);
                    opener.current?.focus();
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </section>
  );
}
