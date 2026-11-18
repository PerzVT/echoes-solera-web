"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GestureIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { Btn } from "../chat/ui";
import { Composer } from "../chat/Composer";
import { chefs, genStyles, lengthOf, searchRecipes, seconds, type Recipe } from "./data";
import { chosenRecipe, useCooking, type RecipeState } from "./store";
import g from "./gen.module.css";

/** The generator: recipe, chef, style, the length the recipe sets, and Generate. */
export function Form({ onGenerate }: { onGenerate: () => void }) {
  const { recipe, setRecipe, chef, setChef, style, setStyle } = useCooking();
  const chosen = chosenRecipe(recipe);
  const ready = !!chosen && !!chef;

  const onRecipe = (s: RecipeState) => {
    if (s.picked && s.picked !== recipe.picked && s.picked.chef) setChef(s.picked.chef);
    setRecipe(s);
  };

  return (
    <div className={g.form}>
      <h1 className={g.heading}>What are we cooking?</h1>
      <RecipeField state={recipe} onChange={onRecipe} />

      <section className={g.field} aria-labelledby="f-chef">
        <h2 id="f-chef" className={g.fieldLabel}>
          Chef
        </h2>
        <ul className={g.chefs}>
          {chefs.map((c) => (
            <li key={c.name}>
              <button type="button" className={g.chef} aria-pressed={c.name === chef} onClick={() => setChef(c.name)}>
                <span className={g.chefArt}>
                  <Image src={c.src} alt="" fill sizes="96px" />
                </span>
                <span className={g.chefName}>{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={g.field} aria-labelledby="f-style">
        <h2 id="f-style" className={g.fieldLabel}>
          Style <span className={g.fieldValue}>{style.name}</span>
        </h2>
        <ul className={g.styles}>
          {genStyles.map((s) => (
            <li key={s.slug}>
              <button type="button" className={g.style} aria-pressed={s.slug === style.slug} aria-label={s.name} title={s.name} onClick={() => setStyle(s)}>
                <span className={g.styleArt}>{s.card && <Image src={s.card.src} alt="" fill sizes="120px" />}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className={g.foot}>
        <dl className={g.length}>
          <dt>Length</dt>
          <dd>{seconds(lengthOf(chosen))}</dd>
        </dl>
        <div className={g.go}>
          <Btn kind="primary" className={g.generate} icon={<Icon name="generate" size={16} />} disabled={!ready} onClick={onGenerate}>
            Generate
          </Btn>
        </div>
      </div>
    </div>
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
  const [more, setMore] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const focusNext = useRef<"search" | "custom" | null>(null);
  const results = searchRecipes(q);
  // Three recipes and a More row until a search or More asks for the rest, so Generate stays in view.
  const shown = q.trim() || more ? results : results.slice(0, 3);

  useEffect(() => {
    if (focusNext.current === "search") input.current?.focus();
    if (focusNext.current === "custom") area.current?.focus();
    focusNext.current = null;
  });

  const change = () => {
    focusNext.current = "search";
    onChange({ ...state, mode: "search", picked: null });
  };
  const paste = () => {
    focusNext.current = "custom";
    onChange({ ...state, mode: "custom" });
  };
  const picking = state.mode === "search" && !state.picked;

  return (
    <section className={g.field} aria-labelledby="f-recipe">
      <div className={g.labelRow}>
        <h2 id="f-recipe" className={g.fieldLabel}>
          Recipe
        </h2>
        {picking && (
          <button type="button" className={g.textBtn} onClick={paste}>
            Paste your own
          </button>
        )}
        {state.mode === "custom" && (
          <button type="button" className={g.textBtn} onClick={change}>
            Search recipes
          </button>
        )}
      </div>
      {state.mode === "search" && state.picked ? (
        <div className={g.picked}>
          <Thumb r={state.picked} />
          <span className={g.rowTitle}>{state.picked.title}</span>
          <Btn kind="ghost" small icon={<Icon name="create" size={16} />} onClick={change}>
            Change
          </Btn>
        </div>
      ) : state.mode === "custom" ? (
        <div className={g.custom}>
          <Composer ref={area} size="compact" label="Your recipe" placeholder="Paste a recipe" value={state.text} onChange={(text) => onChange({ ...state, text })} />
        </div>
      ) : (
        <div className={g.searchBox}>
          <label className={g.search}>
            <GestureIcon name="search" size={18} />
            <span className="sr-only">Search recipes</span>
            <input ref={input} type="search" placeholder="Search recipes" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
          </label>
          <ul className={g.results} aria-label="Recipes">
            {shown.map((r) => (
              <li key={r.key}>
                <button type="button" className={g.row} onClick={() => onChange({ ...state, mode: "search", picked: r })}>
                  <Thumb r={r} />
                  <span className={g.rowTitle}>{r.title}</span>
                </button>
              </li>
            ))}
            {shown.length < results.length && (
              <li>
                <button type="button" className={g.row} aria-expanded={false} onClick={() => setMore(true)}>
                  <span className={g.thumb}>
                    <Icon name="plus" size={18} />
                  </span>
                  <span className={g.rowTitle}>More recipes</span>
                </button>
              </li>
            )}
            {results.length === 0 && <li className={g.none}>No recipes found</li>}
          </ul>
        </div>
      )}
    </section>
  );
}
