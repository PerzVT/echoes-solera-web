/** Fixed data for the anime tool: its series, cast, places, styles and the clips its generations show. */
import type { CastSheet, SeriesCast, Take } from "@/lib/labs/maker";
import { allStyles, type Style } from "@/lib/labs/styles";
import type { Element, EpisodeItem } from "./creator";

const A = "/labs/anime";
const S = `${A}/catalyst-stills`;
const M = `${A}/montage`;
const D = `${A}/dances`;
const P = `${A}/places`;

const clip = (base: string, name = "Take 1"): Take => ({ name, src: `${base}.mp4`, poster: `${base}.webp` });

/** The six clips an anime episode's generations start with, in order. */
export const animeClips: Take[] = [`${A}/catalyst-shop`, `${A}/catalyst-shop-v2`, `${A}/catalyst-rain`, `${A}/catalyst`, `${M}/catalyst-aisle`, `${M}/catalyst-night`].map((b) => clip(b));

/** Clips a retry lands on, in turn. */

/** Each anime's backdrop and its episodes' posters. */
export const animeExtra: Record<string, { backdrop: string; episodes: EpisodeItem[] }> = {
  catalyst: {
    backdrop: `${A}/hero-montage.webp`,
    episodes: [
      { name: "Episode 1", poster: `${A}/catalyst.webp` },
      { name: "Episode 2", poster: `${M}/catalyst-night.webp` },
    ],
  },
  "back-to-me": { backdrop: `${D}/indoor-dance.webp`, episodes: [{ name: "Episode 1", poster: `${D}/cloud-dance.webp` }] },
  "echoes-of-solera": { backdrop: `${A}/hero-cast.webp`, episodes: [{ name: "Episode 1", poster: `${P}/market-overlook.webp` }] },
};

const sheet = (character: string, file: string, variant?: string): CastSheet => ({ id: `${character}-${file}`, tag: `@${character}`, character, src: `${A}/cast/${file}.webp`, face: `${A}/cast/${file}.webp`, variant });

/** The anime cast library the Cast step picks from. */
export const animeCast: SeriesCast = {
  characters: [
    { id: "nova", name: "Nova" },
    { id: "nine", name: "Nine" },
    { id: "ya", name: "Ya" },
    { id: "damion", name: "Damion" },
  ],
  sheets: [sheet("nova", "nova-catalyst", "Catalyst"), sheet("nine", "nine-bust"), sheet("ya", "ya-bust"), sheet("damion", "damion-bust")],
};

/** Places already drawn, which a location can be matched to. */
export const animePlaces = [
  { tag: "@storefront", name: "Restart storefront", src: `${S}/storefront-dusk.webp` },
  { tag: "@aisles", name: "Restart aisles", src: `${P}/restart-aisles.webp` },
  { tag: "@lot", name: "Parking lot", src: `${S}/store-in-rain.webp` },
  { tag: "@cathedral_ruins", name: "Cathedral ruins", src: `${P}/cathedral-ruins.webp` },
  { tag: "@market_overlook", name: "Market overlook", src: `${P}/market-overlook.webp` },
  { tag: "@oasis", name: "Oasis", src: `${P}/oasis.webp` },
];

/** What the anime demo script needs. Nine has no picture chosen yet. */
export const animeElements: Element[] = [
  { id: "nova", kind: "character", name: "Nova", tag: "@nova", src: `${A}/cast/nova-catalyst.webp`, who: "nova", variant: "Catalyst" },
  { id: "nine", kind: "character", name: "Nine", tag: "@nine", who: "nine" },
  { id: "aisles", kind: "location", name: "Restart aisles", tag: "@aisles", src: animePlaces[1].src },
  { id: "lot", kind: "location", name: "Parking lot", tag: "@lot", src: animePlaces[2].src },
];

/** Catalyst, episode 1, as a script: what an anime opens on when nothing is submitted. */
export const animeDemoScript = `INT. RESTART - NIGHT

A bargain bin of old handhelds. Nova leans in and lifts out a clear VR case.

NOVA
No label at all?

She cracks the case open. A gold ticket slides into her palm.

Behind the counter, Nine watches her and says nothing.

EXT. PARKING LOT - NIGHT

Rain sheets across the empty lot. Nova runs for the lone tree.

She scans the ticket's code with her phone. The foil flares white.`;

/** Styles an anime is drawn in: the house anime style and the drawn library directions (not the 3D or paper ones). */
const notAnime = new Set(["Soft-form 3D", "Sculpted adventure", "Layered paper"]);
export const animeStyles: Style[] = [
  ...allStyles.filter((s) => s.slug === "solera-anime"),
  ...allStyles.filter((s) => s.group === "Library" && !s.hidden && s.review && !notAnime.has(s.name)),
];

