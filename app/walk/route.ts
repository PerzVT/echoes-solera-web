import { readFile } from "node:fs/promises";
import path from "node:path";
import { COVE_SHIM } from "@/lib/labs/cove/shim";

// The Tidebell Cove build chooses its current duck only when it is served at /walk,
// so the HTML lives outside public/ and this is the one address that returns it.
export const dynamic = "force-static";

/**
 * The stored HTML stays byte-identical to the game's build. Multiplayer on Vercel comes from a small script put
 * in front of the game's own, which answers the game's /cove socket through POST /api/cove (lib/labs/cove/shim.ts).
 * COVE_MULTIPLAYER=off leaves it out and the game plays solo. The page is built once per deployment, so a change
 * to that variable takes effect on the next deployment.
 */
export async function GET() {
  const html = await readFile(path.join(process.cwd(), "lib/labs/cove/tidebell-cove.html"), "utf8");
  const at = html.indexOf("<script>");
  const served =
    process.env.COVE_MULTIPLAYER === "off" || at < 0
      ? html
      : html.slice(0, at) + "<script>" + COVE_SHIM + "</script>" + html.slice(at);
  return new Response(served, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
