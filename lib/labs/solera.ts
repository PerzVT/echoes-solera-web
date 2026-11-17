import type { WatchItem } from "@/components/labs/WatchView";

const L = "/labs/anime";

export const solera = {
  title: "Echoes of Solera",
  kind: "Anime",
  hook: "Avva, known online as Nova, finds a golden ticket in a bargain bin. It is a pass into Solera, an invite-only virtual world.",
  story: [
    "The story takes place in Solera Prime, the main city of the world of Solera. The ticket into it sits inside a cartridge case marked VR, under a pile of obsolete tech in a game resale shop. It carries a QR code and the crest of 9Lives Studios. Nova nearly tosses it back, then buys it for five dollars.",
    "Outside in the rain she scans the code. Her phone blacks out and shows one line: Delivery Confirmed. Prepare for the Dive. Less than a day later a crate arrives on her doorstep with a neural headset, a haptic suit and a game box.",
  ],
  /** Silent loops cut from Book One: Catalyst. */
  hero: { video: `${L}/catalyst-rain-v2.mp4`, poster: `${L}/catalyst-rain-v2.webp`, label: "The game shop in the rain, from Catalyst" },
  storyLoop: { video: `${L}/catalyst-shop-v2.mp4`, poster: `${L}/catalyst-shop-v2.webp`, label: "Nova reads a VR case in the shop, from Catalyst" },
  cover: `${L}/shorts/one-second-express.webp`,
  cast: [
    { name: "Nova", src: `${L}/cast/nova.webp` },
    { name: "Nine", src: `${L}/cast/nine.webp` },
    { name: "Damion", src: `${L}/cast/damion.webp` },
    { name: "YA", src: `${L}/cast/ya.webp` },
  ],
  places: [
    { name: "Cathedral ruins", src: `${L}/places/cathedral-ruins.webp` },
    { name: "Market overlook", src: `${L}/places/market-overlook.webp` },
    { name: "Oasis", src: `${L}/places/oasis.webp` },
  ],
};

const short = (number: number, slug: string, title: string, seconds: number): WatchItem => ({
  number,
  title,
  seconds,
  video: `${L}/shorts/${slug}.mp4`,
  poster: `${L}/shorts/${slug}.webp`,
});

/** Book One: Catalyst, parts 1 and 2 joined into one film, 3 minutes 3 seconds. */
export const catalyst: WatchItem = {
  number: 1,
  title: "Book One: Catalyst, parts 1 and 2",
  seconds: 183,
  video: `${L}/catalyst.mp4`,
  poster: `${L}/catalyst.webp`,
};

const dance = (number: number, slug: string, title: string, seconds: number): WatchItem => ({
  number,
  title,
  seconds,
  video: `${L}/dances/${slug}.mp4`,
  poster: `${L}/dances/${slug}.webp`,
});

/** Nova and Ya dance clips, landscape. */
export const dances: WatchItem[] = [
  dance(1, "indoor-dance", "Indoor Dance", 15),
  dance(2, "cloud-dance", "Cloud Dance", 15),
];

export const shorts: WatchItem[] = [
  short(1, "one-second-express", "One-Second Express", 15),
  short(2, "highquest-on-break", "HighQuest on Break", 15),
  short(3, "back-to-me", "Back to Me", 13),
  short(4, "creature-comfort", "Creature Comfort", 15),
  short(5, "glowmote-grooming", "Glowmote Grooming", 15),
  short(6, "celestial-fruit-grazer", "Celestial Fruit Grazer", 15),
  short(7, "everyday-stops", "Everyday Stops", 8),
];
