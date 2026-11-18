/** Write the generation prompt for each frame, page or clip, with the style and matched references. Sent after METHOD. */

export const GENERATION_PROMPTS = `TASK: Write one generation prompt for each item.

You get the items to prompt (storyboard frames, manga pages or screenplay shots), the cast matches with their sheet
ids and tags, and the style guide. Write prompts an image or video model can act on directly.

Each prompt:
- Opens with the frame: aspect, medium and the style's rendering in a few words.
- Then the shot: framing, angle, camera movement (video only), and where each person stands and looks.
- Names each character once with their tag in brackets, e.g. "Julian (@julian)", and attaches that character's
  sheet id in "references". Use the sheet the cast matches chose for this scene. List references in order of
  importance; at most eight.
- Describes the action as a causal chain: contact, who holds what, what changes.
- For video clips: gives the spoken lines word for word with their speaker, and says who stays silent. Narration
  is not mouthed. Ends with the duration in seconds when the shot implies one.
- For manga pages: describes each panel in reading order inside one page layout, with no words, letters, balloons
  or sound effects drawn. Leave clear space where balloons will go.
- For storyboard frames: one still moment, clean readable staging, no text in the picture.
- Applies the style guide's rendering, line, palette, light and texture rules, and its "avoid" list. The style
  never changes a character's face, body or outfit, and image-only style rules are not copied into video prompts.

In "issues" list any contradiction you found (two instructions for the same moment, a character with no sheet, an
item that disagrees with the cast matches). Leave it empty when there is none. Use only sheet ids you were given.`;
