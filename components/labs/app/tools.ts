/**
 * The two tools that share the episode flow (script, screenplay, cast, style, results): mini-series and anime.
 * Every step component reads its tool's profile from the CastProvider it sits under; nothing is copied per tool.
 */
import { animeSeriesCards, clips, screenplay, seriesCards, startingCast, type Block, type SeriesCard, type SeriesCast, type Take } from "@/lib/labs/maker";
import type { Step } from "@/lib/labs/store/types";
import { allStyles, type Style } from "@/lib/labs/styles";
import { animeCast, animeClips, animeDemoScript, animeElements, animeExtra, animePlaces, animeStyles } from "./anime";
import { libraryPlaces, seriesExtra, startingElements, type Element, type EpisodeItem } from "./creator";
import { parseScript } from "./script";

export type FlowTool = "mini-series" | "anime";
export type FlowStep = Exclude<Step, "done">;

type Place = { tag: string; name: string; src: string };

export type Profile = {
  tool: FlowTool;
  /** sessionStorage key for the tool's work in this tab. */
  storage: string;
  library: string;
  /** Where each step lives. Script is the start screen. */
  steps: Record<FlowStep, string>;
  seriesHref: (slug: string) => string;
  seriesCards: SeriesCard[];
  extra: Record<string, { backdrop: string; episodes: EpisodeItem[] }>;
  /** The script an episode opens on when nothing readable was submitted. */
  demo: Block[];
  demoFile: string;
  /** The cast library, as the Cast step's pickers show it, and the cards a new episode starts with. */
  cast: (series: string) => SeriesCast;
  places: Place[];
  elements: Element[];
  /** Styles shown first on the Style step; every other style follows under "Other styles". */
  firstStyles: Style[];
  clips: Take[];
  feedbackHint: string;
};

const listed = allStyles.filter((s) => !s.hidden && s.card);
const liveAction = listed.filter((s) => /live-action/i.test(s.medium));
const animeListed = listed.filter((s) => animeStyles.some((a) => a.slug === s.slug));

const stepsUnder = (base: string, start: string): Record<FlowStep, string> => ({
  script: start,
  screenplay: `${base}/screenplay`,
  cast: `${base}/cast`,
  style: `${base}/style`,
  results: `${base}/results`,
});

export const PROFILES: Record<FlowTool, Profile> = {
  "mini-series": {
    tool: "mini-series",
    storage: "nine-lives:mini-series",
    library: "/app/library",
    steps: stepsUnder("/app/episode", "/app"),
    seriesHref: (slug) => `/app/series/${slug}`,
    seriesCards,
    extra: seriesExtra,
    demo: screenplay,
    demoFile: "reflection.fdx",
    // The demo cast library is Second Chance at Your Heart's; a new series has no sheets of its own yet.
    cast: () => startingCast["second-chance"] ?? { characters: [], sheets: [] },
    places: libraryPlaces,
    elements: startingElements,
    firstStyles: liveAction,
    clips,
    feedbackHint: "Julian keeps his head down until the end of the shot",
  },
  anime: {
    tool: "anime",
    storage: "nine-lives:anime",
    library: "/app/anime/library",
    steps: stepsUnder("/app/anime/episode", "/app/anime"),
    seriesHref: (slug) => `/app/anime/series/${slug}`,
    seriesCards: animeSeriesCards,
    extra: animeExtra,
    demo: parseScript(animeDemoScript),
    demoFile: "catalyst.fdx",
    cast: () => animeCast,
    places: animePlaces,
    elements: animeElements,
    firstStyles: animeListed,
    clips: animeClips,
    feedbackHint: "Nova keeps the ticket in frame until the cut",
  },
};

/** The step labels, in order. */
export const FLOW_STEPS: { key: FlowStep; label: string }[] = [
  { key: "script", label: "Script" },
  { key: "screenplay", label: "Screenplay" },
  { key: "cast", label: "Cast" },
  { key: "style", label: "Style" },
  { key: "results", label: "Results" },
];

/** The listed styles in the order a tool's Style step shows them. */
export function stylesFor(p: Profile) {
  const others = listed.filter((s) => !p.firstStyles.includes(s));
  return { first: p.firstStyles, others, all: [...p.firstStyles, ...others] };
}
