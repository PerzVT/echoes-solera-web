import recipeRows from "@/lib/labs/recipes.json";
import { allStyles, type Style } from "@/lib/labs/styles";
import { releases, supper, type Release } from "@/lib/labs/supper";

/** A recipe the generator can cook: a released dish (with its art and length), a planned one, or one pasted in. */
export type Recipe = {
  key: string;
  title: string;
  /** Only set when the chef is one of the show's nine. */
  chef?: string;
  release?: Release;
  custom?: boolean;
};

export type Video = {
  id: string;
  title: string;
  chef: string;
  seconds: number;
  video: string;
  poster: string;
  recipeKey: string;
  style: string;
  status: "developing" | "ready";
};

export const chefs = supper.chefs;
const chefNames = new Set(chefs.map((c) => c.name));

/** Styles a cooking video can be made in: every listed video style except the live-action one. */
export const genStyles: Style[] = [
  ...allStyles.filter((s) => !s.hidden && s.card && s.group === "In use" && s.filter === "video" && s.slug !== "photoreal-period"),
  ...allStyles.filter((s) => !s.hidden && s.card && s.group === "Library" && s.filter === "video"),
];
export const defaultStyle = genStyles[0];
export const styleBySlug = (slug: string) => genStyles.find((s) => s.slug === slug) ?? defaultStyle;

const slug = (r: Release) => r.video.split("/").pop()!.replace(".mp4", "");

const released: Recipe[] = releases.map((r) => ({ key: `rel-${slug(r)}`, title: r.title ?? "", chef: r.chef, release: r }));
const seen = new Set(released.map((r) => r.title.toLowerCase()));
const planned: Recipe[] = (recipeRows as { title: string; chef: string }[])
  .filter((r) => !seen.has(r.title.toLowerCase()))
  .map((r, i) => ({ key: `rec-${i}`, title: r.title, chef: chefNames.has(r.chef) ? r.chef : undefined }));

export const recipes: Recipe[] = [...released, ...planned];
export const recipeByKey = (key: string) => recipes.find((r) => r.key === key);

export const lengthOf = (r: Recipe | null) => r?.release?.seconds ?? 30;

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const searchRecipes = (q: string) => {
  const t = fold(q.trim());
  return t ? recipes.filter((r) => fold(r.title).includes(t)) : recipes;
};



/** The show's videos, newest first. */
export const releasedVideos: Video[] = [...released].reverse().map((r) => ({
  id: r.key,
  title: r.title,
  chef: r.release!.chef,
  seconds: r.release!.seconds,
  video: r.release!.video,
  poster: r.release!.poster,
  recipeKey: r.key,
  style: defaultStyle.slug,
  status: "ready",
}));

export const chefSrc = (name: string) => chefs.find((c) => c.name === name)?.src;
export const seconds = (s: number) => `${s} seconds`;
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
