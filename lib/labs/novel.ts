const L = "/labs/visual-novel";

/** Juri's sprite poses. Each is a transparent cut-out drawn over the background. */
export type Pose = "smirk" | "laugh" | "pout" | "serious" | "soft";

/**
 * A condition on the reader's run so far: a flag (or every flag in a list) their choices set, a flag
 * they did not set, and a floor or ceiling on how warm Juri is towards them. Plain data, so the
 * story can cross from the server page to the client player.
 */
export type Need = { flag?: string | string[]; not?: string; min?: number; max?: number };

export type Line = {
  /** "juri", or left out for narration. */
  who?: "juri";
  text: string;
  /** Juri's pose from this line on. "away" takes her off screen. */
  pose?: Pose | "away";
  /** An event illustration from this line on, in place of the background and sprite. "none" clears it. */
  cg?: string;
  need?: Need;
};

/** A choice with a `need` is offered only to a run that meets it. */
export type Choice = { label: string; next: string; warmth?: number; flag?: string; need?: Need };

export type Scene = {
  id: string;
  bg: string;
  /** Where the background is anchored when a narrow screen crops it. */
  focus?: string;
  lines: Line[];
  choices?: Choice[];
  next?: string;
  /** Checked in order after the last line; the first match wins, and `next` is the fallback. */
  routes?: { need: Need; next: string }[];
  ending?: { title: string; text: string };
};

export type Story = {
  title: string;
  blurb: string;
  start: string;
  /** Art shown behind the title screen. */
  cover: string;
  /** Juri's sprites by pose, one transparent cut-out per pose on the same canvas. A pose with no file shows the scene without her. */
  lead: { name: string; poses: Partial<Record<Pose, string>> };
  scenes: Scene[];
};

const bg = {
  store: `${L}/bg/konbini.webp`,
  street: `${L}/bg/street-rain.webp`,
  roof: `${L}/bg/rooftop-dawn.webp`,
  platform: `${L}/bg/platform-morning.webp`,
};
const cg = {
  roof: `${L}/cg/juri-rooftop.webp`,
};

/**
 * "After Hours", one chapter. Juri Hoshino is 24, a gyaru who works nights at the convenience
 * store under the reader's building and wants to be a nail artist. She teases in ratings out of ten,
 * calls the reader after their order, and never asks anyone for help. Warmth runs from -3 to 8.
 */
