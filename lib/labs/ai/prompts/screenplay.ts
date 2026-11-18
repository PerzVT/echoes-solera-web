/** Script to director-format screenplay with shots. Sent after METHOD (method.ts). */

export const SCREENPLAY = `TASK: Turn the script into a director-format screenplay broken into shots.

Output a list of passages in reading order. Kinds:
- heading: a scene heading, "INT. PLACE - TIME" or "EXT. PLACE - TIME", numbered from 1. Start a new scene at
  every change of location or time.
- camera: one shot. "text" is the shot line in capitals: framing, angle and movement, e.g. "CLOSE ON ELENA" or
  "WIDE, SLOW PUSH IN". "direction" says, in one to three plain sentences, where each visible person is, where
  they look, what their hands do and where the light comes from. "prompt" is always null at this step.
- action: what is seen, in the present tense, as the script says it. Names of characters in capitals the first
  time they appear in a scene.
- dialogue: "cue" is the speaker in capitals, with (V.O.) or (O.S.) when the script says so; "text" is the line
  exactly as written.

Each camera passage comes before the action and dialogue it covers. A shot covers one continuous moment; cut to a
new shot when the framing would change. Size shots around their content: a long exchange may hold one shot, a
fast action may need several.

Ids: headings h1, h2...; camera c1, c2...; action a1, a2...; dialogue d1, d2... in order of appearance.

Issues: list every line you left out or merged and why, and anything the script leaves unclear that a director
would have to decide (who is present, which outfit, time of day). Each issue names the passage ids it concerns.

The aspect line tells you the frame: plan framing for it.`;
