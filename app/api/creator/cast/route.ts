import type { NextRequest } from "next/server";
import { addCast, listCast } from "@/lib/labs/store/creator";
import { formFile, ok, readForm, withUser } from "@/lib/labs/store/http";
import { Bad, LIMITS, fileName, id, imageType, optionalText, text } from "@/lib/labs/store/validate";

/** A series' uploaded cast sheets: ?series=<id or built-in slug>. */
export async function GET(request: NextRequest) {
  return withUser(request, async () => ok({ sheets: await listCast(id(request.nextUrl.searchParams.get("series"), "The series")) }));
}

/** A new cast sheet, as a form: seriesId, character, variant?, tag?, image (PNG, JPEG, GIF or WebP up to 15 MB). */
export async function POST(request: NextRequest) {
  return withUser(request, async (user) => {
    const form = await readForm(request, LIMITS.upload + 64 * 1024);
    const got = await formFile(form, "image");
    if (!got) throw new Bad("invalid", "Choose an image.");
    if (got.bytes.byteLength > LIMITS.upload) throw new Bad("too_large", "The image is over 15 MB.", 413);
    // The type comes from the file's first bytes, never from its name or the browser's word for it.
    const type = imageType(got.bytes);
    if (!type) throw new Bad("file_type", "Use a PNG, JPEG, GIF or WebP image.");
    const character = text(form.get("character"), "The name", 80, { min: 1 });
    const tag = optionalText(form.get("tag"), "The tag", 80) ?? `@${character.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
    const sheet = await addCast(user.email, {
      seriesId: id(form.get("seriesId"), "The series"),
      character,
      variant: optionalText(form.get("variant"), "The variant", 80),
      tag,
      image: { name: fileName(got.name), type, bytes: got.bytes },
    });
    return ok({ sheet }, 201);
  });
}
