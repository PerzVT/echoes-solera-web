import type { NextRequest } from "next/server";
import { startDirectUpload } from "@/lib/labs/store/bytes";
import { ok, readJson, withUser } from "@/lib/labs/store/http";
import { Bad, LIMITS, fileName, scriptType } from "@/lib/labs/store/validate";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

/**
 * A presigned address for sending one file over 4 MB straight to the Blob store, as JSON: kind ("script" or
 * "cast"), name, type (the browser's word for it, used for images only) and size. Answers `{ direct: false }` when
 * there is no Blob store, and the file then goes in the form as before. Nothing is saved here: the script and cast
 * routes read the file back and check it before they keep it.
 */
export async function POST(request: NextRequest) {
  return withUser(request, async () => {
    const body = await readJson(request, 4 * 1024);
    const size = body.size;
    if (typeof size !== "number" || !Number.isInteger(size) || size < 1) throw new Bad("invalid", "The file size is not valid.");
    let type: string;
    if (body.kind === "script") {
      if (size > LIMITS.upload) throw new Bad("too_large", "The file is over 15 MB.", 413);
      // The Blob store wants a bare type; the record keeps the full one, set again from the name on save.
      type = scriptType(fileName(typeof body.name === "string" ? body.name : "")).split(";")[0];
    } else if (body.kind === "cast") {
      if (size > LIMITS.upload) throw new Bad("too_large", "The image is over 15 MB.", 413);
      if (typeof body.type !== "string" || !IMAGE_TYPES.has(body.type)) throw new Bad("file_type", "Use a PNG, JPEG, GIF or WebP image.");
      type = body.type;
    } else {
      throw new Bad("invalid", "The upload kind is not valid.");
    }
    const upload = await startDirectUpload(type, LIMITS.upload);
    return ok(upload ? { direct: true, ...upload } : { direct: false });
  });
}
