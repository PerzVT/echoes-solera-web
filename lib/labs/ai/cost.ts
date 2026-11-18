/** Cost in USD from reported usage, and the estimate held against the limits before a job runs. */
import { IMAGE_PRICE, textPrice } from "./config";
import type { ImageUsage, TextUsage } from "./openai";

const M = 1_000_000;
const round = (n: number) => Math.round(n * 1e6) / 1e6;

export function textCost(model: string, u: TextUsage) {
  const p = textPrice(model);
  const fresh = Math.max(0, u.inputTokens - u.cachedTokens);
  return round((fresh * p.input + u.cachedTokens * p.cached + u.outputTokens * p.output) / M);
}

export function imageCost(u: ImageUsage) {
  return round((u.textInputTokens * IMAGE_PRICE.textInput + u.imageInputTokens * IMAGE_PRICE.imageInput + u.outputTokens * IMAGE_PRICE.output) / M);
}

/** Input at about four characters a token, and the whole output allowance: an estimate that errs high. */
export function textEstimate(model: string, inputChars: number, maxOutputTokens: number) {
  const p = textPrice(model);
  return round(((inputChars / 4) * p.input + maxOutputTokens * p.output) / M);
}

/** Output tokens for one picture by quality, rounded up from OpenAI's calculator; each reference adds input. */
const IMAGE_OUTPUT_TOKENS = { low: 800, medium: 3000, high: 9000 };
export function imageEstimate(quality: "low" | "medium" | "high", pixels: number, references: number) {
  const scale = pixels / (1024 * 1024);
  return round((IMAGE_OUTPUT_TOKENS[quality] * scale * IMAGE_PRICE.output + references * 1500 * IMAGE_PRICE.imageInput + 2000 * IMAGE_PRICE.textInput) / M);
}
