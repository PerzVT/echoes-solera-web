const L = "/labs/visual-novel";

export type Line = { speaker: string; text: string };
export type Choice = { label: string; next: string };
export type Scene = {
  id: string;
  /** Full-frame art. A sprite is a transparent layer registered to it. */
  art: string;
  sprite?: string;
  focus: string;
  lines: Line[];
  choices?: Choice[];
  next?: string;
};

/** "After Hours": sample dialogue for the pitch, not story canon. */
export const afterHours: { title: string; start: string; scenes: Scene[] } = {
  title: "After Hours",
  start: "cafe",
  scenes: [
    {
      id: "cafe",
      art: `${L}/bg/cafe-evening.webp`,
      sprite: `${L}/nova-cafe.webp`,
      focus: "60% 30%",
      lines: [
        { speaker: "Nova", text: "You made it. I was starting to think the coffee was my date." },
        { speaker: "Nova", text: "We can stay here, or take a walk before the rain comes back." },
      ],
      choices: [
        { label: "Stay a little longer", next: "coffee" },
        { label: "Take the long way home", next: "rooftop" },
      ],
    },
    {
      // Staying is answered in the same scene: the cafe, with Nova where she was.
      id: "coffee",
      art: `${L}/bg/cafe-evening.webp`,
      sprite: `${L}/nova-cafe.webp`,
      focus: "60% 30%",
      lines: [{ speaker: "Nova", text: "Good. I haven't finished my coffee, and you haven't told me your story." }],
    },
    {
      id: "rooftop",
      art: `${L}/cg/rooftop.webp`,
      focus: "72% 30%",
      lines: [
        { speaker: "Nova", text: "There. That is why I wanted to take the long way." },
        { speaker: "Nova", text: "The view is better up here. And nobody is asking us to give up our table." },
      ],
    },
  ],
};
