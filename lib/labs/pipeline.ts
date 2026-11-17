/* Text from the prompter feature deck (prompter-features.json), reworded for a visitor. Do not add claims here. */

export type Surface = "Script" | "Screenplay" | "References" | "Results" | "Style hub";
export type Chapter = { slug: string; title: string; intro: string };
export type PipelineFunction = {
  slug: string;
  chapter: string;
  title: string;
  purpose: string;
  input: string;
  process: string;
  output: string;
  checks: string[];
  example: string;
  ui: string;
  surface: Surface;
};

export const chapters: Chapter[] = [
  {
    "slug": "understand-the-source",
    "title": "Understand the source",
    "intro": "Read the whole episode before deciding what to generate."
  },
  {
    "slug": "handle-references-precisely",
    "title": "Handle references precisely",
    "intro": "An attached image has a job. The prompter must know which facts it controls."
  },
  {
    "slug": "resolve-space-and-continuity",
    "title": "Resolve space and continuity",
    "intro": "Spatial correction is a planning and prompt check. It is not an automatic repair of broken video."
  },
  {
    "slug": "direct-performance-and-image",
    "title": "Direct performance and image",
    "intro": "Turn broad adjectives into visible, scene-specific direction."
  },
  {
    "slug": "make-the-action-filmable",
    "title": "Make the action filmable",
    "intro": "Speech, physical action and cuts must fit together."
  },
  {
    "slug": "choose-style-then-compile",
    "title": "Choose a style, then write the prompt",
    "intro": "Shared style tools should supply consistent direction without overriding story or identity."
  },
  {
    "slug": "what-autorun-adds",
    "title": "What the automatic run adds",
    "intro": "Autorun is the production controller around the prompter. It does not make creative failures disappear."
  },
  {
    "slug": "review-harvest-carry-forward",
    "title": "Review, save frames, carry forward",
    "intro": "What happened in the accepted footage matters more than what the prompt intended."
  }
];

