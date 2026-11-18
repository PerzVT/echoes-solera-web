/**
 * What is added around a person's prompt before it goes to the image model, by purpose. The prompt itself is
 * usually written by the prompts job (generation.ts) or edited by a person.
 */

/** Said first when reference pictures are attached, in the order they are sent. */
export const referenceLine = (tags: string[]) =>
  `Reference pictures are attached in this order: ${tags.join(", ")}. Each character sheet fixes that character's face, ` +
  `body, hair and costume construction; match them exactly. Use the references for identity only, never copy their ` +
  `layout, background or turnaround poses.`;

export const IMAGE_FRAMES: Record<"storyboard-frame" | "manga-page" | "cast-sheet", { before: string; after: string }> = {
  "storyboard-frame": {
    before: "A single storyboard frame: one still moment from a shot, staged clearly so the action reads at a glance.",
    after: "No text, captions, frame numbers or watermarks anywhere in the picture.",
  },
  "manga-page": {
    before: "One finished manga page of panels in the layout described, drawn as black-and-white manga art unless the style says otherwise.",
    after:
      "Draw no lettering at all: no words, letters, speech balloons, captions or sound-effect lettering. Leave clear, " +
      "uncluttered space where balloons will be placed later.",
  },
  "cast-sheet": {
    before:
      "A character reference sheet on a plain light background: the same character shown full body from the front, the " +
      "side and the back, with a close-up of the face, all at the same scale and in the same outfit.",
    after: "No text, labels, colour swatches or watermarks. Even, neutral light so the costume and colours read accurately.",
  },
};
