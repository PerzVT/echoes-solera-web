/**
 * The creator's generation and Notion endpoints: every request and response shape. The UI imports these types;
 * the server checks every request against them (lib/labs/ai/inputs.ts, lib/labs/notion/*).
 *
 * Errors from every endpoint are `ApiError` with an HTTP status: 400 invalid, 401 not signed in, 403 another
 * site, 404 not found, 413 too large, 429 paused or busy, 501 not available, 503 not set up.
 */
import type { CastSheet, Script } from "@/lib/labs/store/types";

export type ApiError = { error: string; message: string };

/* ======================================================================================================
 * Status and usage
 * ==================================================================================================== */

/** GET /api/creator/ai/status. `ready` is false until OPENAI_API_KEY is set; `video` is false while no video API exists. */
export type AiStatus = { ready: false } | { ready: true; video: boolean };

/**
 * GET /api/creator/ai/usage. For the owner's own admin use; the creator never shows cost. Limited to the emails in
 * AI_ADMIN_EMAILS when that is set, otherwise any signed-in person.
 */
export type AiUsage = {
  limits: { dailyPerPersonUsd: number; monthlyAllUsd: number };
  today: { since: string; mine: number; everyone: number };
  month: { since: string; everyone: number; byPerson: { owner: string; usd: number; jobs: number }[] };
};

/* ======================================================================================================
 * Jobs
 *
 * POST /api/creator/jobs        body CreateJobRequest  -> 201 { job: JobView }   (503 without a key; 429 when paused)
 * GET  /api/creator/jobs        ?episode=&kind=&limit= -> { jobs: JobView[] }   (the signed-in person's own, newest first)
 * GET  /api/creator/jobs/[id]   -> { job: JobView }    (poll every 2-3 s until status is done or failed)
 * POST /api/creator/jobs/[id]/cancel -> { job: JobView }
 * ==================================================================================================== */

export type JobKind = "screenplay" | "revise" | "match-cast" | "storyboard" | "manga" | "prompts" | "image" | "clip";
export type JobStatus = "queued" | "running" | "done" | "failed";

export type CreateJobRequest =
  | { kind: "screenplay"; input: ScreenplayInput }
  | { kind: "revise"; input: ReviseInput }
  | { kind: "match-cast"; input: MatchCastInput }
  | { kind: "storyboard"; input: StoryboardInput }
  | { kind: "manga"; input: MangaInput }
  | { kind: "prompts"; input: PromptsInput }
  | { kind: "image"; input: ImageInput }
  | { kind: "clip"; input: ClipInput };

export type JobResultFor = {
  screenplay: ScreenplayResult;
  revise: ReviseResult;
  "match-cast": MatchCastResult;
  storyboard: StoryboardResult;
  manga: MangaResult;
  prompts: PromptsResult;
  image: ImageResult;
  clip: never;
};

/** A job as the API returns it. No cost, provider ids or input are included. `error` is a plain sentence. */
export type JobView<K extends JobKind = JobKind> = {
  id: string;
  kind: K;
  status: JobStatus;
  episodeId: string | null;
  result: JobResultFor[K] | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  finishedAt: string | null;
};

/* ---------- Shared pieces ---------- */

/**
 * A screenplay passage, the same kinds the creator's screenplay screen shows (lib/labs/maker.ts Block).
 * `camera` is a shot: `text` is the shot line (framing and movement), `direction` the acting, light and
 * blocking notes for it, `prompt` the generation prompt once one is written (null until then).
 */
export type ScreenplayBlock =
  | { id: string; kind: "heading"; number: number; text: string }
  | { id: string; kind: "camera"; text: string; direction: string; prompt: string | null }
  | { id: string; kind: "action"; text: string }
  | { id: string; kind: "dialogue"; cue: string; text: string };

/** A comment or suggestion on a passage, as saved on the Screenplay record. */
export type ScreenplayNote = { id: string; block: string; type: "comment" | "suggestion"; quote: string; body: string };

/** What the prompter flags instead of guessing. `blocks` are the passage ids it concerns. */
export type Issue = { blocks: string[]; text: string };

export type Aspect = "square" | "landscape" | "portrait";

/* ---------- screenplay: script to director-format screenplay with shots ---------- */

/** The script comes from the episode's saved Script unless `script` is given. Up to 200,000 characters. */
export type ScreenplayInput = { episodeId: string; script?: string; aspect?: Aspect };

