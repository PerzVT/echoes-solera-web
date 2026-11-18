/**
 * A stand-in provider for development, so the job lifecycle and the limits can be tried without spending.
 * Used only when NODE_ENV is not production and the request asks for it (lib/labs/ai/jobs.ts). Its answers are
 * fixed and match each kind's schema.
 */
import type { TextKind } from "./schemas";
import type { ImageUsage, TextOutcome } from "./openai";

/** A 1x1 PNG. */
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const blocks = [
  { id: "h1", kind: "heading", number: 1, cue: null, text: "INT. KITCHEN - NIGHT", direction: null },
  { id: "c1", kind: "camera", number: null, cue: null, text: "MEDIUM TWO-SHOT", direction: "She stands at the door, he sits at the table. Light from the hood lamp." },
  { id: "a1", kind: "action", number: null, cue: null, text: "MAYA closes the door and hands TOM the letter.", direction: null },
  { id: "d1", kind: "dialogue", number: null, cue: "MAYA", text: "Read it.", direction: null },
];

const ANSWERS: Record<TextKind, unknown> = {
  screenplay: { title: "Test episode", blocks, issues: [] },
  revise: { blocks: [...blocks.slice(0, 3), { ...blocks[3], text: "Read it. Now." }], changed: ["d1"], removed: [], answered: [] },
  "match-cast": { matches: [], unmatched: [{ name: "Maya", kind: "character", blocks: ["a1"], note: "No sheet for Maya" }], conflicts: [] },
  storyboard: {
    frames: [{ number: 1, title: "The letter", shot: "Medium two-shot", camera: "Static", action: "Maya hands Tom the letter.", characters: ["Maya", "Tom"], location: "Kitchen", dialogue: "Read it.", note: "Letter in her right hand.", blocks: ["c1", "a1"] }],
    issues: [],
  },
  manga: {
    pages: [
      {
        number: 1,
        layout: "Two tiers",
        panels: [{ number: 1, size: "large", shot: "Medium", art: "Maya holds out a letter to Tom.", characters: ["Maya", "Tom"], speech: [{ speaker: "Maya", text: "Read it.", style: "speech" }], narration: [], sfx: [] }],
      },
    ],
    issues: [],
  },
  prompts: { prompts: [{ itemId: "frame-1", prompt: "Test prompt.", references: [], aspect: "landscape", issues: [] }] },
};

export const fakeText = (kind: TextKind): TextOutcome => ({ state: "done", text: JSON.stringify(ANSWERS[kind]), usage: { inputTokens: 100, cachedTokens: 0, outputTokens: 100 } });

export const fakeImage = async (): Promise<{ bytes: Uint8Array; usage: ImageUsage }> => ({
  bytes: Uint8Array.from(Buffer.from(PNG, "base64")),
  usage: { textInputTokens: 100, imageInputTokens: 0, outputTokens: 100 },
});
