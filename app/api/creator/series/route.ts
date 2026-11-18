import type { NextRequest } from "next/server";
import { createSeries, listAll } from "@/lib/labs/store/creator";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { text, tool } from "@/lib/labs/store/validate";

/** Every saved series and every saved episode, built-in series' episodes included. */
export async function GET(request: NextRequest) {
  return withUser(request, async () => ok(await listAll()));
}

/** A new series: { title, tool }. */
export async function POST(request: NextRequest) {
  return withUser(request, async (user) => {
    const body = await readJson(request);
    const series = await createSeries(user.email, { title: text(body.title, "The series name", 120, { min: 1 }), tool: tool(body.tool ?? "mini-series") });
    return ok({ series }, 201);
  });
}