export type ScreenplayResult = {
  title: string;
  blocks: ScreenplayBlock[];
  /** Passage id to text, ready for the Screenplay record's `texts` (each passage's `text`; a cue stays on the block). */
  texts: Record<string, string>;
  /** Source lines left out, merged or reworded, and anything the script left unclear. */
  issues: Issue[];
};

/* ---------- revise: a screenplay changed from comments ---------- */

/** `blocks` defaults to the episode's latest generated screenplay with saved edits applied; `notes` to the saved comments. */
export type ReviseInput = { episodeId: string; blocks?: ScreenplayBlock[]; notes?: ScreenplayNote[] };

export type ReviseResult = {
  blocks: ScreenplayBlock[];
  texts: Record<string, string>;
  /** Ids of passages whose text changed or that are new: the Screenplay record's `changed`. */
  changed: string[];
  /** Ids of passages removed. */
  removed: string[];
  /** How each note was handled. */
  answered: { note: string; done: boolean; reply: string }[];
};

/* ---------- match-cast: screenplay against the series' cast sheets ---------- */

/** `seriesId` defaults to the episode's series. `blocks` as on ReviseInput. */
export type MatchCastInput = { episodeId: string; seriesId?: string; blocks?: ScreenplayBlock[] };

export type EntityKind = "character" | "location" | "prop";

export type MatchCastResult = {
  matches: {
    name: string;
    kind: EntityKind;
    /** Cast sheet ids: an uploaded sheet's id, or a built-in sheet's id. */
    sheetIds: string[];
    tag: string;
    variant: string | null;
    blocks: string[];
    sure: boolean;
  }[];
  unmatched: { name: string; kind: EntityKind; blocks: string[]; note: string }[];
  /** Two sheets that could both apply, or a script detail that disagrees with a sheet. A person decides. */
  conflicts: { name: string; blocks: string[]; question: string; options: string[] }[];
};

/* ---------- storyboard: numbered frames with shot notes ---------- */

/**
 * The source is one of: an episode (its screenplay, as on ReviseInput), a saved storyboard (its `source`), or
 * `source` text up to 50,000 characters. `maxFrames` 1-60, default 24.
 */
export type StoryboardInput = { episodeId?: string; storyboardId?: string; source?: string; maxFrames?: number; aspect?: Aspect };

export type StoryboardFrame = {
  number: number;
  /** A short name for the frame, for the Frame record's `title`. */
  title: string;
  /** Shot size and angle, e.g. "Close-up, low angle". */
  shot: string;
  camera: string;
  action: string;
  characters: string[];
  location: string;
  dialogue: string | null;
  /** The note an artist reads, for the Frame record's `note`. */
  note: string;
  /** Screenplay passage ids this frame covers (empty when made from plain text). */
  blocks: string[];
};

export type StoryboardResult = { frames: StoryboardFrame[]; issues: Issue[] };

/* ---------- manga: pages with panels, dialogue, narration and sound effects ---------- */

/** Sources as on StoryboardInput, with `mangaId` for a saved manga. `maxPages` 1-24, default 12. */
export type MangaInput = { episodeId?: string; mangaId?: string; source?: string; maxPages?: number; readingDirection?: "rtl" | "ltr" };

export type MangaPanel = {
  number: number;
  size: "full" | "large" | "medium" | "small";
  shot: string;
  /** What is drawn. Never contains lettering. */
  art: string;
  characters: string[];
  speech: { speaker: string; text: string; style: "speech" | "thought" | "whisper" | "shout" }[];
  narration: string[];
  sfx: { text: string; note: string }[];
};

export type MangaPagePlan = { number: number; layout: string; panels: MangaPanel[] };

export type MangaResult = { readingDirection: "rtl" | "ltr"; pages: MangaPagePlan[]; issues: Issue[] };

/* ---------- prompts: the generation prompt for each frame, page or clip ---------- */

/**
 * `medium` picks what to write prompts for:
 * - "storyboard": the frames of `planJobId` (a done storyboard job) or `frames`.
 * - "manga": the pages of `planJobId` (a done manga job) or `pages`.
 * - "clip": the camera passages of the episode's screenplay (`blocks` as on ReviseInput).
 * `matchJobId` is a done match-cast job; by default the episode's latest one. Style: `styleSlug` (a style from the
 * Style hub), else the episode's chosen style, else the series' style; `styleGuide` text (up to 8,000 characters)
 * is added to it. At most 60 items.
 */
