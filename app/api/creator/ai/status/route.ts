import type { NextRequest } from "next/server";
import { ok, withUser } from "@/lib/labs/store/http";
import { VIDEO_AVAILABLE, aiReady } from "@/lib/labs/ai/config";
import type { AiStatus } from "@/lib/labs/ai/contract";

/** Whether generation is set up (OPENAI_API_KEY present) and whether video exists. Never says more. */
export async function GET(request: NextRequest) {
  return withUser(request, async () => ok((aiReady() ? { ready: true, video: VIDEO_AVAILABLE } : { ready: false }) satisfies AiStatus));
}
