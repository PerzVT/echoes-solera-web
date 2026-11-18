/**
 * The OpenAI HTTP API, over fetch. Shapes from developers.openai.com (checked 2026-11-18):
 * - Text: POST /v1/responses with `background: true` and `text.format` json_schema (strict). The response is
 *   picked up with GET /v1/responses/{id}, so a job can outlive the function that started it.
 * - Images: POST /v1/images/generations, or POST /v1/images/edits (JSON, `images: [{ image_url }]`, up to 16) when
 *   reference pictures are attached. The picture comes back as data[0].b64_json.
 *
 * Nothing here logs a prompt, a key or a provider error message: errors carry the HTTP status and code only.
 */
import { apiKey } from "./config";

const API = "https://api.openai.com/v1";

export class ProviderError extends Error {
  constructor(
    /** A plain sentence safe to show a person. */
    public plain: string,
    public status: number,
    public code: string,
  ) {
    super(`openai ${status} ${code}`);
  }
}

export type TextUsage = { inputTokens: number; cachedTokens: number; outputTokens: number };
export type ImageUsage = { textInputTokens: number; imageInputTokens: number; outputTokens: number };

/** The provider's status, reduced to what a job needs. */
export type TextOutcome =
  | { state: "pending" }
  | { state: "done"; text: string; usage: TextUsage }
  | { state: "failed"; plain: string; usage: TextUsage | null };

async function call(path: string, init: RequestInit & { json?: unknown }, timeoutMs = 60_000): Promise<unknown> {
  const key = apiKey();
  if (!key) throw new ProviderError("API token not set up.", 503, "not_set_up");
  const headers: Record<string, string> = { authorization: `Bearer ${key}` };
  if (init.json !== undefined) headers["content-type"] = "application/json";
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new ProviderError("The generator could not be reached. Try again.", 502, "network");
  }
  const data = (await res.json().catch(() => null)) as { error?: { code?: string; type?: string; param?: string } } | null;
  if (!res.ok) {
    const code = String(data?.error?.code ?? data?.error?.type ?? "error").slice(0, 60);
    // Status, code and the name of the field at fault only: the message can quote the request.
    console.error(`openai ${init.method ?? "GET"} ${path.split("/")[1]} ${res.status} ${code} ${String(data?.error?.param ?? "").slice(0, 60)}`);
    throw new ProviderError(plainFor(res.status, code), res.status, code);
  }
  return data;
}

