/**
 * What the creator saves. Every record carries who made it (`owner`, the signed-in email), who changed it last and
 * when. The whole allowed domain is one small team, so everyone signed in sees every record.
 */

export type Tool = "mini-series" | "anime" | "cooking";
export const TOOLS: Tool[] = ["mini-series", "anime", "cooking"];

/** The flow step an episode has reached. "done" is a finished episode in the Library. */
export type Step = "script" | "screenplay" | "cast" | "style" | "results" | "done";
export const STEPS: Step[] = ["script", "screenplay", "cast", "style", "results", "done"];

export type Meta = { id: string; owner: string; updatedBy: string; createdAt: string; updatedAt: string };

export type Series = Meta & { title: string; tool: Tool; style: string | null; cover: string | null };

/** `seriesId` is a saved series' id or the slug of a built-in series. */
export type Episode = Meta & { seriesId: string; number: number; title: string; step: Step };

/** One per episode; its id is the episode's id. `file` is the stored file's key. */
export type Script = Meta & { episodeId: string; text: string; fileName: string | null; file: string | null };

export type Note = { id: string; block: string; type: "comment" | "suggestion"; quote: string; body: string };

/** One per episode; its id is the episode's id. The edited text of each passage, the open comments, the passages changed. */
export type Screenplay = Meta & { episodeId: string; texts: Record<string, string>; notes: Note[]; changed: string[] };

/** An uploaded character sheet. `seriesId` as on Episode. `image` is the stored file's key. */
export type CastSheet = Meta & { seriesId: string; character: string; variant: string | null; tag: string; image: string };

/** One character or place on the cast step, as chosen. */
export type CastChoice = { id: string; kind: "character" | "location"; name: string; tag: string; src?: string; who?: string; variant?: string; sheet?: string };

/** What a person chose on the cast, style and references steps. One per episode; its id is the episode's id. */
export type Choices = Meta & { episodeId: string; cast: CastChoice[] | null; style: string | null; references: string[] };

export type Tables = {
  series: Series;
  episodes: Episode;
  scripts: Script;
  screenplays: Screenplay;
  cast_sheets: CastSheet;
  choices: Choices;
};
export type Table = keyof Tables;

/** The field each table is listed by. Series are listed whole. */
export const PARENT: { [T in Table]: keyof Tables[T] | null } = {
  series: null,
  episodes: "seriesId",
  scripts: "episodeId",
  screenplays: "episodeId",
  cast_sheets: "seriesId",
  choices: "episodeId",
};

/** An uploaded file's record. The bytes are elsewhere (lib/labs/store/bytes.ts); `location` says where. */
export type StoredFile = { key: string; name: string; type: string; size: number; location: string; owner: string; createdAt: string };

/**
 * The one interface both adapters implement. Records are written whole (`put` inserts or replaces), so the
 * adapters stay small; lib/labs/store/creator.ts holds the rules.
 */
export interface Store {
  list<T extends Table>(table: T, parent?: string): Promise<Tables[T][]>;
  get<T extends Table>(table: T, id: string): Promise<Tables[T] | null>;
  put<T extends Table>(table: T, row: Tables[T]): Promise<void>;
  remove(table: Table, ids: string[]): Promise<void>;
  putFile(file: StoredFile): Promise<void>;
  getFile(key: string): Promise<StoredFile | null>;
  removeFiles(keys: string[]): Promise<StoredFile[]>;
}
