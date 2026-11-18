/**
 * Hand-written checks for what the creator's API accepts. Each returns the clean value or throws a Bad with a safe
 * code and a plain message; nothing from the request reaches the store unchecked.
 */
import { MANGA_STEPS, STEPS, STORYBOARD_STEPS, TOOLS, type CastChoice, type Frame, type Made, type MangaLetter, type MangaPage, type MangaStep, type Note, type Step, type StoryboardStep, type Tool } from "./types";

export class Bad extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export const LIMITS = {
  scriptText: 500 * 1024,
  upload: 15 * 1024 * 1024,
  json: 1024 * 1024,
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Control characters other than tab and newline are dropped from short text. */
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");

export function text(v: unknown, field: string, max: number, { min = 0, multiline = false } = {}): string {
  if (typeof v !== "string") throw new Bad("invalid", `${field} is missing.`);
  const t = multiline ? v.replace(/\u0000/g, "") : clean(v).trim();
  if (t.length < min) throw new Bad("invalid", `${field} is empty.`);
  if (t.length > max) throw new Bad("too_large", `${field} is too long.`);
  return t;
}

export const optionalText = (v: unknown, field: string, max: number) => (v === undefined || v === null || v === "" ? null : text(v, field, max));

export const slug = (v: unknown, field: string) => {
  const t = text(v, field, 80, { min: 1 });
  if (!/^[a-z0-9-]+$/.test(t)) throw new Bad("invalid", `${field} is not valid.`);
  return t;
};

/** A picture on this site: a path on the same origin, never another scheme or host. */
export const sitePath = (v: unknown, field: string) => {
  const t = text(v, field, 400, { min: 1 });
  if (!/^\/[^/\\]/.test(t) || /[\s"'<>]/.test(t)) throw new Bad("invalid", `${field} is not valid.`);
  return t;
};

/** A record id from the address or the body. Ids are made by the server; built-in series use their slug. */
export const id = (v: unknown, field = "The id") => {
  if (typeof v !== "string" || !/^[a-z0-9-]{1,80}$/.test(v)) throw new Bad("not_found", `${field} is not valid.`, 404);
  return v;
};

export const tool = (v: unknown): Tool => {
  if (!TOOLS.includes(v as Tool)) throw new Bad("invalid", "Tool is not valid.");
  return v as Tool;
};

export const step = (v: unknown): Step => {
  if (!STEPS.includes(v as Step)) throw new Bad("invalid", "Step is not valid.");
  return v as Step;
};

export function list<T>(v: unknown, field: string, max: number, each: (x: unknown) => T): T[] {
  if (!Array.isArray(v)) throw new Bad("invalid", `${field} is not a list.`);
  if (v.length > max) throw new Bad("too_large", `${field} has too many items.`);
  return v.map(each);
}

export function texts(v: unknown): Record<string, string> {
  if (!isObj(v)) throw new Bad("invalid", "The screenplay text is not valid.");
  const entries = Object.entries(v);
  if (entries.length > 5000) throw new Bad("too_large", "The screenplay is too long.");
  const out: Record<string, string> = {};
  for (const [k, val] of entries) out[text(k, "A passage id", 40, { min: 1 })] = text(val, "A passage", 20000, { multiline: true });
  return out;
}

export function note(v: unknown): Note {
  if (!isObj(v)) throw new Bad("invalid", "A comment is not valid.");
  if (v.type !== "comment" && v.type !== "suggestion") throw new Bad("invalid", "A comment is not valid.");
  return {
    id: text(v.id, "A comment id", 40, { min: 1 }),
    block: text(v.block, "A passage id", 40, { min: 1 }),
    type: v.type,
    quote: text(v.quote, "A quote", 20000, { multiline: true }),
    body: text(v.body, "A comment", 20000, { multiline: true, min: 1 }),
  };
}

export function castChoice(v: unknown): CastChoice {
  if (!isObj(v)) throw new Bad("invalid", "A cast choice is not valid.");
  if (v.kind !== "character" && v.kind !== "location") throw new Bad("invalid", "A cast choice is not valid.");
  const opt = (x: unknown, f: string) => optionalText(x, f, 120) ?? undefined;
  return {
    id: text(v.id, "A cast id", 80, { min: 1 }),
    kind: v.kind,
    name: text(v.name, "A name", 120, { min: 1 }),
    tag: text(v.tag, "A tag", 120),
    src: v.src === undefined || v.src === null || v.src === "" ? undefined : sitePath(v.src, "A picture"),
    who: opt(v.who, "A character"),
    variant: opt(v.variant, "A variant"),
    sheet: opt(v.sheet, "A sheet"),
  };
}

/* ---------- Files ---------- */

/** The first bytes of the image types a cast sheet may be. SVG is left out: it can carry script. */
export function imageType(bytes: Uint8Array): string | null {
  const at = (i: number, ...b: number[]) => b.every((x, j) => bytes[i + j] === x);
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  if (at(0, 0x47, 0x49, 0x46, 0x38) && (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61) return "image/gif";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "image/webp";
  return null;
}

/** Script files are stored as they are; the type is set from the extension, never from the request. */
export const SCRIPT_TYPES: Record<string, string> = {
  ".txt": "text/plain; charset=utf-8",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".fdx": "application/xml",
  ".pdf": "application/pdf",
};

export function scriptType(name: string) {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  const type = SCRIPT_TYPES[ext];
  if (!type) throw new Bad("file_type", "Use a .txt, .docx, .fdx or .pdf file.");
  return type;
}

/** A file's own name, without any folder, kept short and printable. */
export function fileName(name: string) {
  const base = clean(name.split(/[\\/]/).pop() ?? "").trim();
  return (base || "file").slice(0, 200);
}

/* ---------- Storyboards and mangas ---------- */

const num = (v: unknown, field: string, min: number, max: number) => {
  if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) throw new Bad("invalid", `${field} is not valid.`);
  return v;
};
const optNum = (v: unknown, field: string, min: number, max: number) => (v === undefined || v === null ? undefined : num(v, field, min, max));

export const storyboardStep = (v: unknown): StoryboardStep => {
  if (!STORYBOARD_STEPS.includes(v as StoryboardStep)) throw new Bad("invalid", "Step is not valid.");
  return v as StoryboardStep;
};

export const mangaStep = (v: unknown): MangaStep => {
  if (!MANGA_STEPS.includes(v as MangaStep)) throw new Bad("invalid", "Step is not valid.");
  return v as MangaStep;
};

/** How a picture was made: optional, and only these fields. */
export function made(v: unknown): Made | undefined {
  if (v === undefined || v === null) return undefined;
  if (!isObj(v) || typeof v.at !== "string" || Number.isNaN(Date.parse(v.at))) throw new Bad("invalid", "A picture's record is not valid.");
  const out: Made = { at: new Date(v.at).toISOString() };
  if (v.job !== undefined && v.job !== null) out.job = id(v.job, "A job");
  if (v.test === true) out.test = true;
  if (typeof v.prompt === "string" && v.prompt) out.prompt = text(v.prompt, "A prompt", 20000, { multiline: true });
  if (typeof v.by === "string" && v.by) out.by = text(v.by, "A maker", 200);
  return out;
}

export function frame(v: unknown): Frame {
  if (!isObj(v)) throw new Bad("invalid", "A frame is not valid.");
  const m = made(v.made);
  return {
    id: text(v.id, "A frame id", 80, { min: 1 }),
    title: text(v.title, "A frame title", 120),
    note: text(v.note, "A shot note", 4000, { multiline: true }),
    image: sitePath(v.image, "A frame picture"),
    ...(m ? { made: m } : {}),
  };
}

const LETTER_KINDS = ["speech", "narration", "sfx", "inset"] as const;

function letter(v: unknown): MangaLetter {
  if (!isObj(v) || !LETTER_KINDS.includes(v.kind as MangaLetter["kind"])) throw new Bad("invalid", "A balloon is not valid.");
  let tail: MangaLetter["tail"];
  if (v.tail !== undefined && v.tail !== null) {
    if (!isObj(v.tail)) throw new Bad("invalid", "A balloon is not valid.");
    tail = { at: num(v.tail.at, "A tail", 0, 100), up: v.tail.up === true || undefined, flip: v.tail.flip === true || undefined };
  }
  return {
    kind: v.kind as MangaLetter["kind"],
    text: text(v.text, "Lettering", 600, { multiline: true }),
    x: num(v.x, "A balloon position", -10, 110),
    y: num(v.y, "A balloon position", -10, 110),
    w: optNum(v.w, "A balloon width", 1, 100),
    tail,
    rotate: optNum(v.rotate, "A rotation", -90, 90),
    scale: optNum(v.scale, "A size", 0.2, 4),
  };
}

export function mangaPage(v: unknown): MangaPage {
  if (!isObj(v)) throw new Bad("invalid", "A page is not valid.");
  const m = made(v.made);
  return {
    id: text(v.id, "A page id", 80, { min: 1 }),
    image: sitePath(v.image, "A page picture"),
    alt: text(v.alt, "A page description", 2000, { multiline: true }),
    letters: list(v.letters, "The lettering", 60, letter),
    ...(m ? { made: m } : {}),
  };
}

/** A series a storyboard or manga belongs to: a saved series' id or a built-in slug, or null for none. */
export const seriesRef = (v: unknown) => (v === null || v === undefined || v === "" ? null : id(v, "The series"));
