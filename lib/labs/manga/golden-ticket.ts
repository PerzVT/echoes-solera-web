/*
 * Golden Ticket, arc one, from the manga package "Nine Lives manga golden-ticket v001" as delivered.
 * Pages are 2:3, composed left to right, with no words in the art: every balloon, caption and sound is
 * live text from `letters`, in percent of the page (the Letter shape of the reader's Lettering component).
 * `src` is the 1024 x 1536 export, `srcLarge` the 1536 x 2304 one. Release dates are the package's
 * demonstration dates; chapter 4 is announced with a cover and no pages.
 */
export type Letter = { kind: "speech" | "narration" | "sfx" | "inset"; text: string; x: number; y: number; w?: number; tail?: { at: number; up?: boolean; flip?: boolean }; rotate?: number; scale?: number };
export type MangaPage = { src: string; srcLarge: string; alt: string; letters: Letter[] };
export type MangaChapter = { number: number; title: string; releases: string; status: "available" | "announced"; cover: string; thumb: string; pages: MangaPage[] };
export type MangaSeries = { slug: string; title: string; hook: string; genre: string; direction: "ltr" | "rtl"; cover: string; hero: string; square: string; chapters: MangaChapter[] };

export const goldenTicket: MangaSeries = {
  "slug": "golden-ticket",
  "title": "Golden Ticket",
  "hook": "A five-dollar bargain opens a city that already knows her name.",
  "genre": "Fantasy adventure / slow-burn romance",
  "direction": "ltr",
  "cover": "/labs/manga/golden-ticket/cover.webp",
  "hero": "/labs/manga/golden-ticket/hero.webp",
  "square": "/labs/manga/golden-ticket/square.webp",
  "chapters": [
    {
      "number": 1,
      "title": "The Bargain Bin",
      "releases": "2026-11-18",
      "status": "available",
      "cover": "/labs/manga/golden-ticket/ch-01/cover.webp",
      "thumb": "/labs/manga/golden-ticket/ch-01/thumb.webp",
      "pages": [
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-01.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-01-large.webp",
          "alt": "Rain at the station: Wide view of Nova bent over the bin, towering shelves and pendant lamps behind her.",
          "letters": [
            {
              "kind": "narration",
              "text": "I only went in to get out of the rain.",
              "x": 7,
              "y": 6,
              "w": 37
            },
            {
              "kind": "speech",
              "text": "Ten minutes. Then home.",
              "x": 5,
              "y": 35,
              "w": 19,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "The bargain bin had other ideas.",
              "x": 7,
              "y": 70,
              "w": 35
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-02.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-02-large.webp",
          "alt": "The obsolete shelf: Nova pulls it free, curious, case label blank for live lettering.",
          "letters": [
            {
              "kind": "narration",
              "text": "Old consoles and games, sold by the kilo.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "What's this one? It's heavy.",
              "x": 7,
              "y": 40,
              "w": 34,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "inset",
              "text": "VR",
              "x": 15,
              "y": 59,
              "w": 12
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-03.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-03-large.webp",
          "alt": "The clasp: A narrow metal ticket slides from the hinge toward her open palm.",
          "letters": [
            {
              "kind": "speech",
              "text": "A VR case. Is anything in it?",
              "x": 7,
              "y": 6,
              "w": 35,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "sfx",
              "text": "click",
              "x": 7,
              "y": 40,
              "w": 20,
              "rotate": -5,
              "scale": 1
            },
            {
              "kind": "speech",
              "text": "No headset. Just this.",
              "x": 7,
              "y": 71,
              "w": 33,
              "tail": {
                "at": 80
              }
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-04.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-04-large.webp",
          "alt": "The weight: Nova raises ticket at arm's length against the shop lamps, face at right, blank wall at left.",
          "letters": [
            {
              "kind": "narration",
              "text": "A ticket. Too heavy to be a coupon.",
              "x": 7,
              "y": 6,
              "w": 26
            },
            {
              "kind": "speech",
              "text": "Is this real metal?",
              "x": 5,
              "y": 40,
              "w": 20,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "Under the scratches, a crest I knew.",
              "x": 5,
              "y": 74,
              "w": 27
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-05.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-05-large.webp",
          "alt": "An invitation: Nova imagines a distant luminous walled city as a faint reflection in shop glass; she remains in hoodie.",
          "letters": [
            {
              "kind": "narration",
              "text": "Nine Lives. The game you could only join by invitation.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "Who leaves one of these in a bargain bin?",
              "x": 7,
              "y": 22,
              "w": 35,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "For a second I could almost see the city.",
              "x": 7,
              "y": 70,
              "w": 37
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-06.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-06-large.webp",
          "alt": "Almost: Nova abruptly draws it back against her hoodie, conflicted half-smile, plain wall open left.",
          "letters": [
            {
              "kind": "speech",
              "text": "It's probably expired. These always are.",
              "x": 5,
              "y": 5,
              "w": 29,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "I put it back.",
              "x": 5,
              "y": 38,
              "w": 30
            },
            {
              "kind": "speech",
              "text": "...Excuse me. How much for this?",
              "x": 5,
              "y": 71,
              "w": 29,
              "tail": {
                "at": 80
              }
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-07.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-07-large.webp",
          "alt": "Five dollars: She places a five-dollar note on the counter, ticket and case beside it, no readable printed words.",
          "letters": [
            {
              "kind": "speech",
              "text": "Five dollars for anything in that bin.",
              "x": 5,
              "y": 5,
              "w": 26,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "Even this?",
              "x": 53,
              "y": 36,
              "w": 18,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "Especially that. One less thing to dust.",
              "x": 7,
              "y": 70,
              "w": 35,
              "tail": {
                "at": 10
              }
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-08.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-08-large.webp",
          "alt": "No returns: Nova steps under the narrow exterior awning, bag under her elbow, long hair blown sideways.",
          "letters": [
            {
              "kind": "speech",
              "text": "Does it still work?",
              "x": 5,
              "y": 5,
              "w": 24,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "For five dollars, you get to find out.",
              "x": 50,
              "y": 6,
              "w": 19,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "Fair enough. I took it.",
              "x": 7,
              "y": 70,
              "w": 32
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-09.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-09-large.webp",
          "alt": "Under the awning: Over shoulder view of phone aiming at ticket, phone screen plain and blank for overlay.",
          "letters": [
            {
              "kind": "narration",
              "text": "The station was three minutes away.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "One scan. Then I go home.",
              "x": 5,
              "y": 39,
              "w": 19,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "I was hoping it would do nothing.",
              "x": 7,
              "y": 71,
              "w": 31
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-10.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-10-large.webp",
          "alt": "The scan: Nova taps dark screen with one finger, eyebrows pulled together, empty space left for text.",
          "letters": [
            {
              "kind": "sfx",
              "text": "pip",
              "x": 7,
              "y": 6,
              "w": 20,
              "rotate": -5,
              "scale": 1
            },
            {
              "kind": "speech",
              "text": "Black screen. Great.",
              "x": 5,
              "y": 40,
              "w": 19,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "Hello? Anyone?",
              "x": 5,
              "y": 70,
              "w": 25,
              "tail": {
                "at": 80
              }
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-11.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-11-large.webp",
          "alt": "Delivery confirmed: Wide dynamic panel Nova pulled backward through a rush of light and fractured shop reflections, no injury.",
          "letters": [
            {
              "kind": "inset",
              "text": "Delivery confirmed. Prepare for the dive.",
              "x": 51,
              "y": 9,
              "w": 32
            },
            {
              "kind": "speech",
              "text": "Delivery? To who?",
              "x": 4,
              "y": 40,
              "w": 18,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "sfx",
              "text": "WHUM",
              "x": 66,
              "y": 73,
              "w": 25,
              "rotate": -5,
              "scale": 1
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-01/page-12.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-01/page-12-large.webp",
          "alt": "Back at the bin: Close Nova at right staring at ticket, shop lamps behind; her reflection in ticket shows falling rain.",
          "letters": [
            {
              "kind": "narration",
              "text": "The light went out. So did the rain.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "I'm... inside again?",
              "x": 43,
              "y": 33,
              "w": 22,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "I'd walked out of here. I was sure of it.",
              "x": 7,
              "y": 70,
              "w": 30
            }
          ]
        }
      ]
    },
    {
      "number": 2,
      "title": "Delivery Confirmed",
      "releases": "2026-11-18",
      "status": "available",
      "cover": "/labs/manga/golden-ticket/ch-02/cover.webp",
      "thumb": "/labs/manga/golden-ticket/ch-02/thumb.webp",
      "pages": [
        {
          "src": "/labs/manga/golden-ticket/ch-02/page-01.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-02/page-01-large.webp",
          "alt": "The doorstep: Wide she braces shoulder against crate and tests its weight.",
          "letters": [
            {
              "kind": "narration",
              "text": "The next morning, it was at my door.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "Mom? Is this yours?",
              "x": 5,
              "y": 38,
              "w": 21,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "No courier. No label. Just the crest.",
              "x": 7,
              "y": 70,
              "w": 34
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-02/page-02.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-02/page-02-large.webp",
          "alt": "No answer: Low view Nova dragging crate over threshold, socked feet braced, hoodie sleeves pushed up.",
          "letters": [
            {
              "kind": "speech",
              "text": "Mom? Pick up.",
              "x": 5,
              "y": 5,
              "w": 20,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "Voicemail. She was on shift until tonight.",
              "x": 5,
              "y": 19,
              "w": 30
            },
            {
              "kind": "speech",
              "text": "Fine. It's you and me, box.",
              "x": 5,
              "y": 70,
              "w": 36,
              "tail": {
                "at": 80
              }
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-02/page-03.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-02/page-03-large.webp",
          "alt": "The latches: She sits back on heels, hair tousled, noticing a narrow gold slot on front.",
          "letters": [
            {
              "kind": "sfx",
              "text": "clack",
              "x": 7,
              "y": 6,
              "w": 25,
              "rotate": -5,
              "scale": 1
            },
            {
              "kind": "speech",
              "text": "Locked. Of course.",
              "x": 4,
              "y": 35,
              "w": 21,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "Wait. What's this slot?",
              "x": 7,
              "y": 70,
              "w": 28,
              "tail": {
                "at": 80
              }
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-02/page-04.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-02/page-04-large.webp",
          "alt": "The shape: Nova runs toward coat hook where hoodie pocket and paper bag hang, dynamic diagonal pose.",
          "letters": [
            {
              "kind": "narration",
              "text": "A slot. Thin, and about as wide as a card.",
              "x": 7,
              "y": 6,
              "w": 32
            },
            {
              "kind": "speech",
              "text": "No. No way.",
              "x": 4,
              "y": 36,
              "w": 22,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "The ticket was still in my hoodie.",
              "x": 7,
              "y": 70,
              "w": 34
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-02/page-05.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-02/page-05-large.webp",
          "alt": "The key: Close latches release one after another, Nova's reflected eye visible in metal.",
          "letters": [
            {
              "kind": "speech",
              "text": "Okay, five-dollar ticket.",
              "x": 7,
              "y": 6,
              "w": 30,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "Please don't break anything.",
              "x": 4,
              "y": 35,
              "w": 23,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "sfx",
              "text": "click",
              "x": 7,
              "y": 70,
              "w": 28,
              "rotate": -5,
              "scale": 1
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-02/page-06.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-02/page-06-large.webp",
          "alt": "Inside: Wide three objects arranged in crate: suit, headset, physical game box; Nova kneels beyond.",
          "letters": [
            {
              "kind": "narration",
              "text": "No letter. No invoice.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "This can't all be for me.",
              "x": 4,
              "y": 35,
              "w": 23,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "A suit. A headset. And one game.",
              "x": 7,
              "y": 70,
              "w": 34
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-02/page-07.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-02/page-07-large.webp",
          "alt": "The visor: She sets headset beside opened case and reaches for game box.",
          "letters": [
            {
              "kind": "speech",
              "text": "A Nine Lives headset.",
              "x": 7,
              "y": 6,
              "w": 35,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "I'd only ever seen one in videos.",
              "x": 7,
              "y": 18,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "Who sent you?",
              "x": 7,
              "y": 70,
              "w": 34,
              "tail": {
                "at": 80
              }
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-02/page-08.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-02/page-08-large.webp",
          "alt": "The game box: Wide room floor with crate, suit, visor and Nova absorbed in box.",
          "letters": [
            {
              "kind": "narration",
              "text": "The box said Solera Prime.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "narration",
              "text": "A whole city, and no invite code on the back.",
              "x": 5,
              "y": 35,
              "w": 34
            },
            {
              "kind": "speech",
              "text": "So the ticket was the invite.",
              "x": 7,
              "y": 70,
              "w": 34,
              "tail": {
                "at": 80
              }
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-02/page-09.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-02/page-09-large.webp",
          "alt": "Remembering: Nova in profile with a hesitant smile reflected in dark visor, plenty of blank wall left.",
          "letters": [
            {
              "kind": "narration",
              "text": "I used to stay up all night for a new game.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "narration",
              "text": "Then games turned into one more thing to finish.",
              "x": 5,
              "y": 37,
              "w": 34
            },
            {
              "kind": "speech",
              "text": "When did I stop having fun?",
              "x": 7,
              "y": 70,
              "w": 34,
              "tail": {
                "at": 80
              }
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-02/page-10.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-02/page-10-large.webp",
          "alt": "A spark: Large bottom panel her bright eyes raised toward viewer, headset cradled against chest, screenlike white light.",
          "letters": [
            {
              "kind": "narration",
              "text": "Nothing had even started.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "narration",
              "text": "I was already smiling.",
              "x": 5,
              "y": 37,
              "w": 32
            },
            {
              "kind": "speech",
              "text": "Okay. One try.",
              "x": 7,
              "y": 70,
              "w": 36,
              "tail": {
                "at": 80
              }
            }
          ]
        }
      ]
    },
    {
      "number": 3,
      "title": "The Dive",
      "releases": "2026-11-25",
      "status": "available",
      "cover": "/labs/manga/golden-ticket/ch-03/cover.webp",
      "thumb": "/labs/manga/golden-ticket/ch-03/thumb.webp",
      "pages": [
        {
          "src": "/labs/manga/golden-ticket/ch-03/page-01.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-03/page-01-large.webp",
          "alt": "Suit up: Nova sits on bed holding visor at eye level, nervous playful smile.",
          "letters": [
            {
              "kind": "speech",
              "text": "It fits. How does it fit?",
              "x": 7,
              "y": 6,
              "w": 35,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "No scores to chase. Nobody watching.",
              "x": 7,
              "y": 18,
              "w": 37
            },
            {
              "kind": "speech",
              "text": "Just a look around.",
              "x": 7,
              "y": 70,
              "w": 34,
              "tail": {
                "at": 80
              }
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-03/page-02.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-03/page-02-large.webp",
          "alt": "The seal: Room dissolves into white lines around a small seated silhouette, clear space at upper left.",
          "letters": [
            {
              "kind": "sfx",
              "text": "hiss",
              "x": 7,
              "y": 6,
              "w": 25,
              "rotate": -5,
              "scale": 1
            },
            {
              "kind": "speech",
              "text": "Huh. It's actually comfy...",
              "x": 7,
              "y": 18,
              "w": 36,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "The room was gone before I finished.",
              "x": 7,
              "y": 70,
              "w": 37
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-03/page-03.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-03/page-03-large.webp",
          "alt": "Falling: Nova falling feet first toward a distant circular arch of daylight, no text or interface.",
          "letters": [
            {
              "kind": "narration",
              "text": "This wasn't a loading screen.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "Loading screens don't have wind!",
              "x": 5,
              "y": 35,
              "w": 36,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "sfx",
              "text": "FWOOSH",
              "x": 7,
              "y": 70,
              "w": 40,
              "rotate": -5,
              "scale": 1
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-03/page-04.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-03/page-04-large.webp",
          "alt": "Landing: Nova sits back and inspects her long coat and pendant, surprised.",
          "letters": [
            {
              "kind": "sfx",
              "text": "thump",
              "x": 7,
              "y": 6,
              "w": 25,
              "rotate": -5,
              "scale": 1
            },
            {
              "kind": "speech",
              "text": "Ow. That actually hurt.",
              "x": 7,
              "y": 40,
              "w": 22,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "Games weren't supposed to hurt. Or come with a coat.",
              "x": 7,
              "y": 73,
              "w": 37
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-03/page-05.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-03/page-05-large.webp",
          "alt": "Solera Prime: Bottom wide Nova small against bustling market street of human adventurers and vendors, no mascot creatures.",
          "letters": [
            {
              "kind": "narration",
              "text": "Solera Prime.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "This isn't a backdrop.",
              "x": 4,
              "y": 39,
              "w": 22,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "Nobody here was waiting for me to press start.",
              "x": 7,
              "y": 73,
              "w": 34
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-03/page-06.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-03/page-06-large.webp",
          "alt": "The avatar: Nova steadies herself on low wall, smiles at reflection, other hand brushes long hair.",
          "letters": [
            {
              "kind": "speech",
              "text": "Same face. Much better coat.",
              "x": 7,
              "y": 6,
              "w": 35,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "Boots I can't walk in yet.",
              "x": 52,
              "y": 37,
              "w": 25,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "For once, I didn't want to skip the intro.",
              "x": 7,
              "y": 73,
              "w": 34
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-03/page-07.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-03/page-07-large.webp",
          "alt": "A wrong turn: High balcony: Nine watches below, white spiky hair and dark scarf, one hand already reaching toward railing.",
          "letters": [
            {
              "kind": "speech",
              "text": "There has to be a tutorial somewhere.",
              "x": 7,
              "y": 6,
              "w": 35,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "sfx",
              "text": "rattle",
              "x": 7,
              "y": 39,
              "w": 28,
              "rotate": -5,
              "scale": 1
            },
            {
              "kind": "narration",
              "text": "Someone above saw the cart before I did.",
              "x": 7,
              "y": 76,
              "w": 34
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-03/page-08.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-03/page-08-large.webp",
          "alt": "Intervention: Nine withdraws into balcony shade, stern face, faint relief, scarf lifts in breeze.",
          "letters": [
            {
              "kind": "sfx",
              "text": "tak",
              "x": 7,
              "y": 6,
              "w": 25,
              "rotate": -5,
              "scale": 1
            },
            {
              "kind": "speech",
              "text": "Whoa. Thanks, curb.",
              "x": 75,
              "y": 62,
              "w": 21,
              "tail": {
                "at": 50,
                "up": true
              }
            },
            {
              "kind": "narration",
              "text": "On the balcony above, someone lowered his hand.",
              "x": 7,
              "y": 76,
              "w": 32
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-03/page-09.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-03/page-09-large.webp",
          "alt": "Not part of the route: Nine turns his face aside too quickly, subtle blush, pretending to inspect empty street.",
          "letters": [
            {
              "kind": "narration",
              "text": "The gate enforcer isn't meant to leave his post.",
              "x": 7,
              "y": 6,
              "w": 37
            },
            {
              "kind": "speech",
              "text": "Careless. Watch the road.",
              "x": 3,
              "y": 43,
              "w": 25,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "He had stepped in before he decided to.",
              "x": 7,
              "y": 78,
              "w": 39
            }
          ]
        },
        {
          "src": "/labs/manga/golden-ticket/ch-03/page-10.webp",
          "srcLarge": "/labs/manga/golden-ticket/ch-03/page-10-large.webp",
          "alt": "A name from above: Large bottom view from behind Nova facing elevated Nine across market, tension and distance, no physical meeting yet.",
          "letters": [
            {
              "kind": "speech",
              "text": "Nova.",
              "x": 53,
              "y": 5,
              "w": 22,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "How do you know my name?",
              "x": 4,
              "y": 42,
              "w": 23,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "He knew. He didn't look ready to say how.",
              "x": 7,
              "y": 72,
              "w": 35
            }
          ]
        }
      ]
    },
    {
      "number": 4,
      "title": "Off the Record",
      "releases": "2026-12-02",
      "status": "announced",
      "cover": "/labs/manga/golden-ticket/ch-04/cover.webp",
      "thumb": "/labs/manga/golden-ticket/ch-04/thumb.webp",
      "pages": []
    }
  ]
};