export const functions: PipelineFunction[] = [
  {
    "slug": "source-resolution",
    "chapter": "understand-the-source",
    "title": "Find the right script",
    "purpose": "Work from the right script and the right series.",
    "input": "Episode request, current script, series bible and saved progress.",
    "process": "Resolve the complete source and its revision. Reuse the configured project instead of asking for context already available.",
    "output": "A source snapshot and selected project context.",
    "checks": [
      "Conflicting revisions",
      "A script that only partly loaded",
      "A synopsis mistaken for the full script"
    ],
    "example": "A catalogue description cannot supply missing dialogue. Retrieve the episode before planning it.",
    "ui": "The script editor, with a link to the source. If two sources disagree, it asks once.",
    "surface": "Script"
  },
  {
    "slug": "story-coverage-and-scene-planning",
    "chapter": "understand-the-source",
    "title": "Plan the scenes",
    "purpose": "Keep the story intact while making it producible.",
    "input": "Required actions, dialogue, narration, location and time changes.",
    "process": "Map beats to scenes and shots. Split at a location/time change, provider limit or fragile action. Size coverage around the content.",
    "output": "An ordered production map with source-to-scene links and dependencies.",
    "checks": [
      "Missing or repeated lines",
      "Lines left out without approval",
      "Rushed endings",
      "Shots all cut to one length for no reason"
    ],
    "example": "A difficult handoff can be isolated without losing the dialogue before and after it.",
    "ui": "The screenplay and its scene outline. Changes to the source show only when they matter.",
    "surface": "Screenplay"
  },
  {
    "slug": "reference-discovery-and-binding",
    "chapter": "handle-references-precisely",
    "title": "Pick the right reference images",
    "purpose": "Attach the correct evidence to the current scene.",
    "input": "Approved assets, the views needed, scene map and future harvest needs.",
    "process": "Inspect content, not just filenames. Resolve each tag to an asset version, its place in the request and what it controls. Attach only relevant inputs.",
    "output": "A verified reference map and a list of actual gaps.",
    "checks": [
      "The wrong person, outfit or angle",
      "Images that cannot be found",
      "Two images giving opposite instructions",
      "Planned frames that do not yet exist"
    ],
    "example": "A room plate controls geography. A style image does not get to change the character's face.",
    "ui": "The references screen, each image labelled with its job, and one list of what is missing.",
    "surface": "References"
  },
  {
    "slug": "cast-wardrobe-and-scene-state",
    "chapter": "handle-references-precisely",
    "title": "Keep the cast and costumes consistent",
    "purpose": "Reuse established characters without resetting them every scene.",
    "input": "Cast sheets, approved outfit variants, body states and accepted continuity.",
    "process": "Resolve the intended identity and outfit. Carry temporary states such as wet sleeves separately from permanent character identity.",
    "output": "The exact cast/outfit/state assignment for each appearance.",
    "checks": [
      "Costumes nobody approved",
            "A character who changes between scenes"
    ],
    "example": "The scene calls for a coat, but only the dress reference is ready. Ask which approved coat to use or prepare a scoped asset request.",
    "ui": "The cast library, with an outfit choice that can apply to one scene.",
    "surface": "References"
  },
  {
    "slug": "spatial-staging-and-geometry-checks",
    "chapter": "resolve-space-and-continuity",
    "title": "Check the room, camera and positions",
    "purpose": "Make the room, camera and people agree.",
    "input": "Location map/plate, character stations, action axis, camera and light positions.",
    "process": "Derive screen placement from fixed world positions for each camera. Check facing, gaze, distance, depth, occlusion and reverse angles separately.",
    "output": "Coherent shot staging and corrected instructions where the plan contradicts itself.",
    "checks": [
      "Teleporting actors",
      "Swapped positions",
      "Impossible views",
      "Moving doorways",
      "Lights that change world position"
    ],
    "example": "A reverse angle may put the window on the other side of the image. The window has not moved in the room.",
    "ui": "A small scene map, with any problem shown beside the shot it affects.",
    "surface": "Screenplay"
  },
  {
    "slug": "occupancy-and-continuity-ledger",
    "chapter": "resolve-space-and-continuity",
    "title": "Remember who is where",
    "purpose": "Remember what is still true, including what is offscreen.",
    "input": "Scene roster, accepted prior output, retained trim and intended next action.",
    "process": "Track presence/exits, hands, props, clothing, injuries, doors, light and completed speech. Compare required entry against accepted exit.",
    "output": "A scene-state handoff and unresolved differences.",
    "checks": [
      "Silent actors disappearing",
      "Completed actions repeating",
      "Props changing hands without cause",
      "Planned events treated as if they happened"
    ],
    "example": "A silent witness remains in the room during a close-up. Not seeing them does not mean they left.",
    "ui": "A continuity panel that shows only what has changed.",
    "surface": "References"
  },
  {
    "slug": "acting-and-attention",
    "chapter": "direct-performance-and-image",
    "title": "Direct the acting",
    "purpose": "Make each character respond rather than merely pose.",
    "input": "Approved behavior profile, scene objective, partner, obstacle and dialogue.",
    "process": "Express tactics, listening, pauses, eye targets, physical business and a triggered change. Adapt the profile to the present posture.",
    "output": "Performance instructions tied to each visible character and beat.",
    "checks": [
      "Moods named but not shown",
      "Frozen listening faces",
      "Identical group reactions",
      "Behavior that contradicts the character"
    ],
    "example": "Moonflower's prompt directs attention from callus to fingertip, then a testing breath and decision. That is more actionable than \"suspicious.\"",
    "ui": "Direction notes on each scene, with the reasoning one click away.",
    "surface": "Screenplay"
  },
  {
    "slug": "camera-light-and-composition",
    "chapter": "direct-performance-and-image",
    "title": "Set the camera and the light",
    "purpose": "Control what the viewer notices and why.",
    "input": "Story beat, framing format, location, style and performance priority.",
    "process": "Choose framing, depth, focus, purposeful movement and physical lighting/exposure. Describe camera movement separately from subject motion.",
    "output": "A shot with photographic intent, not a list of camera terms.",
    "checks": [
      "Conflicting motion",
      "Camera angles that cannot both be true",
      "Generic beauty lighting",
      "Detail that competes with the story"
    ],
    "example": "Hands occupy the foreground while eyes remain sharp above them; exposure can favor fabric and stone rather than evenly lighting every face.",
    "ui": "The shot description inside the screenplay, with a reference preview.",
    "surface": "Screenplay"
  },
  {
    "slug": "dialogue-narration-and-sound",
    "chapter": "make-the-action-filmable",
    "title": "Place the dialogue and sound",
    "purpose": "Put exact words in the correct mouth and moment.",
    "input": "Original dialogue/VO/text, voice profile and scene sound intent.",
    "process": "Assign each payload to its owning beat. Separate narration from visible speech, preserve supplied wording and make music intentional.",
    "output": "Timed speaker/voice instructions and causal sound direction.",
    "checks": [
      "Lips moving when no one speaks",
      "Paraphrased lines",
      "Sound that drowns out the lines",
      "More speech than the scene can hold"
    ],
    "example": "Narration plays over a silent character's action; the character must not mouth the narrator's words.",
    "ui": "Dialogue and sound cues in the screenplay, with the prompt one click away.",
    "surface": "Screenplay"
  },
  {
    "slug": "physical-action-and-contact",
    "chapter": "make-the-action-filmable",
    "title": "Make physical action believable",
    "purpose": "Explain the mechanics behind a visible action.",
    "input": "Hands, support surfaces, props, material, weight and movement.",
    "process": "Specify contact, ownership, resistance, weight transfer and resulting state. Isolate a fragile interaction when that improves control.",
    "output": "A causal action chain and targeted constraints.",
    "checks": [
      "Floating bodies",
      "Passing through surfaces",
      "Teleporting objects",
      "Impossible grips",
      "Liquid that behaves oddly"
    ],
    "example": "A cup transfers only after the receiver grips it. The next shot starts with the correct person holding it.",
    "ui": "Action notes and any missing references on the shot they affect.",
    "surface": "Screenplay"
  },
  {
    "slug": "cuts-resolution-and-edit-handles",
    "chapter": "make-the-action-filmable",
    "title": "Leave room for the edit",
    "purpose": "Give the editor usable boundaries.",
    "input": "Outgoing event/line, next opening, intended transition and duration budget.",
    "process": "Plan the seam before generation. Finish the action and reaction; leave usable footage around the cut. Update planned trims from accepted footage.",
    "output": "Transition plan and retained in/out points.",
    "checks": [
      "Rushed final lines",
      "Repeated openings",
      "Continuity broken by trimming",
      "A new scene forced to use an unrelated start frame"
    ],
    "example": "Keep the reaction after a revelation instead of cutting the clip at the last spoken syllable.",
    "ui": "Scene boundaries and trim controls on the results screen.",
    "surface": "Results"
  },
  {
    "slug": "style-selection-and-scoped-guidance",
    "chapter": "choose-style-then-compile",
    "title": "Choose the visual style",
    "purpose": "Use the right visual rules for the medium.",
    "input": "Project style guide, approved visual chart, medium and applicable modules.",
    "process": "Select relevant treatment; check for conflicts with identity, staging and medium. Keep anime, photoreal and specialist cooking guidance scoped.",
    "output": "A coherent style contribution to the prompt.",
    "checks": [
      "Two styles pulling against each other",
      "Image-only instructions copied into video"
    ],
    "example": "Solera's image guide uses cel-shading language; its video guide has different instructions. One unfiltered text block is not a safe shared preset.",
    "ui": "The Style hub, where a series pins one style version and a new style is built or imported.",
    "surface": "Style hub"
  },
  {
    "slug": "prompt-assembly-and-coherence-review",
    "chapter": "choose-style-then-compile",
    "title": "Write the prompt and check it",
    "purpose": "Compile all decisions into one usable generation request.",
    "input": "Scene plan, exact references, performance, style, state and settings.",
    "process": "Write only the current generation's active context. Put speech and constraints beside the action they govern. Recheck after edits against the same inputs.",
    "output": "Versioned prompt, resolved references, settings and review conclusions.",
    "checks": [
      "Instructions that contradict each other",
      "Missing source beats",
      "A description that contradicts the first frame",
      "An old review kept after the prompt changed"
    ],
    "example": "\"Keep the hand on the latch\" cannot coexist with \"both hands stay at her sides\" for the same moment.",
    "ui": "Show prompt, with specific issues rather than a quality score.",
    "surface": "Screenplay"
  },
  {
    "slug": "scope-and-dependency-control",
    "chapter": "what-autorun-adds",
    "title": "Run only what is ready",
    "purpose": "Advance only when the next part is ready and authorized.",
    "input": "Selected run scope, production map, available references and project policy.",
    "process": "Save a finite attempt allowance. Resolve dependencies; pause for expanded scope, missing inputs or a required creative decision.",
    "output": "A resumable run with a clear next action.",
    "checks": [
      "Another episode starting silently",
      "A retry relabeled as a first attempt",
      "A missing continuity frame skipped"
    ],
    "example": "\"Run generation 3\" does not authorize generating 1 and 2 to manufacture its missing references.",
    "ui": "Run, pause and resume, with the decision that is waiting.",
    "surface": "Results"
  },
  {
    "slug": "submission-identity-and-recovery",
    "chapter": "what-autorun-adds",
    "title": "Never pay twice for one attempt",
    "purpose": "Recover the same attempt instead of spending twice.",
    "input": "Frozen payload, account/workspace, reference versions and one-use authorization.",
    "process": "Persist intent before dispatch and job ID after. Reconcile unknown submissions; retrieve by exact identity. Bound status polling and safe-read retries.",
    "output": "Recoverable attempt record with honest running, failed, blocked or unknown state.",
    "checks": [
      "The same job sent twice after a timeout",
      "An expired download treated as a failed clip",
      "A restart that resets the spending limit"
    ],
    "example": "If the connection drops after submission, check that attempt. Do not send a fresh one.",
    "ui": "A plain status and the choices that follow, with the details one click away.",
    "surface": "Results"
  },
  {
    "slug": "output-review-and-scoped-correction",
    "chapter": "review-harvest-carry-forward",
    "title": "Review the result, fix only what failed",
    "purpose": "Locate the defect without discarding what worked.",
    "input": "Exact output, source coverage, references and actual review evidence.",
    "process": "Inspect the full visual timeline with matching audio evidence. Classify missing beats, identity, geometry, performance and seams. Propose the smallest correction.",
    "output": "Evidence-backed issue and a scoped next action.",
    "checks": [
      "A few stills passed off as watching the whole clip",
      "Checks marked passed that never ran",
      "Runs repeated without permission"
    ],
    "example": "A missed final line prompts a targeted fix. It does not justify changing the cast, lighting and camera at once.",
    "ui": "The results player, with feedback aimed at the specific problem.",
    "surface": "Results"
  },
  {
    "slug": "native-frame-harvesting",
    "chapter": "review-harvest-carry-forward",
    "title": "Save frames from the footage",
    "purpose": "Turn accepted footage into trustworthy continuity references.",
    "input": "Selected original/final edit, retained trim and a named downstream need.",
    "process": "Extract an actual frame, inspect it and record its source/time/role. Bind it to the next scene only where its authority applies.",
    "output": "Native continuity frame and traceable handoff state.",
    "checks": [
      "Screenshots mistaken for real frames",
      "Discarded action carried forward",
      "An edited still labelled as a real frame"
    ],
    "example": "Harvest after the coat closes, if that moment survives the selected edit. The next part carries the closed coat.",
    "ui": "A frame picker on the results screen, with Use for continuity.",
    "surface": "Results"
  },
  {
    "slug": "change-propagation-and-production-memory",
    "chapter": "review-harvest-carry-forward",
    "title": "Track what a change affects",
    "purpose": "Know which later work an earlier change affects.",
    "input": "Accepted take, dependent frames, state records, later prompts and decisions.",
    "process": "Flag dependent references and unsubmitted prompts after a replacement. Recheck existing descendants; preserve history and scope recurring facts to the bible.",
    "output": "Affected-work list, updated state and verified progress.",
    "checks": [
      "Old saved frames reused",
      "Plans turned into story facts",
      "Approved work made again without asking"
    ],
    "example": "Replacing a take flags its downstream handoff. It does not buy another round of generations.",
    "ui": "A notice listing the affected scenes, and the history of decisions.",
    "surface": "Results"
  }
];