export const afterHours: Story = {
  title: "After Hours",
  blurb:
    "Juri Hoshino, 24, works nights at the convenience store under your building, and at ten this morning she has a trial at a nail salon in Ginza. About ten minutes to read, with three endings.",
  start: "store",
  cover: bg.street,
  lead: {
    name: "Juri",
    poses: {
      smirk: `${L}/juri/smirk-v2.webp`,
      laugh: `${L}/juri/laugh-v2.webp`,
      pout: `${L}/juri/pout-v2.webp`,
      serious: `${L}/juri/serious.webp`,
      soft: `${L}/juri/soft.webp`,
    },
  },
  scenes: [
    {
      id: "store",
      bg: bg.store,
      focus: "62% 50%",
      lines: [
        { text: "1:52 a.m. It has rained since dinner. For four months you have come down to the store on the ground floor of your building at about this time, every night." },
        { text: "The door chime plays its two tired notes. The heater by the entrance breathes on your ankles." },
        { text: "Behind the counter the night clerk has a tiny brush in one hand. She does not look up." },
        { who: "juri", pose: "smirk", text: "Tuna Mayo. One fifty-two. You know you're, like, more reliable than the trains?" },
        { text: "She has never asked your name. In your second week she named you after your order, and it stuck." },
        { text: "A tuna-mayo rice ball and a cold milk tea already sit on the counter, rung up. She did it when she heard the lift." },
        { who: "juri", pose: "laugh", text: "Don't look at me like that. Nobody else buys tuna mayo at two in the morning. It's a sad-person rice ball. Scientifically." },
        { who: "juri", pose: "smirk", text: "And the hair today. Wow. Pillow, then wind, then giving up. Three out of ten. I'm being nice because it's raining." },
        { text: "Her name tag is blank. Head office never printed one, and nobody minds: the whole block calls her Juri. She is twenty-four, bleached blonde with hot pink underneath, and her nails change every week." },
        { text: "Tonight they are long and pale pink, filed to soft points. The counter is covered in her kit: bottles, brushes, a little lamp, and a plastic stick with ten fake nails glued along it." },
        { text: "She paints on her break, never on the clock. You ask what the occasion is." },
        { who: "juri", pose: "serious", text: "...Okay. Don't make it a thing." },
        { who: "juri", pose: "smirk", text: "Ten a.m., Ginza. A salon called Mirabelle. You do a full set on a real client while the owner watches. Ninety minutes. If she likes it, you're in. Real job. A chair with my name on it, or whatever." },
        { who: "juri", pose: "pout", text: "Problem. My left hand I can do perfect. My right hand I paint with my left, so it looks like a toddler did it. And plastic doesn't move. Real hands move." },
        { who: "juri", pose: "smirk", text: "So. Tuna Mayo. I need a hand. Literally. Yours." },
      ],
      choices: [
        { label: "Put your hand on the counter.", next: "practice", warmth: 2, flag: "hand" },
        { label: "\"Only if the rice ball's free.\"", next: "practice", warmth: 1, flag: "haggle" },
        { label: "\"I start work at nine. I can't stay.\"", next: "practice", flag: "declined" },
      ],
    },
    {
      id: "practice",
      bg: bg.store,
      focus: "62% 50%",
      lines: [
        { who: "juri", pose: "laugh", need: { flag: "hand" }, text: "Ehhh? Just like that? No bargaining? You're too easy, Tuna Mayo. That's dangerous at two a.m." },
        { who: "juri", pose: "laugh", need: { flag: "haggle" }, text: "Ohhh, negotiating. Look at you, big business." },
        { who: "juri", pose: "smirk", need: { flag: "haggle" }, text: "Fine. The rice ball's on me. One. If you flinch when the polish is cold, I'm charging you double." },
        { who: "juri", pose: "smirk", need: { flag: "declined" }, text: "Nine? Ew. A day person." },
        { who: "juri", pose: "pout", need: { flag: "declined" }, text: "Fine, go sleep. I'll keep going on my plastic friend. He never complains. Eight out of ten conversationalist." },
        { need: { flag: "declined" }, text: "You say goodnight. Then you don't leave. You end up against the magazine rack with your milk tea, watching her work. She pretends not to notice." },
        { need: { not: "declined" }, pose: "smirk", text: "She hooks the spare stool over with her foot and taps the counter twice. You lay your hand flat. She turns it over like fruit at the market." },
        { who: "juri", need: { not: "declined" }, text: "Cuticles: tragic. Nail beds: actually kind of nice? Don't let it go to your head." },
        { who: "juri", text: "I'm doing the Mirabelle set. Soft pink, one thin gold line, a little star on the ring finger. The owner's whole thing is 'quiet luxury.' So, the opposite of me." },
        { need: { not: "declined" }, text: "Her strokes are short and sure. Up close she smells of polish and the peach gum she chews to stay awake." },
        { who: "juri", pose: "soft", text: "You know why I do nights? Nobody watches. You can practise for four hours and the only witness is the guy who buys cat food at three." },
        { who: "juri", text: "I did one of these trials last year. Different salon. Shibuya." },
        { who: "juri", pose: "serious", text: "My hand shook so bad I painted the client's cuticle. The whole cuticle. Pink. She was so nice about it. That was worse. I wanted her to yell." },
        { who: "juri", pose: "smirk", text: "Anyway! Sad story over. Three out of ten, not enough crying." },
      ],
      choices: [
        { label: "\"Your hands aren't shaking now.\"", next: "practice-after", warmth: 2, flag: "steady" },
        { label: "\"So this year, only half a cuticle. Growth.\"", next: "practice-after", warmth: 1, flag: "tease" },
        { label: "\"Maybe a fancy salon isn't worth it.\"", next: "practice-after", warmth: -1, flag: "doubt" },
      ],
    },
    {
      id: "practice-after",
      bg: bg.store,
      focus: "62% 50%",
      lines: [
        { who: "juri", pose: "pout", need: { flag: "steady" }, text: "...That's because it's you. You and plastic. You don't count." },
        { who: "juri", need: { flag: "steady" }, text: "Shut up. I mean you don't judge. You just sit there with your sad rice ball." },
        { need: { flag: "steady", not: "declined" }, text: "For a second she just looks at her hand on yours, longer than the job needs. Then she goes back to the gold line." },
        { need: { flag: ["steady", "declined"] }, text: "She does not look up from the plastic stick, but the next stroke comes slower, as if someone is holding still for her." },
        { who: "juri", pose: "laugh", need: { flag: "tease" }, text: "Ha! Rude. Seven out of ten. That was actually funny." },
        { who: "juri", pose: "smirk", need: { flag: "tease" }, text: "Half a cuticle. I'm writing that on my mirror." },
        { who: "juri", pose: "serious", need: { flag: "doubt" }, text: "...Yeah. Maybe." },
        { need: { flag: "doubt" }, text: "She keeps painting, but her shoulders drop. The gold line goes on too thick and she doesn't fix it." },
        { who: "juri", need: { flag: "doubt" }, text: "My mom says that too. Wow. You two should get coffee." },
        { need: { not: "declined" }, text: "At 3:10 she seals the last coat and holds your hand up to the light." },
        { need: { flag: "declined" }, text: "At 3:10 she finishes the tenth plastic nail and holds the stick up to the light." },
        { who: "juri", pose: "smirk", text: "Okay. That's... honestly? A nine." },
      ],
      next: "call",
    },
    {
      id: "call",
      bg: bg.store,
      focus: "62% 50%",
      lines: [
        { cg: "none", text: "Her phone buzzes against the counter. OKADA, MANAGER." },
        { who: "juri", pose: "serious", text: "At three a.m.? He never calls. He sends voice memos, like a grandpa." },
        { text: "She answers. You hear her half." },
        { who: "juri", text: "Yes. ...Yes. Oh no, is he okay? ...Until noon? ...No, it's fine. Sure. No problem. Tell Takumi to feel better." },
        { text: "She hangs up and lays the phone face down, gently, as if it might go off." },
        { who: "juri", pose: "smirk", text: "So! Takumi has the flu. Someone has to do the morning. I'm here till noon." },
        { text: "Ten a.m. in Ginza. Noon here. You both do the sum. She gets there first." },
        { who: "juri", pose: "laugh", text: "It's fine! Honestly. Ginza salons are snobby. They'd hate the pink in my hair. They'd make me wear beige. I'd die in beige." },
        { who: "juri", pose: "smirk", text: "Tonight's a two out of ten. Going down to one if you keep looking at me like that." },
        { text: "She is smiling. The practice stick in her hand is trembling, very slightly." },
        { text: "You know one more thing. Mori-san, the retired man who does weekend mornings, lives two streets away and has told the whole building that Juri is his favourite." },
        { who: "juri", pose: "serious", text: "And before you say it: no. I'm not calling Mori-san. He's like seventy. I don't ask people for stuff. I just don't." },
      ],
      choices: [
        { label: "\"Ask Mori-san. Right now.\"", next: "after-call", warmth: 2, flag: "ask" },
        { label: "\"Leave at nine anyway. Let Okada deal with it.\"", next: "after-call", flag: "skip" },
        { label: "\"Ginza will still be there next year.\"", next: "after-call", warmth: -2, flag: "giveup" },
      ],
    },
    {
      id: "after-call",
      bg: bg.store,
      focus: "62% 50%",
      lines: [
        { who: "juri", pose: "pout", need: { flag: "ask" }, text: "Ugh. You're so annoying when you're right. Which is, like, twice a year." },
        { need: { flag: "ask" }, text: "She types the message three times. You watch her delete \"sorry to bother you\" twice." },
        { who: "juri", pose: "serious", need: { flag: "ask" }, text: "Sent. He goes to bed at eight. He's asleep. This is pointless." },
        { who: "juri", pose: "serious", need: { flag: "skip" }, text: "And if Mirabelle says no, I don't have this job either. Babe. Rent." },
        { who: "juri", pose: "pout", need: { flag: "skip" }, text: "...But okay. I'm thinking about it. Don't watch me think, it's embarrassing." },
        { who: "juri", pose: "smirk", need: { flag: "giveup" }, text: "Right? Exactly. Next year. Totally." },
        { need: { flag: "giveup" }, text: "She says it fast, like she was waiting for someone to hand her the line." },
        { need: { flag: "giveup" }, text: "She slides the practice stick into the drawer under the till, behind the receipt rolls." },
        { text: "At 4:30 she stands the little back-soon card on the counter and holds up a key." },
        { who: "juri", pose: "smirk", text: "Break. Come on. The landlord gave me the roof key for the recycling. I use it for this." },
      ],
      next: "stairs",
    },
    {
      id: "stairs",
      bg: bg.street,
      focus: "45% 50%",
      lines: [
        { pose: "away", text: "Outside, the rain has thinned to a mist. The vending machines hum to nobody. She checks the street both ways, like someone might report her." },
        { who: "juri", pose: "smirk", text: "If Okada asks, you were stealing umbrellas and I chased you up to the roof. Heroically." },
        { text: "The outside stairs ring under her platform sneakers all the way up, five floors, past your own door." },
      ],
      next: "roof",
    },
    {
      id: "roof",
      bg: bg.roof,
      focus: "50% 50%",
      lines: [
        { pose: "away", text: "The roof is wet. Over the city the sky has gone from black to deep blue. Somewhere a bird has decided it is morning." },
        { text: "She takes the folding chair someone left up here years ago. You lean on the rail. She steals your milk tea without asking." },
        { who: "juri", pose: "soft", text: "Best part of the shift. The sky does this and nobody sees it but me and, like, the crows." },
        { who: "juri", pose: "serious", need: { min: 4 }, text: "My mom has a hair salon in Chiba. Twenty-two years. She's really good. Actually good." },
        { who: "juri", need: { min: 4 }, text: "When I said nails, she said nails are decoration, not a trade. Then she didn't say much of anything for a year." },
        { who: "juri", pose: "soft", need: { min: 4 }, text: "So I moved out at twenty-one and started nights. Three years of tuna mayo people. Saved for the course. Passed it. Flunked Shibuya." },
        { who: "juri", pose: "pout", need: { min: 4 }, text: "If I get Mirabelle, I'm sending her a photo. No message. Just the nails. ...That's petty, right? It's petty." },
        { who: "juri", pose: "smirk", need: { max: 3 }, text: "Don't get weird. I'm not telling you my life story. You haven't earned a life story. You've earned, like, a paragraph." },
        { need: { max: 3 }, text: "She doesn't give you the paragraph either. She talks about the crows instead, and which one she thinks is in charge." },
        { need: { flag: "ask" }, text: "Her phone buzzes. She reads it twice." },
        { who: "juri", pose: "laugh", need: { flag: "ask" }, text: "He's awake. Why is he awake? 'Of course. I'll be there at 8:30. Go and be wonderful.' And a cat sticker. A cat sticker, Tuna Mayo." },
        { who: "juri", pose: "pout", need: { flag: "ask" }, text: "...I'm not crying. It's cold. My eyes are cold." },
        { who: "juri", pose: "serious", need: { flag: "skip" }, text: "If I go at nine, Okada calls me forty times, and then I've got two jobs or zero. Cool. Love that for me." },
        { who: "juri", pose: "soft", need: { flag: "giveup" }, text: "Next year. Yeah. I'll be twenty-five. That's a normal age to start." },
        { need: { flag: "giveup" }, text: "She says next year the way people say they'll call you." },
        { text: "The sun is not up yet, but the edge of the sky has gone pink, close to the pink under her hair." },
        { who: "juri", pose: "smirk", text: "Okay. Last chance to say something cool before I go down and sell cigarettes to taxi drivers." },
      ],
      choices: [
        { label: "\"You're scared. That's allowed.\"", next: "dawn", warmth: 1, flag: "honest" },
        { label: "\"Paint one more nail on me. For luck.\"", next: "dawn", warmth: 2, flag: "star", need: { not: "declined" } },
        { label: "\"Paint a nail on me. Just one. For luck.\"", next: "dawn", warmth: 2, flag: "star", need: { flag: "declined" } },
        { label: "\"Whatever happens, I'll be at the counter at 1:52.\"", next: "dawn", warmth: 1, flag: "counter" },
      ],
    },
    {
      id: "dawn",
      bg: bg.roof,
      focus: "50% 50%",
      lines: [
        { who: "juri", pose: "pout", need: { flag: "honest" }, text: "Wow. Okay. Who said you could just say stuff like that?" },
        { who: "juri", pose: "soft", need: { flag: "honest" }, text: "...Yeah. I'm scared. Happy? My nails are shaking. That's the first time I've said that out loud." },
        { who: "juri", pose: "laugh", need: { flag: "star" }, text: "Ehhh? Who's flirting at five a.m. now?" },
        { need: { flag: "star" }, cg: cg.roof, text: "The gold brush is in her vest pocket, because of course it is. She finds your ring finger and paints one tiny star." },
        { who: "juri", need: { flag: "star" }, text: "There. Keep it nice till I'm back. If it chips, that's on you." },
        { who: "juri", pose: "smirk", need: { flag: "counter" }, text: "Ugh. That is such a Tuna Mayo thing to say." },
        { who: "juri", pose: "soft", need: { flag: "counter" }, text: "...Okay. One fifty-two. Don't be late. If you're late, I'll assume you died." },
        { cg: cg.roof, text: "The first light catches the wet roof and the ends of her hair. She hands back your milk tea. Empty." },
      ],
      routes: [
        { need: { flag: "giveup" }, next: "end-stay" },
        { need: { flag: "star", min: 6 }, next: "end-ten" },
        // Mori-san said yes on the roof, so a run that asked him always sees her go.
        { need: { max: 2, not: "ask" }, next: "end-stay" },
      ],
      next: "end-counter",
    },
    {
      id: "end-ten",
      bg: bg.platform,
      focus: "40% 50%",
      lines: [
        { pose: "away", cg: "none", text: "9:04. The rain stopped an hour ago. The platform smells of wet concrete and somebody's coffee." },
        { need: { flag: "ask" }, text: "Mori-san arrived at 8:20 with a thermos and shooed her out of the store with both hands." },
        { need: { flag: "skip" }, text: "She walked out of the store at nine on the dot. Her phone has buzzed eleven times since. She hasn't looked once." },
        { text: "There was no time to change. She is still in the store vest, a black blouse folded in her bag for the train. The star clips stayed in." },
        { who: "juri", pose: "pout", text: "Don't. Don't say anything about the vest. I'm changing in the train toilet like a spy." },
        { who: "juri", pose: "soft", text: "Train in two minutes. I'm going to do a full set on a stranger while a rich lady watches. Totally normal Tuesday." },
        { pose: "soft", text: "She takes your hand and checks the star on your ring finger. It hasn't chipped." },
        { who: "juri", text: "That's collateral. You don't get to take it off yourself. You come to me, and I do it properly." },
        { who: "juri", text: "With, like... dinner first. Somewhere with chairs. Not the counter." },
        { who: "juri", text: "And this, right now, is a ten. Don't tell anyone. I've never said ten." },
        { text: "The train pulls in. She gets on without looking back, which is how you know she is trying not to." },
        { text: "At 11:48 your phone buzzes. A photo: ten soft pink nails, one thin gold line, a tiny star on the ring finger. No message." },
        { text: "A minute later, another: \"they said yes. dinner's on you, tuna mayo\"" },
      ],
      ending: { title: "Ten out of ten", text: "Juri went to Ginza, and you have a dinner to book." },
    },
    {
      id: "end-counter",
      bg: bg.store,
      focus: "62% 50%",
      lines: [
        { pose: "away", cg: "none", text: "The next night the door chime plays its two tired notes at exactly 1:52." },
        { pose: "smirk", text: "Juri is behind the counter. Her nails are soft pink with one thin gold line." },
        { who: "juri", need: { flag: "ask" }, text: "Mori-san brought me a thermos and pushed me out the door. Like, physically. He's stronger than he looks." },
        { who: "juri", pose: "pout", need: { flag: "skip" }, text: "Okada left fourteen voicemails. I'm on final warning. Very dramatic. He used my full name." },
        { who: "juri", pose: "smirk", text: "So. Mirabelle. The owner looked at my hair for a really long time." },
        { who: "juri", pose: "laugh", text: "Then she said, 'Come back Thursday for the second round.' There's a second round! Nobody told me there's a second round!" },
        { who: "juri", pose: "soft", text: "...I didn't shake. Not once." },
        { text: "Your rice ball and milk tea are on the counter. She hasn't rung them up." },
        { who: "juri", pose: "pout", text: "It's on me. Once. Don't get used to it, and don't make it a thing." },
        { who: "juri", pose: "soft", need: { flag: "honest" }, text: "And the scared thing. That helped. Or whatever." },
        { who: "juri", pose: "smirk", need: { flag: "counter" }, text: "You were on time, obviously. More reliable than the trains." },
        { who: "juri", pose: "smirk", need: { flag: "star" }, text: "The star's still on. Ugh. Cute. Seven out of ten. Keep it till Thursday." },
        { text: "She goes back to her kit. You stay a while by the magazine rack. Neither of you says anything about it." },
      ],
      ending: { title: "One fifty-two", text: "Juri made the first round. Your spot at the counter is still yours." },
    },
    {
      id: "end-stay",
      bg: bg.store,
      focus: "62% 50%",
      lines: [
        { pose: "away", cg: "none", text: "The next night the door chime plays its two tired notes at 1:52." },
        { pose: "smirk", text: "Juri is behind the counter. Her nails are the same plain pink as last night. No gold line, no star." },
        { who: "juri", text: "Tuna Mayo! One fifty-two. Reliable as always." },
        { who: "juri", pose: "laugh", text: "Morning shift was fine. Takumi's fine. Everything's fine. A solid five out of ten fine." },
        { text: "Your rice ball is not waiting on the counter. She rings it up while you watch, the way she did in your first week." },
        { who: "juri", pose: "soft", need: { flag: "star" }, text: "Oh, and you can take the star off. Remover's in aisle three. It was just practice." },
        { text: "When she turns for your milk tea you see the practice stick in the bin under the counter, ten little nails facing up." },
        { who: "juri", pose: "smirk", text: "Next year, though. Totally. Ginza won't know what hit it." },
        { text: "She says it to the till, not to you." },
      ],
      ending: { title: "Next year", text: "Juri stayed for the shift. On another night, she might have gone." },
    },
  ],
};