function plainFor(status: number, code: string) {
  if (status === 401 || status === 403) return "API token not set up.";
  if (code === "insufficient_quota" || code === "credit_balance_exhausted" || code === "billing_hard_limit_reached") return "Generation is paused. The account needs more credit.";
  if (status === 429) return "The generator is busy. Try again in a minute.";
  if (code === "moderation_blocked" || code === "content_policy_violation") return "The generator refused this request. Change the wording and try again.";
  if (status === 400) return "The generator could not use this request.";
  return "The generator had a problem. Try again.";
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** One hashed id per person, so OpenAI can tell users apart without being sent an email address. */
export async function safetyId(email: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`nine-lives:${email.toLowerCase()}`));
  return Array.from(new Uint8Array(digest).slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- Text ---------- */

export type TextRequest = {
  model: string;
  instructions: string;
  input: string;
  schemaName: string;
  schema: Record<string, unknown>;
  maxOutputTokens: number;
  user: string;
};

/** Starts a background response and returns its id. */
export async function startText(req: TextRequest): Promise<string> {
  const data = (await call("/responses", {
    method: "POST",
    json: {
      model: req.model,
      instructions: req.instructions,
      input: [{ role: "user", content: req.input }],
      text: { format: { type: "json_schema", name: req.schemaName, schema: req.schema, strict: true } },
      max_output_tokens: req.maxOutputTokens,
      background: true,
      safety_identifier: req.user,
    },
  })) as { id?: unknown };
  if (typeof data?.id !== "string") throw new ProviderError("The generator had a problem. Try again.", 502, "no_id");
  return data.id;
}

type RawResponse = {
  status?: string;
  output?: { type?: string; content?: { type?: string; text?: string; refusal?: string }[] }[];
  usage?: { input_tokens?: number; output_tokens?: number; input_tokens_details?: { cached_tokens?: number } };
  incomplete_details?: { reason?: string } | null;
  error?: { code?: string } | null;
};

export function readText(raw: RawResponse): TextOutcome {
  const usage: TextUsage | null = raw.usage
    ? { inputTokens: num(raw.usage.input_tokens), cachedTokens: num(raw.usage.input_tokens_details?.cached_tokens), outputTokens: num(raw.usage.output_tokens) }
    : null;
  const status = raw.status ?? "";
  if (status === "queued" || status === "in_progress") return { state: "pending" };
  if (status === "completed") {
    let text = "";
    for (const item of raw.output ?? []) {
      if (item.type !== "message") continue;
      for (const part of item.content ?? []) {
        if (part.type === "refusal") return { state: "failed", plain: "The generator refused this request. Change the wording and try again.", usage };
        if (part.type === "output_text" && typeof part.text === "string") text += part.text;
      }
    }
    if (!text) return { state: "failed", plain: "The generator returned nothing. Try again.", usage };
    return { state: "done", text, usage: usage ?? { inputTokens: 0, cachedTokens: 0, outputTokens: 0 } };
  }
  if (status === "incomplete") {
    const long = raw.incomplete_details?.reason === "max_output_tokens";
    return { state: "failed", plain: long ? "That was too long to finish. Try a shorter part." : "The generator stopped early. Try again.", usage };
  }
  if (status === "cancelled" || status === "canceled") return { state: "failed", plain: "Stopped.", usage };
  if (["insufficient_quota", "credit_balance_exhausted", "billing_hard_limit_reached"].includes(String(raw.error?.code))) {
    console.error(`openai response ${status} ${raw.error?.code}`);
    return { state: "failed", plain: "Generation is paused. The account needs more credit.", usage };
  }
  console.error(`openai response ${status || "no status"} ${String(raw.error?.code ?? "").slice(0, 60)}`);
  return { state: "failed", plain: "The generator had a problem. Try again.", usage };
}

export async function pollText(id: string): Promise<TextOutcome> {
  return readText((await call(`/responses/${encodeURIComponent(id)}`, {}, 30_000)) as RawResponse);
}

export async function cancelText(id: string) {
  try {
    await call(`/responses/${encodeURIComponent(id)}/cancel`, { method: "POST", json: {} }, 15_000);
  } catch {
    // Already finished or gone: nothing to stop.
  }
}

/* ---------- Images ---------- */

export type ImageRequest = {
  model: string;
  prompt: string;
  size: string;
  quality: "low" | "medium" | "high";
  /** data: URLs of the reference pictures. */
  references: string[];
  user: string;
};

export async function generateImage(req: ImageRequest): Promise<{ bytes: Uint8Array; usage: ImageUsage }> {
  const body: Record<string, unknown> = {
    model: req.model,
    prompt: req.prompt,
    size: req.size,
    quality: req.quality,
    n: 1,
    output_format: "png",
    safety_identifier: req.user,
  };
  if (req.references.length) body.images = req.references.map((image_url) => ({ image_url }));
  // An image can take a few minutes at high quality.
  const data = (await call(req.references.length ? "/images/edits" : "/images/generations", { method: "POST", json: body }, 280_000)) as {
    data?: { b64_json?: string }[];
    usage?: { input_tokens_details?: { text_tokens?: number; image_tokens?: number }; input_tokens?: number; output_tokens?: number };
  };
  const b64 = data?.data?.[0]?.b64_json;
  if (typeof b64 !== "string" || !b64) throw new ProviderError("The generator returned no picture. Try again.", 502, "no_image");
  const u = data.usage;
  const details = u?.input_tokens_details;
  const usage: ImageUsage = {
    textInputTokens: details ? num(details.text_tokens) : num(u?.input_tokens),
    imageInputTokens: num(details?.image_tokens),
    outputTokens: num(u?.output_tokens),
  };
  return { bytes: Uint8Array.from(Buffer.from(b64, "base64")), usage };
}
