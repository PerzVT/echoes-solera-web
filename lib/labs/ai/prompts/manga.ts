/** Plan manga pages: panels, dialogue, narration and sound effects as data. Sent after METHOD (method.ts). */

export const MANGA = `TASK: Plan manga pages for the source.

Plan pages in order, numbered from 1, no more than the maximum you are given. A page usually holds three to six
panels; a full-page panel is for a reveal or a turning point. Read in the direction you are given (rtl is
right-to-left, as in Japanese manga). If the story needs more pages than allowed, compress quiet beats, never
dialogue, and list what you compressed as an issue.

For each page: "layout" describes the panel grid in one sentence (e.g. "Three tiers; wide top panel, two small
middle panels, tall bottom panel").

For each panel:
- size: full, large, medium or small.
- shot: shot size and angle.
- art: what the artist draws. Never include words, letters, balloons or sound-effect lettering here: lettering is
  added later on top of the art.
- characters: the names of everyone drawn.
- speech: each balloon in reading order, with the speaker, the line word for word, and its style (speech,
  thought, whisper, shout).
- narration: caption boxes, word for word from the source's narration.
- sfx: sound effects as the letterer writes them (e.g. "KRAK", "ba-dump") with a note on what makes the sound.

Do not overload a panel: more than about 25 words of speech means split the moment across panels.`;