export const overview = {
  title: "From story to production",
  intro:
    "A video generator cannot film a written page. One tool, the prompter, turns the scene into directions it can act on. A second, autorun, looks after the work around each attempt.",
  halves: [
    {
      title: "Spell the scene out",
      text: "First the cast, the reference pictures, where everyone stands, the acting, the speech, the style and the cuts are decided. Then they are checked against each other.",
    },
    {
      title: "Keep track while it runs",
      text: "The exact pictures are attached and each attempt is sent once. If the connection drops, the same job is picked up again. Every decision is kept for the next scene.",
    },
  ],
};

const SC = "/labs/mini-series/second-chance";

/** A picture beside a step. Every image is real media from Second Chance at Your Heart; the caption names it. */
export type StepFigure =
  | { kind: "script"; text: string }
  | { kind: "sheets"; images: { src: string; alt: string }[]; caption: string }
  | { kind: "still"; src: string; alt: string; caption: string }
  | { kind: "clip"; src: string; poster: string; label: string; caption: string };

export type WalkStep = { slug: string; title: string; text: string[]; functions: string[]; figure?: StepFigure };

export const scene = "She closes the door, hands him the letter, then waits while he reads.";

export const hero = {
  clip: { src: `${SC}/episodes/6.mp4`, poster: `${SC}/episodes/6.webp`, label: "Second Chance at Your Heart, production clip" },
};

