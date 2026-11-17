import { allStyles, type Style } from "@/lib/labs/styles";

const A = "/labs/anime";
const S = `${A}/catalyst-stills`;

export type ShotStatus = "ready" | "generating" | "empty" | "failed";
export type Take = { still: string; clip?: string };
export type CharId = "nova" | "nine" | "ya" | "damion";
export type PlaceId = "storefront" | "aisles" | "lot" | "cathedral-ruins" | "market-overlook" | "oasis";

export type Shot = {
  id: string;
  scene: number;
  label: string;
  action: string;
  cast: CharId[];
  place: PlaceId;
  style: string;
  prompt: string;
  seconds: number;
  takes: Take[];
  take: number;
  status: ShotStatus;
  /** Art a new take draws from, in order. Nothing is generated: the mock reuses stills of the short. */
  next: Take[];
};

export type Scene = { n: number; heading: string };

export const episode = { title: "Catalyst" };

export const scenes: Scene[] = [
  { n: 1, heading: "EXT. STOREFRONT - DUSK" },
  { n: 2, heading: "INT. RESTART - NIGHT" },
  { n: 3, heading: "EXT. PARKING LOT - NIGHT" },
];

export const characters: { id: CharId; name: string; face: string }[] = [
  { id: "nova", name: "Nova", face: `${A}/cast/nova.webp` },
  { id: "nine", name: "Nine", face: `${A}/cast/nine.webp` },
  { id: "ya", name: "Ya", face: `${A}/cast/ya.webp` },
  { id: "damion", name: "Damion", face: `${A}/cast/damion.webp` },
];

export const places: { id: PlaceId; name: string; thumb: string }[] = [
  { id: "storefront", name: "Restart storefront", thumb: `${S}/storefront-dusk.webp` },
  { id: "aisles", name: "Restart aisles", thumb: `${A}/catalyst-hero.webp` },
  { id: "lot", name: "Parking lot", thumb: `${S}/store-in-rain.webp` },
  { id: "cathedral-ruins", name: "Cathedral ruins", thumb: `${A}/places/cathedral-ruins.webp` },
  { id: "market-overlook", name: "Market overlook", thumb: `${A}/places/market-overlook.webp` },
  { id: "oasis", name: "Oasis", thumb: `${A}/places/oasis.webp` },
];

export const styles: Style[] = [...allStyles.filter((s) => !s.hidden && s.group === "In use"), ...allStyles.filter((s) => !s.hidden && s.group === "Library")];
export const styleBySlug = (slug: string) => styles.find((s) => s.slug === slug) ?? styles[0];

const STYLE = "solera-anime";

const t = (still: string, clip?: string): Take => ({ still, clip });

const shop = t(`${A}/catalyst-shop.webp`, `${A}/catalyst-shop.mp4`);
const shopClose = t(`${A}/catalyst-shop-v2.webp`, `${A}/catalyst-shop-v2.mp4`);
const rain = t(`${A}/catalyst-rain.webp`, `${A}/catalyst-rain.mp4`);
const rainRun = t(`${A}/catalyst-rain-v2.webp`, `${A}/catalyst-rain-v2.mp4`);

