/** Match the screenplay's characters, locations and props to the series' cast sheets. Sent after METHOD (method.ts). */

export const MATCH_CAST = `TASK: Match who and what the screenplay needs to the series' cast sheets.

You get the screenplay as JSON passages and the series' cast sheets as a list: id, character, variant (an episode
or outfit label, may be empty) and tag (an element id such as @chloe_ep01).

Find every character who appears or speaks, every location (from the scene headings and action), and every prop
that a shot depends on (something handed over, read, worn as a plot point). Then for each:
- matches: it has one or more sheets. Use the sheet whose variant fits this episode or scene. "sure" is false when
  you matched on a likely alias or a near name rather than the exact name or tag.
- unmatched: no sheet fits. Say in "note" what sheet would be needed, e.g. "Elena, evening gown, no sheet".
- conflicts: more than one sheet could apply and the script does not settle it, or the script describes the person
  differently from the sheet (another outfit, a different age). Write the question a person answers, e.g. "Which
  outfit does Chloe wear in scene 2?", and the options as sheet tags or short choices.

Characters a speaker cue names in V.O. still need a sheet only if they are seen. A name matches regardless of case,
titles or a surname alone. Never invent a sheet id: use only ids from the list. List the passage ids each entry
concerns.`;
