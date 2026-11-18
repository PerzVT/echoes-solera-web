import { readFile } from "node:fs/promises";
import path from "node:path";
import { COVE_SHIM } from "@/lib/labs/cove/shim";

// The Tidebell Cove build chooses its current duck only when it is served at /walk,
// so the HTML lives outside public/ and this is the one address that returns it.
export const dynamic = "force-static";

/** Where public/labs/worlds/play/assets/ is served: the room props, music and garments the game fetches. */
const ASSETS = "/labs/worlds/play/assets/";

/**
 * The stored HTML stays byte-identical to the game's build. A small script in front of the game's own sets
 * window.COVE_CONFIG (the game reads assetsPrefix and websocketUrl from it) and, for multiplayer on Vercel, answers
 * the game's /cove socket through POST /api/cove (lib/labs/cove/shim.ts). COVE_MULTIPLAYER=off leaves the shim out
 * and the game plays solo. The page is built once per deployment, so a change to that variable takes effect on the
 * next deployment.
 */
export async function GET() {
  const html = await readFile(path.join(process.cwd(), "lib/labs/cove/tidebell-cove.html"), "utf8");
  const at = html.indexOf("<script>");
  const config =
    `window.COVE_CONFIG={assetsPrefix:${JSON.stringify(ASSETS)},` +
    `websocketUrl:(location.protocol==="https:"?"wss:":"ws:")+"//"+location.host+"/cove"};`;
  const multiplayer = process.env.COVE_MULTIPLAYER !== "off";
  const served = at < 0 ? html : html.slice(0, at) + "<script>" + config + (multiplayer ? COVE_SHIM : "") + "</script>" + html.slice(at);
  return new Response(served, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
