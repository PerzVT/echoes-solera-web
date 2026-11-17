"use client";

import { useEffect, useRef, useState } from "react";
import { clipFor, defaultStyle, lengthOf, recipeByKey, releasedVideos, styleBySlug, type Video } from "./data";
import { Feed } from "./Feed";
import { GenBar } from "./GenBar";
import { useReducedMotion } from "./hooks";
import { Rail, chosenRecipe, type RecipeState } from "./Rail";
import g from "./gen.module.css";

const DEVELOP_MS = 4000;

/** The cooking video generator: settings at the left, the show's videos filling the rest. Nothing is really generated. */
export function CookingApp() {
  const [recipe, setRecipe] = useState<RecipeState>({ mode: "search", picked: null, text: "" });
  const [chef, setChef] = useState<string | null>(null);
  const [style, setStyle] = useState(defaultStyle);
  const [videos, setVideos] = useState<Video[]>(releasedVideos);
  const reduced = useReducedMotion();
  const made = useRef(0);
  const timers = useRef<number[]>([]);
  const railScroll = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const onRecipe = (s: RecipeState) => {
    const changed = s.picked && s.picked !== recipe.picked;
    setRecipe(s);
    if (changed && s.picked?.chef) setChef(s.picked.chef);
  };

  const generate = () => {
    const r = chosenRecipe(recipe);
    if (!r || !chef) return;
    const clip = clipFor(r);
    const id = `g-${++made.current}`;
    setVideos((list) => [
      { id, title: r.title, chef, seconds: lengthOf(r), video: clip.video, poster: clip.poster, recipeKey: r.key, style: style.slug, status: "developing" },
      ...list,
    ]);
    const finish = () => setVideos((list) => list.map((v) => (v.id === id ? { ...v, status: "ready" } : v)));
    if (reduced) finish();
    else timers.current.push(window.setTimeout(finish, DEVELOP_MS));
  };

  const use = (v: Video) => {
    if (v.recipeKey.startsWith("custom:")) setRecipe({ mode: "custom", picked: null, text: v.recipeKey.slice(7) });
    else setRecipe({ mode: "search", picked: recipeByKey(v.recipeKey) ?? null, text: recipe.text });
    setChef(v.chef);
    setStyle(styleBySlug(v.style));
    railScroll.current?.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    page.current?.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className={g.app}>
      <GenBar current="/app/cooking" feedId="videos" />
      <div ref={page} className={g.body}>
        <h1 className="sr-only">Cooking videos</h1>
        <Rail recipe={recipe} onRecipe={onRecipe} chef={chef} onChef={setChef} style={style} onStyle={setStyle} onGenerate={generate} scrollRef={railScroll} />
        <main id="main" tabIndex={-1} className={g.work}>
          <Feed id="videos" videos={videos} onUse={use} />
        </main>
      </div>
    </div>
  );
}
