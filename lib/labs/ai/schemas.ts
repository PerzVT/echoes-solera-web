/**
 * JSON schemas for structured outputs (strict mode: every property required, no extra properties, null where a
 * field may be empty). Passages use one flat shape with nullable fields; lib/labs/ai/kinds.ts turns them into
 * the ScreenplayBlock union.
 */
type Schema = Record<string, unknown>;

const str: Schema = { type: "string" };
const strOrNull: Schema = { type: ["string", "null"] };
const int: Schema = { type: "integer" };
const bool: Schema = { type: "boolean" };
const arr = (items: Schema): Schema => ({ type: "array", items });
const obj = (properties: Record<string, Schema>): Schema => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
const oneOf = (...values: string[]): Schema => ({ type: "string", enum: values });

const issue = obj({ blocks: arr(str), text: str });

export const flatBlock = obj({
  id: str,
  kind: oneOf("heading", "camera", "action", "dialogue"),
  number: { type: ["integer", "null"] },
  cue: strOrNull,
  text: str,
  direction: strOrNull,
});

export const SCHEMAS = {
  screenplay: obj({ title: str, blocks: arr(flatBlock), issues: arr(issue) }),
  revise: obj({
    blocks: arr(flatBlock),
    changed: arr(str),
    removed: arr(str),
    answered: arr(obj({ note: str, done: bool, reply: str })),
  }),
  "match-cast": obj({
    matches: arr(
      obj({ name: str, kind: oneOf("character", "location", "prop"), sheetIds: arr(str), tag: str, variant: strOrNull, blocks: arr(str), sure: bool }),
    ),
    unmatched: arr(obj({ name: str, kind: oneOf("character", "location", "prop"), blocks: arr(str), note: str })),
    conflicts: arr(obj({ name: str, blocks: arr(str), question: str, options: arr(str) })),
  }),
  storyboard: obj({
    frames: arr(
      obj({ number: int, title: str, shot: str, camera: str, action: str, characters: arr(str), location: str, dialogue: strOrNull, note: str, blocks: arr(str) }),
    ),
    issues: arr(issue),
  }),
  manga: obj({
    pages: arr(
      obj({
        number: int,
        layout: str,
        panels: arr(
          obj({
            number: int,
            size: oneOf("full", "large", "medium", "small"),
            shot: str,
            art: str,
            characters: arr(str),
            speech: arr(obj({ speaker: str, text: str, style: oneOf("speech", "thought", "whisper", "shout") })),
            narration: arr(str),
            sfx: arr(obj({ text: str, note: str })),
          }),
        ),
      }),
    ),
    issues: arr(issue),
  }),
  prompts: obj({
    prompts: arr(obj({ itemId: str, prompt: str, references: arr(str), aspect: oneOf("square", "landscape", "portrait"), issues: arr(str) })),
  }),
} satisfies Record<string, Schema>;

export type TextKind = keyof typeof SCHEMAS;
