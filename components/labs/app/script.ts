/** Reads a submitted script into screenplay blocks, and the generations the blocks make. */
import { clips, type Block, type Take } from "@/lib/labs/maker";

const HEADING = /^(INT\.?\/EXT\.?|EXT\.?\/INT\.?|I\/E\.?|INT\.|EXT\.)\s*/i;

/** A character cue: a short line in capitals, optionally with (V.O.) or (CONT'D). */
function isCue(line: string) {
  if (line.length > 40 || !/[A-Z]/.test(line) || line !== line.toUpperCase()) return false;
  if (/[.!?:]$/.test(line.replace(/\([^)]*\)\s*$/, "").trim())) return false;
  return line.split(/\s+/).length <= 5;
}

/**
 * The plain reading of a script. A line starting INT. or EXT. is a scene heading; a short line in capitals is a
 * character cue and the next line its dialogue; anything else is action, one block per paragraph. Scenes are
 * numbered in order. A script with no heading is one scene.
 */
export function parseScript(text: string): Block[] {
  const blocks: Block[] = [];
  let scene = 0;
  let action: string[] = [];
  let n = 0;
  const id = (p: string) => `${p}${++n}`;
  const flush = () => {
    if (!action.length) return;
    const t = action.join(" ");
    blocks.push({ id: id("a"), kind: "action", text: t, rewrite: t });
    action = [];
  };
  const lines = text.replace(/\r\n?/g, "\n").split("\n").map((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      flush();
      continue;
    }
    if (HEADING.test(line)) {
      flush();
      blocks.push({ id: id("h"), kind: "heading", number: ++scene, text: line.toUpperCase() });
      continue;
    }
    const next = lines[i + 1];
    if (isCue(line) && next) {
      flush();
      // A parenthetical under the cue belongs to the line that follows it.
      let j = i + 1;
      const said: string[] = [];
      while (j < lines.length && lines[j]) {
        said.push(lines[j]);
        j++;
        if (!lines[j - 1].startsWith("(")) break;
      }
      const t = said.join(" ");
      blocks.push({ id: id("d"), kind: "dialogue", cue: line, text: t, rewrite: t });
      i = j - 1;
      continue;
    }
    action.push(line);
  }
  flush();
  if (!blocks.some((b) => b.kind === "heading")) blocks.unshift({ id: "h0", kind: "heading", number: 1, text: "SCENE 1" });
  return blocks;
}

/** Final Draft files are XML: each paragraph's type and text, written back out as plain script lines. */
export function fdxToText(xml: string) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const out: string[] = [];
  for (const p of Array.from(doc.getElementsByTagName("Paragraph"))) {
    const type = p.getAttribute("Type") ?? "Action";
    const t = (p.textContent ?? "").replace(/\s+/g, " ").trim();
    if (!t) continue;
    if (type === "Scene Heading" || type === "Character") out.push("", t.toUpperCase());
    else if (type === "Dialogue" || type === "Parenthetical") out.push(t);
    else out.push("", t, "");
  }
  return out.join("\n");
}

/** The first words of a passage, as a generation's summary. */
function firstWords(text: string, n = 7) {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length > n ? `${words.slice(0, n).join(" ")}...` : words.join(" ");
}

export type Gen = { n: number; block: string; summary: string; takes: Take[]; decision?: "approved" | "denied" };

/** One generation per action or dialogue block, up to six. */
export function generationsFor(blocks: Block[], approved: boolean): Gen[] {
  return blocks
    .filter((b): b is Extract<Block, { kind: "action" | "dialogue" }> => b.kind === "action" || b.kind === "dialogue")
    .slice(0, clips.length)
    .map((b, i) => ({
      n: i + 1,
      block: b.id,
      summary: b.kind === "dialogue" ? `${b.cue}: ${firstWords(b.text, 5)}` : firstWords(b.text),
      takes: [clips[i]],
      decision: approved ? "approved" : undefined,
    }));
}
