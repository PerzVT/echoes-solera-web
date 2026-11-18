"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GestureIcon } from "@/components/labs/fx";
import { Btn } from "@/components/labs/chat/ui";
import { WorkShell, type WorkStepDef } from "@/components/labs/app/WorkShell";
import { defaultStyle, recipeByKey, styleBySlug, type Recipe, type Video } from "./data";
import { Feed } from "./Feed";
import { Form } from "./Form";
import { Result } from "./Result";
import { chosenRecipe, useCooking } from "./store";
import r from "./result.module.css";

type Made = { n: number; recipe: Recipe; chef: string; style: { slug: string; name: string } };

/**
 * The cooking tool's two steps: the recipe (the start screen) and the video made from it. From the video, Recipe
 * opens the start again with the recipe still in it (the page is keyed on `again`, so it starts over). Video is
 * the screen a Generate opens, so it is never a link.
 */
export const COOKING_STEPS = (made?: number): WorkStepDef[] => [
  { key: "recipe", label: "Recipe", href: made ? `/app/cooking?again=${made}` : "/app/cooking" },
  { key: "video", label: "Video" },
];

/** Create: the start screen, like every tool's; Generate replaces it with the video being made. */
export function CookingApp() {
  const { recipe, chef, style, setRecipe, setChef } = useCooking();
  const [made, setMade] = useState<Made | null>(null);

  const generate = () => {
    const pick = chosenRecipe(recipe);
    if (!pick || !chef) return;
    setMade((m) => ({ n: (m?.n ?? 0) + 1, recipe: pick, chef, style: { slug: style.slug, name: style.name } }));
  };
  const another = () => {
    setRecipe({ mode: "search", picked: null, text: "" });
    setChef(null);
    setMade(null);
  };

  if (!made)
    return (
      <WorkShell tool="cooking" view="create" steps={COOKING_STEPS()} step="recipe">
        <Form onGenerate={generate} />
      </WorkShell>
    );
  return (
    <WorkShell tool="cooking" view="create" steps={COOKING_STEPS(made.n)} step="video" reached="video" fit>
      <div className={r.fit}>
        <Result key={made.n} recipe={made.recipe} chef={made.chef} style={made.style} onAnother={another} />
      </div>
    </WorkShell>
  );
}

/** Library: every video, opening as its record. "Use these settings" loads the start screen and goes to Create. */
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
    <WorkShell
      tool="cooking"
      view="library"
      steps={COOKING_STEPS()}
      action={
        <Btn kind="primary" icon={<GestureIcon name="plus" size={18} />} onClick={() => router.push("/app/cooking")}>
          New
        </Btn>
      }
    >
      <Feed videos={library} onUse={use} onDelete={(v) => remove(v.id)} />
    </WorkShell>
  );
}
