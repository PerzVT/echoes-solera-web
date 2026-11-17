"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  EPISODE,
  otherTags,
  seriesCards,
  slug,
  startingCast,
  tagForFile,
  uniqueTag,
  type CastSheet,
  type OtherSheet,
  type SeriesCard,
  type SeriesCast,
  type Tool,
} from "@/lib/labs/maker";

/** The series the episode screens work on. */
export type Working = { slug: string; title: string };

/** The cast of every series, plus the series made in this session, held in React state for the whole /app section. */
type Store = {
  all: Record<string, SeriesCast>;
  get: (series: string) => SeriesCast;
  set: (series: string, next: SeriesCast) => void;
  addCharacter: (series: string, name: string) => string;
  renameCharacter: (series: string, id: string, name: string) => void;
  removeCharacter: (series: string, id: string) => void;
  /**
   * Adds one sheet per image file to a character and returns the new sheets. Pass the name when the character was added in the same event,
   * and the tags when they were worked out beforehand (the upload step shows them before they are added).
   */
  addSheets: (series: string, character: string, files: File[], name?: string, tags?: string[]) => CastSheet[];
  updateSheet: (series: string, id: string, patch: Partial<CastSheet>) => void;
  removeSheet: (series: string, id: string) => void;
  /** Keeps a location, prop or continuity frame uploaded on References, and returns it. */
  addOther: (series: string, kind: OtherSheet["kind"], who: string, file: File, tag?: string) => OtherSheet;
  /** Frees the object URLs of uploads that nothing shows any more. */
  release: (srcs: string[]) => void;
  /** Series made with New series in this session, newest first. */
  created: SeriesCard[];
  addSeries: (title: string, tool: Tool) => string;
  /** The series the episode screens show. */
  working: Working;
  setWorking: (w: Working) => void;
  /** State a screen keeps when the person leaves it and comes back, such as the matches on References. */
  kept: <T>(key: string) => T | undefined;
  keep: (key: string, value: unknown) => void;
};

const Ctx = createContext<Store | null>(null);

const empty: SeriesCast = { characters: [], sheets: [] };
let seq = 0;
const nextId = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** Every tag in use in a series, plus the library's location and prop tags. */
export const tagsIn = (cast: SeriesCast, except?: string) => [
  ...cast.sheets.filter((x) => x.id !== except).map((x) => x.tag),
  ...(cast.others ?? []).filter((x) => x.id !== except).map((x) => x.tag),
  ...otherTags,
];

/** The series card for a slug, including series made in this session. */
export function findSeries(slugValue: string | undefined, created: SeriesCard[]) {
  return [...created, ...seriesCards].find((x) => x.slug === slugValue);
}

export function CastProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Record<string, SeriesCast>>(startingCast);
  const [created, setCreated] = useState<SeriesCard[]>([]);
  const [working, setWorking] = useState<Working>({ slug: "second-chance", title: EPISODE.series });
  const memo = useRef(new Map<string, unknown>());
  /**
   * Tags handed out since the cast was last drawn. Several adds in one event each see the tags the earlier ones took,
   * although none of them has reached `all` yet. Emptied once the new cast is drawn, when `all` holds them.
   */
  const handedOut = useRef(new Map<string, Set<string>>());
  useEffect(() => {
    handedOut.current.clear();
  }, [all]);

  const get = useCallback((series: string) => all[series] ?? empty, [all]);

  const edit = useCallback((series: string, fn: (c: SeriesCast) => SeriesCast) => {
    setAll((a) => ({ ...a, [series]: fn(a[series] ?? empty) }));
  }, []);

  const store = useMemo<Store>(
    () => ({
      all,
      get,
      set: (series, next) => setAll((a) => ({ ...a, [series]: next })),
      addCharacter: (series, name) => {
        const id = nextId("character");
        edit(series, (c) => ({ ...c, characters: [...c.characters, { id, name }] }));
        return id;
      },
      renameCharacter: (series, id, name) =>
        edit(series, (c) => {
          // Tags of sheets added here follow the character name until someone edits them.
          const taken = new Set(tagsIn(c));
          const sheets = c.sheets.map((x) => {
            if (x.character !== id || !x.added || x.tagEdited) return x;
            taken.delete(x.tag);
            const tag = tagForFile(name, x.file, taken);
            taken.add(tag);
            return { ...x, tag };
          });
          return { ...c, characters: c.characters.map((x) => (x.id === id ? { ...x, name } : x)), sheets };
        }),
      removeCharacter: (series, id) =>
        edit(series, (c) => ({ ...c, characters: c.characters.filter((x) => x.id !== id), sheets: c.sheets.filter((x) => x.character !== id) })),
      addSheets: (series, character, files, given, tags) => {
        const c = all[series] ?? empty;
        const name = given ?? c.characters.find((x) => x.id === character)?.name ?? "sheet";
        const out = handedOut.current.get(series) ?? new Set<string>();
        handedOut.current.set(series, out);
        const taken = new Set([...tagsIn(c), ...out]);
        const added = files.map((f, i) => {
          const planned = tags?.[i];
          const tag = planned && !taken.has(planned) ? planned : tagForFile(name, f.name, taken);
          taken.add(tag);
          out.add(tag);
          const src = URL.createObjectURL(f);
          return { id: nextId("sheet"), tag, character, src, face: src, added: true, file: f.name } satisfies CastSheet;
        });
        edit(series, (x) => ({ ...x, sheets: [...x.sheets, ...added] }));
        return added;
      },
      updateSheet: (series, id, patch) => edit(series, (c) => ({ ...c, sheets: c.sheets.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeSheet: (series, id) => edit(series, (c) => ({ ...c, sheets: c.sheets.filter((x) => x.id !== id) })),
      addOther: (series, kind, who, file, given) => {
        const c = all[series] ?? empty;
        const tag = given ?? uniqueTag(who, tagsIn(c));
        const other: OtherSheet = { id: nextId(kind), kind, tag, who, src: URL.createObjectURL(file) };
        edit(series, (x) => ({ ...x, others: [...(x.others ?? []), other] }));
        return other;
      },
      release: (srcs) => srcs.filter((x) => x.startsWith("blob:")).forEach((x) => URL.revokeObjectURL(x)),
      created,
      addSeries: (title, tool) => {
        const base = slug(title).replace(/_/g, "-") || "series";
        let key = base;
        for (let n = 2; [...created, ...seriesCards].some((x) => x.slug === key); n++) key = `${base}-${n}`;
        const card: SeriesCard = {
          title,
          slug: key,
          tool,
          cover: "",
          add: tool === "Cooking" ? "New video" : "New episode",
          episodes: [{ name: tool === "Cooking" ? "Video 1" : "Episode 1", stage: tool === "Cooking" ? "Recipe" : "Script", href: "/app/episode/script" }],
        };
        setCreated((x) => [card, ...x]);
        setWorking({ slug: key, title });
        return key;
      },
      working,
      setWorking,
      kept: <T,>(key: string) => memo.current.get(key) as T | undefined,
      keep: (key, value) => void memo.current.set(key, value),
    }),
    [all, get, edit, created, working],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useCast() {
  const store = useContext(Ctx);
  if (!store) throw new Error("useCast needs the CastProvider from app/(labs)/app/layout.tsx");
  return store;
}