export const initialShots: Shot[] = [
  {
    id: "s1",
    scene: 1,
    label: "WIDE",
    action: "The Restart sign glows under a darkening sky.",
    cast: [],
    place: "storefront",
    style: STYLE,
    prompt: "Low angle on a retro game store at dusk, red RESTART sign, full moon, heavy clouds rolling in, warm last light on the clouds.",
    seconds: 4,
    takes: [t(`${S}/storefront-dusk.webp`)],
    take: 0,
    status: "ready",
    next: [t(`${S}/storefront-dusk.webp`)],
  },
  {
    id: "s2",
    scene: 2,
    label: "INSERT",
    action: "A bargain bin of old handhelds. Nova leans in.",
    cast: ["nova"],
    place: "aisles",
    style: STYLE,
    prompt: "Over the shoulder into a wooden bin of retro handhelds and cartridges, Nova leaning in from the right, warm shop light.",
    seconds: 3,
    takes: [t(`${A}/catalyst-hero.webp`)],
    take: 0,
    status: "ready",
    next: [t(`${A}/catalyst-hero.webp`)],
  },
  {
    id: "s3",
    scene: 2,
    label: "MEDIUM ON NOVA",
    action: "She finds a VR case on the shelf and reads it.",
    cast: ["nova"],
    place: "aisles",
    style: STYLE,
    prompt: "Nova in a grey hoodie holds a clear VR game case low, reading the cover, shelves of boxed games soft behind her.",
    seconds: 4,
    takes: [shop],
    take: 0,
    status: "ready",
    next: [t(`${S}/nova-vr-case.webp`)],
  },
  {
    id: "s4",
    scene: 2,
    label: "CLOSE ON NOVA",
    action: "She lifts the case closer and frowns.",
    cast: ["nova"],
    place: "aisles",
    style: STYLE,
    prompt: "Close on Nova holding a clear VR game case, a floating island on the cover, she frowns at it.",
    seconds: 6,
    takes: [shopClose],
    take: 0,
    status: "ready",
    next: [shop],
  },
  {
    id: "s5",
    scene: 2,
    label: "CLOSE ON TICKET",
    action: "A gold ticket slides out of the case.",
    cast: [],
    place: "aisles",
    style: STYLE,
    prompt: "Extreme close on a gold ticket with a black cat crest and a QR code, catching the light, shelves soft behind.",
    seconds: 3,
    takes: [t(`${S}/ticket-close.webp`)],
    take: 0,
    status: "generating",
    next: [t(`${S}/ticket-close.webp`)],
  },
  {
    id: "s6",
    scene: 2,
    label: "CLOSE ON NOVA",
    action: "Nova holds the ticket up beside her face.",
    cast: ["nova"],
    place: "aisles",
    style: STYLE,
    prompt: "Nova holds the gold ticket up next to her face, calm, a glint on the foil, store shelves behind her.",
    seconds: 4,
    takes: [t(`${S}/nova-ticket-shop.webp`)],
    take: 0,
    status: "ready",
    next: [t(`${S}/nova-ticket-shop.webp`)],
  },
  {
    id: "s7",
    scene: 2,
    label: "MEDIUM ON NOVA",
    action: "She looks to the counter. Nine is watching her.",
    cast: ["nova", "nine"],
    place: "aisles",
    style: STYLE,
    prompt: "Nova turns toward the counter with the case in her hands; Nine stands behind the register, half in shadow.",
    seconds: 4,
    takes: [],
    take: 0,
    status: "empty",
    next: [t(`${S}/nova-ticket-shop.webp`)],
  },
  {
    id: "s8",
    scene: 3,
    label: "WIDE",
    action: "Rain sheets across the empty lot. Nova runs for the tree.",
    cast: ["nova"],
    place: "lot",
    style: STYLE,
    prompt: "Wide on a flooded parking lot at night in heavy rain, the store lit behind, a lone tree at right, a small figure running.",
    seconds: 6,
    takes: [rain, rainRun],
    take: 1,
    status: "ready",
    next: [t(`${S}/store-in-rain.webp`)],
  },
  {
    id: "s9",
    scene: 3,
    label: "WIDE ON NOVA",
    action: "Nova sits against the tree, out of the rain.",
    cast: ["nova"],
    place: "lot",
    style: STYLE,
    prompt: "Nova sits on the grass against a tree trunk at night, rain falling past the leaves, the ticket in her hand.",
    seconds: 5,
    takes: [t(`${A}/catalyst.webp`)],
    take: 0,
    status: "ready",
    next: [t(`${A}/catalyst.webp`)],
  },
  {
    id: "s10",
    scene: 3,
    label: "MEDIUM ON NOVA",
    action: "She turns the ticket over in her fingers.",
    cast: ["nova"],
    place: "lot",
    style: STYLE,
    prompt: "Medium on Nova under the tree, wet hair, turning the gold ticket in her fingers, dark leaves and rain behind.",
    seconds: 4,
    takes: [t(`${S}/nova-under-tree.webp`)],
    take: 0,
    status: "ready",
    next: [t(`${S}/nova-under-tree.webp`)],
  },
  {
    id: "s11",
    scene: 3,
    label: "CLOSE ON TICKET",
    action: "She scans the code. The ticket flares white.",
    cast: ["nova"],
    place: "lot",
    style: STYLE,
    prompt: "Close on the ticket's QR code lit by a phone screen, the foil flaring white from the centre.",
    seconds: 3,
    takes: [],
    take: 0,
    status: "failed",
    next: [t(`${S}/ticket-close.webp`)],
  },
];

export const statusWord: Record<ShotStatus, string> = { ready: "Ready", generating: "Generating", empty: "Not made", failed: "Failed" };
