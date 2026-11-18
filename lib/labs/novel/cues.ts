/**
 * Sound for "After Hours". The package defines music per scene in the story data; it supplies the sound
 * cues as files only, so this file places them. A cue fires when the line at that place in the scene
 * (its index in `scene.lines`) is shown. Rain plays under the scenes that are out in it or beside it.
 */
const S = "/labs/visual-novel/after-hours/sfx";

export const sfx = {
  chime: `${S}/door-chime.mp3`,
  phone: `${S}/phone-buzz.mp3`,
  stairs: `${S}/stairs.mp3`,
  train: `${S}/train.mp3`,
  birds: `${S}/birds-dawn.mp3`,
  oven: `${S}/oven-door.mp3`,
  strum: `${S}/guitar-strum.mp3`,
  choice: `${S}/choice.mp3`,
  rain: `${S}/rain-loop.mp3`,
};

/** `scene:line` to a sound file. */
export const cues: Record<string, string> = {
  "p1-store:0": sfx.chime,
  "p2-shelter:0": sfx.chime,
  "p3-break:0": sfx.chime,
  "p3-break:16": sfx.train,
  "nurse-1:5": sfx.phone,
  "nurse-2:13": sfx.phone,
  "nurse-3:0": sfx.phone,
  "nurse-3:13": sfx.phone,
  "busker-1:11": sfx.strum,
  "busker-1:13": sfx.train,
  "busker-2:14": sfx.strum,
  "busker-2:19": sfx.train,
  "busker-3:0": sfx.phone,
  "busker-4:13": sfx.train,
  "busker-4:15": sfx.strum,
  "busker-end-good:9": sfx.strum,
  "baker-1:0": sfx.oven,
  "baker-4:0": sfx.oven,
  "call:0": sfx.phone,
  "stairs:2": sfx.stairs,
  "roof:0": sfx.birds,
  "roof:9": sfx.phone,
  "end-ten:10": sfx.train,
  "end-ten:11": sfx.phone,
  "end-counter:0": sfx.chime,
  "end-stay:0": sfx.chime,
};

/** Rain level under a scene, 0 to 1: softer indoors, fuller outside. One loop, never two. */
export const rain: Record<string, number> = {
  "p1-store": 0.35,
  "p2-shelter": 0.45,
  "p3-break": 0.35,
  "p4-choose": 0.7,
  "nurse-1": 0.7,
  "nurse-2": 0.7,
  "nurse-3": 0.65,
  "nurse-4": 0.6,
  "nurse-5": 0.45,
  "busker-1": 0.7,
  "busker-2": 0.7,
  "busker-3": 0.65,
  "busker-4": 0.6,
  "busker-5": 0.45,
  "baker-1": 0.25,
  "baker-2": 0.25,
  "baker-3": 0.2,
  "baker-4": 0.2,
  practice: 0.35,
  "practice-after": 0.3,
  call: 0.3,
  "after-call": 0.3,
  stairs: 0.4,
};

/** The declared loop length of each music file, so a decoded loop ends on the beat and not on encoder padding. */
export const loopSeconds: Record<string, number> = { "dawn.mp3": 60, "rain-loop.mp3": 30 };
export const defaultLoop = 64;
