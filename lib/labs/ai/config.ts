/**
 * Settings for generation, all from the environment. Nothing here is ever logged or returned.
 *
 * OPENAI_API_KEY         required for any generation
 * AI_TEXT_MODEL          default gpt-6.2-astra (the model OpenAI's docs recommend for new work, Nov 2026)
 * AI_IMAGE_MODEL         default gpt-image-2.6-sunburst
 * AI_DAILY_LIMIT_USD     per person per UTC day, default 25
 * AI_MONTHLY_LIMIT_USD   for everyone per UTC month, default 1500
 * AI_ADMIN_EMAILS        comma-separated; when set, only these may read /api/creator/ai/usage
 */

export const apiKey = () => process.env.OPENAI_API_KEY?.trim() || null;
export const aiReady = () => !!apiKey();

/** OpenAI shut its video API down on 2026-09-24 with no replacement. */
export const VIDEO_AVAILABLE = false;

export const textModel = () => process.env.AI_TEXT_MODEL?.trim() || "gpt-6.2-astra";
export const imageModel = () => process.env.AI_IMAGE_MODEL?.trim() || "gpt-image-2.6-sunburst";

const usd = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};
export const dailyLimit = () => usd("AI_DAILY_LIMIT_USD", 25);
export const monthlyLimit = () => usd("AI_MONTHLY_LIMIT_USD", 1500);

export const adminEmails = () =>
  (process.env.AI_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/**
 * Prices in USD per million tokens, from developers.openai.com/api/docs/pricing (checked 2026-11-18).
 * A model not listed is charged at the dearest text rate, so an unknown model never under-counts.
 */
export const TEXT_PRICES: Record<string, { input: number; cached: number; output: number }> = {
  "gpt-6.2-astra": { input: 8, cached: 0.4, output: 40 },
  "gpt-6.2-sol": { input: 2, cached: 0.1, output: 10 },
  "gpt-6.1-terra": { input: 1, cached: 0.05, output: 5 },
  "gpt-6-luna": { input: 0.1, cached: 0.01, output: 0.5 },
};
const DEAREST_TEXT = TEXT_PRICES["gpt-6.2-astra"];
export const textPrice = (model: string) => TEXT_PRICES[model] ?? DEAREST_TEXT;

/** Every listed GPT Image model is priced the same: text in $5, image in $8, image out $30 per million tokens. */
export const IMAGE_PRICE = { textInput: 5, imageInput: 8, output: 30 };

/** Upper bounds on output, which also bound each job's cost. */
export const MAX_OUTPUT_TOKENS: Record<string, number> = {
  screenplay: 48000,
  revise: 48000,
  "match-cast": 12000,
  storyboard: 24000,
  manga: 32000,
  prompts: 40000,
};

/** At most this many jobs queued or running per person. */
export const MAX_ACTIVE_JOBS = 4;