/** The deck's "One scene, end to end", one step per stage, with the functions each step calls on. */
export const steps: WalkStep[] = [
  {
    slug: "read-the-script",
    title: "Read the script",
    text: [
      "Before anything is planned, the whole episode is read, from the right script in its latest revision.",
      "No action in the scene is dropped. This one has three: she closes the door, hands him the letter, and waits.",
    ],
    functions: ["source-resolution", "story-coverage-and-scene-planning"],
    figure: { kind: "script", text: scene },
  },
  {
    slug: "match-the-references",
    title: "Match the references",
    text: [
      "Each thing the scene needs is matched to an approved sheet: her evening outfit, his face, the room and the letter. A file is judged by what it shows, not by what it is called.",
      "When an outfit has no sheet, the team is asked to choose one. Nobody guesses a costume.",
    ],
    functions: ["reference-discovery-and-binding", "cast-wardrobe-and-scene-state"],
    figure: {
      kind: "sheets",
      images: [
        { src: "/labs/app/sheets/chloe_ep01.webp", alt: "Character sheet: Chloe in her episode 1 outfit, front, side, back and face" },
        { src: "/labs/app/sheets/julian.webp", alt: "Character sheet: Julian in a dark suit, front, side, back and face" },
      ],
      caption: "Character sheets from Second Chance at Your Heart: Chloe and Julian.",
    },
  },
  {
    slug: "stage-the-room",
    title: "Stage the room",
    text: [
      "She starts at the door and he stays at the table. When the camera turns to the other side, both are still where they were. Which way each one faces, where they look and where they sit on screen are checked one at a time.",
      "This is a check of the plan and of the written directions. It does not repair a video that came out wrong.",
    ],
    functions: ["spatial-staging-and-geometry-checks", "occupancy-and-continuity-ledger"],
    figure: { kind: "still", src: `${SC}/episodes/6.webp`, alt: "She stands by the table while he sits at it", caption: "Second Chance at Your Heart, production clip." },
  },
  {
    slug: "direct-the-acting",
    title: "Direct the acting and the camera",
    text: [
      "She watches how he takes it. He pauses over the letter before he looks up. A broad word such as \"suspicious\" is turned into something the camera can see.",
      "The acting follows what the script intends. Anything new about a character has to be approved first.",
    ],
    functions: ["acting-and-attention", "camera-light-and-composition"],
    figure: { kind: "still", src: `${SC}/episodes/2.webp`, alt: "Two faces close together, she looks at him as he turns away", caption: "Second Chance at Your Heart, production clip." },
  },
  {
    slug: "plan-the-action",
    title: "Plan the action and the cut",
    text: [
      "The letter changes hands where the viewer can see it. The door stays closed. She stays in the room while she says nothing.",
      "The next shot is planned to find things this way. They only count as true once the footage shows them.",
    ],
    functions: ["dialogue-narration-and-sound", "physical-action-and-contact", "cuts-resolution-and-edit-handles"],
    figure: { kind: "still", src: `${SC}/episodes/1.webp`, alt: "A hand grips a wrist", caption: "Second Chance at Your Heart, production clip." },
  },
  {
    slug: "write-and-run",
    title: "Write the prompt and run it",
    text: [
      "The style is chosen, the exact pictures are attached, and the instructions are checked against each other. The attempt that was approved is saved and sent once.",
      "When one of the inputs changes, the checks that depend on it are run again.",
    ],
    functions: [
      "style-selection-and-scoped-guidance",
      "prompt-assembly-and-coherence-review",
      "scope-and-dependency-control",
      "submission-identity-and-recovery",
    ],
  },
  {
    slug: "review-the-take",
    title: "Review the take",
    text: [
      "The editor watches the take to see whether the handing over of the letter and his reading of it come across.",
      "If an action is missing, that is written down. Trying again needs its own approval.",
    ],
    functions: ["output-review-and-scoped-correction"],
    figure: {
      kind: "clip",
      src: `${SC}/episodes/7.mp4`,
      poster: `${SC}/episodes/7.webp`,
      label: "Second Chance at Your Heart, production clip",
      caption: "Second Chance at Your Heart, production clip.",
    },
  },
  {
    slug: "carry-it-forward",
    title: "Carry it forward",
    text: [
      "A real frame of him holding the letter becomes the reference picture for the next shot. The closed door and both people carry over with it.",
      "The work goes on only as far as the project's rules allow.",
    ],
    functions: ["native-frame-harvesting", "change-propagation-and-production-memory"],
    figure: { kind: "still", src: `${SC}/episodes/4.webp`, alt: "She looks at him, his face in profile", caption: "Second Chance at Your Heart, production clip." },
  },
];

/** Where each creator surface opens. The episode screens live under /app. */
export const surfaceHref: Record<Surface, string> = {
  Script: "/app/episode/script",
  Screenplay: "/app/episode/screenplay",
  References: "/app/episode/references",
  Results: "/app/episode/results",
  "Style hub": "/app/styles",
};

export function getFunction(slug: string) {
  return functions.find((f) => f.slug === slug);
}

export function getChapter(slug: string) {
  return chapters.find((c) => c.slug === slug);
}

/** The walk step that calls on a function. */
export function stepOf(slug: string) {
  return steps.find((s) => s.functions.includes(slug));
}

export function neighbours(slug: string) {
  const i = functions.findIndex((f) => f.slug === slug);
  return { prev: i > 0 ? functions[i - 1] : undefined, next: i < functions.length - 1 ? functions[i + 1] : undefined };
}
