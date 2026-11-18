import type { Story } from "../novel";

/**
 * "After Hours": one rainy night on one block, a shared opening and four routes (Juri, Ren, Mio,
 * Sota), 38 scenes and 12 endings. Imported from the Nine Lives dating v001 package; paths point at
 * public/labs/visual-novel/after-hours. Regenerate from the package rather than editing by hand.
 */
export const afterHours: Story = {
  "title": "After Hours",
  "blurb": "One rainy block. Four invitations. Choose whose night becomes yours. All four adult romances are open from the start.",
  "start": "p1-store",
  "cover": "/labs/visual-novel/after-hours/ui/title.webp",
  "cast": {
    "juri": {
      "name": "Juri Hoshino",
      "age": 24,
      "pronouns": "she/her",
      "color": "#FF9EC7",
      "poses": {
        "smirk": "/labs/visual-novel/after-hours/juri/smirk.webp",
        "laugh": "/labs/visual-novel/after-hours/juri/laugh.webp",
        "pout": "/labs/visual-novel/after-hours/juri/pout.webp",
        "serious": "/labs/visual-novel/after-hours/juri/serious.webp",
        "soft": "/labs/visual-novel/after-hours/juri/soft.webp"
      },
      "portrait": "/labs/visual-novel/after-hours/portrait/juri.webp"
    },
    "nurse": {
      "name": "Ren Kurose",
      "age": 28,
      "pronouns": "he/him",
      "color": "#9BBFEB",
      "poses": {
        "neutral": "/labs/visual-novel/after-hours/nurse/neutral.webp",
        "smile": "/labs/visual-novel/after-hours/nurse/smile.webp",
        "upset": "/labs/visual-novel/after-hours/nurse/upset.webp",
        "surprised": "/labs/visual-novel/after-hours/nurse/surprised.webp",
        "soft": "/labs/visual-novel/after-hours/nurse/soft.webp"
      },
      "portrait": "/labs/visual-novel/after-hours/portrait/nurse.webp"
    },
    "busker": {
      "name": "Mio Arata",
      "age": 21,
      "pronouns": "she/her",
      "color": "#FFBB79",
      "poses": {
        "neutral": "/labs/visual-novel/after-hours/busker/neutral.webp",
        "smile": "/labs/visual-novel/after-hours/busker/smile.webp",
        "upset": "/labs/visual-novel/after-hours/busker/upset.webp",
        "surprised": "/labs/visual-novel/after-hours/busker/surprised.webp",
        "soft": "/labs/visual-novel/after-hours/busker/soft.webp"
      },
      "portrait": "/labs/visual-novel/after-hours/portrait/busker.webp"
    },
    "baker": {
      "name": "Sota Mizuno",
      "age": 26,
      "pronouns": "he/him",
      "color": "#D9B592",
      "poses": {
        "neutral": "/labs/visual-novel/after-hours/baker/neutral.webp",
        "smile": "/labs/visual-novel/after-hours/baker/smile.webp",
        "upset": "/labs/visual-novel/after-hours/baker/upset.webp",
        "surprised": "/labs/visual-novel/after-hours/baker/surprised.webp",
        "soft": "/labs/visual-novel/after-hours/baker/soft.webp"
      },
      "portrait": "/labs/visual-novel/after-hours/portrait/baker.webp"
    }
  },
  "cgs": [
    {
      "id": "prologue-counter",
      "src": "/labs/visual-novel/after-hours/cg/prologue-counter.webp",
      "thumb": "/labs/visual-novel/after-hours/cg/thumb/prologue-counter.webp",
      "title": "The night shift",
      "focus": "50% 45%"
    },
    {
      "id": "nurse-climax",
      "src": "/labs/visual-novel/after-hours/cg/nurse-climax.webp",
      "thumb": "/labs/visual-novel/after-hours/cg/thumb/nurse-climax.webp",
      "title": "No measurements",
      "focus": "50% 45%"
    },
    {
      "id": "nurse-good",
      "src": "/labs/visual-novel/after-hours/cg/nurse-good.webp",
      "thumb": "/labs/visual-novel/after-hours/cg/thumb/nurse-good.webp",
      "title": "No excuse",
      "focus": "50% 45%"
    },
    {
      "id": "busker-climax",
      "src": "/labs/visual-novel/after-hours/cg/busker-climax.webp",
      "thumb": "/labs/visual-novel/after-hours/cg/thumb/busker-climax.webp",
      "title": "Let it finish",
      "focus": "50% 45%"
    },
    {
      "id": "busker-good",
      "src": "/labs/visual-novel/after-hours/cg/busker-good.webp",
      "thumb": "/labs/visual-novel/after-hours/cg/thumb/busker-good.webp",
      "title": "First fan",
      "focus": "50% 45%"
    },
    {
      "id": "baker-climax",
      "src": "/labs/visual-novel/after-hours/cg/baker-climax.webp",
      "thumb": "/labs/visual-novel/after-hours/cg/thumb/baker-climax.webp",
      "title": "The crooked one",
      "focus": "50% 45%"
    },
    {
      "id": "baker-good",
      "src": "/labs/visual-novel/after-hours/cg/baker-good.webp",
      "thumb": "/labs/visual-novel/after-hours/cg/thumb/baker-good.webp",
      "title": "His morning rolls",
      "focus": "50% 45%"
    },
    {
      "id": "juri-platform",
      "src": "/labs/visual-novel/after-hours/cg/juri-platform.webp",
      "thumb": "/labs/visual-novel/after-hours/cg/thumb/juri-platform.webp",
      "title": "Ten out of ten",
      "focus": "50% 45%"
    },
    {
      "id": "juri-rooftop",
      "src": "/labs/visual-novel/after-hours/cg/juri-rooftop.webp",
      "thumb": "/labs/visual-novel/after-hours/cg/thumb/juri-rooftop.webp",
      "title": "A star for luck",
      "focus": "50% 45%"
    }
  ],
  "scenes": [
    {
      "id": "p1-store",
      "bg": "/labs/visual-novel/after-hours/bg/konbini.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "1:52 a.m. Rain follows you into the convenience store under your building. The chime plays two tired notes. Your usual rice ball is already beside the till."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Tuna Mayo. One fifty-two. You know you're, like, more reliable than the trains?"
        },
        {
          "text": "Juri turns a tiny brush between two pink nails. Bleached waves fall over her striped teal vest, hot pink showing underneath. A star clip keeps one side out of her eyes. It is losing."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "laugh",
          "text": "Don't look so impressed. Nobody else buys that at this hour. Statistically tragic rice ball."
        },
        {
          "text": "You set your dripping umbrella in the stand. Hers is there too, transparent plastic repaired with a strip of gold tape."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "And the hair. Pillow, wind, surrender. Three out of ten. Come closer. I need better lighting to insult you properly."
        },
        {
          "text": "She leans across the counter. The brush stops just short of your fringe. Then she puts it down, suddenly careful about where it lands."
        },
        {
          "text": "Beside her kit, ten practice nails are painted soft pink. Each has one thin gold line. The last is blank."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "Ten a.m. Ginza. Salon trial. Real client, ninety minutes, one terrifying woman in expensive shoes."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "If she likes it, I get a chair with my name on it. Imagine. A name tag that isn't imaginary."
        },
        {
          "text": "You glance at the blank badge on her vest."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "Head office is busy. Naming a person takes four months, apparently."
        },
        {
          "text": "She pulls a spare stool out with her foot and rests one elbow where you normally put your milk tea."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "Plastic hands don't move. Real hands do. I need to practise with someone who won't make a whole thing of it."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "So. Tuna Mayo. I need a hand. Literally. Yours."
        },
        {
          "text": "Her palm waits face up on the counter. You have watched those fingers count change for months. Tonight, for once, she lets you decide what happens next."
        }
      ],
      "choices": [
        {
          "label": "Put your hand on the counter.",
          "next": "p2-shelter",
          "warmth": {
            "juri": 2
          },
          "flag": "hand"
        },
        {
          "label": "\"Only if the rice ball is free.\"",
          "next": "p2-shelter",
          "warmth": {
            "juri": 1
          },
          "flag": "haggle"
        },
        {
          "label": "\"I start work at nine. I can’t stay.\"",
          "next": "p2-shelter",
          "warmth": {
            "juri": 0
          },
          "flag": "declined"
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/main.mp3"
    },
    {
      "id": "p2-shelter",
      "bg": "/labs/visual-novel/after-hours/bg/konbini.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "2:06 a.m. Before the brush can touch a nail, the door flies open. A young woman backs through it with a guitar case held over her head."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "surprised",
          "text": "Nobody panic! The guitar is dry. I'm basically soup, but the guitar has a promising future."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "The floor had one too."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Sorry, sorry. I'll buy something. Cheapest thing that earns me the right to stand here without being furniture?"
        },
        {
          "text": "Juri points at a bowl of wrapped sweets. The newcomer counts coins on the counter, takes one, then carefully sets a second coin beside the wet footprint she has left."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "Floor compensation. Financially symbolic."
        },
        {
          "text": "Her yellow hoodie slips off one shoulder as she lowers the case. Beneath it is a black stage top; the torn tights and heavy boots have survived the rain better than her orange hair buns."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Mio Arata. Twenty-one. Local nuisance. You may have heard me under the railway shouting three chords at a concrete pillar."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Four last week. We were proud."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "The fourth was an accident. Please respect my artistic limits."
        },
        {
          "text": "She opens the case a finger's width and checks the guitar. A folded flyer falls out. Tomorrow night's date. A band's name crossed through in orange pen."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "It's a solo show now. Surprise promotion. Nobody mention the part where I didn't apply."
        },
        {
          "text": "You reach for the flyer before it touches the wet floor. Her fingers brush yours as she takes it back, and her patter misses half a beat."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Thanks, Umbrella. That's your name until I think of something better. No pressure. My standards are extremely inconsistent."
        },
        {
          "text": "Juri puts a clean towel beside her without comment. Mio squeezes the end of a hair bun into it, then looks between you and the stool."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Oh. Am I interrupting a date, or a very glamorous interrogation?"
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Depends how much they flinch."
        },
        {
          "text": "Mio hooks one boot around the case handle. Rain ticks against the glass like a drummer counting in, but nobody starts."
        }
      ],
      "choices": [
        {
          "label": "\"Play me that show when you’re dry.\"",
          "next": "p3-break",
          "warmth": {
            "busker": 1
          },
          "flag": "p-listen"
        },
        {
          "label": "\"Juri’s towel service is ten out of ten.\"",
          "next": "p3-break",
          "warmth": {
            "juri": 1
          },
          "flag": "p-towel"
        },
        {
          "label": "Move your umbrella so hers fits.",
          "next": "p3-break",
          "flag": "p-space"
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/main.mp3"
    },
    {
      "id": "p3-break",
      "bg": "/labs/visual-novel/after-hours/bg/konbini.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "2:21 a.m. The chime rings again. A tall man in navy scrubs ducks beneath the door frame, folding a black umbrella with almost unreasonable precision.",
          "cg": "/labs/visual-novel/after-hours/cg/prologue-counter.webp"
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Black coffee. Large. Seven minutes before I have to be useful again."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Ren. Your usual tragic little cup of authority."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Ren Kurose. Twenty-eight. The authority is sold separately."
        },
        {
          "text": "His camel coat hangs open over a fitted scrub top. A silver watch sits above one rolled sleeve. He notices water on your shoulder, takes a napkin, and offers it instead of reaching for you."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "You're dripping. That was an observation. Not a diagnosis."
        },
        {
          "text": "Mio presses the flyer flat with both palms. Ren reads the crossed-out names, then looks away before she has to explain."
        },
        {
          "text": "The next arrival stays halfway through the door, balancing an empty egg tray under one arm. Flour dusts his dark braid and the edge of his white jacket."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Excuse me. Milk, please. And eggs. If you have enough to spare."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "Sota, that's my entire dairy shelf you're looking at."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "The delivery van broke down. I promised the first trays for four. I'm sorry. I thought perhaps..."
        },
        {
          "text": "Sota Mizuno is twenty-six, broad through the shoulders, and somehow attempting to take up less space than the egg tray. A brown apron is tied neatly over his jacket. One loop has come loose."
        },
        {
          "text": "Ren checks the remaining cartons while Juri rings up his coffee. Mio offers three sweets and immediately admits they are not a useful substitute for eggs."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "It's kind of you to offer."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "You need a smaller first batch. What can you make without either?"
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "My grandmother's salt rolls. But I was hoping to try something else this morning."
        },
        {
          "text": "He stops there. From across the street comes a dull burst of train noise; the glass trembles in its frame."
        },
        {
          "text": "Juri writes a price on a scrap of receipt paper. Mio steadies the egg tray. Ren's phone lights up with a message he turns face down without reading."
        },
        {
          "text": "Four people, one counter, and every one of them pretending morning is further away than it is."
        }
      ],
      "choices": [
        {
          "label": "Help Juri dry the crowded counter.",
          "next": "p4-choose",
          "warmth": {
            "juri": 1
          },
          "flag": "p-juri"
        },
        {
          "label": "Offer Ren the quiet end of the counter.",
          "next": "p4-choose",
          "warmth": {
            "nurse": 1
          },
          "flag": "p-nurse"
        },
        {
          "label": "Ask Mio to finish telling you about the show.",
          "next": "p4-choose",
          "warmth": {
            "busker": 1
          },
          "flag": "p-busker"
        },
        {
          "label": "Offer to carry Sota’s bag to the bakery.",
          "next": "p4-choose",
          "warmth": {
            "baker": 1
          },
          "flag": "p-baker"
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/main.mp3"
    },
    {
      "id": "p4-choose",
      "bg": "/labs/visual-novel/after-hours/bg/block-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "2:40 a.m. The rain softens enough to show the opposite pavement. For a moment the clinic sign, railway arch and bakery shutter all fit in the same reflection.",
          "cg": "none"
        },
        {
          "text": "Juri stands behind the counter with her brush. Mio has the guitar on her back. Sota tucks two cartons into a paper bag. Ren fastens one button of his coat."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Right. Back to the pillar. It never requests covers. Excellent audience."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "My shift ends at five. Until then, the staff entrance has an awning. And a vending machine with unacceptable coffee."
        },
        {
          "text": "He looks at you when he says it. Juri raises one eyebrow over the till."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "That was an invitation. I prefer to state these things clearly."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "surprised",
          "text": "I could use another pair of hands. If you don't mind flour. Or early mornings. Or me explaining things badly."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "There would be breakfast. I can promise that part."
        },
        {
          "text": "Mio steps into the space between his offer and your answer. Not quite in front of you. Close enough that the cold wet sleeve of her hoodie brushes your arm."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Mine comes with a private concert. Also terrible coffee, if we're comparing benefits. But I can learn your favourite song."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Cute. A queue. Should I print tickets?"
        },
        {
          "text": "She taps the empty stool with the handle of her brush."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "You can stay, you know. We haven't done the star yet."
        },
        {
          "text": "Nobody asks you to save their life. There are smaller things available tonight: hold still, listen, carry a bag, stand beside somebody while they make a call."
        },
        {
          "text": "Outside, a taxi parts the puddle along the kerb. Its red tail lights stretch all the way to the bakery door."
        },
        {
          "text": "You finish your milk tea. There is enough night left to go somewhere with one of them."
        }
      ],
      "choices": [
        {
          "label": "Stay with Juri for the star.",
          "next": "practice",
          "route": "juri"
        },
        {
          "label": "Walk Ren back to the clinic.",
          "next": "nurse-1",
          "route": "nurse"
        },
        {
          "label": "Hear Mio’s private concert.",
          "next": "busker-1",
          "route": "busker"
        },
        {
          "label": "Make breakfast with Sota.",
          "next": "baker-1",
          "route": "baker"
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/main.mp3"
    },
    {
      "id": "nurse-1",
      "bg": "/labs/visual-novel/after-hours/bg/clinic-entrance-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "2:44 a.m. Ren walks on the road side of the pavement. When a bicycle passes, his hand hovers behind your shoulder without touching it."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Three steps to the left. The drain floods there."
        },
        {
          "text": "You obey just before your shoe finds the water. He gives one satisfied nod, as if you have passed a very small examination."
        },
        {
          "text": "The clinic's staff entrance sits between two vending machines. Warm light falls across the awning. Ren leaves his coffee unopened on the sill."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I have four minutes. Then a handover, two checks, and paperwork that breeds when unobserved."
        },
        {
          "text": "His phone lights again. ISLAND COMMUNITY CLINIC. Under it, a ferry timetable saved as an image."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "A job offer. Head nurse. They want an answer by eight."
        },
        {
          "text": "He folds the phone into his palm before you can read anything else."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Better title. Lower rent. My family nearby. A very persuasive column of advantages."
        },
        {
          "text": "You ask what is in the other column."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Nothing measurable."
        },
        {
          "text": "For someone who has four minutes, he takes a long time twisting the lid off his coffee. A silver ring hangs on a chain beside his staff badge. He catches you looking."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "My father's. He's alive. He gave it to me when I moved here. Apparently pockets aren't secure enough for sentiment."
        },
        {
          "text": "He lets the ring fall beneath his scrub top. The chain catches against his collarbone, and he straightens it with an impatient finger."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "You can ask a question without apologising first. I do notice when people are about to apologise."
        },
        {
          "text": "A window opens overhead. Someone calls his surname. He answers at once, all clean edges and certainty, then turns back to you."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "One question. Make it worth being late by twenty seconds."
        },
        {
          "text": "His gaze stays on yours. The vending machine compressor stops, leaving the space between you unexpectedly quiet."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/nurse.mp3",
      "choices": [
        {
          "label": "\"What do you want from the city?\"",
          "next": "nurse-2",
          "warmth": {
            "nurse": 2
          },
          "flag": "nurse-want"
        },
        {
          "label": "\"Start with the better salary.\"",
          "next": "nurse-2",
          "warmth": {
            "nurse": 0
          },
          "flag": "nurse-salary"
        },
        {
          "label": "\"Your family should decide.\"",
          "next": "nurse-2",
          "warmth": {
            "nurse": -2
          },
          "flag": "nurse-family"
        }
      ]
    },
    {
      "id": "nurse-2",
      "bg": "/labs/visual-novel/after-hours/bg/clinic-entrance-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "3:18 a.m. Ren comes out with his sleeves rolled one turn higher. He has brought two paper cups and an exact account of the vending machine's failures."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "You asked what I want. An unusually difficult question. Thank you.",
          "need": {
            "flag": "nurse-want"
          }
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "The salary comparison is complete. Unfortunately, the decision is not.",
          "need": {
            "flag": "nurse-salary"
          }
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "My family gets an opinion. I would like to keep mine too.",
          "need": {
            "flag": "nurse-family"
          }
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Too sweet. Too hot. Nevertheless, it's yours if you want it."
        },
        {
          "text": "You make room on the dry end of the bench. He sits close enough that his knee touches yours, then shifts half an inch away."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Crowded bench."
        },
        {
          "text": "There is room for three more people. You look at the empty space. He looks at his cup."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "No need to document it."
        },
        {
          "text": "You ask about the island. He describes the last ferry, a bakery that closes before noon, and a harbour wall where the paint never dries properly."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "My mother sends photographs of the sea. No captions. Very subtle recruitment campaign."
        },
        {
          "text": "You ask whether she needs him home."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "She wants me home. Those are different sentences. I keep correcting everyone except myself."
        },
        {
          "text": "His watch vibrates. He silences it, then turns your cup so the lid opening faces away from the rain. It is a small, unnecessary act, performed with complete concentration."
        },
        {
          "text": "You notice a narrow blue elastic around his wrist. He takes it off and loops it around your loose umbrella strap."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "There. It won't slap your leg when you walk."
        },
        {
          "text": "You tug it once. The umbrella stays shut. Ren watches your fingers instead of answering your thanks."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "Keep it. It's an elastic band. We can survive the expense."
        },
        {
          "text": "A colleague knocks on the window and points at the clock. Ren rises, but leaves his untouched coffee beside yours."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I finish at five. If you're still here, I will stop pretending the bench is crowded."
        },
        {
          "text": "He disappears through the staff door before you can see whether he is smiling. The blue band holds the umbrella neatly shut against your knee."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/nurse.mp3",
      "next": "nurse-3"
    },
    {
      "id": "nurse-3",
      "bg": "/labs/visual-novel/after-hours/bg/clinic-entrance-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "4:07 a.m. The staff door opens harder this time. Ren steps out, reads one message, and presses the phone against his forehead."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "My brother told the neighbours I accepted. He thought it would encourage me."
        },
        {
          "text": "He says encourage as if it belongs in quotation marks. A second message arrives before he can put the phone away."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "They have planned a welcome dinner. Friday. Six people. Someone has already bought fish."
        },
        {
          "text": "You cannot help laughing at the fish. Ren's mouth moves a fraction at one corner."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "Yes. A formidable opponent. I should have considered the fish earlier."
        },
        {
          "text": "He sits beside you. This time he leaves his knee against yours. His coat falls open, and the night air carries a clean soap scent from his collar."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I came here because I wanted work where nobody knew my family. Not because they were cruel. That would make a tidier story."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "At home, every person I helped told me I was my father's son. Here, they had to learn my name."
        },
        {
          "text": "You ask whether the work still matters to him."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Yes. The people too. My ridiculous apartment. The noodle shop that remembers I hate coriander. The person who waited outside in the rain tonight."
        },
        {
          "text": "He looks down at your umbrella. The blue band is still there."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "That last item is new. It does complicate the list."
        },
        {
          "text": "His phone lights with his mother's name. He does not answer, but he does not turn it over either."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "If I say I want to stay, it will sound like I don't miss them. If I go, everybody gets what they wanted. Convenient."
        },
        {
          "text": "The call stops. Your knees remain together. Ren waits, with no spare task available to fill his hands."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/nurse.mp3",
      "choices": [
        {
          "label": "\"You can miss them and still stay.\"",
          "next": "nurse-4",
          "warmth": {
            "nurse": 2
          },
          "flag": "nurse-both"
        },
        {
          "label": "\"Ask for a day to think.\"",
          "next": "nurse-4",
          "warmth": {
            "nurse": 1
          },
          "flag": "nurse-time"
        },
        {
          "label": "\"The dinner’s planned. Just go.\"",
          "next": "nurse-4",
          "warmth": {
            "nurse": -2
          },
          "flag": "nurse-duty"
        }
      ]
    },
    {
      "id": "nurse-4",
      "bg": "/labs/visual-novel/after-hours/bg/clinic-entrance-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "4:32 a.m. Ren calls his mother from beneath the awning. You stand far enough away to give him privacy, close enough that he can find you without turning.",
          "cg": "/labs/visual-novel/after-hours/cg/nurse-climax.webp"
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "Two true things. I can miss them and still stay.",
          "need": {
            "flag": "nurse-both"
          }
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I will ask for time. First, I owe her an honest call.",
          "need": {
            "flag": "nurse-time"
          }
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "The dinner cannot answer for me. I need to say that myself.",
          "need": {
            "flag": "nurse-duty"
          }
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I'm safe. Yes, I've eaten. Coffee is not what I said."
        },
        {
          "text": "He listens. Water runs from the corner of the awning and lands between two cracked paving stones."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "I know they need somebody. I haven't said yes."
        },
        {
          "text": "His free hand closes on the edge of his coat. Then opens."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I miss you. I still haven't said yes."
        },
        {
          "text": "The two sentences sit next to each other without cancelling out. Ren looks at you once, then moves the phone to his other ear."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "No. Please don't cancel the dinner. Have it without me. Send a photograph of the fish."
        },
        {
          "text": "He ends the call after promising another on Sunday. For several seconds he just stands under the awning, phone loose in his hand."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "She asked why I was whispering. Then she asked whether I was with someone interesting."
        },
        {
          "text": "You ask what he told her."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "That she should go back to sleep."
        },
        {
          "text": "He finally laughs. It is quiet and unexpectedly rough. When he steps closer, the chain at his throat catches the vending machine light."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "I am afraid of being wanted only when I'm useful. There. That is the inconvenient thing. No measurements available."
        },
        {
          "text": "You stay where you are. Ren rests his fingertips against your umbrella handle, beside yours, without taking it away."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "You haven't asked me to fix anything all night. I keep waiting for it."
        },
        {
          "text": "The staff door opens behind him. His last round is ready. He removes his hand, then puts it back for one brief, deliberate second."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Twenty-eight minutes. Please consider staying for the part where I have no professional excuse to stand this close."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/nurse.mp3",
      "next": "nurse-5"
    },
    {
      "id": "nurse-5",
      "bg": "/labs/visual-novel/after-hours/bg/clinic-entrance-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:12 a.m. Ren comes out without the badge. His coat is buttoned badly: the middle button sits one hole too high.",
          "cg": "none"
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Don't say anything. I can feel it."
        },
        {
          "text": "You straighten the coat when he tilts his chin in permission. His hands stay at his sides. This close, you can see the small crease the badge cord has left at his neck."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "You are taking a suspiciously long time with one button."
        },
        {
          "text": "The sky beyond the railway has begun to pale. Ren has written two emails. One accepts the island post. One declines it. Neither has been sent."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I can choose. I know that. I would like to stop making the choice as if I'm presenting evidence in court."
        },
        {
          "text": "He shows you the draft addressed to the clinic. It thanks them, names the city work he wants to continue, and offers to help find another candidate. There are no apologies."
        },
        {
          "text": "You hand the phone back. His thumb stays above the screen."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "And after this, I would like breakfast. Somewhere with proper cups. With you."
        },
        {
          "text": "The invitation lands more plainly than his hand ever did. You have spent the night watching him make space for every possible answer except his own."
        },
        {
          "text": "He takes the blue band off your umbrella and loops it around his wrist again. Then he offers you that hand, palm open."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "You can say no. To breakfast. To the hand. I would rather hear an answer than guess."
        },
        {
          "text": "Across the street, the bakery shutter rattles upward. Ren looks at the first warm line of light beneath it, then back at you. The phone in his other hand has gone dark."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/nurse.mp3",
      "choices": [
        {
          "label": "Take his hand. \"Choose what you want.\"",
          "next": "nurse-end-normal",
          "warmth": {
            "nurse": 2
          },
          "flag": "nurse-own-voice",
          "routes": [
            {
              "need": {
                "of": "nurse",
                "min": 6,
                "flag": "nurse-own-voice"
              },
              "next": "nurse-end-good"
            },
            {
              "need": {
                "of": "nurse",
                "max": 2
              },
              "next": "nurse-end-bitter"
            }
          ]
        },
        {
          "label": "\"Breakfast, while you think it through.\"",
          "next": "nurse-end-normal",
          "warmth": {
            "nurse": 1
          },
          "flag": "nurse-breakfast",
          "routes": [
            {
              "need": {
                "of": "nurse",
                "min": 6,
                "flag": "nurse-own-voice"
              },
              "next": "nurse-end-good"
            },
            {
              "need": {
                "of": "nurse",
                "max": 2
              },
              "next": "nurse-end-bitter"
            }
          ]
        },
        {
          "label": "\"The island sounds safer.\"",
          "next": "nurse-end-normal",
          "warmth": {
            "nurse": -2
          },
          "flag": "nurse-safe",
          "routes": [
            {
              "need": {
                "of": "nurse",
                "min": 6,
                "flag": "nurse-own-voice"
              },
              "next": "nurse-end-good"
            },
            {
              "need": {
                "of": "nurse",
                "max": 2
              },
              "next": "nurse-end-bitter"
            }
          ]
        }
      ]
    },
    {
      "id": "nurse-end-good",
      "bg": "/labs/visual-novel/after-hours/bg/bakery-front-dawn.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:28 a.m. Ren sends the refusal before either of you crosses the street. Then he puts his phone away for the whole walk.",
          "cg": "/labs/visual-novel/after-hours/cg/nurse-good.webp"
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "I stayed because I want this life. You are a very welcome complication in it."
        },
        {
          "text": "At the crossing, he reaches for your hand. The blue band brushes your wrist as his fingers settle between yours."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "smile",
          "text": "No clinical justification. I checked."
        },
        {
          "text": "Breakfast is not open yet. You stand under the bakery awning, closer than the width of the shelter requires. Ren asks if he may kiss you, so quietly that the question belongs only to the two of you."
        },
        {
          "text": "You answer by stepping nearer. His other hand settles at your waist. The first kiss is careful; the second begins when he smiles against your mouth."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "That was worth thirty-eight minutes of overtime."
        },
        {
          "text": "You point out that he finished on time."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "smile",
          "text": "Then I have no excuse at all."
        },
        {
          "text": "The shutter lifts. Neither of you immediately lets go. When he finally opens the door, he holds your hand through it, blue elastic and all."
        }
      ],
      "ending": {
        "title": "No Excuse",
        "text": "Ren chooses the city, and breakfast begins with a kiss."
      },
      "music": "/labs/visual-novel/after-hours/music/dawn.mp3"
    },
    {
      "id": "nurse-end-normal",
      "bg": "/labs/visual-novel/after-hours/bg/bakery-front-dawn.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:28 a.m. Ren saves the drafts and sets a reminder for seven. He is going to sleep for an hour, then read them somewhere without a vending machine humming at him.",
          "cg": "none"
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "A delay. Not an answer. I can distinguish them now."
        },
        {
          "text": "He walks you as far as your building. The pavement has begun to dry in uneven patches beneath the awnings."
        },
        {
          "text": "You offer back the blue band. He shakes his head."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "Your umbrella still needs it. Besides, returning borrowed things is a respectable reason to see somebody again."
        },
        {
          "text": "He takes out his phone, opens a new contact, and hands it to you. For once there is no deadline attached."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Tomorrow evening. I'll know which city my breakfast is in by then."
        },
        {
          "text": "You enter your number. When you give the phone back, his thumb brushes yours and stays there for a moment."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "Thank you for waiting. I did notice."
        },
        {
          "text": "He leaves with the collar of his coat turned up. Before he reaches the clinic corner, your phone lights: Proper coffee next time. That is a promise."
        }
      ],
      "ending": {
        "title": "Proper Coffee",
        "text": "Ren takes time to decide and asks to see you again."
      },
      "music": "/labs/visual-novel/after-hours/music/nurse.mp3"
    },
    {
      "id": "nurse-end-bitter",
      "bg": "/labs/visual-novel/after-hours/bg/bakery-front-dawn.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:28 a.m. Ren accepts the island post. He reads the confirmation once, then twice, and folds the phone into his coat.",
          "cg": "none"
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Friday's ferry. The dinner will go ahead."
        },
        {
          "text": "You say his family will be pleased. He nods. That part, at least, is easy to predict."
        },
        {
          "text": "He walks you back across the road. At the building entrance, you give him the blue band. He takes it with a small, professional thank-you and puts it in his pocket."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "You should get some sleep. You've been awake too long on my account."
        },
        {
          "text": "For a moment he looks as if he might add something. A delivery bicycle rattles past, and he steps back to make room."
        },
        {
          "text": "By Friday, the clinic window has a new rota. You see his name crossed out beneath the morning reflection."
        },
        {
          "text": "That night a photograph arrives from an unfamiliar number: a harbour wall, wet blue paint, the edge of a ferry."
        },
        {
          "text": "Under it, two words: Arrived safely."
        },
        {
          "text": "You type a reply. Delete it. Then wish him well. The message is read before the screen goes dark."
        }
      ],
      "ending": {
        "title": "Arrived Safely",
        "text": "Ren returns to the island, leaving the invitation unspoken."
      },
      "music": "/labs/visual-novel/after-hours/music/nurse.mp3"
    },
    {
      "id": "busker-1",
      "bg": "/labs/visual-novel/after-hours/bg/underpass-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "2:47 a.m. Mio takes you to the railway arch as if it is a famous venue with a difficult door policy."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Mind the puddle. VIP entrance. No refunds, because nobody has paid me anything."
        },
        {
          "text": "She sets her case on a dry rectangle beneath the streetlight. Someone has drawn a small heart on the concrete pillar. She turns the case so its open lid faces it."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "That was me. Needed an audience with taste."
        },
        {
          "text": "The guitar has a dent near the bridge and a strip of orange tape around one strap buckle. Mio tunes by ear, frowning at a string that refuses to agree with the others."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Okay. Set list. One song I know, one I almost know, and the terrifying original nobody requested."
        },
        {
          "text": "Her phone, propped inside the case, shows a message from the venue: Need your final lineup by 6. Solo is fine. Cancel if you need to."
        },
        {
          "text": "She turns it face down with the heel of her hand."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "My drummer got an office job. Bass player is moving. Guitarist said the band's dead, which was rude, because I'm the guitarist."
        },
        {
          "text": "You ask why she is still here in the rain."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "The pillar hasn't quit yet."
        },
        {
          "text": "She starts a bright chord progression, gets as far as the first line, then stops to adjust a tuning peg that does not need adjusting."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Audience participation section! Very exclusive. You can request absolutely anything, and I will explain why I can't play it."
        },
        {
          "text": "A train passes overhead. Its wheels drown out the last word. Mio mouths something exaggeratedly rude at the ceiling and makes you laugh."
        },
        {
          "text": "When the noise fades, she has not restarted. Her fingers rest against the strings, muting every note."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Or I could play you the new one. It's not clever yet. You have to promise not to expect clever."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/busker.mp3",
      "choices": [
        {
          "label": "\"Play the new one. I’m listening.\"",
          "next": "busker-2",
          "warmth": {
            "busker": 2
          },
          "flag": "busker-listen"
        },
        {
          "label": "\"Start with something familiar.\"",
          "next": "busker-2",
          "warmth": {
            "busker": 0
          },
          "flag": "busker-cover"
        },
        {
          "label": "\"Maybe skip the embarrassing one.\"",
          "next": "busker-2",
          "warmth": {
            "busker": -2
          },
          "flag": "busker-hide"
        }
      ]
    },
    {
      "id": "busker-2",
      "bg": "/labs/visual-novel/after-hours/bg/underpass-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "3:09 a.m. The first verse is about a laundrette closing. The second is about leaving a chair empty so somebody has a reason to come back."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "You asked for the new one. No take-backs now, Umbrella.",
          "need": {
            "flag": "busker-listen"
          }
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "One familiar chorus first. Then mine. Otherwise I’ll hide forever.",
          "need": {
            "flag": "busker-cover"
          }
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "It might be embarrassing. I still want to try it once.",
          "need": {
            "flag": "busker-hide"
          }
        },
        {
          "text": "Mio sings the chorus once, very softly. No joke fits over the last line, so she lets it end."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "There. Three minutes of my actual personality. Horrifying. We can never speak of it again."
        },
        {
          "text": "You ask about the empty chair. She picks at a rough edge of tape on the guitar case."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "My old flat. Four of us used to sit around this little table after practice. Everybody kept moving out, and I kept buying extra chairs."
        },
        {
          "text": "She holds up two fingers, then changes her mind and spreads all five."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "My coping strategy had a furniture budget. Very grown-up."
        },
        {
          "text": "A taxi slows at the kerb. Its driver raises a thumb, drops a coin into the case, and drives on. Mio bows after it with absurd ceremony."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "The industry has spoken. We can afford half a sweet."
        },
        {
          "text": "She looks at the coin, then at you."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Was the chorus too small? I always want to make it bigger before anybody notices what it says."
        },
        {
          "text": "Instead of answering at once, you hum the last few notes. Mio's fingers find the chord beneath them. For one verse, you let the song occupy the whole arch."
        },
        {
          "text": "When you finish, she unclips an orange guitar pick from the case strap and presses it into your palm."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Temporary membership. Don't panic. There are no rehearsals. The uniform is whatever you got rained on in."
        },
        {
          "text": "She closes your fingers around it with both hands, suddenly less fluent than before."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Keep it till the show. Otherwise I'll decide you were invented by sleep deprivation."
        },
        {
          "text": "The train signal changes overhead. This time she begins the song again before the next train arrives."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/busker.mp3",
      "next": "busker-3"
    },
    {
      "id": "busker-3",
      "bg": "/labs/visual-novel/after-hours/bg/underpass-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "3:43 a.m. Mio's phone vibrates against the guitar case. A former bandmate has sent a clip of their last show, followed by a laughing face and: Remember when we thought we'd make it?"
        },
        {
          "text": "She watches the first ten seconds. Turns the volume down. Watches them again."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "We were dreadful. Listen to that drum fill. That's a suitcase falling downstairs."
        },
        {
          "text": "She smiles at the screen until the clip ends. Then she scrolls to the venue's message and starts typing a cancellation."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "It's a forty-minute slot. I have three songs. Three honest ones, anyway. Everything else is me talking until nobody notices the gap."
        },
        {
          "text": "You mention the chorus she just played. She shakes her head hard enough to loosen one of her buns."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "You like me. That makes you unreliable. Extremely attractive in an audience, but scientifically useless."
        },
        {
          "text": "The compliment seems to surprise her as much as it surprises you. She hides behind the guitar neck for half a second."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "I said that out loud. Cool. Fantastic. Wonderful night for language."
        },
        {
          "text": "She puts the guitar across her knees and counts the songs with her fingertips. Three. Then a cover. Then another. Five, if she slows down long enough to let anybody clap."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "What if nobody comes? Worse, what if they come and wish they hadn't?"
        },
        {
          "text": "You can hear rain running inside the drainpipe. Mio is waiting for you to fill the silence, but you have heard what she does when every silence gets filled."
        },
        {
          "text": "The cancellation draft glows in the case. Beside it, the little coin catches a circle of streetlight."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Tell me what you'd actually want to hear. Not what would make me stop freaking out. I can tell the difference sometimes."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/busker.mp3",
      "choices": [
        {
          "label": "\"The small chorus. Let it finish.\"",
          "next": "busker-4",
          "warmth": {
            "busker": 2
          },
          "flag": "busker-room"
        },
        {
          "label": "\"Try a shorter set.\"",
          "next": "busker-4",
          "warmth": {
            "busker": 1
          },
          "flag": "busker-short"
        },
        {
          "label": "\"Cancel. You’re not ready.\"",
          "next": "busker-4",
          "warmth": {
            "busker": -2
          },
          "flag": "busker-cancel"
        }
      ]
    },
    {
      "id": "busker-4",
      "bg": "/labs/visual-novel/after-hours/bg/underpass-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "4:19 a.m. You hold her phone while Mio records a rehearsal for the venue. The first take lasts nine seconds before she apologises to the lens.",
          "cg": "/labs/visual-novel/after-hours/cg/busker-climax.webp"
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Let it finish. Right. You can confiscate my next joke.",
          "need": {
            "flag": "busker-room"
          }
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "A shorter set. I can pitch that with a rehearsal.",
          "need": {
            "flag": "busker-short"
          }
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "Maybe I’m not ready. Let me record it before I decide.",
          "need": {
            "flag": "busker-cancel"
          }
        },
        {
          "text": "The second lasts twelve. She stops it with her sleeve over her face."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "I do this for strangers under a train. Why is a tiny rectangle winning?"
        },
        {
          "text": "You lower the phone. Mio watches the reflection of the streetlight in its dark screen."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "When the band was here, I could blame everybody else if it went badly. The sound. The drummer. The train. Somebody always had a louder mistake."
        },
        {
          "text": "She sits on the edge of the case, guitar balanced against her shoulder."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "I'm scared they'll hear me properly and still leave. That's the part I keep trying to drown out."
        },
        {
          "text": "You sit beside her. Not close enough to crowd the instrument. Close enough that she can rest her head against your shoulder when she finally stops talking."
        },
        {
          "text": "For a minute, she does. The orange hair tickles your cheek. Her hand finds yours beside the case, then turns it over to check that the pick is still there."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "You kept it."
        },
        {
          "text": "She says nothing else until the next train has gone. Then she stands, ties her hair back with an elastic from her wrist, and asks you to record again."
        },
        {
          "text": "This time she begins with her name. No band name. No apology. The small chorus reaches the far end of the arch without getting bigger."
        },
        {
          "text": "When she finishes, you keep the phone steady for the whole silence after the last chord. Mio looks at the lens, then past it to you."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Okay. That one sounded like somebody I know."
        },
        {
          "text": "She saves the take. For once she does not immediately watch it back looking for something to hate."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/busker.mp3",
      "next": "busker-5"
    },
    {
      "id": "busker-5",
      "bg": "/labs/visual-novel/after-hours/bg/underpass-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:06 a.m. The sky beyond the arch is pale enough to show the rain hanging in the wires. Mio sits beside you with her phone between both knees.",
          "cg": "none"
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "Six-song set. A short one. I can ask for thirty minutes instead of pretending I have forty."
        },
        {
          "text": "She has written the message. It says she will perform solo. It gives her own name and attaches the rehearsal. The send arrow waits beneath her thumb."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "This is the bit where I want to become extremely funny and change the subject. You may have noticed my subtle methods."
        },
        {
          "text": "You turn the orange pick over in your fingers. There is a little groove worn into one edge where her thumb rests."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Oh, excellent. The membership card. I forgot to explain the terms. Members get one song request and unlimited arguments about the best convenience-store snack."
        },
        {
          "text": "She reaches for the pick, then leaves it in your hand. Her fingertips stay against your palm."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "I'd like you in the front row. Not hiding behind the pillar. Somewhere I can look when I forget what my knees do."
        },
        {
          "text": "The phone dims. She wakes it again, still holding your hand with the other."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "And after the show, if I haven't talked you out of it by then, I'd like to take you somewhere without a railway over our heads."
        },
        {
          "text": "You ask whether that is another membership benefit. Mio laughs once, then meets your eyes instead of looking for the next joke."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "No. That's me asking you on a date. I thought I should try saying the actual thing, since the night is already wildly out of character."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/busker.mp3",
      "choices": [
        {
          "label": "\"Send it. Save me the front row.\"",
          "next": "busker-end-normal",
          "warmth": {
            "busker": 2
          },
          "flag": "busker-own-name",
          "routes": [
            {
              "need": {
                "of": "busker",
                "min": 6,
                "flag": "busker-own-name"
              },
              "next": "busker-end-good"
            },
            {
              "need": {
                "of": "busker",
                "max": 2
              },
              "next": "busker-end-bitter"
            }
          ]
        },
        {
          "label": "\"Ask them for a smaller slot.\"",
          "next": "busker-end-normal",
          "warmth": {
            "busker": 1
          },
          "flag": "busker-small-slot",
          "routes": [
            {
              "need": {
                "of": "busker",
                "min": 6,
                "flag": "busker-own-name"
              },
              "next": "busker-end-good"
            },
            {
              "need": {
                "of": "busker",
                "max": 2
              },
              "next": "busker-end-bitter"
            }
          ]
        },
        {
          "label": "\"A band would make this easier.\"",
          "next": "busker-end-normal",
          "warmth": {
            "busker": -2
          },
          "flag": "busker-wait",
          "routes": [
            {
              "need": {
                "of": "busker",
                "min": 6,
                "flag": "busker-own-name"
              },
              "next": "busker-end-good"
            },
            {
              "need": {
                "of": "busker",
                "max": 2
              },
              "next": "busker-end-bitter"
            }
          ]
        }
      ]
    },
    {
      "id": "busker-end-good",
      "bg": "/labs/visual-novel/after-hours/bg/underpass-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:19 a.m. Mio sends the message, then drops the phone into the case as if it has become dangerously hot.",
          "cg": "/labs/visual-novel/after-hours/cg/busker-good.webp"
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "surprised",
          "text": "Done. Oh, that's awful. That's brilliant. Give me a second to choose."
        },
        {
          "text": "She catches your sleeve before you can move and pulls you into a quick, fierce hug. The guitar sits safely in its case. For once there is nothing between you."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Can I kiss my first fan, or is that an appalling abuse of fame?"
        },
        {
          "text": "You tell her her first fan was a concrete pillar."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "You're right. I'll apologise to it later."
        },
        {
          "text": "Her kiss arrives with a laugh that fades halfway through. When she draws back, she is quieter than you have heard her all night."
        },
        {
          "text": "The next evening, the orange pick gets you into a front-row seat. Mio steps up alone, finds you, and adjusts the microphone once."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "This first one's for somebody who let the last note finish."
        },
        {
          "text": "She plays the small chorus. Nobody leaves. When the applause comes, she lets that finish too."
        }
      ],
      "ending": {
        "title": "Front Row",
        "text": "Mio takes the stage in her own name, with you in the front row."
      },
      "music": "/labs/visual-novel/after-hours/music/dawn.mp3"
    },
    {
      "id": "busker-end-normal",
      "bg": "/labs/visual-novel/after-hours/bg/underpass-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:19 a.m. Mio sends the rehearsal and asks for a shorter set. The message takes a full minute to leave the arch's unreliable signal.",
          "cg": "none"
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "There. A sensible adult business proposal. I feel like I should buy a filing cabinet."
        },
        {
          "text": "She walks you home with the guitar on her back, humming the chorus under her breath. At your door, she takes out a flyer and crosses out the old band's name."
        },
        {
          "text": "MIO ARATA goes above it in thick orange pen. She adds a tiny umbrella beside the time."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "No pressure to come. But if you do, there'll be a chair with a good view of me making a brave fool of myself."
        },
        {
          "text": "You give back the pick. She clips it to her case, then changes her mind and hands it to you again."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Actually, keep it. I need an excuse to ask how your day went."
        },
        {
          "text": "That evening, your phone receives six seconds of guitar and a message: Still playing. Still terrified. Snack argument postponed till after the show."
        }
      ],
      "ending": {
        "title": "Still Playing",
        "text": "Mio books a smaller set and leaves you a reason to return."
      },
      "music": "/labs/visual-novel/after-hours/music/busker.mp3"
    },
    {
      "id": "busker-end-bitter",
      "bg": "/labs/visual-novel/after-hours/bg/underpass-night.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:19 a.m. Mio sends the cancellation. She types a careful apology, deletes a joke from the end, and closes the case.",
          "cg": "none"
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "They'll find somebody. It's a good slot. Better not to waste it."
        },
        {
          "text": "She makes her voice bright again while she coils the cable. The brightness does not last beyond the next sentence."
        },
        {
          "text": "You offer the pick back. She takes it and turns it between two fingers, then clips it to the strap without looking up."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Thanks for listening tonight. Really. That part was good."
        },
        {
          "text": "You walk to the corner together. She goes towards the station, where the first commuters are beginning to gather under the signs."
        },
        {
          "text": "The following night, there is a different name on the venue's board. Under the railway, Mio plays a song everybody knows. A few people stop. A few drop coins."
        },
        {
          "text": "She sees you and waves with the pick before beginning the next verse."
        },
        {
          "text": "The little song about the empty chair does not come back into the set. You can still remember its last line, but you do not sing it over her."
        }
      ],
      "ending": {
        "title": "The Cover Set",
        "text": "Mio cancels the show and keeps the little song to herself."
      },
      "music": "/labs/visual-novel/after-hours/music/busker.mp3"
    },
    {
      "id": "baker-1",
      "bg": "/labs/visual-novel/after-hours/bg/bakery-kitchen.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "2:46 a.m. Sota holds the bakery door with one shoulder while you carry the milk. Warm air touches your face before you see the ovens."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Thank you. Please mind the step. And the tray. Actually, let me move the tray. I'm making a very poor first impression."
        },
        {
          "text": "He moves three things that were nowhere near your feet. Then he takes the milk and stands looking at it as though he has forgotten what milk does."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Sorry. I don't usually have company this early."
        },
        {
          "text": "The kitchen is narrow, clean, and full of small repairs: a drawer with a different handle, a patched stool, a recipe book held together with cloth tape."
        },
        {
          "text": "He washes his hands, offers you a clean apron, and waits while you find the straps. When they twist behind your back, he asks before stepping close to untangle them."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "There. Is that too tight?"
        },
        {
          "text": "His fingers are warm from the room. You say it is fine. He makes a second knot more slowly than the first."
        },
        {
          "text": "On the bench sit two bowls. One holds ordinary dough. The other smells faintly of orange peel and toasted sesame."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "The salt rolls are my grandmother's. The other batch is... an idea. It may not deserve a whole shelf."
        },
        {
          "text": "You ask how many shelves an idea normally needs. He glances at you, surprised, then smiles into the bowl."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "smile",
          "text": "One would be ambitious. Half, perhaps. A quiet corner."
        },
        {
          "text": "He gives you a small piece of the scented dough to smell. The sweetness is there, but restrained, waiting behind the sesame."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "I made it three times last week. I kept eating it at home instead of bringing it out front."
        },
        {
          "text": "The oven timer clicks behind him. Sota sets both hands on the bench and looks at the two bowls, still deciding which one you are allowed to see."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/baker.mp3",
      "choices": [
        {
          "label": "\"Show me how you make your version.\"",
          "next": "baker-2",
          "warmth": {
            "baker": 2
          },
          "flag": "baker-version"
        },
        {
          "label": "\"Let’s start with the salt rolls.\"",
          "next": "baker-2",
          "warmth": {
            "baker": 0
          },
          "flag": "baker-familiar"
        },
        {
          "label": "\"Why risk a recipe that works?\"",
          "next": "baker-2",
          "warmth": {
            "baker": -2
          },
          "flag": "baker-risk"
        }
      ]
    },
    {
      "id": "baker-2",
      "bg": "/labs/visual-novel/after-hours/bg/bakery-kitchen.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "3:12 a.m. Sota shows you how to fold the dough. His hands make the movement look simple until you try it yourself."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "My version. I like how that sounds when you say it.",
          "need": {
            "flag": "baker-version"
          }
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "The salt rolls first, then. We can try mine afterwards.",
          "need": {
            "flag": "baker-familiar"
          }
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "It is a risk. Perhaps we can taste it privately.",
          "need": {
            "flag": "baker-risk"
          }
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "smile",
          "text": "That's all right. It is meant to stick a little. Bread has opinions about strangers."
        },
        {
          "text": "Your first roll looks like a folded sock. He sets it beside his perfectly shaped one without comment."
        },
        {
          "text": "When you stare at the comparison, he gives his own roll a deliberate crooked pinch. Now they look like relatives."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "There. A family resemblance."
        },
        {
          "text": "He reaches behind you for a tray, stops close enough that you feel the warmth through his jacket, and asks whether he may pass. You move half a step. He moves half a step. Neither is quite enough."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "surprised",
          "text": "Sorry. I have worked in this room for years. Apparently I have forgotten its dimensions."
        },
        {
          "text": "The neck of his jacket has come open at the top. Flour rests along the tendon above his collarbone. He notices your glance and wipes the wrong side."
        },
        {
          "text": "You point. He laughs softly and offers you a clean cloth."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Would you? Since my geometry has failed."
        },
        {
          "text": "You brush the flour away. He holds very still, then takes the cloth with both hands."
        },
        {
          "text": "On the shelf above the bench, a photograph shows an older woman holding a tray larger than she is. Sota follows your look."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "She taught me the knot for these rolls. Two turns, tuck the end. When I was little, she said they kept promises from coming undone."
        },
        {
          "text": "He loops a spare strip of clean apron ribbon twice around your wrist to demonstrate, leaving it loose enough to slip off."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Not a real knot. Just the shape. I wouldn't tie you to a bakery on our first evening."
        },
        {
          "text": "His face changes as the sentence catches up with him. The timer saves him before he can apologise for it."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/baker.mp3",
      "next": "baker-3"
    },
    {
      "id": "baker-3",
      "bg": "/labs/visual-novel/after-hours/bg/bakery-kitchen.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "3:41 a.m. The first rolls cool on the rack. The orange-sesame batch still waits beneath its cloth."
        },
        {
          "text": "Sota opens his grandmother's recipe book. A handwritten note falls out: Don't rush the second rise. You always do."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "She knew exactly where to leave instructions."
        },
        {
          "text": "He smooths the paper with his thumb. There is a clean rectangle on the wall where the funeral notice hung earlier in the year."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "People come in and ask whether the bread tastes the same. I say yes before they've tried it. I want them to feel they can still find her here."
        },
        {
          "text": "He turns to a page crowded with measurements. In the margin, a different hand has written orange? beside three crossed-out amounts."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "Those are mine. I shouldn't have written in her book."
        },
        {
          "text": "You ask why. He looks at the page, but answers the photograph."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Because it was hers."
        },
        {
          "text": "A delivery van passes without stopping. He watches its lights through the small window, then brings the second bowl back to the bench."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "She used to put orange peel in her tea. She hated wasting any part of a fruit. I thought the smell might work in a roll. Something warm, with a little edge to it."
        },
        {
          "text": "He has said more about this dough than about every established recipe combined. When he notices, he closes the book halfway."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "If I put it out front, somebody will say it isn't hers. They'll be right. I don't know how to stand behind the counter and agree."
        },
        {
          "text": "The cloth rises gently over the bowl. Whatever Sota calls it, the dough has been doing its part all night."
        },
        {
          "text": "He takes a blank price card from a drawer and puts it between you. There is room for a name, a price, and nothing that explains him away."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/baker.mp3",
      "choices": [
        {
          "label": "\"It can be yours and belong here.\"",
          "next": "baker-4",
          "warmth": {
            "baker": 2
          },
          "flag": "baker-room"
        },
        {
          "label": "\"Offer a few samples first.\"",
          "next": "baker-4",
          "warmth": {
            "baker": 1
          },
          "flag": "baker-samples"
        },
        {
          "label": "\"Keep the book exactly as it was.\"",
          "next": "baker-4",
          "warmth": {
            "baker": -2
          },
          "flag": "baker-book"
        }
      ]
    },
    {
      "id": "baker-4",
      "bg": "/labs/visual-novel/after-hours/bg/bakery-kitchen.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "4:16 a.m. Sota opens the oven. The first experimental tray has browned too quickly on one side.",
          "cg": "/labs/visual-novel/after-hours/cg/baker-climax.webp"
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Mine, and still here. I would like to believe that.",
          "need": {
            "flag": "baker-room"
          }
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Samples might help. We should taste the first batch ourselves.",
          "need": {
            "flag": "baker-samples"
          }
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "I understand. But I need somewhere to write the changes.",
          "need": {
            "flag": "baker-book"
          }
        },
        {
          "text": "He stands with the oven gloves held apart, looking at the uneven row. Then he starts to move it towards the back counter where nobody will see it."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "I should have rotated it sooner. I knew that corner ran hot. I'm sorry you stayed for this."
        },
        {
          "text": "You pick up the cooling knife and ask which one to cut. He sets the tray down, reluctantly, and chooses the least perfect roll."
        },
        {
          "text": "The crust cracks. Inside, the bread is soft and threaded with orange. Sota tastes a small piece, then takes another before he remembers to look disappointed."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "The sesame needs a little more salt."
        },
        {
          "text": "You wait. He tries a third piece."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "smile",
          "text": "But the orange works."
        },
        {
          "text": "He writes the salt adjustment in the margin of the recipe book. This time he does not erase it."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "I keep thinking that if I change anything, the shop will stop being proof she was here. That sounds foolish when I say it in a room full of her handwriting."
        },
        {
          "text": "You shake your head. Sota leans back against the bench, shoulders finally dropping."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "I'm frightened of wanting something she can't tell me is good. I miss asking her. Even when I knew she'd disagree."
        },
        {
          "text": "He looks at the loose ribbon around your wrist. Gently, he turns the little knot so its two loops face upward again."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "She would have liked that you ate the crooked one first."
        },
        {
          "text": "The second tray is ready to go in. Sota rotates it before closing the door. Then he leaves the first batch in the centre of the bench, where it can be tasted, rather than hidden."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/baker.mp3",
      "next": "baker-5"
    },
    {
      "id": "baker-5",
      "bg": "/labs/visual-novel/after-hours/bg/bakery-front-dawn.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:03 a.m. The shutter is halfway up. Dawn puts a pale stripe across the counter, just wide enough for one tray.",
          "cg": "none"
        },
        {
          "text": "Sota sets down the orange-sesame rolls. He has brushed the flour from his jacket and retied his braid. The blank price card is still in his hand."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "The salt rolls can go beside them. Nobody has to choose only one."
        },
        {
          "text": "He seems surprised to hear himself say it. You slide the old wooden tray a little to the left, making room without removing anything."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Yes. Like that."
        },
        {
          "text": "The first customer will be here in twenty minutes. Sota has time to write the card, hide the tray, or find a new task that lasts until the decision has made itself."
        },
        {
          "text": "He reaches for the cloth. Stops. Puts it down."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "I was going to polish the glass again. It has probably suffered enough attention."
        },
        {
          "text": "You stand beside him behind the counter. From here, the room looks different: the door you came through, the little bell, the place where somebody will ask who made these."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Will you stay for breakfast? After I open. We can sit by the window. I would rather not have a counter between us the whole time."
        },
        {
          "text": "He touches the loose ribbon at your wrist, then leaves it alone. His hand rests palm down beside yours on the wood."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "And another day, when I'm not covered in flour, perhaps dinner. I can manage a restaurant. I know that sounds unlikely after tonight."
        },
        {
          "text": "You look at the price card. He laughs under his breath and picks up the pen."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "One brave thing first. Then I can attempt the second without dropping the first on the floor."
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/baker.mp3",
      "choices": [
        {
          "label": "\"Put your name on it. I’ll stay.\"",
          "next": "baker-end-normal",
          "warmth": {
            "baker": 2
          },
          "flag": "baker-own-name",
          "routes": [
            {
              "need": {
                "of": "baker",
                "min": 6,
                "flag": "baker-own-name"
              },
              "next": "baker-end-good"
            },
            {
              "need": {
                "of": "baker",
                "max": 2
              },
              "next": "baker-end-bitter"
            }
          ]
        },
        {
          "label": "\"A tasting plate is a start.\"",
          "next": "baker-end-normal",
          "warmth": {
            "baker": 1
          },
          "flag": "baker-tasting",
          "routes": [
            {
              "need": {
                "of": "baker",
                "min": 6,
                "flag": "baker-own-name"
              },
              "next": "baker-end-good"
            },
            {
              "need": {
                "of": "baker",
                "max": 2
              },
              "next": "baker-end-bitter"
            }
          ]
        },
        {
          "label": "\"Wait until it’s perfect.\"",
          "next": "baker-end-normal",
          "warmth": {
            "baker": -2
          },
          "flag": "baker-perfect",
          "routes": [
            {
              "need": {
                "of": "baker",
                "min": 6,
                "flag": "baker-own-name"
              },
              "next": "baker-end-good"
            },
            {
              "need": {
                "of": "baker",
                "max": 2
              },
              "next": "baker-end-bitter"
            }
          ]
        }
      ]
    },
    {
      "id": "baker-end-good",
      "bg": "/labs/visual-novel/after-hours/bg/bakery-front-dawn.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:27 a.m. Sota writes ORANGE AND SESAME in large, steady letters. Beneath it, smaller: Sota's morning rolls.",
          "cg": "/labs/visual-novel/after-hours/cg/baker-good.webp"
        },
        {
          "text": "The first customer asks whether they are new. He says yes. No apology follows it."
        },
        {
          "text": "When the bell stops ringing, he looks at the space where two rolls used to be, then at you."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "smile",
          "text": "She said she'd come back for another. I should probably make more before that happens."
        },
        {
          "text": "Instead, for one minute, he stays exactly where he is. He takes your ribbon-wrapped wrist and brings your hand to his mouth, asking with his eyes before pressing a kiss to your knuckles."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "I would like to kiss you properly too. If that's welcome."
        },
        {
          "text": "It is. He leans down, one hand settling gently at your back. The kiss is shy until you touch his collar; then he forgets to leave room for another apology."
        },
        {
          "text": "You eat breakfast by the window. Your two crooked rolls are on the same plate. Sota unties the ribbon and sets it beside the recipe book, ready to be used again."
        }
      ],
      "ending": {
        "title": "His Morning Rolls",
        "text": "Sota puts his name on the shelf and asks for a second date."
      },
      "music": "/labs/visual-novel/after-hours/music/dawn.mp3"
    },
    {
      "id": "baker-end-normal",
      "bg": "/labs/visual-novel/after-hours/bg/bakery-front-dawn.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:27 a.m. Sota sets out a small tasting plate. He writes TRIAL BATCH on the card and places it beside his grandmother's rolls.",
          "cg": "none"
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "I can ask what people think. That would be a start."
        },
        {
          "text": "The first customer takes a piece. Says the orange is lovely. Sota writes that down as carefully as he wrote the salt adjustment."
        },
        {
          "text": "You help carry the empty trays back to the kitchen. He makes you breakfast and insists on sitting down for at least half of it."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Otherwise you'll remember me as a pair of hands disappearing into an oven."
        },
        {
          "text": "At the door, you give him the ribbon. He folds it twice and slips it into the recipe book beside the new page."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Thank you. For staying long enough to taste it. Could you come back when I've tried the salt again?"
        },
        {
          "text": "You say you would like that. He writes the next baking day on the back of a receipt, then adds his number beneath it."
        },
        {
          "text": "This time, when his fingers touch yours, he does not immediately step away."
        }
      ],
      "ending": {
        "title": "Trial Batch",
        "text": "Sota offers a taste of his own work and asks you back."
      },
      "music": "/labs/visual-novel/after-hours/music/baker.mp3"
    },
    {
      "id": "baker-end-bitter",
      "bg": "/labs/visual-novel/after-hours/bg/bakery-front-dawn.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "text": "5:27 a.m. Sota takes the orange-sesame tray into the kitchen. The price card goes back in the drawer without a word on it.",
          "cg": "none"
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Perhaps another morning. I should get the ordinary batch right first."
        },
        {
          "text": "The ordinary batch is already perfect. You can see it cooling beside the oven, every knot turned the same way."
        },
        {
          "text": "He wraps two experimental rolls for you to take home. The paper is warm in your hands, and a little oil darkens one corner."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "It shouldn't go to waste. I hope they're still pleasant when you get upstairs."
        },
        {
          "text": "You slip off the ribbon and leave it on the bench. Sota folds it neatly, then goes to open the shutter the rest of the way."
        },
        {
          "text": "From the street, the bakery looks exactly as it did yesterday. The familiar names are written on the cards. His grandmother's photograph watches the first customers come in."
        },
        {
          "text": "At home, you cut one roll in half. The orange smell fills your small kitchen. You eat slowly, trying to decide whether returning for breakfast would help, and wishing you had answered differently while the card was still blank."
        }
      ],
      "ending": {
        "title": "Another Morning",
        "text": "Sota hides the new recipe, and you take its only sample home."
      },
      "music": "/labs/visual-novel/after-hours/music/baker.mp3"
    },
    {
      "id": "practice",
      "bg": "/labs/visual-novel/after-hours/bg/konbini.webp",
      "focus": "62% 50%",
      "lines": [
        {
          "text": "2:42 a.m. The others leave for their own shifts. Juri pulls the stool back towards the counter.",
          "show": "juri",
          "pose": "smirk"
        },
        {
          "who": "juri",
          "pose": "laugh",
          "need": {
            "flag": "hand",
            "of": "juri"
          },
          "text": "Ehhh? Just like that? No bargaining? You're too easy, Tuna Mayo. That's dangerous at two a.m.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "laugh",
          "need": {
            "flag": "haggle",
            "of": "juri"
          },
          "text": "Ohhh, negotiating. Look at you, big business.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "smirk",
          "need": {
            "flag": "haggle",
            "of": "juri"
          },
          "text": "Fine. The rice ball's on me. One. If you flinch when the polish is cold, I'm charging you double.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "smirk",
          "need": {
            "flag": "declined",
            "of": "juri"
          },
          "text": "Nine? Ew. A day person.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "pout",
          "need": {
            "flag": "declined",
            "of": "juri"
          },
          "text": "Fine, go sleep. I'll keep going on my plastic friend. He never complains. Eight out of ten conversationalist.",
          "show": "juri"
        },
        {
          "need": {
            "flag": "declined",
            "of": "juri"
          },
          "text": "You say goodnight. Then you don't leave. You end up against the magazine rack with your milk tea, watching her work. She pretends not to notice."
        },
        {
          "need": {
            "not": "declined",
            "of": "juri"
          },
          "pose": "smirk",
          "text": "She hooks the spare stool over with her foot and taps the counter twice. You lay your hand flat. She turns it over like fruit at the market.",
          "show": "juri"
        },
        {
          "who": "juri",
          "need": {
            "not": "declined",
            "of": "juri"
          },
          "text": "Cuticles: tragic. Nail beds: actually kind of nice? Don't let it go to your head."
        },
        {
          "who": "juri",
          "text": "I'm doing the Mirabelle set. Soft pink, one thin gold line, a little star on the ring finger. The owner's whole thing is 'quiet luxury.' So, the opposite of me."
        },
        {
          "need": {
            "not": "declined",
            "of": "juri"
          },
          "text": "Her strokes are short and sure. Up close she smells of polish and the peach gum she chews to stay awake."
        },
        {
          "who": "juri",
          "pose": "soft",
          "text": "You know why I do nights? Nobody watches. You can practise for four hours and the only witness is the guy who buys cat food at three.",
          "show": "juri"
        },
        {
          "who": "juri",
          "text": "I did one of these trials last year. Different salon. Shibuya."
        },
        {
          "who": "juri",
          "pose": "serious",
          "text": "My hand shook so bad I painted the client's cuticle. The whole cuticle. Pink. She was so nice about it. That was worse. I wanted her to yell.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "smirk",
          "text": "Anyway! Sad story over. Three out of ten, not enough crying.",
          "show": "juri"
        }
      ],
      "choices": [
        {
          "label": "\"Your hands aren't shaking now.\"",
          "next": "practice-after",
          "warmth": {
            "juri": 2
          },
          "flag": "steady"
        },
        {
          "label": "\"So this year, only half a cuticle. Growth.\"",
          "next": "practice-after",
          "warmth": {
            "juri": 1
          },
          "flag": "tease"
        },
        {
          "label": "\"Maybe a fancy salon isn't worth it.\"",
          "next": "practice-after",
          "warmth": {
            "juri": -1
          },
          "flag": "doubt"
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/juri.mp3"
    },
    {
      "id": "practice-after",
      "bg": "/labs/visual-novel/after-hours/bg/konbini.webp",
      "focus": "62% 50%",
      "lines": [
        {
          "who": "juri",
          "pose": "pout",
          "need": {
            "flag": "steady",
            "of": "juri"
          },
          "text": "...That's because it's you. You and plastic. You don't count.",
          "show": "juri"
        },
        {
          "who": "juri",
          "need": {
            "flag": "steady",
            "of": "juri"
          },
          "text": "Shut up. I mean you don't judge. You just sit there with your sad rice ball."
        },
        {
          "need": {
            "flag": "steady",
            "not": "declined",
            "of": "juri"
          },
          "text": "For a second she just looks at her hand on yours, longer than the job needs. Then she goes back to the gold line."
        },
        {
          "need": {
            "flag": [
              "steady",
              "declined"
            ],
            "of": "juri"
          },
          "text": "She does not look up from the plastic stick, but the next stroke comes slower, as if someone is holding still for her."
        },
        {
          "who": "juri",
          "pose": "laugh",
          "need": {
            "flag": "tease",
            "of": "juri"
          },
          "text": "Ha! Rude. Seven out of ten. That was actually funny.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "smirk",
          "need": {
            "flag": "tease",
            "of": "juri"
          },
          "text": "Half a cuticle. I'm writing that on my mirror.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "serious",
          "need": {
            "flag": "doubt",
            "of": "juri"
          },
          "text": "...Yeah. Maybe.",
          "show": "juri"
        },
        {
          "need": {
            "flag": "doubt",
            "of": "juri"
          },
          "text": "She keeps painting, but her shoulders drop. The gold line goes on too thick and she doesn't fix it."
        },
        {
          "who": "juri",
          "need": {
            "flag": "doubt",
            "of": "juri"
          },
          "text": "My mom says that too. Wow. You two should get coffee."
        },
        {
          "need": {
            "not": "declined",
            "of": "juri"
          },
          "text": "At 3:10 she seals the last coat and holds your hand up to the light."
        },
        {
          "need": {
            "flag": "declined",
            "of": "juri"
          },
          "text": "At 3:10 she finishes the tenth plastic nail and holds the stick up to the light."
        },
        {
          "who": "juri",
          "pose": "smirk",
          "text": "Okay. That's... honestly? A nine.",
          "show": "juri"
        }
      ],
      "next": "call",
      "music": "/labs/visual-novel/after-hours/music/juri.mp3"
    },
    {
      "id": "call",
      "bg": "/labs/visual-novel/after-hours/bg/konbini.webp",
      "focus": "62% 50%",
      "lines": [
        {
          "cg": "none",
          "text": "3:12 a.m. Her phone buzzes against the counter. OKADA, MANAGER."
        },
        {
          "who": "juri",
          "pose": "serious",
          "text": "At three a.m.? He never calls. He sends voice memos, like a grandpa.",
          "show": "juri"
        },
        {
          "text": "She answers. You hear her half."
        },
        {
          "who": "juri",
          "text": "Yes. ...Yes. Oh no, is he okay? ...Until noon? ...No, it's fine. Sure. No problem. Tell Takumi to feel better."
        },
        {
          "text": "She hangs up and lays the phone face down, gently, as if it might go off."
        },
        {
          "who": "juri",
          "pose": "smirk",
          "text": "So! Takumi has the flu. Someone has to do the morning. I'm here till noon.",
          "show": "juri"
        },
        {
          "text": "Ten a.m. in Ginza. Noon here. You both do the sum. She gets there first."
        },
        {
          "who": "juri",
          "pose": "laugh",
          "text": "It's fine! Honestly. Ginza salons are snobby. They'd hate the pink in my hair. They'd make me wear beige. I'd die in beige.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "smirk",
          "text": "Tonight's a two out of ten. Going down to one if you keep looking at me like that.",
          "show": "juri"
        },
        {
          "text": "She is smiling. The practice stick in her hand is trembling, very slightly."
        },
        {
          "text": "You know one more thing. Mori-san, the retired man who does weekend mornings, lives two streets away and has told the whole building that Juri is his favourite."
        },
        {
          "who": "juri",
          "pose": "serious",
          "text": "And before you say it: no. I'm not calling Mori-san. He's like seventy. I don't ask people for stuff. I just don't.",
          "show": "juri"
        }
      ],
      "choices": [
        {
          "label": "\"Ask Mori-san. Right now.\"",
          "next": "after-call",
          "warmth": {
            "juri": 2
          },
          "flag": "ask"
        },
        {
          "label": "\"Leave at nine anyway. Let Okada deal with it.\"",
          "next": "after-call",
          "flag": "skip"
        },
        {
          "label": "\"Ginza will still be there next year.\"",
          "next": "after-call",
          "warmth": {
            "juri": -2
          },
          "flag": "giveup"
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/juri.mp3"
    },
    {
      "id": "after-call",
      "bg": "/labs/visual-novel/after-hours/bg/konbini.webp",
      "focus": "62% 50%",
      "lines": [
        {
          "who": "juri",
          "pose": "pout",
          "need": {
            "flag": "ask",
            "of": "juri"
          },
          "text": "3:18 a.m. Ugh. You're so annoying when you're right. Which is, like, twice a year.",
          "show": "juri"
        },
        {
          "need": {
            "flag": "ask",
            "of": "juri"
          },
          "text": "She types the message three times. You watch her delete \"sorry to bother you\" twice."
        },
        {
          "who": "juri",
          "pose": "serious",
          "need": {
            "flag": "ask",
            "of": "juri"
          },
          "text": "Sent. He goes to bed at eight. He's asleep. This is pointless.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "serious",
          "need": {
            "flag": "skip",
            "of": "juri"
          },
          "text": "And if Mirabelle says no, I don't have this job either. Babe. Rent.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "pout",
          "need": {
            "flag": "skip",
            "of": "juri"
          },
          "text": "...But okay. I'm thinking about it. Don't watch me think, it's embarrassing.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "smirk",
          "need": {
            "flag": "giveup",
            "of": "juri"
          },
          "text": "Right? Exactly. Next year. Totally.",
          "show": "juri"
        },
        {
          "need": {
            "flag": "giveup",
            "of": "juri"
          },
          "text": "She says it fast, like she was waiting for someone to hand her the line."
        },
        {
          "need": {
            "flag": "giveup",
            "of": "juri"
          },
          "text": "She slides the practice stick into the drawer under the till, behind the receipt rolls."
        },
        {
          "text": "At 4:30 she stands the little back-soon card on the counter and holds up a key."
        },
        {
          "who": "juri",
          "pose": "smirk",
          "text": "Break. Come on. The landlord gave me the roof key for the recycling. I use it for this.",
          "show": "juri"
        }
      ],
      "next": "stairs",
      "music": "/labs/visual-novel/after-hours/music/juri.mp3"
    },
    {
      "id": "stairs",
      "bg": "/labs/visual-novel/after-hours/bg/street-rain.webp",
      "focus": "45% 50%",
      "lines": [
        {
          "pose": "away",
          "text": "4:33 a.m. Outside, the rain has thinned to a mist. The vending machines hum to nobody. She checks the street both ways, like someone might report her."
        },
        {
          "who": "juri",
          "pose": "smirk",
          "text": "If Okada asks, you were stealing umbrellas and I chased you up to the roof. Heroically.",
          "show": "juri"
        },
        {
          "text": "The outside stairs ring under her platform sneakers all the way up, five floors, past your own door."
        }
      ],
      "next": "roof",
      "music": "/labs/visual-novel/after-hours/music/juri.mp3"
    },
    {
      "id": "roof",
      "bg": "/labs/visual-novel/after-hours/bg/rooftop-dawn.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "pose": "away",
          "text": "4:40 a.m. The roof is wet. Over the city the sky has gone from black to deep blue. Somewhere a bird has decided it is morning."
        },
        {
          "text": "She takes the folding chair someone left up here years ago. You lean on the rail. She steals your milk tea without asking."
        },
        {
          "who": "juri",
          "pose": "soft",
          "text": "Best part of the shift. The sky does this and nobody sees it but me and, like, the crows.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "serious",
          "need": {
            "min": 4,
            "of": "juri"
          },
          "text": "My mom has a hair salon in Chiba. Twenty-two years. She's really good. Actually good.",
          "show": "juri"
        },
        {
          "who": "juri",
          "need": {
            "min": 4,
            "of": "juri"
          },
          "text": "When I said nails, she said nails are decoration, not a trade. Then she didn't say much of anything for a year."
        },
        {
          "who": "juri",
          "pose": "soft",
          "need": {
            "min": 4,
            "of": "juri"
          },
          "text": "So I moved out at twenty-one and started nights. Three years of tuna mayo people. Saved for the course. Passed it. Flunked Shibuya.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "pout",
          "need": {
            "min": 4,
            "of": "juri"
          },
          "text": "If I get Mirabelle, I'm sending her a photo. No message. Just the nails. ...That's petty, right? It's petty.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "smirk",
          "need": {
            "max": 3,
            "of": "juri"
          },
          "text": "Don't get weird. I'm not telling you my life story. You haven't earned a life story. You've earned, like, a paragraph.",
          "show": "juri"
        },
        {
          "need": {
            "max": 3,
            "of": "juri"
          },
          "text": "She doesn't give you the paragraph either. She talks about the crows instead, and which one she thinks is in charge."
        },
        {
          "need": {
            "flag": "ask",
            "of": "juri"
          },
          "text": "Her phone buzzes. She reads it twice."
        },
        {
          "who": "juri",
          "pose": "laugh",
          "need": {
            "flag": "ask",
            "of": "juri"
          },
          "text": "He's awake. Why is he awake? 'Of course. I'll be there at 8:30. Go and be wonderful.' And a cat sticker. A cat sticker, Tuna Mayo.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "pout",
          "need": {
            "flag": "ask",
            "of": "juri"
          },
          "text": "...I'm not crying. It's cold. My eyes are cold.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "serious",
          "need": {
            "flag": "skip",
            "of": "juri"
          },
          "text": "If I go at nine, Okada calls me forty times, and then I've got two jobs or zero. Cool. Love that for me.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "soft",
          "need": {
            "flag": "giveup",
            "of": "juri"
          },
          "text": "Next year. Yeah. I'll be twenty-five. That's a normal age to start.",
          "show": "juri"
        },
        {
          "need": {
            "flag": "giveup",
            "of": "juri"
          },
          "text": "She says next year the way people say they'll call you."
        },
        {
          "text": "The sun is not up yet, but the edge of the sky has gone pink, close to the pink under her hair."
        },
        {
          "who": "juri",
          "pose": "smirk",
          "text": "Okay. Last chance to say something cool before I go down and sell cigarettes to taxi drivers.",
          "show": "juri"
        }
      ],
      "choices": [
        {
          "label": "\"You're scared. That's allowed.\"",
          "next": "dawn",
          "warmth": {
            "juri": 1
          },
          "flag": "honest"
        },
        {
          "label": "\"Paint one more nail on me. For luck.\"",
          "next": "dawn",
          "warmth": {
            "juri": 2
          },
          "flag": "star",
          "need": {
            "not": "declined",
            "of": "juri"
          }
        },
        {
          "label": "\"Paint a nail on me. Just one. For luck.\"",
          "next": "dawn",
          "warmth": {
            "juri": 2
          },
          "flag": "star",
          "need": {
            "flag": "declined",
            "of": "juri"
          }
        },
        {
          "label": "\"Whatever happens, I'll be at the counter at 1:52.\"",
          "next": "dawn",
          "warmth": {
            "juri": 1
          },
          "flag": "counter"
        }
      ],
      "music": "/labs/visual-novel/after-hours/music/juri.mp3"
    },
    {
      "id": "dawn",
      "bg": "/labs/visual-novel/after-hours/bg/rooftop-dawn.webp",
      "focus": "50% 50%",
      "lines": [
        {
          "who": "juri",
          "pose": "pout",
          "need": {
            "flag": "honest",
            "of": "juri"
          },
          "text": "5:01 a.m. Wow. Okay. Who said you could just say stuff like that?",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "soft",
          "need": {
            "flag": "honest",
            "of": "juri"
          },
          "text": "...Yeah. I'm scared. Happy? My nails are shaking. That's the first time I've said that out loud.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "laugh",
          "need": {
            "flag": "star",
            "of": "juri"
          },
          "text": "Ehhh? Who's flirting at five a.m. now?",
          "show": "juri"
        },
        {
          "need": {
            "flag": "star",
            "of": "juri"
          },
          "cg": "/labs/visual-novel/after-hours/cg/juri-rooftop.webp",
          "text": "The gold brush is in her vest pocket, because of course it is. She finds your ring finger and paints one tiny star."
        },
        {
          "who": "juri",
          "need": {
            "flag": "star",
            "of": "juri"
          },
          "text": "There. Keep it nice till I'm back. If it chips, that's on you."
        },
        {
          "who": "juri",
          "pose": "smirk",
          "need": {
            "flag": "counter",
            "of": "juri"
          },
          "text": "Ugh. That is such a Tuna Mayo thing to say.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "soft",
          "need": {
            "flag": "counter",
            "of": "juri"
          },
          "text": "...Okay. One fifty-two. Don't be late. If you're late, I'll assume you died.",
          "show": "juri"
        },
        {
          "cg": "/labs/visual-novel/after-hours/cg/juri-rooftop.webp",
          "text": "The first light catches the wet roof and the ends of her hair. She hands back your milk tea. Empty."
        }
      ],
      "routes": [
        {
          "need": {
            "flag": "giveup",
            "of": "juri"
          },
          "next": "end-stay"
        },
        {
          "need": {
            "flag": "star",
            "min": 6,
            "of": "juri"
          },
          "next": "end-ten"
        },
        {
          "need": {
            "max": 2,
            "not": "ask",
            "of": "juri"
          },
          "next": "end-stay"
        }
      ],
      "next": "end-counter",
      "music": "/labs/visual-novel/after-hours/music/juri.mp3"
    },
    {
      "id": "end-ten",
      "bg": "/labs/visual-novel/after-hours/bg/platform-morning.webp",
      "focus": "40% 50%",
      "lines": [
        {
          "pose": "away",
          "cg": "/labs/visual-novel/after-hours/cg/juri-platform.webp",
          "text": "9:04. The rain stopped an hour ago. The platform smells of wet concrete and somebody's coffee."
        },
        {
          "need": {
            "flag": "ask",
            "of": "juri"
          },
          "text": "Mori-san arrived at 8:20 with a thermos and shooed her out of the store with both hands."
        },
        {
          "need": {
            "flag": "skip",
            "of": "juri"
          },
          "text": "She walked out of the store at nine on the dot. Her phone has buzzed eleven times since. She hasn't looked once."
        },
        {
          "text": "There was no time to change. She is still in the store vest, a black blouse folded in her bag for the train. The star clips stayed in."
        },
        {
          "who": "juri",
          "pose": "pout",
          "text": "Don't. Don't say anything about the vest. I'm changing in the train toilet like a spy.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "soft",
          "text": "Train in two minutes. I'm going to do a full set on a stranger while a rich lady watches. Totally normal Tuesday.",
          "show": "juri"
        },
        {
          "pose": "soft",
          "text": "She takes your hand and checks the star on your ring finger. It hasn't chipped.",
          "show": "juri"
        },
        {
          "who": "juri",
          "text": "That's collateral. You don't get to take it off yourself. You come to me, and I do it properly."
        },
        {
          "who": "juri",
          "text": "With, like... dinner first. Somewhere with chairs. Not the counter."
        },
        {
          "who": "juri",
          "text": "And this, right now, is a ten. Don't tell anyone. I've never said ten."
        },
        {
          "text": "The train pulls in. She gets on without looking back, which is how you know she is trying not to."
        },
        {
          "text": "At 11:48 your phone buzzes. A photo: ten soft pink nails, one thin gold line, a tiny star on the ring finger. No message."
        },
        {
          "text": "A minute later, another: \"they said yes. dinner's on you, tuna mayo\""
        }
      ],
      "ending": {
        "title": "Ten out of ten",
        "text": "Juri went to Ginza, and you have a dinner to book."
      },
      "music": "/labs/visual-novel/after-hours/music/dawn.mp3"
    },
    {
      "id": "end-counter",
      "bg": "/labs/visual-novel/after-hours/bg/konbini.webp",
      "focus": "62% 50%",
      "lines": [
        {
          "pose": "away",
          "cg": "none",
          "text": "The next night the door chime plays its two tired notes at exactly 1:52."
        },
        {
          "pose": "smirk",
          "text": "Juri is behind the counter. Her nails are soft pink with one thin gold line.",
          "show": "juri"
        },
        {
          "who": "juri",
          "need": {
            "flag": "ask",
            "of": "juri"
          },
          "text": "Mori-san brought me a thermos and pushed me out the door. Like, physically. He's stronger than he looks."
        },
        {
          "who": "juri",
          "pose": "pout",
          "need": {
            "flag": "skip",
            "of": "juri"
          },
          "text": "Okada left fourteen voicemails. I'm on final warning. Very dramatic. He used my full name.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "smirk",
          "text": "So. Mirabelle. The owner looked at my hair for a really long time.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "laugh",
          "text": "Then she said, 'Come back Thursday for the second round.' There's a second round! Nobody told me there's a second round!",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "soft",
          "text": "...I didn't shake. Not once.",
          "show": "juri"
        },
        {
          "text": "Your rice ball and milk tea are on the counter. She hasn't rung them up."
        },
        {
          "who": "juri",
          "pose": "pout",
          "text": "It's on me. Once. Don't get used to it, and don't make it a thing.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "soft",
          "need": {
            "flag": "honest",
            "of": "juri"
          },
          "text": "And the scared thing. That helped. Or whatever.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "smirk",
          "need": {
            "flag": "counter",
            "of": "juri"
          },
          "text": "You were on time, obviously. More reliable than the trains.",
          "show": "juri"
        },
        {
          "who": "juri",
          "pose": "smirk",
          "need": {
            "flag": "star",
            "of": "juri"
          },
          "text": "The star's still on. Ugh. Cute. Seven out of ten. Keep it till Thursday.",
          "show": "juri"
        },
        {
          "text": "She goes back to her kit. You stay a while by the magazine rack. Neither of you says anything about it."
        }
      ],
      "ending": {
        "title": "One fifty-two",
        "text": "Juri made the first round. Your spot at the counter is still yours."
      },
      "music": "/labs/visual-novel/after-hours/music/juri.mp3"
    },
    {
      "id": "end-stay",
      "bg": "/labs/visual-novel/after-hours/bg/konbini.webp",
      "focus": "62% 50%",
      "lines": [
        {
          "pose": "away",
          "cg": "none",
          "text": "The next night the door chime plays its two tired notes at 1:52."
        },
        {
          "pose": "smirk",
          "text": "Juri is behind the counter. Her nails are the same plain pink as last night. No gold line, no star.",
          "show": "juri"
        },
        {
          "who": "juri",
          "text": "Tuna Mayo! One fifty-two. Reliable as always."
        },
        {
          "who": "juri",
          "pose": "laugh",
          "text": "Morning shift was fine. Takumi's fine. Everything's fine. A solid five out of ten fine.",
          "show": "juri"
        },
        {
          "text": "Your rice ball is not waiting on the counter. She rings it up while you watch, the way she did in your first week."
        },
        {
          "who": "juri",
          "pose": "soft",
          "need": {
            "flag": "star",
            "of": "juri"
          },
          "text": "Oh, and you can take the star off. Remover's in aisle three. It was just practice.",
          "show": "juri"
        },
        {
          "text": "When she turns for your milk tea you see the practice stick in the bin under the counter, ten little nails facing up."
        },
        {
          "who": "juri",
          "pose": "smirk",
          "text": "Next year, though. Totally. Ginza won't know what hit it.",
          "show": "juri"
        },
        {
          "text": "She says it to the till, not to you."
        }
      ],
      "ending": {
        "title": "Next year",
        "text": "Juri stayed for the shift. On another night, she might have gone."
      },
      "music": "/labs/visual-novel/after-hours/music/juri.mp3"
    }
  ]
};