export type PromptsInput = {
  medium: "storyboard" | "manga" | "clip";
  episodeId?: string;
  planJobId?: string;
  frames?: StoryboardFrame[];
  pages?: MangaPagePlan[];
  blocks?: ScreenplayBlock[];
  matchJobId?: string;
  seriesId?: string;
  styleSlug?: string;
  styleGuide?: string;
  aspect?: Aspect;
};

export type PromptsResult = {
  prompts: {
    /** "frame-3", "page-2", or a camera passage id. */
    itemId: string;
    prompt: string;
    /** Cast sheet ids to attach as references, in order of importance. */
    references: string[];
    aspect: Aspect;
    /** Contradictions or gaps found while writing it. Empty when none. */
    issues: string[];
  }[];
};

/* ---------- image: storyboard frames, manga page art, cast sheets ---------- */

/**
 * `references` are cast sheet ids (up to 8), sent to the image model as reference pictures. Manga pages are drawn
 * with no lettering. A "cast-sheet" with `castSheet` set is also saved to that series' cast.
 * `quality` defaults to "medium". `prompt` up to 8,000 characters.
 */
export type ImageInput = {
  purpose: "storyboard-frame" | "manga-page" | "cast-sheet";
  prompt: string;
  references?: string[];
  /** Needed to find built-in sheets among `references`; uploaded sheets are found by id alone. */
  seriesId?: string;
  episodeId?: string;
  aspect?: Aspect;
  quality?: "low" | "medium" | "high";
  castSheet?: { seriesId: string; character: string; variant?: string; tag?: string };
};

export type ImageResult = {
  /** The stored file's key; the picture is served at `url` behind the session check. */
  file: string;
  url: string;
  width: number;
  height: number;
  /** References that could not be loaded and were left out. */
  skipped: string[];
  /** The cast sheet saved, when `castSheet` was given. */
  sheetId: string | null;
};

/* ---------- clip: video ---------- */

/**
 * OpenAI shut its video API (Sora 2) down on 24 September 2026 and offers no replacement, so a clip job is refused
 * with 501 { error: "not_available" }. The shape is kept for when a provider is added.
 */
export type ClipInput = { prompt: string; references?: string[]; seconds?: number; aspect?: Aspect };

/* ======================================================================================================
 * Notion (read-only)
 *
 * GET  /api/creator/notion/status                 -> NotionStatus
 * GET  /api/creator/notion/search?q=&type=&cursor= -> NotionSearchResult  (type: "page" | "database"; default both)
 * GET  /api/creator/notion/search?in=<database id>&cursor= -> NotionSearchResult (the pages in one database)
 * POST /api/creator/notion/import/script  body NotionImportScriptRequest -> NotionImportScriptResult
 * POST /api/creator/notion/import/cast    body NotionImportCastRequest   -> NotionImportCastResult
 * Without NOTION_TOKEN every endpoint but status answers 503 { error: "not_linked" }.
 * ==================================================================================================== */

export type NotionStatus = { linked: false } | { linked: true; workspace: string | null };

export type NotionItem = {
  id: string;
  type: "page" | "database";
  title: string;
  url: string;
  /** The parent database's id for a page in a database, else null. */
  parent: string | null;
  lastEdited: string;
  /** Short readable property values: Status, Lifecycle, Approved and the like. Pages only. */
  properties: Record<string, string>;
};

export type NotionSearchResult = { items: NotionItem[]; next: string | null };

/** Imports the page's text as the episode's script, replacing the pasted text. Any uploaded file stays. */
export type NotionImportScriptRequest = { pageId: string; episodeId: string };
/** The saved Script record (lib/labs/store/types.ts) and whether Notion cut the page short. */
export type NotionImportScriptResult = { script: Script; truncated: boolean };

/**
 * Each page is a character or place: its title is the name; every image in its file properties and body becomes a
 * cast sheet. Up to 20 pages and 40 images per request.
 */
export type NotionImportCastRequest = { seriesId: string; pageIds: string[] };

export type NotionImportCastResult = {
  /** Saved CastSheet records (lib/labs/store/types.ts). */
  sheets: CastSheet[];
  skipped: { pageId: string; reason: string }[];
};
