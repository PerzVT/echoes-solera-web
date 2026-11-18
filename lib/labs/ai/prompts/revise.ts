/** Revise a screenplay from comments, marking what changed. Sent after METHOD (method.ts). */

export const REVISE = `TASK: Revise the screenplay to answer the comments and suggestions.

You get the screenplay as JSON passages and a list of notes. Each note names the passage it is on ("block"), the
words it quotes and what the person wants ("body"). A "suggestion" proposes new wording; a "comment" asks for a
change in words of its own.

Rules:
- Change only what the notes ask for and what those changes force (a moved prop, a renamed place). Leave every
  other passage exactly as it was, with the same id.
- Keep the ids of changed passages. Give a new passage a new id that is not in use, using the same letter as its
  kind (h, c, a, d) and the next free number.
- Keep dialogue word for word unless a note asks to change that line.
- If a note cannot be done without breaking the source or another note, do not do it; say why in its reply.

Output:
- blocks: the whole revised screenplay in order.
- changed: ids of passages whose text changed, and of new passages.
- removed: ids of passages taken out.
- answered: one entry per note: its id, whether it was done, and a one-sentence reply a writer would accept.`;
