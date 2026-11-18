"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/labs/fx";
import { Composer } from "@/components/labs/chat/Composer";
import { NotionImport } from "@/components/labs/app/NotionImport";
import { StartScreen } from "@/components/labs/app/StartScreen";
import st from "@/components/labs/app/ScriptStep.module.css";
import { chefs, genStyles, recipes, searchRecipes } from "./data";
import { chosenRecipe, useCooking } from "./store";
import g from "./gen.module.css";

const TYPES = [".txt", ".md"];

/** A labelled select in the box's foot, drawn like the series picker on the other tools. */
function Pick({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className={st.series}>
      <span className={st.seriesLabel}>{label}</span>
      <span className={st.selectWrap}>
        <select className={st.select} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronIcon open={false} size={16} />
      </span>
    </label>
  );
}

/**
 * The cooking start, laid out like every other tool's: the question, the tools, and one box. The box takes a dish
 * to search for or a whole recipe (typed, pasted, uploaded or imported from Notion); the chef and the style are
 * picked in its foot. Matching recipes from the show are offered under the box.
 */
export function Form({ onGenerate }: { onGenerate: () => void }) {
  const { recipe, setRecipe, chef, setChef, style, setStyle } = useCooking();
  const [rejected, setRejected] = useState("");
  const chosen = chosenRecipe(recipe);
  const text = recipe.mode === "search" && recipe.picked ? recipe.picked.title : recipe.text;
  const ready = Boolean(chosen) && Boolean(chef);

  const type = (t: string) => {
    const exact = recipes.find((r) => r.title.toLowerCase() === t.trim().toLowerCase());
    if (exact) {
      if (exact.chef) setChef(exact.chef);
      setRecipe({ mode: "search", picked: exact, text: t });
    } else setRecipe({ mode: "custom", picked: null, text: t });
  };
  const take = (files: File[]) => {
    const [f] = files;
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!TYPES.includes(ext)) return setRejected(`${f.name} cannot be read here. Use a .txt file, or paste the recipe.`);
    setRejected("");
    f.text().then(type, () => setRejected(`${f.name} could not be read. Paste the recipe instead.`));
  };
  // A short single line is a search: the show's recipes that match it are offered under the box.
  const query = text.trim();
  const searching = !recipe.picked && query.length > 0 && query.length < 60 && !query.includes("\n");
  const matches = searching ? searchRecipes(query).slice(0, 6) : [];

  return (
    <StartScreen tool="cooking">
      <Composer
        value={text}
        onChange={type}
        onSubmit={onGenerate}
        submitLabel="Generate"
        label="Recipe"
        placeholder="Name a dish or paste a recipe"
        attachment={{ accept: TYPES.join(","), onAttach: take, onRemove: () => {} }}
        tools={<NotionImport mode="text" look="composer" onText={(r) => type(r.text)} />}
        leading={
          <div className={`${st.end} ${st.pair}`}>
            <Pick label="Chef" value={chef ?? ""} onChange={(v) => setChef(v || null)} options={[{ value: "", label: "Choose" }, ...chefs.map((c) => ({ value: c.name, label: c.name }))]} />
            <Pick label="Style" value={style.slug} onChange={(v) => setStyle(genStyles.find((s) => s.slug === v) ?? style)} options={genStyles.map((s) => ({ value: s.slug, label: s.name }))} />
          </div>
        }
        ready={ready}
        error={rejected}
        autoFocus
      />
      {matches.length > 0 && (
        <ul className={g.suggest} aria-label="Recipes from the show">
          {matches.map((r) => (
            <li key={r.key}>
              <button
                type="button"
                className={g.suggestion}
                onClick={() => {
                  if (r.chef) setChef(r.chef);
                  setRecipe({ mode: "search", picked: r, text: r.title });
                }}
              >
                {r.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </StartScreen>
  );
}
