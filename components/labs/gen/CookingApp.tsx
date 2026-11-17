"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBar } from "@/components/labs/chat/AppBar";
import { defaultStyle, recipeByKey, styleBySlug, type Recipe, type Video } from "./data";
import { Feed } from "./Feed";
import { Form } from "./Form";
import { Result } from "./Result";
import { chosenRecipe, useCooking } from "./store";
import g from "./gen.module.css";

type Made = { n: number; recipe: Recipe; chef: string; style: { slug: string; name: string } };

/** Create: the generator is the page. Generate replaces the form with the result. Nothing is really generated. */
export function CookingApp() {
  const { recipe, chef, style, setRecipe, setChef } = useCooking();
  const [made, setMade] = useState<Made | null>(null);

  const generate = () => {
    const r = chosenRecipe(recipe);
    if (!r || !chef) return;
    setMade((m) => ({ n: (m?.n ?? 0) + 1, recipe: r, chef, style: { slug: style.slug, name: style.name } }));
  };

  return (
    <div className={g.page}>
      <AppBar tool="cooking" view="create" />
      <main id="main" className={g.main} data-result={made ? "" : undefined}>
        {made ? (
          <Result
            key={made.n}
            recipe={made.recipe}
            chef={made.chef}
            style={made.style}
            onAnother={() => {
              setRecipe({ mode: "search", picked: null, text: "" });
              setChef(null);
              setMade(null);
            }}
          />
        ) : (
          <Form onGenerate={generate} />
        )}
      </main>
    </div>
  );
}

/** Library: every video, opening in the viewer. "Use these settings" loads the form and goes to Create. */
export function CookingLibrary() {
  const router = useRouter();
  const { library, setRecipe, setChef, setStyle, remove } = useCooking();
  const use = (v: Video) => {
    if (v.recipeKey.startsWith("custom:")) setRecipe({ mode: "custom", picked: null, text: v.recipeKey.slice(7) });
    else setRecipe({ mode: "search", picked: recipeByKey(v.recipeKey) ?? null, text: "" });
    setChef(v.chef);
    setStyle(styleBySlug(v.style) ?? defaultStyle);
    router.push("/app/cooking");
  };
  return (
    <div className={g.page}>
      <AppBar tool="cooking" view="library" />
      <main id="main" className={g.libraryMain}>
        <Feed videos={library} onUse={use} onDelete={(v) => remove(v.id)} />
      </main>
    </div>
  );
}
