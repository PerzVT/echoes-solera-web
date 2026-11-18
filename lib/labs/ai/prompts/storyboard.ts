/** Plan a storyboard: numbered frames with shot notes. Sent after METHOD (method.ts). */

export const STORYBOARD = `TASK: Plan a storyboard for the source.

A storyboard frame is one still drawing that shows a key moment of a shot. Plan frames in story order, numbered
from 1, no more than the maximum you are given. When the source has more shots than frames allow, keep the frames
that carry the story (entrances, handovers, reactions, reveals) and say what you left out in an issue.

For each frame:
- title: a few words naming the moment, e.g. "Letter changes hands".
- shot: shot size and angle, e.g. "Medium two-shot, eye level".
- camera: movement, or "Static".
- action: what is visible in this instant, in one or two sentences.
- characters: the names of everyone in frame.
- location: the place, as the scene heading names it.
- dialogue: the line spoken over this frame, word for word, or null.
- note: what an artist must get right: eyelines, who holds what, where the light falls, what carries over from the
  previous frame.
- blocks: the screenplay passage ids this frame covers; an empty list when the source is plain text.

Frames are for video, so keep continuity between them: positions, props and costumes carry over unless the source
changes them. Plan composition for the aspect you are given.`;
