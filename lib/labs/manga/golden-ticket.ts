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
              "text": "I only came in to get out of the rain.",
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
              "text": "That was the plan.",
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
              "text": "Someone had sold a whole childhood by the kilogram.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "And somehow kept every cable.",
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
              "text": "VR? In this thing?",
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
              "text": "Oh. Not empty.",
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
              "text": "Too heavy for a coupon.",
              "x": 7,
              "y": 6,
              "w": 26
            },
            {
              "kind": "speech",
              "text": "Is this actual metal?",
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
              "text": "Nine Lives. The place you needed someone to get into.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "Who leaves an invitation in a bargain bin?",
              "x": 7,
              "y": 22,
              "w": 35,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "Probably someone who had better places to be.",
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
              "text": "It is probably a promotion that expired years ago.",
              "x": 5,
              "y": 5,
              "w": 29,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "I could leave it there.",
              "x": 5,
              "y": 38,
              "w": 30
            },
            {
              "kind": "speech",
              "text": "...How much for this?",
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
              "text": "Five dollars. Everything in that bin.",
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
              "text": "Especially that. Saves me dusting it.",
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
              "text": "Does it work?",
              "x": 5,
              "y": 5,
              "w": 24,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "For five dollars, you get the mystery.",
              "x": 50,
              "y": 6,
              "w": 19,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "Fair enough.",
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
              "text": "One scan. Then I am leaving.",
              "x": 5,
              "y": 39,
              "w": 19,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "I wanted it to be nothing.",
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
              "text": "Come on. I charged you.",
              "x": 5,
              "y": 40,
              "w": 19,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "Hello?",
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
              "text": "Delivery Confirmed. Prepare for the Dive.",
              "x": 51,
              "y": 9,
              "w": 32
            },
            {
              "kind": "speech",
              "text": "Delivery to where?",
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
              "text": "The rain stopped.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "I already left.",
              "x": 43,
              "y": 33,
              "w": 22,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "So why was I back at the bin?",
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
              "text": "Less than a day later.",
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
              "text": "No answer.",
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
              "text": "Mom?",
              "x": 5,
              "y": 5,
              "w": 20,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "The apartment gave me the same answer as the phone.",
              "x": 5,
              "y": 19,
              "w": 30
            },
            {
              "kind": "speech",
              "text": "Fine. You and me, suspicious box.",
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
              "text": "Not even a little?",
              "x": 4,
              "y": 35,
              "w": 21,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "Wait.",
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
              "text": "I had seen that shape before.",
              "x": 7,
              "y": 6,
              "w": 32
            },
            {
              "kind": "speech",
              "text": "No. That cannot be right.",
              "x": 4,
              "y": 36,
              "w": 22,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "I went to get it anyway.",
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
              "text": "Five dollars.",
              "x": 7,
              "y": 6,
              "w": 30,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "Please do not be the expensive part.",
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
              "text": "No confetti. No letter.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "This cannot all be for me.",
              "x": 4,
              "y": 35,
              "w": 23,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "A suit. A headset. And a game.",
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
              "text": "Nine Lives.",
              "x": 7,
              "y": 6,
              "w": 35,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "I had never seen one outside a screen.",
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
              "text": "Solera Prime",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "narration",
              "text": "A whole city in a box.",
              "x": 5,
              "y": 35,
              "w": 34
            },
            {
              "kind": "speech",
              "text": "No invite code. No waiting list.",
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
              "text": "I used to stay up for release nights.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "narration",
              "text": "Somewhere along the way, games had become another thing to finish.",
              "x": 5,
              "y": 37,
              "w": 34
            },
            {
              "kind": "speech",
              "text": "When did that happen?",
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
              "text": "Nothing had started yet.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "narration",
              "text": "Still, I was smiling.",
              "x": 5,
              "y": 37,
              "w": 32
            },
            {
              "kind": "speech",
              "text": "Am I excited for a game again?",
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
              "text": "Okay. New game.",
              "x": 7,
              "y": 6,
              "w": 35,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "No one to impress. No score to catch up to.",
              "x": 7,
              "y": 18,
              "w": 37
            },
            {
              "kind": "speech",
              "text": "Just look around.",
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
              "text": "That is surprisingly...",
              "x": 7,
              "y": 18,
              "w": 36,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "The bed vanished before I found the word.",
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
              "text": "Not a loading screen.",
              "x": 7,
              "y": 6,
              "w": 35
            },
            {
              "kind": "speech",
              "text": "Definitely not a loading screen.",
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
              "text": "Ow.",
              "x": 7,
              "y": 40,
              "w": 22,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "I had not expected the ground to have an opinion.",
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
              "text": "You are not a skybox.",
              "x": 4,
              "y": 39,
              "w": 22,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "The wind kept going after I stopped moving.",
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
              "text": "Same face. Better coat.",
              "x": 7,
              "y": 6,
              "w": 35,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "speech",
              "text": "Slightly ambitious boots.",
              "x": 52,
              "y": 37,
              "w": 25,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "For once, I did not want to skip the beginning.",
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
              "text": "There has to be a tutorial around here.",
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
              "text": "Someone noticed the cart before I did.",
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
              "text": "Above the market, a hand slowly unclenched.",
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
              "text": "The gate enforcer was supposed to stay at his post.",
              "x": 7,
              "y": 6,
              "w": 37
            },
            {
              "kind": "speech",
              "text": "Careless newcomer.",
              "x": 3,
              "y": 43,
              "w": 25,
              "tail": {
                "at": 80
              }
            },
            {
              "kind": "narration",
              "text": "He had moved before the thought was finished.",
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
              "text": "The city had an answer. He did not look ready to give it.",
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
