import { readFile } from "node:fs/promises";
import path from "node:path";

// The Tidebell Cove build chooses its current duck only when it is served at /walk,
// so the HTML lives outside public/ and this is the one address that returns it.
export const dynamic = "force-static";

export async function GET() {
  const html = await readFile(path.join(process.cwd(), "lib/labs/cove/tidebell-cove.html"), "utf8");
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
