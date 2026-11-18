/**
 * Video clips. OpenAI's Videos API (sora-2, sora-2-pro: POST /v1/videos, poll GET /v1/videos/{id}, download
 * /content) was shut down on 2026-09-24 with no replacement (developers.openai.com/api/docs/guides/video-generation).
 * A clip job is refused with 501 until another provider is added here behind the same job interface.
 */
import type { ClipInput } from "./contract";

export type ClipOutcome = { available: false; reason: "no_provider" };

export async function generateClip(input: ClipInput): Promise<ClipOutcome> {
  void input;
  return { available: false, reason: "no_provider" };
}
