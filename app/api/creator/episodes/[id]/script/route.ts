import type { NextRequest } from "next/server";
import { dropBytes } from "@/lib/labs/store/bytes";
import { saveScript, type Upload } from "@/lib/labs/store/creator";
import { formFile, ok, readForm, sentFile, withUser } from "@/lib/labs/store/http";
import { Bad, LIMITS, fileName, id, scriptType } from "@/lib/labs/store/validate";

type Ctx = { params: Promise<{ id: string }> };

/**
 * The episode's script, as a form: `text` (the pasted or read text, up to 500 KB), `file` (a .txt, .docx, .fdx or
 * .pdf up to 15 MB, stored as it is) or `upload` + `uploadName` for a file the browser sent straight to the store
 * (/api/creator/uploads), and `clearFile` ("1" drops the stored file).
 */
export async function PUT(request: NextRequest, { params }: Ctx) {
  return withUser(request, async (user) => {
    const episodeId = id((await params).id);
    const form = await readForm(request, LIMITS.upload + LIMITS.scriptText + 64 * 1024);
    const raw = form.get("text") ?? "";
    if (typeof raw !== "string") throw new Bad("invalid", "The script text is not valid.");
    if (new TextEncoder().encode(raw).byteLength > LIMITS.scriptText) throw new Bad("too_large", "The script text is over 500 KB.", 413);
    const sent = await sentFile(form, (name) => scriptType(name));
    const got = sent ? null : await formFile(form, "file");
    let file: Upload | undefined = sent ?? undefined;
    if (got) {
      if (got.bytes.byteLength > LIMITS.upload) throw new Bad("too_large", "The file is over 15 MB.", 413);
      const name = fileName(got.name);
      file = { name, type: scriptType(name), bytes: got.bytes };
    }
    try {
      const script = await saveScript(user.email, episodeId, { text: raw.replace(/\u0000/g, ""), file, clearFile: form.get("clearFile") === "1" });
      return ok({ script });
    } catch (e) {
      if (sent) await dropBytes([sent.sent.location]);
      throw e;
    }
  });
}
