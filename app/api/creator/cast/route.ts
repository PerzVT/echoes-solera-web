import type { NextRequest } from "next/server";
import { dropBytes } from "@/lib/labs/store/bytes";
import { addCast, listCast } from "@/lib/labs/store/creator";
import { formFile, ok, readForm, sentFile, withUser } from "@/lib/labs/store/http";
import { Bad, LIMITS, fileName, id, imageType, optionalText, text } from "@/lib/labs/store/validate";

/** A series' uploaded cast sheets: ?series=<id or built-in slug>. */
export async function GET(request: NextRequest) {
  return withUser(request, async () => ok({ sheets: await listCast(id(request.nextUrl.searchParams.get("series"), "The series")) }));
}

// The type comes from the file's first bytes, never from its name or the browser's word for it.
const checkedImageType = (bytes: Uint8Array) => {
  const type = imageType(bytes);
  if (!type) throw new Bad("file_type", "Use a PNG, JPEG, GIF or WebP image.");
  return type;
};

/**
 * A new cast sheet, as a form: seriesId, character, variant?, tag?, and either image (PNG, JPEG, GIF or WebP up to
 * 15 MB) or upload + uploadName for an image the browser sent straight to the store (/api/creator/uploads).
 */
export async function POST(request: NextRequest) {
  return withUser(request, async (user) => {
    const form = await readForm(request, LIMITS.upload + 64 * 1024);
    const seriesId = id(form.get("seriesId"), "The series");
    const character = text(form.get("character"), "The name", 80, { min: 1 });
    const tag = optionalText(form.get("tag"), "The tag", 80) ?? `@${character.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
    const variant = optionalText(form.get("variant"), "The variant", 80);
    const sent = await sentFile(form, (_, bytes) => checkedImageType(bytes));
    const got = sent ?? (await formFile(form, "image"));
    if (!got) throw new Bad("invalid", "Choose an image.");
    if (got.bytes.byteLength > LIMITS.upload) throw new Bad("too_large", "The image is over 15 MB.", 413);
    const type = sent?.type ?? checkedImageType(got.bytes);
    try {
      const sheet = await addCast(user.email, { seriesId, character, variant, tag, image: { name: fileName(got.name), type, bytes: got.bytes, sent: sent?.sent } });
      return ok({ sheet }, 201);
    } catch (e) {
      if (sent) await dropBytes([sent.sent.location]);
      throw e;
    }
  });
}
