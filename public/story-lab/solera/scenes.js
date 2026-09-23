export const scenes = [
  {
    "id": "selection",
    "title": "Choose your character",
    "image": "expanded/selection-room.png",
    "caption": "",
    "alt": "Choose your character",
    "chapter": "01 / CHARACTER",
    "seconds": 6,
    "choices": [
      {
        "label": "Ya",
        "to": "ya-spawn"
      },
      {
        "label": "Nova",
        "to": "spawn"
      },
      {
        "label": "Or-en",
        "to": "oren-village-departure"
      }
    ]
  },
  {
    "id": "spawn",
    "title": "Spawning in Solera",
    "image": "spawn.png",
    "caption": "The capsule drains. The door opens into a new world.",
    "alt": "The capsule drains. The door opens into a new world.",
    "chapter": "02 / ARRIVAL",
    "seconds": 6,
    "character": "nova",
    "clip": "spawn",
    "cinematic": true,
    "next": "nova-threshold",
    "videoNext": "nova-threshold",
    "videoAction": "Enter the foyer"
  },
  {
    "id": "nova-threshold",
    "title": "The guild foyer",
    "image": "expanded/nova-threshold.png",
    "caption": "Footsteps, conversation and the faint hum of magic fill the hall.",
    "alt": "Footsteps, conversation and the faint hum of magic fill the hall.",
    "chapter": "03 / ARRIVAL",
    "seconds": 8,
    "character": "nova",
    "next": "nova-greeting",
    "clip": "nova-threshold",
    "videoNext": "nova-greeting",
    "videoAction": "Meet the guide",
    "cinematic": true
  },
  {
    "id": "nova-greeting",
    "title": "Welcome, traveler",
    "image": "expanded/nova-greeting.png",
    "caption": "Salutations, Traveler.",
    "alt": "Salutations, Traveler.",
    "chapter": "03 / ARRIVAL",
    "seconds": 6,
    "character": "nova",
    "next": "nova-scan",
    "speaker": "SOLERA",
    "audio": "greeting",
    "clip": "nova-greeting",
    "videoNext": "nova-scan",
    "videoAction": "Continue"
  },
  {
    "id": "nova-scan",
    "title": "Identification required",
    "image": "expanded/nova-scan.png",
    "caption": "It seems you don’t have any identification. We will have to fix that.",
    "alt": "It seems you don’t have any identification. We will have to fix that.",
    "chapter": "03 / ARRIVAL",
    "seconds": 6,
    "character": "nova",
    "next": "nova-registered",
    "speaker": "SOLERA"
  },
  {
    "id": "nova-registered",
    "title": "Your Solera ID",
    "image": "expanded/nova-registered.png",
    "caption": "Nova is taken here in Solera, so I have updated your username to Novva.",
    "alt": "Nova is taken here in Solera, so I have updated your username to Novva.",
    "chapter": "03 / ARRIVAL",
    "seconds": 6,
    "character": "nova",
    "next": "nova-reaction",
    "speaker": "SOLERA",
    "identity": true
  },
  {
    "id": "nova-reaction",
    "title": "Officially here",
    "image": "expanded/nova-reaction.png",
    "caption": "“Novva. With two v’s. Right.”",
    "alt": "“Novva. With two v’s. Right.”",
    "chapter": "03 / ARRIVAL",
    "seconds": 6,
    "character": "nova",
    "next": "nova-guidance"
  },
  {
    "id": "nova-guidance",
    "title": "Follow the light",
    "image": "expanded/nova-guidance.png",
    "caption": "Follow the glowing marker. The guild’s training rooms are just ahead.",
    "alt": "Follow the glowing marker. The guild’s training rooms are just ahead.",
    "chapter": "03 / ARRIVAL",
    "seconds": 6,
    "character": "nova",
    "next": "classes",
    "speaker": "SOLERA",
    "arrow": true
  },
  {
    "id": "nova-sword-start",
    "title": "Training Grounds",
    "image": "expanded/training-room.png",
    "caption": "“Pick a practice blade. We’ll start with a little control.”",
    "alt": "“Pick a practice blade. We’ll start with a little control.”",
    "chapter": "04 / TRAINING GROUNDS",
    "seconds": 6,
    "speaker": "INSTRUCTOR",
    "character": "nova",
    "route": "sword",
    "next": "nova-sword-pickup"
  },
  {
    "id": "nova-bow-start",
    "title": "Archery Range",
    "image": "expanded/archery-room.png",
    "caption": "“Stay behind the line until your lane is clear.”",
    "alt": "“Stay behind the line until your lane is clear.”",
    "chapter": "04 / ARCHERY RANGE",
    "seconds": 6,
    "speaker": "INSTRUCTOR",
    "character": "nova",
    "route": "bow",
    "next": "nova-bow-pickup"
  },
  {
    "id": "nova-summon-start",
    "title": "Summoner’s Lair",
    "image": "expanded/summoning-room.png",
    "caption": "“A summon is a partnership. Let it come to you.”",
    "alt": "“A summon is a partnership. Let it come to you.”",
    "chapter": "04 / SUMMONER’S LAIR",
    "seconds": 6,
    "speaker": "INSTRUCTOR",
    "character": "nova",
    "route": "summon",
    "next": "nova-summon-focus"
  },
  {
    "id": "nova-sword-pickup",
    "title": "Choose a blade",
    "image": "expanded/nova-sword-pickup.png",
    "caption": "Nova reaches for the practice blade. The instructor watches the grip.",
    "alt": "Nova reaches for the practice blade. The instructor watches the grip.",
    "chapter": "04 / TRAINING",
    "seconds": 6,
    "character": "nova",
    "next": "nova-sword-awaken"
  },
  {
    "id": "nova-sword-awaken",
    "title": "Mana awakened",
    "image": "expanded/nova-sword-awaken.png",
    "caption": "“Easy. Let the mana settle before you move.”",
    "alt": "“Easy. Let the mana settle before you move.”",
    "chapter": "04 / TRAINING",
    "seconds": 6,
    "character": "nova",
    "next": "nova-sword-ready",
    "speaker": "INSTRUCTOR"
  },
  {
    "id": "nova-sword-ready",
    "title": "Your practice partner",
    "image": "expanded/nova-sword-ready.png",
    "caption": "The ADA bot raises its padded target. The lane is clear.",
    "alt": "The ADA bot raises its padded target. The lane is clear.",
    "chapter": "04 / TRAINING",
    "seconds": 6,
    "character": "nova",
    "next": "nova-sword-strike",
    "action": "Try a mana strike"
  },
  {
    "id": "nova-sword-strike",
    "title": "A first ability",
    "image": "expanded/nova-sword-strike.png",
    "caption": "A crescent of mana crosses the lane and flashes against the target.",
    "alt": "A crescent of mana crosses the lane and flashes against the target.",
    "chapter": "04 / TRAINING",
    "seconds": 6,
    "character": "nova",
    "next": "nova-sword-reset"
  },
  {
    "id": "nova-sword-reset",
    "title": "Control before power",
    "image": "expanded/nova-sword-reset.png",
    "caption": "“Good. Return the loaner here. There’s a challenge room if you’re feeling brave.”",
    "alt": "“Good. Return the loaner here. There’s a challenge room if you’re feeling brave.”",
    "chapter": "04 / TRAINING",
    "seconds": 6,
    "character": "nova",
    "next": "nova-sword-choice",
    "speaker": "INSTRUCTOR"
  },
  {
    "id": "nova-bow-pickup",
    "title": "Find your aim",
    "image": "expanded/nova-bow-pickup.png",
    "caption": "The bow’s crystal wakes; a thread of light forms its string.",
    "alt": "The bow’s crystal wakes; a thread of light forms its string.",
    "chapter": "04 / ARCHERY",
    "seconds": 6,
    "character": "nova",
    "next": "nova-bow-draw"
  },
  {
    "id": "nova-bow-draw",
    "title": "Hold your focus",
    "image": "expanded/nova-bow-draw.png",
    "caption": "“Breathe. Look at the target, then let the string go.”",
    "alt": "“Breathe. Look at the target, then let the string go.”",
    "chapter": "04 / ARCHERY",
    "seconds": 6,
    "character": "nova",
    "next": "nova-bow-release",
    "speaker": "INSTRUCTOR",
    "action": "Release the arrow"
  },
  {
    "id": "nova-bow-release",
    "title": "A clear shot",
    "image": "expanded/nova-bow-release.png",
    "caption": "The luminous arrow streaks downrange. A spark answers from the target.",
    "alt": "The luminous arrow streaks downrange. A spark answers from the target.",
    "chapter": "04 / ARCHERY",
    "seconds": 6,
    "character": "nova",
    "next": "nova-bow-reset"
  },
  {
    "id": "nova-bow-reset",
    "title": "Back behind the line",
    "image": "expanded/nova-bow-reset.png",
    "caption": "“That’s a start. Rack the bow before you leave the range.”",
    "alt": "“That’s a start. Rack the bow before you leave the range.”",
    "chapter": "04 / ARCHERY",
    "seconds": 6,
    "character": "nova",
    "next": "nova-bow-choice",
    "speaker": "INSTRUCTOR"
  },
  {
    "id": "nova-summon-focus",
    "title": "A small invitation",
    "image": "expanded/nova-summon-focus.png",
    "caption": "“Touch the focus. Let the circle do the rest.”",
    "alt": "“Touch the focus. Let the circle do the rest.”",
    "chapter": "04 / SUMMONING",
    "seconds": 6,
    "character": "nova",
    "next": "nova-summon-arrive",
    "speaker": "INSTRUCTOR"
  },
  {
    "id": "nova-summon-arrive",
    "title": "Someone answers",
    "image": "expanded/nova-summon-arrive.png",
    "caption": "A phthalo-green dragon gathers out of the light, blinking at its new partner.",
    "alt": "A phthalo-green dragon gathers out of the light, blinking at its new partner.",
    "chapter": "04 / SUMMONING",
    "seconds": 6,
    "character": "nova",
    "next": "nova-summon-bond"
  },
  {
    "id": "nova-summon-bond",
    "title": "An introduction",
    "image": "expanded/nova-summon-bond.png",
    "caption": "The dragon leans closer. Curiosity wins over caution.",
    "alt": "The dragon leans closer. Curiosity wins over caution.",
    "chapter": "04 / SUMMONING",
    "seconds": 6,
    "character": "nova",
    "next": "nova-summon-command"
  },
  {
    "id": "nova-summon-command",
    "title": "Try it together",
    "image": "expanded/nova-summon-command.png",
    "caption": "One small signal. One little puff of magic. The practice disc glows.",
    "alt": "One small signal. One little puff of magic. The practice disc glows.",
    "chapter": "04 / SUMMONING",
    "seconds": 6,
    "character": "nova",
    "next": "nova-summon-recall"
  },
  {
    "id": "nova-summon-recall",
    "title": "A place to rest",
    "image": "expanded/nova-summon-recall.png",
    "caption": "“The focus lets your summon rest. Call it back when you need it.”",
    "alt": "“The focus lets your summon rest. Call it back when you need it.”",
    "chapter": "04 / SUMMONING",
    "seconds": 6,
    "character": "nova",
    "next": "nova-summon-choice",
    "speaker": "INSTRUCTOR"
  },
  {
    "id": "nova-sword-choice",
    "title": "Ready for something bigger?",
    "image": "expanded/nova-sword-reset.png",
    "caption": "Try the challenge room, or head back and find company.",
    "alt": "Try the challenge room, or head back and find company.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "nova",
    "route": "sword",
    "choices": [
      {
        "label": "Enter the challenge room",
        "to": "challenge-door",
        "outcome": "entered"
      },
      {
        "label": "Return to lobby",
        "to": "lobby",
        "outcome": "skipped"
      }
    ]
  },
  {
    "id": "nova-bow-choice",
    "title": "Ready for something bigger?",
    "image": "expanded/nova-bow-reset.png",
    "caption": "Try the challenge room, or head back and find company.",
    "alt": "Try the challenge room, or head back and find company.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "nova",
    "route": "bow",
    "choices": [
      {
        "label": "Enter the challenge room",
        "to": "challenge-door",
        "outcome": "entered"
      },
      {
        "label": "Return to lobby",
        "to": "lobby",
        "outcome": "skipped"
      }
    ]
  },
  {
    "id": "nova-summon-choice",
    "title": "Ready for something bigger?",
    "image": "expanded/nova-summon-recall.png",
    "caption": "Try the challenge room, or head back and find company.",
    "alt": "Try the challenge room, or head back and find company.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "nova",
    "route": "summon",
    "choices": [
      {
        "label": "Enter the challenge room",
        "to": "challenge-door",
        "outcome": "entered"
      },
      {
        "label": "Return to lobby",
        "to": "lobby",
        "outcome": "skipped"
      }
    ]
  },
  {
    "id": "nova-challenge-entry",
    "title": "Quiet in here",
    "image": "expanded/nova-challenge-entry.png",
    "caption": "The guild noise fades behind the open door.",
    "alt": "The guild noise fades behind the open door.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "nova",
    "next": "challenge-empty"
  },
  {
    "id": "nova-boss-reaction",
    "title": "That is not a practice target",
    "image": "expanded/nova-boss-reaction.png",
    "caption": "Confidence makes a very quick exit.",
    "alt": "Confidence makes a very quick exit.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "nova",
    "next": "titan-step"
  },
  {
    "id": "nova-dragon-reaction",
    "title": "A shared opinion",
    "image": "expanded/nova-dragon-reaction.png",
    "caption": "The dragon looks up. Its partner looks down. Neither needs convincing.",
    "alt": "The dragon looks up. Its partner looks down. Neither needs convincing.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "nova",
    "route": "summon",
    "next": "titan-step"
  },
  {
    "id": "nova-boss-run",
    "title": "Time to leave",
    "image": "expanded/nova-boss-run.png",
    "caption": "The exit is still open. That seems worth taking.",
    "alt": "The exit is still open. That seems worth taking.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "nova",
    "next": "door-sealed"
  },
  {
    "id": "nova-dragon-run",
    "title": "Absolutely not",
    "image": "expanded/nova-dragon-run.png",
    "caption": "Two very determined adventurers make for the door.",
    "alt": "Two very determined adventurers make for the door.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "nova",
    "route": "summon",
    "next": "door-sealed"
  },
  {
    "id": "nova-boss-gulp",
    "title": "A sensible retreat",
    "image": "expanded/nova-boss-gulp.png",
    "caption": "Perhaps this is a job for more than one adventurer.",
    "alt": "Perhaps this is a job for more than one adventurer.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "nova",
    "next": "lobby",
    "outcome": "escaped",
    "action": "Find some help"
  },
  {
    "id": "nova-dragon-gulp",
    "title": "Still here",
    "image": "expanded/nova-dragon-gulp.png",
    "caption": "A gulp. A look at the door. Then a very firm decision to leave.",
    "alt": "A gulp. A look at the door. Then a very firm decision to leave.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "nova",
    "route": "summon",
    "next": "nova-dragon-recall"
  },
  {
    "id": "nova-dragon-recall",
    "title": "Take a breather",
    "image": "expanded/nova-dragon-recall.png",
    "caption": "The dragon returns to its focus. Time to find some help.",
    "alt": "The dragon returns to its focus. Time to find some help.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "nova",
    "route": "summon",
    "next": "lobby",
    "outcome": "escaped"
  },
  {
    "id": "nova-meet-ya",
    "title": "A little company",
    "image": "expanded/nova-meet-ya.png",
    "caption": "“Looking for company?”",
    "alt": "“Looking for company?”",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "nova",
    "speaker": "Ya",
    "next": "nova-leave-ya"
  },
  {
    "id": "nova-leave-ya",
    "title": "Better together",
    "image": "expanded/nova-leave-ya.png",
    "caption": "Nova and Ya head toward their next adventure together.",
    "alt": "Nova and Ya head toward their next adventure together.",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "nova",
    "end": true
  },
  {
    "id": "nova-meet-oren",
    "title": "A little company",
    "image": "expanded/nova-meet-oren.png",
    "caption": "Or-en leans forward with an interested chirp.",
    "alt": "Or-en leans forward with an interested chirp.",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "nova",
    "speaker": "",
    "next": "nova-leave-oren"
  },
  {
    "id": "nova-leave-oren",
    "title": "Better together",
    "image": "expanded/nova-leave-oren.png",
    "caption": "Nova and Or-en head into the city together.",
    "alt": "Nova and Or-en head into the city together.",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "nova",
    "end": true
  },
  {
    "id": "ya-spawn",
    "title": "A new arrival",
    "image": "expanded/ya-spawn.png",
    "caption": "Ya stirs inside the capsule. Light ripples across the glass.",
    "alt": "Ya stirs inside the capsule. Light ripples across the glass.",
    "chapter": "02 / ARRIVAL",
    "seconds": 6,
    "character": "ya",
    "next": "ya-exit"
  },
  {
    "id": "ya-exit",
    "title": "First steps",
    "image": "expanded/ya-exit.png",
    "caption": "The liquid drains, the ring docks, and the open door reveals a path into Solera.",
    "alt": "The liquid drains, the ring docks, and the open door reveals a path into Solera.",
    "chapter": "02 / ARRIVAL",
    "seconds": 6,
    "character": "ya",
    "next": "ya-threshold"
  },
  {
    "id": "ya-threshold",
    "title": "The guild foyer",
    "image": "expanded/ya-threshold.png",
    "caption": "Footsteps, conversation and the faint hum of magic fill the hall.",
    "alt": "Footsteps, conversation and the faint hum of magic fill the hall.",
    "chapter": "03 / ARRIVAL",
    "seconds": 6,
    "character": "ya",
    "next": "ya-greeting"
  },
  {
    "id": "ya-greeting",
    "title": "Welcome, traveler",
    "image": "expanded/ya-greeting.png",
    "caption": "Salutations, Traveler.",
    "alt": "Salutations, Traveler.",
    "chapter": "03 / ARRIVAL",
    "seconds": 6,
    "character": "ya",
    "next": "ya-scan",
    "speaker": "SOLERA",
    "audio": "greeting"
  },
  {
    "id": "ya-scan",
    "title": "Identification required",
    "image": "expanded/ya-scan.png",
    "caption": "It seems you don’t have any identification. We will have to fix that.",
    "alt": "It seems you don’t have any identification. We will have to fix that.",
    "chapter": "03 / ARRIVAL",
    "seconds": 6,
    "character": "ya",
    "next": "ya-registered",
    "speaker": "SOLERA"
  },
  {
    "id": "ya-registered",
    "title": "Your Solera ID",
    "image": "expanded/ya-registered.png",
    "caption": "Welcome to Solera, Ya. Your identification is ready.",
    "alt": "Welcome to Solera, Ya. Your identification is ready.",
    "chapter": "03 / ARRIVAL",
    "seconds": 6,
    "character": "ya",
    "next": "ya-reaction",
    "speaker": "SOLERA",
    "identity": true
  },
  {
    "id": "ya-reaction",
    "title": "Officially here",
    "image": "expanded/ya-reaction.png",
    "caption": "Ya turns the card in her hand, then grins.",
    "alt": "Ya turns the card in her hand, then grins.",
    "chapter": "03 / ARRIVAL",
    "seconds": 6,
    "character": "ya",
    "next": "ya-guidance"
  },
  {
    "id": "ya-guidance",
    "title": "Follow the light",
    "image": "expanded/ya-guidance.png",
    "caption": "Follow the glowing marker. The guild’s training rooms are just ahead.",
    "alt": "Follow the glowing marker. The guild’s training rooms are just ahead.",
    "chapter": "03 / ARRIVAL",
    "seconds": 6,
    "character": "ya",
    "next": "classes",
    "speaker": "SOLERA",
    "arrow": true
  },
  {
    "id": "ya-sword-start",
    "title": "Training Grounds",
    "image": "expanded/training-room.png",
    "caption": "“Pick a practice blade. We’ll start with a little control.”",
    "alt": "“Pick a practice blade. We’ll start with a little control.”",
    "chapter": "04 / TRAINING GROUNDS",
    "seconds": 6,
    "speaker": "INSTRUCTOR",
    "character": "ya",
    "route": "sword",
    "next": "ya-sword-pickup"
  },
  {
    "id": "ya-bow-start",
    "title": "Archery Range",
    "image": "expanded/archery-room.png",
    "caption": "“Stay behind the line until your lane is clear.”",
    "alt": "“Stay behind the line until your lane is clear.”",
    "chapter": "04 / ARCHERY RANGE",
    "seconds": 6,
    "speaker": "INSTRUCTOR",
    "character": "ya",
    "route": "bow",
    "next": "ya-bow-pickup"
  },
  {
    "id": "ya-summon-start",
    "title": "Summoner’s Lair",
    "image": "expanded/summoning-room.png",
    "caption": "“A summon is a partnership. Let it come to you.”",
    "alt": "“A summon is a partnership. Let it come to you.”",
    "chapter": "04 / SUMMONER’S LAIR",
    "seconds": 6,
    "speaker": "INSTRUCTOR",
    "character": "ya",
    "route": "summon",
    "next": "ya-summon-focus"
  },
  {
    "id": "ya-sword-pickup",
    "title": "Choose a blade",
    "image": "expanded/ya-sword-pickup.png",
    "caption": "Ya reaches for the practice blade. The instructor watches the grip.",
    "alt": "Ya reaches for the practice blade. The instructor watches the grip.",
    "chapter": "04 / TRAINING",
    "seconds": 6,
    "character": "ya",
    "next": "ya-sword-awaken"
  },
  {
    "id": "ya-sword-awaken",
    "title": "Mana awakened",
    "image": "expanded/ya-sword-awaken.png",
    "caption": "“Easy. Let the mana settle before you move.”",
    "alt": "“Easy. Let the mana settle before you move.”",
    "chapter": "04 / TRAINING",
    "seconds": 6,
    "character": "ya",
    "next": "ya-sword-ready",
    "speaker": "INSTRUCTOR"
  },
  {
    "id": "ya-sword-ready",
    "title": "Your practice partner",
    "image": "expanded/ya-sword-ready.png",
    "caption": "The ADA bot raises its padded target. The lane is clear.",
    "alt": "The ADA bot raises its padded target. The lane is clear.",
    "chapter": "04 / TRAINING",
    "seconds": 6,
    "character": "ya",
    "next": "ya-sword-strike",
    "action": "Try a mana strike"
  },
  {
    "id": "ya-sword-strike",
    "title": "A first ability",
    "image": "expanded/ya-sword-strike.png",
    "caption": "A crescent of mana crosses the lane and flashes against the target.",
    "alt": "A crescent of mana crosses the lane and flashes against the target.",
    "chapter": "04 / TRAINING",
    "seconds": 6,
    "character": "ya",
    "next": "ya-sword-reset"
  },
  {
    "id": "ya-sword-reset",
    "title": "Control before power",
    "image": "expanded/ya-sword-reset.png",
    "caption": "“Good. Return the loaner here. There’s a challenge room if you’re feeling brave.”",
    "alt": "“Good. Return the loaner here. There’s a challenge room if you’re feeling brave.”",
    "chapter": "04 / TRAINING",
    "seconds": 6,
    "character": "ya",
    "next": "ya-sword-choice",
    "speaker": "INSTRUCTOR"
  },
  {
    "id": "ya-bow-pickup",
    "title": "Find your aim",
    "image": "expanded/ya-bow-pickup.png",
    "caption": "The bow’s crystal wakes; a thread of light forms its string.",
    "alt": "The bow’s crystal wakes; a thread of light forms its string.",
    "chapter": "04 / ARCHERY",
    "seconds": 6,
    "character": "ya",
    "next": "ya-bow-draw"
  },
  {
    "id": "ya-bow-draw",
    "title": "Hold your focus",
    "image": "expanded/ya-bow-draw.png",
    "caption": "“Breathe. Look at the target, then let the string go.”",
    "alt": "“Breathe. Look at the target, then let the string go.”",
    "chapter": "04 / ARCHERY",
    "seconds": 6,
    "character": "ya",
    "next": "ya-bow-release",
    "speaker": "INSTRUCTOR",
    "action": "Release the arrow"
  },
  {
    "id": "ya-bow-release",
    "title": "A clear shot",
    "image": "expanded/ya-bow-release.png",
    "caption": "The luminous arrow streaks downrange. A spark answers from the target.",
    "alt": "The luminous arrow streaks downrange. A spark answers from the target.",
    "chapter": "04 / ARCHERY",
    "seconds": 6,
    "character": "ya",
    "next": "ya-bow-reset"
  },
  {
    "id": "ya-bow-reset",
    "title": "Back behind the line",
    "image": "expanded/ya-bow-reset.png",
    "caption": "“That’s a start. Rack the bow before you leave the range.”",
    "alt": "“That’s a start. Rack the bow before you leave the range.”",
    "chapter": "04 / ARCHERY",
    "seconds": 6,
    "character": "ya",
    "next": "ya-bow-choice",
    "speaker": "INSTRUCTOR"
  },
  {
    "id": "ya-summon-focus",
    "title": "A small invitation",
    "image": "expanded/ya-summon-focus.png",
    "caption": "“Touch the focus. Let the circle do the rest.”",
    "alt": "“Touch the focus. Let the circle do the rest.”",
    "chapter": "04 / SUMMONING",
    "seconds": 6,
    "character": "ya",
    "next": "ya-summon-arrive",
    "speaker": "INSTRUCTOR"
  },
  {
    "id": "ya-summon-arrive",
    "title": "Someone answers",
    "image": "expanded/ya-summon-arrive.png",
    "caption": "A phthalo-green dragon gathers out of the light, blinking at its new partner.",
    "alt": "A phthalo-green dragon gathers out of the light, blinking at its new partner.",
    "chapter": "04 / SUMMONING",
    "seconds": 6,
    "character": "ya",
    "next": "ya-summon-bond"
  },
  {
    "id": "ya-summon-bond",
    "title": "An introduction",
    "image": "expanded/ya-summon-bond.png",
    "caption": "The dragon leans closer. Curiosity wins over caution.",
    "alt": "The dragon leans closer. Curiosity wins over caution.",
    "chapter": "04 / SUMMONING",
    "seconds": 6,
    "character": "ya",
    "next": "ya-summon-command"
  },
  {
    "id": "ya-summon-command",
    "title": "Try it together",
    "image": "expanded/ya-summon-command.png",
    "caption": "One small signal. One little puff of magic. The practice disc glows.",
    "alt": "One small signal. One little puff of magic. The practice disc glows.",
    "chapter": "04 / SUMMONING",
    "seconds": 6,
    "character": "ya",
    "next": "ya-summon-recall"
  },
  {
    "id": "ya-summon-recall",
    "title": "A place to rest",
    "image": "expanded/ya-summon-recall.png",
    "caption": "“The focus lets your summon rest. Call it back when you need it.”",
    "alt": "“The focus lets your summon rest. Call it back when you need it.”",
    "chapter": "04 / SUMMONING",
    "seconds": 6,
    "character": "ya",
    "next": "ya-summon-choice",
    "speaker": "INSTRUCTOR"
  },
  {
    "id": "ya-sword-choice",
    "title": "Ready for something bigger?",
    "image": "expanded/ya-sword-reset.png",
    "caption": "Try the challenge room, or head back and find company.",
    "alt": "Try the challenge room, or head back and find company.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "ya",
    "route": "sword",
    "choices": [
      {
        "label": "Enter the challenge room",
        "to": "challenge-door",
        "outcome": "entered"
      },
      {
        "label": "Return to lobby",
        "to": "lobby",
        "outcome": "skipped"
      }
    ]
  },
  {
    "id": "ya-bow-choice",
    "title": "Ready for something bigger?",
    "image": "expanded/ya-bow-reset.png",
    "caption": "Try the challenge room, or head back and find company.",
    "alt": "Try the challenge room, or head back and find company.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "ya",
    "route": "bow",
    "choices": [
      {
        "label": "Enter the challenge room",
        "to": "challenge-door",
        "outcome": "entered"
      },
      {
        "label": "Return to lobby",
        "to": "lobby",
        "outcome": "skipped"
      }
    ]
  },
  {
    "id": "ya-summon-choice",
    "title": "Ready for something bigger?",
    "image": "expanded/ya-summon-recall.png",
    "caption": "Try the challenge room, or head back and find company.",
    "alt": "Try the challenge room, or head back and find company.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "ya",
    "route": "summon",
    "choices": [
      {
        "label": "Enter the challenge room",
        "to": "challenge-door",
        "outcome": "entered"
      },
      {
        "label": "Return to lobby",
        "to": "lobby",
        "outcome": "skipped"
      }
    ]
  },
  {
    "id": "ya-challenge-entry",
    "title": "Quiet in here",
    "image": "expanded/ya-challenge-entry.png",
    "caption": "The guild noise fades behind the open door.",
    "alt": "The guild noise fades behind the open door.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "ya",
    "next": "challenge-empty"
  },
  {
    "id": "ya-boss-reaction",
    "title": "That is not a practice target",
    "image": "expanded/ya-boss-reaction.png",
    "caption": "Confidence makes a very quick exit.",
    "alt": "Confidence makes a very quick exit.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "ya",
    "next": "titan-step"
  },
  {
    "id": "ya-dragon-reaction",
    "title": "A shared opinion",
    "image": "expanded/ya-dragon-reaction.png",
    "caption": "The dragon looks up. Its partner looks down. Neither needs convincing.",
    "alt": "The dragon looks up. Its partner looks down. Neither needs convincing.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "ya",
    "route": "summon",
    "next": "titan-step"
  },
  {
    "id": "ya-boss-run",
    "title": "Time to leave",
    "image": "expanded/ya-boss-run.png",
    "caption": "The exit is still open. That seems worth taking.",
    "alt": "The exit is still open. That seems worth taking.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "ya",
    "next": "door-sealed"
  },
  {
    "id": "ya-dragon-run",
    "title": "Absolutely not",
    "image": "expanded/ya-dragon-run.png",
    "caption": "Two very determined adventurers make for the door.",
    "alt": "Two very determined adventurers make for the door.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "ya",
    "route": "summon",
    "next": "door-sealed"
  },
  {
    "id": "ya-boss-gulp",
    "title": "A sensible retreat",
    "image": "expanded/ya-boss-gulp.png",
    "caption": "Perhaps this is a job for more than one adventurer.",
    "alt": "Perhaps this is a job for more than one adventurer.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "ya",
    "next": "lobby",
    "outcome": "escaped",
    "action": "Find some help"
  },
  {
    "id": "ya-dragon-gulp",
    "title": "Still here",
    "image": "expanded/ya-dragon-gulp.png",
    "caption": "A gulp. A look at the door. Then a very firm decision to leave.",
    "alt": "A gulp. A look at the door. Then a very firm decision to leave.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "ya",
    "route": "summon",
    "next": "ya-dragon-recall"
  },
  {
    "id": "ya-dragon-recall",
    "title": "Take a breather",
    "image": "expanded/ya-dragon-recall.png",
    "caption": "The dragon returns to its focus. Time to find some help.",
    "alt": "The dragon returns to its focus. Time to find some help.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "character": "ya",
    "route": "summon",
    "next": "lobby",
    "outcome": "escaped"
  },
  {
    "id": "ya-meet-nova",
    "title": "A little company",
    "image": "expanded/ya-meet-nova.png",
    "caption": "“Looking for company?”",
    "alt": "“Looking for company?”",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "ya",
    "speaker": "Nova",
    "next": "ya-leave-nova"
  },
  {
    "id": "ya-leave-nova",
    "title": "Better together",
    "image": "expanded/ya-leave-nova.png",
    "caption": "Ya and Nova head toward their next adventure together.",
    "alt": "Ya and Nova head toward their next adventure together.",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "ya",
    "end": true
  },
  {
    "id": "ya-meet-oren",
    "title": "A little company",
    "image": "expanded/ya-meet-oren.png",
    "caption": "Or-en leans forward with an interested chirp.",
    "alt": "Or-en leans forward with an interested chirp.",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "ya",
    "speaker": "",
    "next": "ya-leave-oren"
  },
  {
    "id": "ya-leave-oren",
    "title": "Better together",
    "image": "expanded/ya-leave-oren.png",
    "caption": "Ya and Or-en head into the city together.",
    "alt": "Ya and Or-en head into the city together.",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "ya",
    "end": true
  },
  {
    "id": "oren-village-departure",
    "title": "A world beyond the village",
    "caption": "Or-en slips away while the village is busy with its morning repairs.",
    "alt": "Or-en slips away while the village is busy with its morning repairs.",
    "image": "expanded/oren-village-departure.png",
    "character": "oren",
    "route": "native",
    "outcome": "native",
    "chapter": "02 / A LOCAL ARRIVAL",
    "seconds": 6,
    "next": "oren-city-sneak"
  },
  {
    "id": "oren-city-sneak",
    "title": "A small gap in a big city",
    "caption": "At Solera's gate, a delivery gives him just enough cover.",
    "alt": "At Solera's gate, a delivery gives him just enough cover.",
    "image": "expanded/oren-city-sneak.png",
    "character": "oren",
    "route": "native",
    "outcome": "native",
    "chapter": "02 / A LOCAL ARRIVAL",
    "seconds": 6,
    "next": "oren-guild-sneak"
  },
  {
    "id": "oren-guild-sneak",
    "title": "An uninvited guest",
    "caption": "He follows the bustle to the guild and slips through a side door.",
    "alt": "He follows the bustle to the guild and slips through a side door.",
    "image": "expanded/oren-guild-sneak.png",
    "character": "oren",
    "route": "native",
    "outcome": "native",
    "chapter": "02 / A LOCAL ARRIVAL",
    "seconds": 6,
    "next": "oren-lobby-wait"
  },
  {
    "id": "oren-lobby-wait",
    "title": "A place to sit",
    "caption": "For now, the lobby is a comfortable place to watch the world go by.",
    "alt": "For now, the lobby is a comfortable place to watch the world go by.",
    "image": "expanded/oren-lobby-wait.png",
    "character": "oren",
    "route": "native",
    "outcome": "native",
    "chapter": "02 / A LOCAL ARRIVAL",
    "seconds": 6,
    "next": "lobby"
  },
  {
    "id": "oren-meet-nova",
    "title": "A little company",
    "image": "expanded/oren-meet-nova.png",
    "caption": "“Looking for company?”",
    "alt": "“Looking for company?”",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "oren",
    "speaker": "Nova",
    "next": "oren-leave-nova"
  },
  {
    "id": "oren-leave-nova",
    "title": "Better together",
    "image": "expanded/oren-leave-nova.png",
    "caption": "Nova and Or-en head into the city together.",
    "alt": "Nova and Or-en head into the city together.",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "oren",
    "end": true
  },
  {
    "id": "oren-meet-ya",
    "title": "A little company",
    "image": "expanded/oren-meet-ya.png",
    "caption": "“Looking for company?”",
    "alt": "“Looking for company?”",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "oren",
    "speaker": "Ya",
    "next": "oren-leave-ya"
  },
  {
    "id": "oren-leave-ya",
    "title": "Better together",
    "image": "expanded/oren-leave-ya.png",
    "caption": "Ya and Or-en head into the city together.",
    "alt": "Ya and Or-en head into the city together.",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "character": "oren",
    "end": true
  },
  {
    "id": "classes",
    "title": "Where do you want to go next?",
    "image": "expanded/hall.png",
    "caption": "",
    "alt": "Where do you want to go next?",
    "chapter": "03 / DESTINATIONS",
    "seconds": 6,
    "choices": []
  },
  {
    "id": "challenge-door",
    "title": "The challenge room",
    "image": "expanded/challenge-door.png",
    "caption": "Training equipment stays in its rack. Beyond this door, the guild’s challenge awaits.",
    "alt": "Training equipment stays in its rack. Beyond this door, the guild’s challenge awaits.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "next": "challenge-empty"
  },
  {
    "id": "challenge-empty",
    "title": "A little too quiet",
    "image": "expanded/challenge-empty.png",
    "caption": "The lights dim. Something beneath the smoke begins to move.",
    "alt": "The lights dim. Something beneath the smoke begins to move.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "next": "titan-reveal"
  },
  {
    "id": "titan-reveal",
    "title": "Titan Truffle",
    "image": "expanded/titan-reveal.png",
    "caption": "A bellow rolls through the chamber.",
    "alt": "A bellow rolls through the chamber.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "next": "titan-step"
  },
  {
    "id": "titan-step",
    "title": "Something much bigger",
    "image": "expanded/titan-step.png",
    "caption": "Stone grinds beneath a massive planted fist.",
    "alt": "Stone grinds beneath a massive planted fist.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "next": "door-sealed"
  },
  {
    "id": "door-sealed",
    "title": "Safely outside",
    "image": "expanded/door-sealed.png",
    "caption": "The doors slam shut. A last puff of purple smoke slips through.",
    "alt": "The doors slam shut. A last puff of purple smoke slips through.",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "next": "lobby"
  },
  {
    "id": "lobby",
    "title": "Who should you ask for help?",
    "image": "expanded/nova-lobby.png",
    "caption": "",
    "alt": "Who should you ask for help?",
    "chapter": "06 / COMPANION",
    "seconds": 6,
    "choices": []
  },
  {
    "id": "nova-dragon-call",
    "title": "One more invitation",
    "image": "expanded/nova-dragon-call.png",
    "caption": "The focus glows. The dragon returns at its partner’s side.",
    "alt": "The dragon is summoned inside the challenge doorway before the boss appears.",
    "character": "nova",
    "route": "summon",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "next": "challenge-empty"
  },
  {
    "id": "ya-dragon-call",
    "title": "One more invitation",
    "image": "expanded/ya-dragon-call.png",
    "caption": "The focus glows. The dragon returns at its partner’s side.",
    "alt": "The dragon is summoned inside the challenge doorway before the boss appears.",
    "character": "ya",
    "route": "summon",
    "chapter": "05 / CHALLENGE",
    "seconds": 6,
    "next": "challenge-empty"
  }
];
export const characterNames={nova:'Nova',ya:'Ya',oren:'Or-en'};
export const storyState={character:'nova',route:'sword',outcome:'skipped'};
const raw=new Map(scenes.map(s=>[s.id,s]));
export function enterScene(id){const s=raw.get(id);if(!s)return;if(id==='selection'){Object.assign(storyState,{character:'nova',route:'sword',outcome:'skipped'});}if(s.character)storyState.character=s.character;if(storyState.character==='oren'&&['classes','challenge-door','challenge-empty','titan-reveal','titan-step','door-sealed'].includes(id))Object.assign(storyState,{character:'nova',route:'sword',outcome:'skipped'});if(s.route)storyState.route=s.route;else if(id.includes('-sword-'))storyState.route='sword';else if(id.includes('-bow-'))storyState.route='bow';else if(id.includes('-summon-')||id.includes('-dragon-'))storyState.route='summon';else if(id.includes('-boss-')&&storyState.route==='summon')storyState.route='sword';if(s.outcome)storyState.outcome=s.outcome;}
export function resolveScene(id){const base=raw.get(id);if(!base)return;const s={...base},c=storyState.character,summon=storyState.route==='summon';
 if(id==='classes')s.choices=[{label:'Archery Range',to:c+'-bow-start'},{label:'Training Grounds',to:c+'-sword-start'},{label:'Summoner’s Lair',to:c+'-summon-start'}];
 if(id===c+'-challenge-entry'&&summon)s.next=c+'-dragon-call';
 if(id==='challenge-door')s.next=c+'-challenge-entry';
 if(id==='titan-reveal')s.next=c+(summon?'-dragon-reaction':'-boss-reaction');
 if(id==='titan-step')s.next=c+(summon?'-dragon-run':'-boss-run');
 if(id==='door-sealed')s.next=c+(summon?'-dragon-gulp':'-boss-gulp');
 if(id==='lobby'){s.image='expanded/'+c+'-lobby.png';s.title=c==='oren'?'A little company':'Who should you ask for help?';s.caption=c==='oren'?'Two travelers pause near the bench. Or-en looks up.':storyState.outcome==='escaped'?'That challenge calls for a little help. Familiar faces wait by the bench.':'Practice is a start. The next adventure could use some company.';s.choices=Object.entries(characterNames).filter(([k])=>k!==c).map(([k,n])=>({label:'Ask '+n,to:c+'-meet-'+k}));}
 s.alt=id==='lobby'?s.caption:s.alt||s.title;return s;
}
export const byId={has:id=>raw.has(id),get:resolveScene};
export const validScene=id=>raw.has(id)?id:'selection';
export function nextScene(id,index=0){const s=resolveScene(id);return s?.choices?s.choices[index]?.to:s?.next;}
