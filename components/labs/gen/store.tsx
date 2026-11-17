"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Style } from "@/lib/labs/styles";
import { defaultStyle, releasedVideos, type Recipe, type Video } from "./data";

export type RecipeState = { mode: "search" | "custom"; picked: Recipe | null; text: string };

/** The recipe the form holds: the picked one, or a pasted one once it has a title line. */
export function chosenRecipe(s: RecipeState): Recipe | null {
  if (s.mode === "search") return s.picked;
  const title = s.text.split("\n")[0].trim();
  return title ? { key: `custom:${title}`, title, custom: true } : null;
}

type Store = {
  recipe: RecipeState;
  setRecipe: (r: RecipeState) => void;
  chef: string | null;
  setChef: (c: string | null) => void;
  style: Style;
  setStyle: (s: Style) => void;
  /** The show's videos and, first, every video approved this session, less any deleted. */
  library: Video[];
  approve: (v: Video) => void;
  /** Deletes a video from the library and returns what puts it back. */
  remove: (id: string) => () => void;
};

const Ctx = createContext<Store | null>(null);

export function useCooking() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useCooking outside CookingProvider");
  return s;
}

const KEY = "nine-lives-cooking";

/** Holds the generator's form, the videos approved this session and the ones deleted, across Create and Library and a reload. */
export function CookingProvider({ children }: { children: ReactNode }) {
  const [recipe, setRecipe] = useState<RecipeState>({ mode: "search", picked: null, text: "" });
  const [chef, setChef] = useState<string | null>(null);
  const [style, setStyle] = useState<Style>(defaultStyle);
  const [approved, setApproved] = useState<Video[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as { approved?: Video[]; removed?: string[] } | null;
      if (Array.isArray(saved?.approved)) setApproved(saved.approved);
      if (Array.isArray(saved?.removed)) setRemoved(saved.removed);
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ approved, removed }));
    } catch {}
  }, [loaded, approved, removed]);

  const value = useMemo<Store>(
    () => ({
      recipe,
      setRecipe,
      chef,
      setChef,
      style,
      setStyle,
      library: [...approved, ...releasedVideos].filter((v) => !removed.includes(v.id)),
      approve: (v) => setApproved((list) => (list.some((x) => x.id === v.id) ? list : [v, ...list])),
      remove: (id) => {
        setRemoved((r) => (r.includes(id) ? r : [...r, id]));
        return () => setRemoved((r) => r.filter((x) => x !== id));
      },
    }),
    [recipe, chef, style, approved, removed],
  );
  // Nothing renders until the saved session is read, so the library never shows a deleted video for a frame.
  return <Ctx.Provider value={value}>{loaded ? children : null}</Ctx.Provider>;
}
