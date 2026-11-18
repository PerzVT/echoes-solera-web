import type { NextRequest } from "next/server";
import { getFile } from "@/lib/labs/store/creator";
import { withUser } from "@/lib/labs/store/http";
import { Bad } from "@/lib/labs/store/validate";

type Ctx = { params: Promise<{ key: string }> };

const INLINE = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

/**
 * An uploaded file, for signed-in people only. Images checked at upload show in place; scripts always download.
 * Nothing served here can run: no sniffing, and a sandbox policy that allows nothing.
 */
export async function GET(request: NextRequest, { params }: Ctx) {
  return withUser(request, async () => {
    const { key } = await params;
    if (!/^[a-f0-9]{24}$/.test(key)) throw new Bad("not_found", "That file is not there.", 404);
    const found = await getFile(key);
    if (!found) throw new Bad("not_found", "That file is not there.", 404);
    const { file, bytes } = found;
    const inline = INLINE.has(file.type);
    const ascii = file.name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
    return new Response(bytes as BodyInit, {
      headers: {
        "content-type": inline ? file.type : "application/octet-stream",
        "content-length": String(bytes.byteLength),
        "content-disposition": `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'none'; sandbox",
        "cache-control": "private, max-age=3600",
      },
    });
  });
}
