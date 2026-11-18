import type { NextRequest } from "next/server";

/**
 * Development only: a request with header `x-nl-fake-ai: <usd>` runs on the stand-in provider (lib/labs/ai/fake.ts)
 * and reports that cost, so jobs and limits can be tried without a key or spending. Ignored in production.
 */
export function fakeCost(request: NextRequest): number | null {
  if (process.env.NODE_ENV === "production") return null;
  const raw = request.headers.get("x-nl-fake-ai");
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n < 10_000 ? n : 0.001;
}
