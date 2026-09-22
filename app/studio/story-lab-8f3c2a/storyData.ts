export type Clip = { id: string; title: string; url: string };
export type Chapter = { id: string; number: string; title: string; summary: string; story: string; kind: "episode" | "draft"; x: number; y: number; clips: Clip[]; poster?: string; mediaStatus?: string; choices: { label: string; to: string; draft?: boolean }[] };
export const seriesTitle = "Heart of the Gray Winter";
export const sourceUrl = "https://app.notion.com/p/3cebe2fe78408167a6bacd1b2f5856bc";
// Original episode summaries follow the Notion script. Alternate outcomes are unapproved proposals.
// Local media: Pilot V06, Part 02 V05, Part 03 v3. Episode 04 is a script continuation.
export const chapters: Chapter[] = [
  {
    "id": "winter-1",
    "number": "01",
    "title": "The Encounter",
    "summary": "The village turns its back. A stranger blocks the way home.",
    "story": "Claire carries firewood through a winter that has already taken her family and her community. When the forest falls silent, Kalore steps into her path. She knows the rule: running feeds a Graygore's hunger for fear.",
    "kind": "episode",
    "x": 0,
    "y": 80,
    "clips": [
      {
        "id": "final-1",
        "title": "Full episode",
        "url": "/story-lab/gray-winter/episode-1.mp4"
      }
    ],
    "choices": [
      {
        "label": "Stand her ground",
        "to": "winter-2"
      },
      {
        "label": "Run into the forest",
        "to": "run",
        "draft": true
      }
    ],
    "poster": "/story-lab/gray-winter/episode-1.jpg",
    "mediaStatus": "Final edit"
  },
  {
    "id": "winter-2",
    "number": "02",
    "title": "The Scent of Defiance",
    "summary": "Kalore finds no fear to feed on. He leaves a mark.",
    "story": "Claire stands her ground while Kalore searches for terror and finds only exhaustion. Fascinated by her defiance, he presses a fingertip to her neck and leaves the Shadow-Kiss. He vanishes; she collapses beside her firewood, clutching the mark.",
    "kind": "episode",
    "x": 440,
    "y": 80,
    "clips": [
      {
        "id": "final-2",
        "title": "Full episode",
        "url": "/story-lab/gray-winter/episode-2.mp4"
      }
    ],
    "choices": [
      {
        "label": "Ask the village for help",
        "to": "winter-3"
      },
      {
        "label": "Seek Kalore instead",
        "to": "seek",
        "draft": true
      }
    ],
    "poster": "/story-lab/gray-winter/episode-2.jpg?v=2",
    "mediaStatus": "Final edit"
  },
  {
    "id": "winter-3",
    "number": "03",
    "title": "The Cruel Village",
    "summary": "The mark turns Claire from an outcast into a threat.",
    "story": "The villagers recognize the Shadow-Kiss and shut their doors. Claire begs the Elder for rations, but he refuses. She returns to her freezing cabin. That night the wind stops, and something heavy lands on the roof: the mark has drawn the Gaunts.",
    "kind": "episode",
    "x": 880,
    "y": 80,
    "clips": [
      {
        "id": "final-3",
        "title": "Full episode",
        "url": "/story-lab/gray-winter/episode-3.mp4"
      }
    ],
    "choices": [
      {
        "label": "Take the iron poker",
        "to": "winter-4"
      },
      {
        "label": "Slip out the back",
        "to": "escape",
        "draft": true
      }
    ],
    "poster": "/story-lab/gray-winter/episode-3.jpg?v=2",
    "mediaStatus": "Final edit"
  },
  {
    "id": "winter-4",
    "number": "04",
    "title": "The Nightmare at the Door",
    "summary": "Iron burns the Gaunt. It doesn't stop it.",
    "story": "Claire takes an iron poker as claws tear through her roof. A Gaunt drops into the cabin. Her blow burns its arm, but it throws her against the wall. As it prepares to strike, a freezing shockwave destroys the front door. The identity of the arrival is the cliffhanger.",
    "kind": "episode",
    "x": 1320,
    "y": 80,
    "clips": [],
    "choices": [],
    "mediaStatus": "Script"
  },
  {
    "id": "run",
    "number": "01B",
    "title": "Fear leaves a trail",
    "summary": "Her flight gives Kalore the fear he couldn't find.",
    "story": "Claire drops the firewood and runs. Fear replaces her exhausted stillness. Kalore follows, and she reaches the frozen ravine with no warmth and no clear way across.",
    "kind": "draft",
    "x": 440,
    "y": 560,
    "clips": [],
    "choices": [
      {
        "label": "Turn and face him",
        "to": "bargain",
        "draft": true
      },
      {
        "label": "Cross the frozen ravine",
        "to": "ravine",
        "draft": true
      }
    ]
  },
  {
    "id": "seek",
    "number": "02B",
    "title": "Follow the shadow",
    "summary": "Claire avoids the village and searches for the one who marked her.",
    "story": "Claire follows Kalore's tracks rather than showing the Shadow-Kiss to the Elder. The trail fades at the tree line. She calls for him and demands shelter in return for the danger his mark has brought. Their bargain begins before the village rejection.",
    "kind": "draft",
    "x": 880,
    "y": 560,
    "clips": [],
    "choices": []
  },
  {
    "id": "escape",
    "number": "03B",
    "title": "Out into the cold",
    "summary": "The cabin stays behind. The mark comes with her.",
    "story": "Claire slips through the rear shutter as the roof begins to split. She avoids the first attack but leaves the iron poker behind. The Gaunts follow the mark into the snow. She must reach the village gate before the pack catches her.",
    "kind": "draft",
    "x": 1320,
    "y": 560,
    "clips": [],
    "choices": [
      {
        "label": "Go to the village gate",
        "to": "gate",
        "draft": true
      }
    ]
  },
  {
    "id": "bargain",
    "number": "01B.1",
    "title": "A bargain before the mark",
    "summary": "Claire offers terms instead of terror.",
    "story": "Claire stops at the ravine and tells Kalore that taking her life will buy him little. She offers to enter his manor willingly if he protects her from the winter. This opens a different relationship: a negotiated bargain, without the village's discovery of the Shadow-Kiss.",
    "kind": "draft",
    "x": 880,
    "y": 1040,
    "clips": [],
    "choices": []
  },
  {
    "id": "ravine",
    "number": "01B.2",
    "title": "The ice gives way",
    "summary": "Escape costs her the way home.",
    "story": "Claire attempts the crossing. Thin ice breaks beneath her and Kalore pulls her free. She survives because he intervenes, but wakes in his manor before she can choose to trust him.",
    "kind": "draft",
    "x": 880,
    "y": 1520,
    "clips": [],
    "choices": []
  },
  {
    "id": "gate",
    "number": "03B.1",
    "title": "A village forced to choose",
    "summary": "Now the danger stands at everyone's door.",
    "story": "Claire reaches the barred gate with the Gaunts close behind. The Elder must decide whether to admit the woman he rejected or leave her outside with the creatures. The village becomes part of the immediate danger rather than remaining safely offscreen.",
    "kind": "draft",
    "x": 1760,
    "y": 1040,
    "clips": [],
    "choices": []
  }
];
