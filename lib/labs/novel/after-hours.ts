import type { Story } from "../novel";

/**
 * "After Hours": one rainy night on one block, a shared opening and four routes (Juri, Ren, Mio,
 * Sota), 38 scenes and 12 endings. Imported from the Nine Lives dating v001 package; paths point at
 * public/labs/visual-novel/after-hours.
 */
export const afterHours: Story = {
  "title": "After Hours",
  "blurb": "One rainy block. Four invitations. Choose whose night becomes yours.",
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
          "text": "1:52 a.m. Rain follows you into the convenience store under your building. The door chime plays its two tired notes."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Tuna Mayo. One fifty-two on the dot. You know you're more reliable than the trains?"
        },
        {
          "text": "\"The trains stop at midnight.\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "laugh",
          "text": "Exactly. Low bar, and you clear it every night. Your rice ball's by the till already."
        },
        {
          "text": "\"You put it out before I got here?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Nobody else buys it at this hour. Don't make it romantic. Also, your hair. Three out of ten. What happened?"
        },
        {
          "text": "\"It's raining.\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "It's been raining for a week and you still don't own a hood."
        },
        {
          "text": "You drop your umbrella in the stand next to hers: clear plastic, mended with a strip of gold tape. Beside her kit on the counter sit ten practice nails, soft pink, one thin gold line each. The last one is blank."
        },
        {
          "text": "\"What are those for?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "Salon trial. Ten a.m. in Ginza. A real client for ninety minutes while the owner watches."
        },
        {
          "text": "\"Today? As in eight hours from now?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Don't count it out loud. If she likes me, I get a chair with my name on it. An actual name tag."
        },
        {
          "text": "You look at the blank badge on her vest."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "Head office has been printing that for four months. Don't."
        },
        {
          "text": "\"So why is the last nail blank?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "Because plastic doesn't move. Real hands twitch and sweat and ask how long it'll take. I need to practise on a person."
        },
        {
          "text": "\"And I'm the only person here.\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "You're the only person who won't make it weird. So, Tuna Mayo. Lend me a hand? Literally?"
        },
        {
          "text": "She puts her palm face up on the counter and waits."
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
          "text": "2:06 a.m. Before the brush touches anything, the door bangs open. A young woman backs in out of the rain with a guitar case held over her head."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "surprised",
          "text": "Sorry! Sorry. Is it okay if I drip in here for a bit? The guitar's dry. I'm not."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "The floor was dry too, until just now."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "I'll buy something. What's the cheapest thing that makes me a customer?"
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Sweets in the bowl. Thirty yen."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "Sold. And here's another thirty for the floor."
        },
        {
          "text": "She counts out coins, takes one sweet, and lowers the case as if it might bruise. Orange hair buns, yellow hoodie, both soaked through."
        },
        {
          "text": "\"You carried it over your head the whole way?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "From the railway arch. It's worth more than I am. I'm Mio. I play under the tracks most nights."
        },
        {
          "text": "\"The three chords. I can hear you from my window.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "It's four chords now, thank you."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "The fourth turned up last week. The whole block noticed. We were proud."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "The fourth was an accident and I'm keeping it."
        },
        {
          "text": "She opens the case a crack to check inside, and a flyer slides out. You catch it before it lands in the puddle: tomorrow's date, a venue, and a band name crossed out in orange pen."
        },
        {
          "text": "\"You've got a show tomorrow?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "I've got a slot tomorrow. The band quit on Monday. So it's a solo show now, which nobody asked me about, including me."
        },
        {
          "text": "\"Are you going to do it?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Ask me when I'm dry. Thanks for the catch, though. I'm calling you Umbrella until I learn your name."
        },
        {
          "text": "Juri slides a clean towel across the counter without a word. Mio wrings out one hair bun, then looks from you to the stool to Juri's brush."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Wait. Did I walk in on something? Is this a date?"
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "It's a manicure. Whether it's a date depends on how much they flinch."
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
          "text": "2:21 a.m. The chime again. A tall man in navy scrubs ducks in and folds a black umbrella until it is perfectly flat.",
          "cg": "/labs/visual-novel/after-hours/cg/prologue-counter.webp"
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Evening, Juri. Large black coffee, please. I have seven minutes."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Ren. You say seven minutes every night and then stand there for ten."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Tonight I mean it. We're two people short."
        },
        {
          "text": "He notices the water running off your shoulder, pulls a napkin from the dispenser and holds it out."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "You're dripping on the magazines. Here."
        },
        {
          "text": "\"Thanks. Are you from the clinic across the road?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Night nurse. Ren Kurose. And you're the one from the fourth floor who buys the same rice ball every night. Juri talks."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "I do not talk. I report."
        },
        {
          "text": "The door opens once more, only halfway. A broad man in a floury white jacket stands in the gap with an empty egg tray under his arm."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Excuse me. I'm sorry to bother everyone. Juri, do you have any milk left? And eggs?"
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "Sota, it's half two. How many do you need?"
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "All of them, if that's all right. My delivery van broke down on the highway and I've promised the first trays for four o'clock."
        },
        {
          "text": "\"You're the baker? From the place with the green shutter?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Yes. Sota. I've seen you go past in the mornings. You always look as if you've only just woken up."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "They have. Sota, I've got three sweets, if that helps."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "That's very kind. I don't think I can bake with them."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Juri has two cartons of milk and one box of eggs. That isn't four trays. What can you make without them?"
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "My grandmother's salt rolls. They only need flour and water. But I was hoping to try something new this morning."
        },
        {
          "text": "\"New like what?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "It's nothing. It isn't ready. I shouldn't have mentioned it."
        },
        {
          "text": "Ren's phone lights up on the counter. He reads the name, turns it face down and says nothing. Juri rings up the eggs. Mio flattens her flyer against her knee."
        },
        {
          "text": "Four people at one counter, and every one of them is due somewhere by morning."
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
          "text": "2:40 a.m. The rain eases. Through the glass you can see the clinic sign, the railway arch and the bakery shutter, all on the one block.",
          "cg": "none"
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Right. I should get back under the arch before someone steals my spot. Not that anyone wants it."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "And I'm four minutes late. Thank you for the coffee, Juri."
        },
        {
          "text": "He buttons his coat, then stops and turns to you."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "My shift ends at five. There's a bench under the awning at the staff entrance, and I get a few minutes every half hour. If you're not going to sleep anyway, I'd like the company."
        },
        {
          "text": "\"Is that an invitation?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Yes. I'd rather say so than have you guess."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "surprised",
          "text": "I, um. I could use a second pair of hands, if you don't mind flour. I'm not good at explaining things. But there'd be breakfast. I can promise the breakfast."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Hang on, if we're bidding, mine comes with a private concert. You asked about the show. Come and hear it, and tell me honestly whether I should cancel."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Wow. A queue. Should I hand out numbers?"
        },
        {
          "text": "She taps the empty stool with the end of her brush."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "Or you could stay. I've still got one blank nail, and you've still got ten."
        },
        {
          "text": "\"You all want me to pick?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Nobody's forcing you, Tuna Mayo. You can also go upstairs and sleep like a normal person."
        },
        {
          "text": "You finish your milk tea. You were never going to sleep."
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
          "text": "2:44 a.m. Ren walks on the road side of the pavement and matches his pace to yours."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Step left here. That drain floods."
        },
        {
          "text": "You step left. Your shoe misses the water by a hand's width."
        },
        {
          "text": "\"How did you know that?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I've walked this road at five every morning for three years. I know every drain on it."
        },
        {
          "text": "The staff entrance sits between two vending machines, under a striped awning. He puts his coffee on the sill without opening it."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I have four minutes before handover. Sit, if you like. The bench is dry at that end."
        },
        {
          "text": "His phone lights up in his hand. You can read the top line: ISLAND COMMUNITY CLINIC."
        },
        {
          "text": "\"That's the second time tonight. Do you need to get it?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "No. It's a job offer. Head nurse, at the clinic on the island where I grew up. They want an answer by eight this morning."
        },
        {
          "text": "\"That sounds like good news.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "It is. Better title, lower rent, my family ten minutes away. I've written it all down, and the list is very convincing."
        },
        {
          "text": "\"What's on the other side of the list?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Nothing I can put a number on. That's the problem. I'm good with numbers."
        },
        {
          "text": "A ring hangs on a chain beside his staff badge. He sees you looking."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "My father's. He gave it to me the day I moved here. He's alive and well. He just doesn't trust pockets."
        },
        {
          "text": "\"Sorry. I didn't mean to stare.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "You don't have to apologise before you ask me things. People do that with nurses. I'd rather you just asked."
        },
        {
          "text": "A window opens overhead and someone calls his surname. He calls back, \"One minute,\" and looks at you again."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I can be twenty seconds late. Ask me one thing."
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
          "text": "3:18 a.m. Ren comes back out with his sleeves rolled and a paper cup in each hand."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "I've been thinking about your question since I went in. What I want from the city. Nobody asks me that. They ask what the island is offering.",
          "need": {
            "flag": "nurse-want"
          }
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I did what you said and started with the salary. The island pays more. It took two minutes, and I still don't have an answer.",
          "need": {
            "flag": "nurse-salary"
          }
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "About my family deciding. They'd like to, believe me. I'd like a vote as well.",
          "need": {
            "flag": "nurse-family"
          }
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "This is from the machine. It's too sweet and too hot, but it's yours if you want it."
        },
        {
          "text": "\"Thanks. Sit down. You've been on your feet all night.\""
        },
        {
          "text": "He sits. His knee touches yours, and he shifts half an inch away."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Sorry. Crowded bench."
        },
        {
          "text": "\"Ren, there's room for three more people.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "Then please don't tell them."
        },
        {
          "text": "\"Tell me about the island instead.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "The last ferry leaves at six. The bakery shuts before noon. There's a harbour wall my father repaints every spring, and it has never once dried properly."
        },
        {
          "text": "\"Do you miss it?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Yes. My mother sends me photographs of the sea. No message, just the sea. It works on me every time."
        },
        {
          "text": "\"Does she need you back, or does she want you back?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "She wants me back. I keep telling everyone those are different things. I haven't managed to tell myself."
        },
        {
          "text": "The strap on your umbrella has come loose and slaps against the bench leg. He pulls a blue elastic band off his wrist and loops it round."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "There. It was going to hit your leg all the way home."
        },
        {
          "text": "\"Don't you need that?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "It's an elastic band. The clinic has a drawer of them. Keep it."
        },
        {
          "text": "A colleague knocks on the window and points at the clock. Ren stands, and leaves his coffee next to yours."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I finish at five. If you're still here then, I'll stop pretending the bench is crowded."
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
          "text": "4:07 a.m. The staff door opens harder this time. Ren is already reading his phone."
        },
        {
          "text": "\"What happened?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "My brother has told the neighbours I accepted. He says he thought it would encourage me."
        },
        {
          "text": "\"But you haven't answered yet.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I know. It gets worse. There's a welcome dinner on Friday, six people, and my aunt has already bought the fish."
        },
        {
          "text": "You laugh before you can stop yourself. \"Sorry. The fish.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "No, laugh. I can argue with my brother. I don't know how to argue with a fish."
        },
        {
          "text": "He sits down next to you, and this time he leaves his knee where it lands."
        },
        {
          "text": "\"Why did you leave in the first place? Was it bad there?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "No. That would be easier to explain. Everyone on the island knows my father. Every patient I had told me I was just like him."
        },
        {
          "text": "\"And here?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Here nobody knew him. They had to learn my name. It took a year, and I liked every day of it."
        },
        {
          "text": "\"So the work still matters to you.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "The work, yes. And my ridiculous flat. And the noodle shop that remembers I hate coriander. And, apparently, someone who'll sit outside a clinic in the rain at four in the morning."
        },
        {
          "text": "\"That last one's only a few hours old.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "I know. It's still on the list."
        },
        {
          "text": "His phone lights up again with his mother's name. He lets it ring, but he doesn't turn it over."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "If I tell her I want to stay, she'll hear that I don't miss them. If I go, everyone's happy and nobody has to hear anything."
        },
        {
          "text": "The ringing stops. He looks at you and waits."
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
          "text": "4:32 a.m. Ren stands under the awning with the phone in his hand. You wait at the far end of the bench.",
          "cg": "/labs/visual-novel/after-hours/cg/nurse-climax.webp"
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "I'm going to tell her both. That I miss them, and that I haven't decided. You were right that I can say them together.",
          "need": {
            "flag": "nurse-both"
          }
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I'll ask the clinic for another day. But I owe my mother a straight call first.",
          "need": {
            "flag": "nurse-time"
          }
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "I can't let a dinner answer for me. If I go, I want to be the one who said yes.",
          "need": {
            "flag": "nurse-duty"
          }
        },
        {
          "text": "She picks up on the first ring. You only hear his half."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Hello, Mum. Yes, I'm fine. Yes, I've eaten. No, I said coffee, I didn't say only coffee."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "upset",
          "text": "I know they need someone. I know. But I haven't said yes, whatever Daichi told the neighbours."
        },
        {
          "text": "He listens for a long time. His free hand opens and closes on the edge of his coat."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I miss you too. I mean that. And I still haven't said yes."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "No, don't cancel the dinner. Have it without me. Send me a photo of the fish."
        },
        {
          "text": "He hangs up, stands there for a moment, then walks back to the bench."
        },
        {
          "text": "\"How did she take it?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "She asked why I was whispering. Then she asked if I was with someone interesting."
        },
        {
          "text": "\"What did you say?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I told her to go back to sleep."
        },
        {
          "text": "He laughs, quietly, for the first time all night. Then it fades."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "Can I tell you why this is hard? I'm afraid people only want me when I'm useful. At home I'd be useful every day. I don't know who I'd be on a day off."
        },
        {
          "text": "\"You haven't been useful to me once tonight. I'm still here.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "I fixed your umbrella."
        },
        {
          "text": "\"I didn't ask you to.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "No. You haven't asked me for anything. I keep waiting for it."
        },
        {
          "text": "The staff door opens behind him. Last round. He stands up."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Twenty-eight minutes. Will you wait? After that I'm off the clock, and I won't have a professional reason to stand near you."
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
          "text": "5:12 a.m. Ren comes out without his badge. His coat is buttoned one hole wrong.",
          "cg": "none"
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Don't say anything. I did it in the dark."
        },
        {
          "text": "\"Hold still.\" You redo the buttons. He lifts his chin and lets you."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "You're taking a long time over one button."
        },
        {
          "text": "\"It's a difficult button.\""
        },
        {
          "text": "Behind the railway the sky has started to go pale. He takes out his phone and shows you two drafts."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I wrote both. One says yes to the island. One says no, thank you, and offers to help them find someone else."
        },
        {
          "text": "\"Which one did you write first?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "The no. Then I wrote the yes so I'd feel I'd been fair."
        },
        {
          "text": "\"You don't have to be fair. It's your life.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I know. I keep making the decision as if I'll have to defend it in court."
        },
        {
          "text": "He puts the phone in his pocket without sending either."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "Whichever I send, I'd like breakfast afterwards. Somewhere with real cups. With you, if you're not sick of me."
        },
        {
          "text": "\"I've sat on a wet bench for two hours. I'm not sick of you.\""
        },
        {
          "text": "He takes the blue band off your umbrella, loops it back on his own wrist, and holds that hand out to you, palm up."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "You can say no. To breakfast or to the hand. I'd just rather hear it than guess."
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
          "text": "5:28 a.m. Ren sends the no before you've crossed the street. Then he switches his phone off.",
          "cg": "/labs/visual-novel/after-hours/cg/nurse-good.webp"
        },
        {
          "text": "\"How do you feel?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "As if I've wanted to do that for a month. I'm staying because I like my life here. I want you to know I'd decided that before tonight."
        },
        {
          "text": "\"And tonight?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "Tonight is the part I didn't plan for. I'm glad of it."
        },
        {
          "text": "At the crossing he takes your hand. The blue band presses against your wrist."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "smile",
          "text": "There's no medical reason for this. I checked."
        },
        {
          "text": "The bakery isn't open yet. You stand under its awning, closer than the rain requires."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "May I kiss you?"
        },
        {
          "text": "\"Yes.\""
        },
        {
          "text": "The first one is careful. The second starts when he smiles halfway through it."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "That was worth thirty-eight minutes of overtime."
        },
        {
          "text": "\"You finished on time.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "smile",
          "text": "Then I've got no excuse at all."
        },
        {
          "text": "The shutter rattles up. He holds the door for you and doesn't let go of your hand."
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
          "text": "5:28 a.m. Ren saves both drafts and sets an alarm for seven.",
          "cg": "none"
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I'm going to sleep for an hour and read them again somewhere without a vending machine. That isn't an answer. But I've stopped pretending it is."
        },
        {
          "text": "\"That's fair. You've been up all night.\""
        },
        {
          "text": "He walks you to your building. The pavement is drying in patches."
        },
        {
          "text": "\"Here. Your elastic band.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "Keep it. Your umbrella still needs it. And I'll have to come and get it back, which is a respectable reason to see you again."
        },
        {
          "text": "\"You could just ask to see me again.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "I could. Give me your number and I will."
        },
        {
          "text": "He hands you his phone, open on a new contact. You type it in."
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Tomorrow evening. By then I'll know which city I'm having breakfast in."
        },
        {
          "text": "\"Either way, tell me.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "I will. Thank you for waiting tonight. I did notice."
        },
        {
          "text": "He has barely reached the corner when your phone buzzes: \"Proper coffee next time. That's a promise.\""
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
          "text": "5:28 a.m. Ren sends the yes. He reads the confirmation twice and puts the phone away.",
          "cg": "none"
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Friday's ferry. The dinner can go ahead."
        },
        {
          "text": "\"Your family will be pleased.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "They will. That part was always easy to predict."
        },
        {
          "text": "He walks you back across the road. At your door you hold out the blue band."
        },
        {
          "text": "\"You'll want this back.\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "neutral",
          "text": "Thank you. You should get some sleep. I've kept you up long enough."
        },
        {
          "text": "\"Ren. Are you sure?\""
        },
        {
          "who": "nurse",
          "show": "nurse",
          "pose": "soft",
          "text": "It's the sensible choice. Everyone says so."
        },
        {
          "text": "A delivery bike rattles past and he steps back to let it through. Whatever he was going to add, he doesn't."
        },
        {
          "text": "On Friday the rota in the clinic window has a line through his name."
        },
        {
          "text": "That night a photo arrives from a number you don't know: a harbour wall, wet blue paint, the bow of a ferry. Under it: \"Arrived safely.\""
        },
        {
          "text": "You type a reply, delete it, and wish him well instead. He reads it straight away. He doesn't write back."
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
          "text": "2:47 a.m. Mio leads you under the railway arch and sweeps an arm at it like a doorman."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Welcome to the venue. Mind the puddle, that's the VIP entrance."
        },
        {
          "text": "\"How much is a ticket?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Nobody's ever paid, so I've never had to decide."
        },
        {
          "text": "She sets her case down on the one dry patch, under the streetlight. Someone has drawn a small heart on the concrete pillar in orange marker."
        },
        {
          "text": "\"Is the heart yours?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "Yeah. I wanted one fan who'd definitely show up."
        },
        {
          "text": "She tunes by ear, frowning at one string. Her phone is propped in the case lid with the screen lit: \"Need your final lineup by 6. Solo is fine. Cancel if you need to.\""
        },
        {
          "text": "\"Is that the venue?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "Don't read my mail, Umbrella. Yes. That's the venue."
        },
        {
          "text": "\"What happened to the band?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "The drummer got an office job. The bassist is moving to Osaka. And the guitarist says the band's dead, which is rude, because I'm the guitarist."
        },
        {
          "text": "\"So why are you still out here at three in the morning?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Because the pillar hasn't quit yet. And if I stop for one night, I think I'll stop."
        },
        {
          "text": "She starts something bright, gets one line in, and breaks off to fiddle with a tuning peg that was fine."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Okay! Requests. Ask for anything, and I'll explain why I can't play it."
        },
        {
          "text": "A train goes over and drowns her out. She shouts something rude at the ceiling, and you laugh. When it's quiet again she hasn't started. Her hand lies flat on the strings."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Or I could play you the new one. The one for tomorrow. It isn't clever yet, so you'd have to promise not to expect clever."
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
          "text": "3:09 a.m. The first verse is about a laundrette closing down. The second is about leaving a chair empty so that someone has a reason to come back."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "You asked for it, Umbrella. You can't un-hear it now.",
          "need": {
            "flag": "busker-listen"
          }
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "I did the famous one first, like you said. That one after it was mine. I snuck it in.",
          "need": {
            "flag": "busker-cover"
          }
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "I know you said to skip it. I played it anyway. I needed to hear it out loud once.",
          "need": {
            "flag": "busker-hide"
          }
        },
        {
          "text": "She sings the chorus a second time, very quietly, and lets the last line end without a joke on top."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "So. That's three minutes of my actual personality. Awful, right? We never speak of it again."
        },
        {
          "text": "\"Who's the empty chair for?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "My old flat. There were four of us round this tiny table after practice. They moved out one at a time, and every time one left, I bought another chair."
        },
        {
          "text": "\"You bought more chairs when people left?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "I know. I thought it would look like I was expecting company. It looked like a furniture shop."
        },
        {
          "text": "A taxi slows at the kerb. The driver gives her a thumbs up, tosses a coin into the case and drives on."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "A hundred yen! That's the most that song has ever made."
        },
        {
          "text": "\"It's a good song, Mio.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Is the chorus too small, though? I always want to make it louder before anyone hears what it says."
        },
        {
          "text": "\"Play it again and I'll tell you.\""
        },
        {
          "text": "She does. This time you hum the last few notes with her, and she doesn't make it louder."
        },
        {
          "text": "When it ends she unclips an orange pick from her strap and presses it into your palm."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Band membership. Don't panic, there are no rehearsals, and the uniform is whatever you got rained on in."
        },
        {
          "text": "\"I can't play anything.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Neither could my drummer. Just keep it until the show. Otherwise tomorrow I'll decide I made you up."
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
          "text": "3:43 a.m. Her phone buzzes in the case. She picks it up, and her face changes."
        },
        {
          "text": "\"The venue again?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "No. My old bassist. He's sent a clip of our last gig. \"Remember when we thought we'd make it?\" With a laughing face."
        },
        {
          "text": "She plays it. Ten seconds of noise and a drum fill that falls over."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "We were terrible. Listen to that. That's a suitcase going down a staircase."
        },
        {
          "text": "\"You're smiling.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "Because it was fun. It was terrible, and there were four of us being terrible. Now it's forty minutes and just me."
        },
        {
          "text": "She opens the venue's message and starts typing. You can see the first word: \"Sorry\"."
        },
        {
          "text": "\"Mio. What are you writing?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "A cancellation. I've got three songs. Three real ones. The rest of the set is me talking until nobody notices there's no song."
        },
        {
          "text": "\"The one you just played is better than anything in that clip.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "You like me, so you don't count. You're a lovely audience and useless as evidence."
        },
        {
          "text": "\"You think I like you?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "I said that out loud, didn't I. Great. Good night for my mouth."
        },
        {
          "text": "She counts on her fingers: three songs, a cover, another cover. Five, if she slows down enough to let people clap."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "What if nobody comes? No, worse. What if they come, and halfway through they wish they hadn't?"
        },
        {
          "text": "The draft is still open in the case, next to the taxi driver's coin."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Tell me what you'd actually want to hear tomorrow. Not the thing that calms me down. I can usually tell the difference."
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
          "text": "4:19 a.m. You hold her phone and film while Mio records a rehearsal for the venue. The first take lasts nine seconds before she says sorry to the camera.",
          "cg": "/labs/visual-novel/after-hours/cg/busker-climax.webp"
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Let it finish. Okay. If I start a joke in the middle, you're allowed to take the phone away.",
          "need": {
            "flag": "busker-room"
          }
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "A shorter set, fine. But they'll want to hear me first, so I have to get through one whole song.",
          "need": {
            "flag": "busker-short"
          }
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "Maybe you're right and I'm not ready. Let me get one take down before I send anything.",
          "need": {
            "flag": "busker-cancel"
          }
        },
        {
          "text": "The second take lasts twelve seconds. She stops it with her sleeve over her face."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "upset",
          "text": "I play for strangers under a train every night! Why is a phone scarier than that?"
        },
        {
          "text": "\"Because they can play it back.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Yeah. When the band was here, if it went badly there was always someone louder to blame. The drums, the sound, the train."
        },
        {
          "text": "\"And now?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Now if they don't like it, it's just me they didn't like. I'm scared they'll hear me properly and leave anyway."
        },
        {
          "text": "You sit down beside her on the edge of the case. After a moment she leans her head on your shoulder."
        },
        {
          "text": "\"I heard you properly an hour ago. I'm still here.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Have you still got the pick?"
        },
        {
          "text": "\"It's in my hand.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Okay. Okay. One more."
        },
        {
          "text": "She stands, ties her hair back and nods at the phone. This time she starts with her name. No band name, no sorry. The small chorus reaches the far end of the arch at the size she wrote it."
        },
        {
          "text": "You keep filming through the quiet after the last chord. She looks at the lens, then past it at you."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "That one sounded like someone I know."
        },
        {
          "text": "\"Do you want to watch it back?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "No. For once, no. Save it."
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
          "text": "5:06 a.m. The sky past the arch has gone pale. Mio sits next to you with her phone held in both hands.",
          "cg": "none"
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "I've written to them. It says I'll play solo, under my own name, six songs. The rehearsal's attached."
        },
        {
          "text": "\"Six? You said you had three.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "Three of mine and three covers. And I've asked for thirty minutes instead of pretending I can fill forty."
        },
        {
          "text": "\"So send it.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "This is where I'd normally get very funny and change the subject. You might have noticed I do that."
        },
        {
          "text": "\"Once or twice.\""
        },
        {
          "text": "You turn the orange pick over in your fingers. One edge is worn smooth where her thumb goes."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "Oh, the membership card. I never told you what you get. One song request, and unlimited arguments about convenience-store snacks."
        },
        {
          "text": "\"Is that all?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "And a seat in the front row. Not behind the pillar. Somewhere I can look when I forget what my hands are doing."
        },
        {
          "text": "\"I can do the front row.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "And after the show, I'd like to take you somewhere that doesn't have a railway on top of it."
        },
        {
          "text": "\"Is that part of the membership too?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "No. That's me asking you on a date. I'm trying out saying the real thing. How's it going?"
        },
        {
          "text": "Her thumb is still over the send arrow."
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
          "text": "5:19 a.m. Mio presses send and drops the phone into the case as if it's hot.",
          "cg": "/labs/visual-novel/after-hours/cg/busker-good.webp"
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "surprised",
          "text": "It's gone. Oh, that's horrible. Oh, that's amazing. Hang on, I don't know which yet."
        },
        {
          "text": "\"It's amazing.\""
        },
        {
          "text": "She grabs your sleeve and pulls you into a hug, quick and hard. For once the guitar isn't between you."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Am I allowed to kiss my first fan, or is that abusing my fame?"
        },
        {
          "text": "\"Your first fan is a concrete pillar.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "You're right. I'll say sorry to it later."
        },
        {
          "text": "She kisses you laughing, and the laugh stops halfway through. When she pulls back she's the quietest she has been all night."
        },
        {
          "text": "The next evening the orange pick gets you a seat in the front row. Mio walks on alone, finds you, and fixes the microphone once."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Hi. I'm Mio Arata. This first one's for someone who let the last note finish."
        },
        {
          "text": "She plays the small chorus. Nobody leaves. When they clap, she lets that finish too."
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
          "text": "5:19 a.m. Mio sends the rehearsal and asks for a shorter slot. Under the arch the message takes a full minute to go.",
          "cg": "none"
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "Done. A sensible grown-up business email. I feel like I should own a filing cabinet."
        },
        {
          "text": "\"Shorter is still a show.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Yeah. It is, isn't it."
        },
        {
          "text": "She walks you home with the guitar on her back. At your door she takes out the flyer, crosses through the old band's name and writes MIO ARATA above it in orange. She draws a tiny umbrella next to the time."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "No pressure. But if you come, there'll be a chair with a good view of me being brave and stupid."
        },
        {
          "text": "\"Do you want your pick back for it?\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "I did. Now I think you should keep it. Then I've got an excuse to text and ask how your day was."
        },
        {
          "text": "\"You don't need an excuse.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "smile",
          "text": "I know. I like having one."
        },
        {
          "text": "That evening your phone gets six seconds of guitar and a message: \"Still playing. Still terrified. Snack argument after the show.\""
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
          "text": "5:19 a.m. Mio sends the cancellation. She writes a careful sorry, deletes the joke at the end, and shuts the case.",
          "cg": "none"
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "They'll find someone. It's a good slot. Better it goes to someone who'll use it."
        },
        {
          "text": "\"You'd have used it.\""
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "neutral",
          "text": "Maybe next time. When there's a band again."
        },
        {
          "text": "You hold out the pick. She takes it and clips it back on the strap without looking up."
        },
        {
          "who": "busker",
          "show": "busker",
          "pose": "soft",
          "text": "Thanks for listening tonight. I mean it. That bit was good."
        },
        {
          "text": "You walk as far as the corner together. She turns towards the station, where the first commuters are gathering."
        },
        {
          "text": "The next night there's a different name on the venue's board. Under the railway, Mio plays a song everybody knows. A few people stop. A few drop coins."
        },
        {
          "text": "She sees you and waves with the pick, then starts the next verse."
        },
        {
          "text": "The song about the empty chair isn't in the set. You still remember how it ends."
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
          "text": "2:46 a.m. Sota holds the bakery door open with his shoulder while you carry the milk in. The air inside is warm and smells of yeast."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Thank you. Mind the step. And the tray. No, wait, let me move the tray."
        },
        {
          "text": "\"It's fine, I can get round it.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Sorry. I don't usually have anyone in here this early. I've forgotten how to host."
        },
        {
          "text": "The kitchen is narrow and very clean: a drawer with a mismatched handle, a recipe book held together with cloth tape. He washes his hands and passes you an apron."
        },
        {
          "text": "\"I think I've twisted the straps.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "You have. May I?"
        },
        {
          "text": "He steps behind you and reties them, slowly."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Is that too tight?"
        },
        {
          "text": "\"No. It's good.\""
        },
        {
          "text": "There are two bowls on the bench. One is plain dough. The other smells of orange peel and toasted sesame."
        },
        {
          "text": "\"Which one's the new thing you wouldn't tell us about?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "You remembered that. The plain one is my grandmother's salt rolls. The other is an idea of mine. I don't think it deserves a whole shelf."
        },
        {
          "text": "\"How many shelves does an idea usually get?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "smile",
          "text": "Half of one, maybe. A corner at the back."
        },
        {
          "text": "\"Has anyone tried it?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Only me. I've made it three times this week and eaten every batch at home, so that nobody would see."
        },
        {
          "text": "The oven timer clicks. He rests both hands on the bench and looks from one bowl to the other."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "There's only time to shape one batch before four. Which would you like to learn?"
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
          "text": "3:12 a.m. Sota shows you the fold. In his hands it takes two seconds."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "\"Your version.\" I like how that sounds. Nobody has called it mine before, including me.",
          "need": {
            "flag": "baker-version"
          }
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Salt rolls first, then. That's sensible. We can try mine after, if there's time.",
          "need": {
            "flag": "baker-familiar"
          }
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "You're right, it is a risk. Perhaps we just taste mine in here, between us, and nobody else has to know.",
          "need": {
            "flag": "baker-risk"
          }
        },
        {
          "text": "\"Like this?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "smile",
          "text": "Nearly. It's meant to stick to you a little. Dough doesn't trust strangers."
        },
        {
          "text": "Your first roll looks like a folded sock. He sets it beside his own perfect one and says nothing."
        },
        {
          "text": "\"You can laugh. It's terrible.\""
        },
        {
          "text": "He gives his own roll a deliberate pinch, so that it leans the same way as yours."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "There. Now they look related."
        },
        {
          "text": "He reaches past you for a tray and stops. You step left. So does he."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "surprised",
          "text": "Sorry. I've worked in this room for six years, and tonight I can't remember how wide it is."
        },
        {
          "text": "\"You've got flour on your neck.\""
        },
        {
          "text": "He wipes the wrong side."
        },
        {
          "text": "\"Other side. Here, give me the cloth.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Would you? Thank you."
        },
        {
          "text": "He holds very still while you brush it off. Above the bench, a photograph shows a small old woman holding a tray wider than she is."
        },
        {
          "text": "\"Is that her? Your grandmother?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Yes. She taught me the knot on these rolls: two turns and tuck the end. She said it stops promises coming undone."
        },
        {
          "text": "He loops a strip of apron ribbon twice round your wrist to show you, loose enough to slip off."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "That's not a real knot, only the shape. I wouldn't tie you to a bakery on the first night."
        },
        {
          "text": "\"The first night?\""
        },
        {
          "text": "He goes red to the ears. The timer rings before he can say sorry."
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
          "text": "3:41 a.m. The first rolls are cooling on the rack. The orange dough is still under its cloth."
        },
        {
          "text": "Sota opens the recipe book and a slip of paper falls out. You pick it up: \"Don't rush the second rise. You always do.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "That's her handwriting. She left those all over the kitchen. I'm still finding them."
        },
        {
          "text": "\"When did she die?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "In March. People come in and ask if the bread still tastes the same. I say yes before they've even tried it."
        },
        {
          "text": "\"Why before?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Because I want them to feel she's still here. If the bread's the same, she is."
        },
        {
          "text": "He turns to a page thick with measurements. In the margin, in different handwriting, someone has written \"orange?\" next to three crossed-out numbers."
        },
        {
          "text": "\"That's your writing.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "Yes. I shouldn't have written in her book."
        },
        {
          "text": "\"Why not? You're the one baking from it.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Because it's hers."
        },
        {
          "text": "\"Then tell me about the orange. Why orange?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "She put the peel in her tea. She couldn't stand wasting any part of a fruit. I thought it might work in a roll. Something warm with a little bite."
        },
        {
          "text": "\"So the idea came from her.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "But the roll didn't. If I put it out front, someone will say, \"This isn't hers.\" They'll be right, and I'll have to stand there and agree with them."
        },
        {
          "text": "He takes a blank price card from the drawer and sets it on the bench between you."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "I don't even know what I'd write on it."
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
          "text": "4:16 a.m. Sota opens the oven. The first tray of orange rolls has browned too fast on one side.",
          "cg": "/labs/visual-novel/after-hours/cg/baker-climax.webp"
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "You said it could be mine and still belong here. I've been turning that over. I'd like it to be true.",
          "need": {
            "flag": "baker-room"
          }
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Samples are a good idea. But we should taste them ourselves before anyone else does.",
          "need": {
            "flag": "baker-samples"
          }
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "I'll keep her book as it was, as you said. But then I need somewhere else to write this down.",
          "need": {
            "flag": "baker-book"
          }
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "Oh, no. I should have turned the tray. I know that corner runs hot. I'm sorry, you stayed up for this."
        },
        {
          "text": "He starts to carry it to the back counter, out of sight."
        },
        {
          "text": "\"Wait. Put it down. Which one do I cut?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "upset",
          "text": "You don't have to eat a burnt one to be polite."
        },
        {
          "text": "\"I'm hungry. I'm not being polite. Which one?\""
        },
        {
          "text": "He picks out the most crooked roll. The crust cracks under the knife. Inside it is soft, with threads of orange."
        },
        {
          "text": "\"Sota. This is really good.\""
        },
        {
          "text": "He tries a piece himself, then a second before he remembers to look disappointed."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "The sesame needs more salt."
        },
        {
          "text": "\"And?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "smile",
          "text": "And the orange works. It does, doesn't it?"
        },
        {
          "text": "He writes the salt down in the margin of the book, and this time he doesn't rub it out."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "I keep thinking that if I change anything, the shop stops being proof she was here. It sounds foolish, said out loud in a room covered in her notes."
        },
        {
          "text": "\"It doesn't sound foolish.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "I'm frightened of making something she can't tell me is good. I miss asking her. Even when I knew she'd say no."
        },
        {
          "text": "\"What would she say about this one?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "That I rushed the second rise. And then she'd have eaten three. She'd have liked that you chose the crooked one."
        },
        {
          "text": "He turns the second tray before he shuts the oven door. The first he leaves in the middle of the bench, where anyone could see it."
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
          "text": "5:03 a.m. The shutter is half up. A stripe of early light lies across the counter, about one tray wide.",
          "cg": "none"
        },
        {
          "text": "Sota puts the orange rolls down in it. He has brushed off his jacket and retied his braid. The price card is still blank."
        },
        {
          "text": "\"Where do the salt rolls go?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Next to them. Nobody has to pick only one."
        },
        {
          "text": "\"Did you hear what you just said?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "I did. I surprised myself."
        },
        {
          "text": "You slide the old wooden tray to the left to make room. Nothing has to come off the counter."
        },
        {
          "text": "\"The first customer's in twenty minutes. What goes on the card?\""
        },
        {
          "text": "He reaches for the glass cloth, stops, and puts it down again."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "I was about to polish the case for the third time. I do that when I don't want to decide."
        },
        {
          "text": "\"I noticed. It's very clean.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Will you stay for breakfast, after I open? By the window. I'd rather not have a counter between us."
        },
        {
          "text": "\"I was promised breakfast four hours ago.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "You were. And some other day, when I'm not covered in flour, I'd like to take you to dinner. I can manage a restaurant. I know tonight doesn't prove it."
        },
        {
          "text": "He touches the ribbon on your wrist, then picks up the pen."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "One brave thing at a time. The card first. What do you think?"
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
          "text": "5:27 a.m. Sota writes ORANGE AND SESAME in big steady letters. Underneath, smaller: \"Sota's morning rolls.\"",
          "cg": "/labs/visual-novel/after-hours/cg/baker-good.webp"
        },
        {
          "text": "The first customer is a woman with a pram. \"Are these new?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "smile",
          "text": "Yes. They're mine."
        },
        {
          "text": "She buys two. When the bell stops ringing he stares at the gap in the tray, then at you."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "smile",
          "text": "She said she'd be back for more. I should start another batch."
        },
        {
          "text": "\"In a minute.\""
        },
        {
          "text": "He takes your hand, ribbon and all, and kisses your knuckles."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "I'd like to kiss you properly as well. If you'd like that."
        },
        {
          "text": "\"I've been waiting since the flour.\""
        },
        {
          "text": "He bends down, one hand careful at your back. He's shy about it until you take hold of his collar. After that he forgets to say sorry for anything."
        },
        {
          "text": "You eat breakfast by the window, your two crooked rolls on one plate. He unties the ribbon and lays it beside the recipe book."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "For next time. You still can't do the knot."
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
          "text": "5:27 a.m. Sota cuts three rolls into pieces on a small plate, writes TRIAL BATCH on the card, and sets it beside his grandmother's tray.",
          "cg": "none"
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "I'll ask people what they think. That's a start, isn't it?"
        },
        {
          "text": "\"It's a start.\""
        },
        {
          "text": "The first customer takes a piece and says the orange is lovely. He writes that in the book too."
        },
        {
          "text": "You help carry the empty trays back. He makes you breakfast, and you make him sit down for half of it."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Thank you. Otherwise you'd only remember me as a back bent over an oven."
        },
        {
          "text": "At the door you slip the ribbon off. \"This is yours.\""
        },
        {
          "text": "He folds it twice and tucks it into the recipe book, at the new page."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Thank you for staying long enough to taste it. Would you come back when I've fixed the salt?"
        },
        {
          "text": "\"When's that?\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Thursday. I'll write it down for you."
        },
        {
          "text": "He writes it on the back of a receipt and, after a moment, adds his number underneath. When he hands it over, he doesn't let go straight away."
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
          "text": "5:27 a.m. Sota carries the orange tray back into the kitchen. The card goes in the drawer, still blank.",
          "cg": "none"
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Another morning, perhaps. I should get the ordinary batch right first."
        },
        {
          "text": "\"The ordinary batch is already right.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "neutral",
          "text": "Then I should keep it that way."
        },
        {
          "text": "He wraps two of the orange rolls in paper for you. They're still warm."
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Take these, please. I don't want them wasted. I hope they're still nice by the time you're upstairs."
        },
        {
          "text": "\"Sota, you could put them out tomorrow.\""
        },
        {
          "who": "baker",
          "show": "baker",
          "pose": "soft",
          "text": "Tomorrow, yes. Maybe."
        },
        {
          "text": "You leave the ribbon on the bench. He folds it neatly and goes to raise the shutter the rest of the way."
        },
        {
          "text": "From the street the bakery looks the way it did yesterday. The same names on the same cards. The photograph above the bench."
        },
        {
          "text": "Upstairs you cut one roll in half, and the kitchen fills with orange. You eat it slowly. You wish you'd said something else while the card was blank."
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
          "text": "2:42 a.m. The others head off to their own nights. Juri drags the stool back to the counter.",
          "show": "juri"
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "laugh",
          "text": "Ehhh? Hand straight on the counter earlier, no bargaining? You're too easy, Tuna Mayo. That's dangerous at two a.m.",
          "need": {
            "flag": "hand",
            "of": "juri"
          }
        },
        {
          "text": "\"You asked nicely.\"",
          "need": {
            "flag": "hand",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "I never ask nicely. You're just soft.",
          "need": {
            "flag": "hand",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "laugh",
          "text": "So. Your big negotiation. One hand for one free rice ball.",
          "need": {
            "flag": "haggle",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Fine. It's on me. One. But if you flinch when the polish is cold, I'm charging you double.",
          "need": {
            "flag": "haggle",
            "of": "juri"
          }
        },
        {
          "text": "\"Deal.\"",
          "need": {
            "flag": "haggle",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "You said you start at nine. Ew. A day person. So why are you still here?",
          "need": {
            "flag": "declined",
            "of": "juri"
          }
        },
        {
          "text": "\"I'm finishing my tea.\"",
          "need": {
            "flag": "declined",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "Sure you are. Fine, I'll use my plastic friend. He never complains. Eight out of ten conversationalist.",
          "need": {
            "flag": "declined",
            "of": "juri"
          }
        },
        {
          "text": "You end up leaning on the magazine rack, watching her work. She pretends not to notice.",
          "need": {
            "flag": "declined",
            "of": "juri"
          }
        },
        {
          "text": "She taps the counter twice. You lay your hand flat, and she turns it over like fruit at the market.",
          "need": {
            "not": "declined",
            "of": "juri"
          },
          "show": "juri"
        },
        {
          "who": "juri",
          "text": "Cuticles: tragic. Nail beds: actually kind of nice? Don't let it go to your head.",
          "need": {
            "not": "declined",
            "of": "juri"
          }
        },
        {
          "text": "\"So what's the design?\""
        },
        {
          "who": "juri",
          "text": "The Mirabelle set. Soft pink, one thin gold line, a little star on the ring finger. The owner's whole thing is \"quiet luxury\". So, the opposite of me."
        },
        {
          "text": "Her strokes are short and sure. Up close she smells of polish and the peach gum she chews to stay awake.",
          "need": {
            "not": "declined",
            "of": "juri"
          }
        },
        {
          "text": "\"Why do you work nights, if this is what you want to do?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "Because nobody watches. I can practise for four hours and the only witness is the guy who buys cat food at three."
        },
        {
          "text": "\"Have you done a trial before?\""
        },
        {
          "who": "juri",
          "text": "Once. Last year, a different salon, in Shibuya."
        },
        {
          "text": "\"How did it go?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "My hand shook so much I painted the client's cuticle. The whole cuticle. Pink. And she was so nice about it, which was worse. I wanted her to yell."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Anyway! Sad story over. Three out of ten, not enough crying."
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
          "show": "juri",
          "pose": "pout",
          "text": "...That's because it's you. You and plastic. You don't count.",
          "need": {
            "flag": "steady",
            "of": "juri"
          }
        },
        {
          "text": "\"I don't count?\"",
          "need": {
            "flag": "steady",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "text": "Shut up. I mean you don't judge. You just sit there with your sad rice ball.",
          "need": {
            "flag": "steady",
            "of": "juri"
          }
        },
        {
          "text": "For a second she looks at her hand on yours, longer than the job needs. Then she goes back to the gold line.",
          "need": {
            "flag": "steady",
            "not": "declined",
            "of": "juri"
          }
        },
        {
          "text": "She doesn't look up from the plastic stick, but the next stroke comes slower, as if someone were holding still for her.",
          "need": {
            "flag": [
              "steady",
              "declined"
            ],
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "laugh",
          "text": "Ha! Rude. Seven out of ten. That was actually funny.",
          "need": {
            "flag": "tease",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Half a cuticle. I'm writing that on my mirror.",
          "need": {
            "flag": "tease",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "...Yeah. Maybe.",
          "need": {
            "flag": "doubt",
            "of": "juri"
          }
        },
        {
          "text": "She keeps painting, but her shoulders drop. The gold line goes on too thick and she doesn't fix it.",
          "need": {
            "flag": "doubt",
            "of": "juri"
          }
        },
        {
          "text": "\"I didn't mean you couldn't do it.\"",
          "need": {
            "flag": "doubt",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "text": "I know what you meant. My mom says it too. You two should get coffee.",
          "need": {
            "flag": "doubt",
            "of": "juri"
          }
        },
        {
          "text": "At 3:10 she seals the last coat and holds your hand up to the light.",
          "need": {
            "not": "declined",
            "of": "juri"
          }
        },
        {
          "text": "At 3:10 she finishes the tenth plastic nail and holds the stick up to the light.",
          "need": {
            "flag": "declined",
            "of": "juri"
          }
        },
        {
          "text": "\"Well? Out of ten?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "That's... honestly? A nine."
        },
        {
          "text": "\"What does a ten look like?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "I've never given one. Don't push it."
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
          "text": "3:12 a.m. Her phone buzzes against the counter. OKADA, MANAGER.",
          "cg": "none"
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "At three a.m.? He never calls. He sends voice memos, like a grandpa."
        },
        {
          "text": "She answers. You only hear her half."
        },
        {
          "who": "juri",
          "text": "Yes. ...Yes. Oh no, is he okay? ...Until noon? ...No, it's fine. Sure. No problem. Tell Takumi to feel better."
        },
        {
          "text": "She hangs up and puts the phone face down, gently, as if it might go off."
        },
        {
          "text": "\"What was that?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Takumi has the flu. Someone has to cover the morning. So I'm here till noon."
        },
        {
          "text": "\"Juri. Your trial's at ten.\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "laugh",
          "text": "It's fine! Honestly. Ginza salons are snobby. They'd hate the pink in my hair. They'd make me wear beige. I'd die in beige."
        },
        {
          "text": "\"You've practised for this every night for months.\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Tonight's a two out of ten, and it's going down to one if you keep looking at me like that."
        },
        {
          "text": "She's smiling. The practice stick in her hand is shaking, very slightly."
        },
        {
          "text": "\"What about Mori-san? He lives two streets away. He tells the whole building you're his favourite.\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "No. I'm not calling Mori-san. He's, like, seventy. I don't ask people for stuff. I just don't."
        },
        {
          "text": "\"Why not?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "Because then they can say no."
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
          "text": "3:18 a.m. She turns the phone over, then back."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "Ugh. You're so annoying when you're right. Which is, like, twice a year.",
          "need": {
            "flag": "ask",
            "of": "juri"
          }
        },
        {
          "text": "She types the message three times. You watch her delete \"sorry to bother you\" twice.",
          "need": {
            "flag": "ask",
            "of": "juri"
          }
        },
        {
          "text": "\"Just say what you need.\"",
          "need": {
            "flag": "ask",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "Sent. He goes to bed at eight, though. He's asleep. This is pointless.",
          "need": {
            "flag": "ask",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "Just walk out at nine? And if Mirabelle says no, I don't have this job either. Babe. Rent.",
          "need": {
            "flag": "skip",
            "of": "juri"
          }
        },
        {
          "text": "\"Okada isn't going to fire his only night clerk.\"",
          "need": {
            "flag": "skip",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "...Okay. I'm thinking about it. Don't watch me think, it's embarrassing.",
          "need": {
            "flag": "skip",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Right? Exactly. Next year. Totally.",
          "need": {
            "flag": "giveup",
            "of": "juri"
          }
        },
        {
          "text": "She says it fast, as if she'd been waiting for someone to hand her the line.",
          "need": {
            "flag": "giveup",
            "of": "juri"
          }
        },
        {
          "text": "She slides the practice stick into the drawer under the till, behind the receipt rolls.",
          "need": {
            "flag": "giveup",
            "of": "juri"
          }
        },
        {
          "text": "At 4:30 she stands the back-soon card on the counter and holds up a key."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Break. Come on. The landlord gave me the roof key for the recycling. I use it for this."
        },
        {
          "text": "\"For what?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "You'll see. Bring your tea."
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
          "text": "4:33 a.m. Outside, the rain has thinned to mist. She checks the street both ways, as if someone might report her."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "If Okada asks, you were stealing umbrellas and I chased you up to the roof. Heroically."
        },
        {
          "text": "\"Why am I the thief in this story?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Because I'm the one with the key."
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
          "text": "4:40 a.m. The roof is wet. Over the city the sky has gone from black to deep blue. Somewhere a bird has decided it's morning."
        },
        {
          "text": "She takes the folding chair someone left up here years ago. You lean on the rail. She takes your milk tea without asking."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "Best part of the shift. The sky does this and nobody sees it but me and, like, the crows."
        },
        {
          "text": "\"Why nails? Really.\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "My mom has a hair salon in Chiba. Twenty-two years. She's really good. Actually good.",
          "need": {
            "min": 4,
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "text": "When I said I wanted to do nails, she said nails are decoration, not a trade. Then she didn't say much of anything for a year.",
          "need": {
            "min": 4,
            "of": "juri"
          }
        },
        {
          "text": "\"So you left.\"",
          "need": {
            "min": 4,
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "At twenty-one. Started nights. Three years of tuna mayo people. Saved for the course, passed it, flunked Shibuya.",
          "need": {
            "min": 4,
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "If I get Mirabelle, I'm sending her a photo. No message. Just the nails. ...That's petty, right? It's petty.",
          "need": {
            "min": 4,
            "of": "juri"
          }
        },
        {
          "text": "\"It's a little petty. Send it anyway.\"",
          "need": {
            "min": 4,
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Don't get weird. I'm not telling you my life story. You haven't earned a life story. You've earned, like, a paragraph.",
          "need": {
            "max": 3,
            "of": "juri"
          }
        },
        {
          "text": "She doesn't give you the paragraph either. She talks about the crows instead, and which one she thinks is in charge.",
          "need": {
            "max": 3,
            "of": "juri"
          }
        },
        {
          "text": "Her phone buzzes. She reads it twice.",
          "need": {
            "flag": "ask",
            "of": "juri"
          }
        },
        {
          "text": "\"Is that him?\"",
          "need": {
            "flag": "ask",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "laugh",
          "text": "He's awake. Why is he awake? \"Of course. I'll be there at 8:30. Go and be wonderful.\" And a cat sticker. A cat sticker, Tuna Mayo.",
          "need": {
            "flag": "ask",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "...I'm not crying. It's cold. My eyes are cold.",
          "need": {
            "flag": "ask",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "serious",
          "text": "If I go at nine, Okada calls me forty times, and then I've got two jobs or zero. Cool. Love that for me.",
          "need": {
            "flag": "skip",
            "of": "juri"
          }
        },
        {
          "text": "\"Or one, and it's the one you want.\"",
          "need": {
            "flag": "skip",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "Next year. Yeah. I'll be twenty-five. That's a normal age to start.",
          "need": {
            "flag": "giveup",
            "of": "juri"
          }
        },
        {
          "text": "She says \"next year\" the way people say they'll call you.",
          "need": {
            "flag": "giveup",
            "of": "juri"
          }
        },
        {
          "text": "The sun isn't up yet, but the edge of the sky has gone pink, close to the pink under her hair."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Okay. Last chance to say something cool before I go down and sell cigarettes to taxi drivers."
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
          "text": "5:01 a.m. She looks at you for a second before she answers."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "Wow. Okay. Who said you could just say stuff like that?",
          "need": {
            "flag": "honest",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "...Yeah. I'm scared. Happy? That's the first time I've said it out loud.",
          "need": {
            "flag": "honest",
            "of": "juri"
          }
        },
        {
          "text": "\"How does it feel?\"",
          "need": {
            "flag": "honest",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "Bad. And kind of lighter. Shut up.",
          "need": {
            "flag": "honest",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "laugh",
          "text": "Ehhh? Who's flirting at five a.m. now?",
          "need": {
            "flag": "star",
            "of": "juri"
          }
        },
        {
          "text": "The gold brush is in her vest pocket, because of course it is. She finds your ring finger and paints one tiny star.",
          "need": {
            "flag": "star",
            "of": "juri"
          },
          "cg": "/labs/visual-novel/after-hours/cg/juri-rooftop.webp"
        },
        {
          "who": "juri",
          "text": "There. Keep it nice till I'm back. If it chips, that's on you.",
          "need": {
            "flag": "star",
            "of": "juri"
          }
        },
        {
          "text": "\"And if it doesn't chip?\"",
          "need": {
            "flag": "star",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Then I'm better than I thought.",
          "need": {
            "flag": "star",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Ugh. That is such a Tuna Mayo thing to say.",
          "need": {
            "flag": "counter",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "...Okay. One fifty-two. Don't be late. If you're late, I'll assume you died.",
          "need": {
            "flag": "counter",
            "of": "juri"
          }
        },
        {
          "text": "The first light catches the wet roof and the ends of her hair. She hands back your milk tea. Empty.",
          "cg": "/labs/visual-novel/after-hours/cg/juri-rooftop.webp"
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
          "text": "9:04. The rain stopped an hour ago. The platform smells of wet concrete and somebody's coffee.",
          "cg": "/labs/visual-novel/after-hours/cg/juri-platform.webp"
        },
        {
          "text": "Mori-san turned up at 8:20 with a thermos and shooed her out of the store with both hands.",
          "need": {
            "flag": "ask",
            "of": "juri"
          }
        },
        {
          "text": "She walked out of the store at nine on the dot. Her phone has buzzed eleven times since. She hasn't looked once.",
          "need": {
            "flag": "skip",
            "of": "juri"
          }
        },
        {
          "text": "There was no time to change. She's still in the store vest, with a black blouse folded in her bag. The star clips stayed in."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "Don't. Don't say anything about the vest. I'm changing in the train toilet like a spy."
        },
        {
          "text": "\"I wasn't going to. How are your hands?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "Fine. Look. Steady. Train's in two minutes, and then I do a full set on a stranger while a rich lady watches. Totally normal Tuesday."
        },
        {
          "text": "She takes your hand and checks the star on your ring finger. It hasn't chipped.",
          "show": "juri"
        },
        {
          "who": "juri",
          "text": "That's collateral. You don't get to take it off yourself. You come to me, and I do it properly."
        },
        {
          "text": "\"When?\""
        },
        {
          "who": "juri",
          "text": "After dinner. Somewhere with chairs. Not the counter."
        },
        {
          "text": "\"Are you asking me out, Juri?\""
        },
        {
          "who": "juri",
          "text": "I'm telling you that this, right now, is a ten. Don't tell anyone. I've never said ten."
        },
        {
          "text": "The train pulls in. She gets on without looking back, which is how you know she's trying not to."
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
          "text": "The next night the door chime plays its two tired notes at exactly 1:52.",
          "cg": "none"
        },
        {
          "text": "Juri is behind the counter. Her nails are soft pink with one thin gold line.",
          "show": "juri"
        },
        {
          "text": "\"Well? How did it go?\""
        },
        {
          "who": "juri",
          "text": "Mori-san brought me a thermos and pushed me out the door. Like, physically. He's stronger than he looks.",
          "need": {
            "flag": "ask",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "Okada left fourteen voicemails. I'm on final warning. Very dramatic. He used my full name.",
          "need": {
            "flag": "skip",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "So. Mirabelle. The owner looked at my hair for a really long time."
        },
        {
          "text": "\"And?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "laugh",
          "text": "And she said, \"Come back Thursday for the second round.\" There's a second round! Nobody told me there's a second round!"
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "...I didn't shake. Not once."
        },
        {
          "text": "\"I knew you wouldn't.\""
        },
        {
          "text": "Your rice ball and milk tea are on the counter. She hasn't rung them up."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "pout",
          "text": "It's on me. Once. Don't get used to it, and don't make it a thing."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "And the scared thing. That helped. Or whatever.",
          "need": {
            "flag": "honest",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "You were on time, obviously. More reliable than the trains.",
          "need": {
            "flag": "counter",
            "of": "juri"
          }
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "The star's still on. Ugh. Cute. Seven out of ten. Keep it till Thursday.",
          "need": {
            "flag": "star",
            "of": "juri"
          }
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
          "text": "The next night the door chime plays its two tired notes at 1:52.",
          "cg": "none"
        },
        {
          "text": "Juri is behind the counter. Her nails are the same plain pink as last night. No gold line, no star.",
          "show": "juri"
        },
        {
          "who": "juri",
          "text": "Tuna Mayo! One fifty-two. Reliable as always."
        },
        {
          "text": "\"How was the morning shift?\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "laugh",
          "text": "Fine. Takumi's fine. Everything's fine. A solid five out of ten fine."
        },
        {
          "text": "Your rice ball isn't waiting on the counter. She rings it up while you watch, the way she did in your first week."
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "soft",
          "text": "Oh, and you can take the star off. Remover's in aisle three. It was just practice.",
          "need": {
            "flag": "star",
            "of": "juri"
          }
        },
        {
          "text": "When she turns for your milk tea you see the practice stick in the bin under the counter, ten little nails facing up."
        },
        {
          "text": "\"Juri.\""
        },
        {
          "who": "juri",
          "show": "juri",
          "pose": "smirk",
          "text": "Next year, though. Totally. Ginza won't know what hit it."
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
