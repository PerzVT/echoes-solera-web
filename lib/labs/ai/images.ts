/**
 * Runs an image job: loads the reference pictures, calls the image model, stores the picture as an uploaded file
 * (Vercel Blob with BLOB_READ_WRITE_TOKEN, .data/uploads/ in development) and, for a cast sheet, saves it to the
 * series' cast.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { addCast } from "@/lib/labs/store/creator";
import { getStore } from "@/lib/labs/store";
import { loadBytes, saveBytes } from "@/lib/labs/store/bytes";
import { imageType } from "@/lib/labs/store/validate";
import type { ImageResult } from "./contract";
import type { ImageJobInput } from "./kinds";
import type { ImageUsage } from "./openai";
import { referenceLine } from "./prompts/images";

/** All reference pictures together are kept under this, so one request stays a sensible size. */
const MAX_REFERENCE_BYTES = 30 * 1024 * 1024;

const hex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, "0")).join("");

/** A built-in sheet is a file under public/. Deployed functions do not carry public/, so it is fetched from the site. */
async function sitePicture(src: string): Promise<Uint8Array | null> {
  if (!/^\/labs\/[a-zA-Z0-9/_.-]+$/.test(src) || src.includes("..")) return null;
  const withExt = /\.(webp|png|jpe?g)$/.test(src) ? src : `${src}.webp`;
  try {
    return new Uint8Array(await readFile(path.join(process.cwd(), "public", withExt)));
  } catch {
    const host = process.env.VERCEL_URL;
    if (!host) return null;
    try {
      const res = await fetch(`https://${host}${withExt}`, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
      return res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
    } catch {
      return null;
    }
  }
}

async function referenceBytes(ref: ImageJobInput["references"][number]) {
  if (ref.file) {
    const file = await getStore().getFile(ref.file);
    return file ? loadBytes(file.location) : null;
  }
  return ref.src ? sitePicture(ref.src) : null;
}

/** The references as data: URLs, in order, with the ones that could not be read left out. */
export async function loadReferences(refs: ImageJobInput["references"]) {
  const urls: string[] = [];
  const tags: string[] = [];
  const skipped: string[] = [];
  let total = 0;
  for (const ref of refs) {
    const bytes = await referenceBytes(ref);
    const type = bytes ? imageType(bytes) : null;
    if (!bytes || !type || type === "image/gif" || total + bytes.byteLength > MAX_REFERENCE_BYTES) {
      skipped.push(ref.id);
      continue;
    }
    total += bytes.byteLength;
    urls.push(`data:${type};base64,${Buffer.from(bytes).toString("base64")}`);
    tags.push(ref.tag);
  }
  return { urls, tags, skipped };
}

export type ImageCall = (prompt: string, references: string[]) => Promise<{ bytes: Uint8Array; usage: ImageUsage }>;

export async function runImage(jobId: string, owner: string, input: ImageJobInput, call: ImageCall): Promise<{ result: ImageResult; usage: ImageUsage }> {
  const refs = await loadReferences(input.references);
  const prompt = refs.urls.length ? `${referenceLine(refs.tags)}\n\n${input.prompt}` : input.prompt;
  const { bytes, usage } = await call(prompt, refs.urls);
  if (imageType(bytes) !== "image/png") throw new Error("image was not a png");
  const name = `${input.purpose}-${jobId}.png`;
  const skipped = [...input.skipped, ...refs.skipped];

  if (input.castSheet) {
    const sheet = await addCast(owner, { ...input.castSheet, image: { name, type: "image/png", bytes } });
    return { result: { file: sheet.image, url: `/api/creator/files/${sheet.image}`, width: input.width, height: input.height, skipped, sheetId: sheet.id }, usage };
  }

  const key = hex(12);
  const location = await saveBytes(key, "image/png", bytes);
  await getStore().putFile({ key, name, type: "image/png", size: bytes.byteLength, location, owner, createdAt: new Date().toISOString() });
  return { result: { file: key, url: `/api/creator/files/${key}`, width: input.width, height: input.height, skipped, sheetId: null }, usage };
}
