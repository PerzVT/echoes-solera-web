import { allStyles, type Style } from "@/lib/labs/styles";

const A = "/labs/anime";
const S = `${A}/catalyst-stills`;
const M = `${A}/montage`;
const D = `${A}/dances`;
const P = `${A}/places`;

export type ShotStatus = "ready" | "generating" | "empty" | "failed";
export type Review = "approved" | "denied";
export type Take = { still: string; clip?: string };
/** Characters and places are named by id: the library ones below, and any a script brings. */
export type CharId = string;
export type PlaceId = string;
/** One card on the Cast step: a character or a place and its art. A script can name one the library has no art for. */
export type CastItem = { id: string; kind: "char" | "place"; name: string; src?: string };

export type Shot = {
  id: string;
  label: string;
  action: string;
  cast: CharId[];
  place: PlaceId;
  prompt: string;
  seconds: number;
  takes: Take[];
  take: number;
  status: ShotStatus;
  review?: Review;
  /** Art a new take draws from, in order. Nothing is generated: the mock reuses stills of the short. */
  next: Take[];
};

export type Scene = { id: string; heading: string; shots: Shot[] };
export type Episode = { scenes: Scene[] };
export type Canvas = { id: string; name: string; cover: string; style: string; cast: CastItem[]; episodes: Episode[] };

export const characters: { id: CharId; name: string; face: string }[] = [
  { id: "nova", name: "Nova", face: `${A}/cast/nova-catalyst.webp` },
  { id: "nine", name: "Nine", face: `${A}/cast/nine-bust.webp` },
  { id: "ya", name: "Ya", face: `${A}/cast/ya-bust.webp` },
  { id: "damion", name: "Damion", face: `${A}/cast/damion-bust.webp` },
];

export const places: { id: PlaceId; name: string; thumb: string }[] = [
  { id: "storefront", name: "Restart storefront", thumb: `${S}/storefront-dusk.webp` },
  { id: "aisles", name: "Restart aisles", thumb: `${P}/restart-aisles.webp` },
  { id: "lot", name: "Parking lot", thumb: `${S}/store-in-rain.webp` },
  { id: "cathedral-ruins", name: "Cathedral ruins", thumb: `${P}/cathedral-ruins.webp` },
  { id: "market-overlook", name: "Market overlook", thumb: `${P}/market-overlook.webp` },
  { id: "oasis", name: "Oasis", thumb: `${P}/oasis.webp` },
];

/** Everything in the library, as cast cards. */
export const libraryCast = (): CastItem[] => [
  ...characters.map((c) => ({ id: c.id, kind: "char" as const, name: c.name, src: c.face })),
  ...places.map((p) => ({ id: p.id, kind: "place" as const, name: p.name, src: p.thumb })),
];
const castOf = (ids: string[]) => libraryCast().filter((c) => ids.includes(c.id));
export const catalystCast = () => castOf(["nova", "nine", "storefront", "aisles", "lot"]);

/** Styles an anime can be made in: the house anime style and the drawn library directions (not the 3D or paper ones). */
const notAnime = new Set(["Soft-form 3D", "Sculpted adventure", "Layered paper"]);
export const animeStyles: Style[] = [
  ...allStyles.filter((s) => s.slug === "solera-anime"),
  ...allStyles.filter((s) => s.group === "Library" && !s.hidden && s.review && !notAnime.has(s.name)),
];
export const styleBySlug = (slug: string) => animeStyles.find((s) => s.slug === slug) ?? animeStyles[0];

const t = (still: string, clip?: string): Take => ({ still, clip });
function shot(id: string, label: string, action: string, cast: CharId[], place: PlaceId, prompt: string, seconds: number, takes: Take[], next?: Take[]): Shot {
  return { id, label, action, cast, place, prompt, seconds, takes, take: Math.max(0, takes.length - 1), status: "ready", next: next ?? takes };
}

const shop = t(`${A}/catalyst-shop.webp`, `${A}/catalyst-shop.mp4`);
const shopClose = t(`${A}/catalyst-shop-v2.webp`, `${A}/catalyst-shop-v2.mp4`);
const rain = t(`${A}/catalyst-rain.webp`, `${A}/catalyst-rain.mp4`);
const rainRun = t(`${A}/catalyst-rain-v2.webp`, `${A}/catalyst-rain-v2.mp4`);
const ticket = t(`${S}/ticket-close.webp`);

/** Catalyst, episode 1: the shot list the screenplay was split into. */
export function catalystScenes(): Scene[] {
  return [
    {
      id: "c1",
      heading: "EXT. STOREFRONT - DUSK",
      shots: [shot("s1", "Wide", "The Restart sign glows under a darkening sky.", [], "storefront", "Low angle on a retro game store at dusk, red RESTART sign, full moon, heavy clouds rolling in, warm last light on the clouds.", 4, [t(`${S}/storefront-dusk.webp`)])],
    },
    {
      id: "c2",
      heading: "INT. RESTART - NIGHT",
      shots: [
        shot("s2", "Insert", "A bargain bin of old handhelds. Nova leans in.", ["nova"], "aisles", "Over the shoulder into a wooden bin of retro handhelds and cartridges, Nova leaning in from the right, warm shop light.", 3, [t(`${A}/catalyst-hero.webp`)]),
        shot("s3", "Medium on Nova", "She finds a VR case on the shelf and reads it.", ["nova"], "aisles", "Nova in a grey hoodie holds a clear VR game case low, reading the cover, shelves of boxed games soft behind her.", 4, [shop], [t(`${S}/nova-vr-case.webp`), shop]),
        shot("s4", "Close on Nova", "She lifts the case closer and frowns.", ["nova"], "aisles", "Close on Nova holding a clear VR game case, a floating island on the cover, she frowns at it.", 6, [shopClose], [shopClose, shop]),
        shot("s5", "Close on ticket", "A gold ticket slides out of the case.", [], "aisles", "Extreme close on a gold ticket with a black cat crest and a QR code, catching the light, shelves soft behind.", 3, [ticket]),
        shot("s6", "Close on Nova", "Nova holds the ticket up beside her face.", ["nova"], "aisles", "Nova holds the gold ticket up next to her face, calm, a glint on the foil, store shelves behind her.", 4, [t(`${S}/nova-ticket-shop.webp`)]),
        shot("s7", "Medium on Nova", "She looks to the counter. Nine is watching her.", ["nova", "nine"], "aisles", "Nova turns toward the counter with the case in her hands; Nine stands behind the register, half in shadow.", 4, [t(`${S}/nova-vr-case.webp`)]),
      ],
    },
    {
      id: "c3",
      heading: "EXT. PARKING LOT - NIGHT",
      shots: [
        shot("s8", "Wide", "Rain sheets across the empty lot. Nova runs for the tree.", ["nova"], "lot", "Wide on a flooded parking lot at night in heavy rain, the store lit behind, a lone tree at right, a small figure running.", 6, [rain, rainRun], [rainRun, rain]),
        shot("s9", "Wide on Nova", "Nova sits against the tree, out of the rain.", ["nova"], "lot", "Nova sits on the grass against a tree trunk at night, rain falling past the leaves, the ticket in her hand.", 5, [t(`${A}/catalyst.webp`, `${A}/catalyst.mp4`)]),
        shot("s10", "Medium on Nova", "She turns the ticket over in her fingers.", ["nova"], "lot", "Medium on Nova under the tree, wet hair, turning the gold ticket in her fingers, dark leaves and rain behind.", 4, [t(`${S}/nova-under-tree.webp`)]),
        shot("s11", "Close on ticket", "She scans the code. The ticket flares white.", ["nova"], "lot", "Close on the ticket's QR code lit by a phone screen, the foil flaring white from the centre.", 3, [ticket]),
      ],
    },
  ];
}

/** The shot that fails the first time a new anime is generated. */
export const FAILS_ONCE = "s11";

export type Passage = { id: string; kind: "heading" | "camera" | "action" | "character" | "dialogue"; text: string; n?: number };

/** The screenplay shown after processing: Catalyst, written out from its shot list. */
export function screenplayOf(scenes: Scene[]): Passage[] {
  return scenes.flatMap((sc, i) => [
    { id: `h-${sc.id}`, kind: "heading" as const, n: i + 1, text: sc.heading },
    ...sc.shots.flatMap((s) => [
      { id: `c-${s.id}`, kind: "camera" as const, text: s.label.toUpperCase() },
      { id: `a-${s.id}`, kind: "action" as const, text: s.action },
    ]),
  ]);
}

/** A scene list with every shot not made yet, for a new anime to fill in. */
export const unmade = (scenes: Scene[]): Scene[] =>
  scenes.map((sc) => ({ ...sc, shots: sc.shots.map((s) => ({ ...s, next: s.takes.length ? s.takes : s.next, takes: [], take: 0, status: "empty" as const, review: undefined })) }));

/** A long canvas built from the stills on hand, to show the board holding up at size. */
function longScenes(): Scene[] {
  const pool: Take[] = [
    t(`${S}/storefront-dusk.webp`),
    t(`${A}/catalyst-hero.webp`),
    shop,
    shopClose,
    ticket,
    t(`${S}/nova-ticket-shop.webp`),
    t(`${S}/nova-vr-case.webp`),
    rain,
    rainRun,
    t(`${A}/catalyst.webp`, `${A}/catalyst.mp4`),
    t(`${S}/nova-under-tree.webp`),
    t(`${M}/catalyst-aisle.webp`, `${M}/catalyst-aisle.mp4`),
    t(`${M}/catalyst-card.webp`, `${M}/catalyst-card.mp4`),
    t(`${M}/catalyst-night.webp`, `${M}/catalyst-night.mp4`),
    t(`${D}/cloud-dance.webp`, `${D}/cloud-dance.mp4`),
    t(`${D}/indoor-dance.webp`, `${D}/indoor-dance.mp4`),
    t(`${D}/underwater-dance.webp`, `${D}/underwater-dance.mp4`),
    t(`${P}/cathedral-ruins.webp`),
    t(`${P}/market-overlook.webp`),
    t(`${P}/oasis.webp`),
  ];
  const heads = ["EXT. SOLERA PRIME - DAWN", "EXT. MARKET OVERLOOK - DAY", "INT. GUILD HALL - DAY", "EXT. CATHEDRAL RUINS - DUSK", "EXT. CANYON OASIS - NIGHT", "EXT. ABOVE THE CLOUDS - NIGHT", "INT. RESTART - NIGHT"];
  const labels = ["Wide", "Medium on Nova", "Close on Nova", "Insert", "Over the shoulder", "Wide on Nine"];
  const placeIds: PlaceId[] = ["market-overlook", "market-overlook", "aisles", "cathedral-ruins", "oasis", "oasis", "aisles"];
  const counts = [6, 7, 5, 8, 6, 5, 6];
  let n = 0;
  return heads.map((heading, i) => ({
    id: `l${i + 1}`,
    heading,
    shots: Array.from({ length: counts[i] }, () => {
      const take = pool[n % pool.length];
      const label = labels[n % labels.length];
      n++;
      const where = heading.toLowerCase().replace(/^(ext|int)\. /, "");
      return shot(`l-s${n}`, label, "", label.includes("Nine") ? ["nine"] : label.includes("Nova") ? ["nova"] : [], placeIds[i], `${label}, ${where}.`, 3 + (n % 4), [take]);
    }),
  }));
}

function catalystTwo(): Scene[] {
  return [
    {
      id: "d1",
      heading: "INT. NOVA'S ROOM - NIGHT",
      shots: [
        shot("e2-1", "Medium on Nova", "Nova at her desk, headphones on, the ticket beside the keyboard.", ["nova"], "aisles", "Nova at a desk in a dark bedroom, headphones on, the monitor the only light, the gold ticket by the keyboard.", 5, [t(`${M}/catalyst-night.webp`, `${M}/catalyst-night.mp4`)]),
        shot("e2-2", "Close on Nova", "She looks down at the ticket in the screen light.", ["nova"], "aisles", "Close on Nova in a grey hoodie looking down, monitor light on her face, shelves behind.", 3, [t(`${M}/catalyst-card.webp`, `${M}/catalyst-card.mp4`)]),
      ],
    },
    {
      id: "d2",
      heading: "INT. RESTART - DAY",
      shots: [shot("e2-3", "Wide", "Nova walks back down the aisle to the counter.", ["nova"], "aisles", "Wide down the store aisle from behind, Nova in a grey hoodie walking toward the counter, glass cases either side.", 5, [t(`${M}/catalyst-aisle.webp`, `${M}/catalyst-aisle.mp4`)])],
    },
    {
      id: "d3",
      heading: "EXT. PARKING LOT - NIGHT",
      shots: [
        shot("e2-4", "Wide", "Rain again. The tree stands alone in the lot.", [], "lot", "Wide on the lot in rain, the lone tree lit from the store windows.", 4, [t(`${M}/catalyst-rain.webp`, `${M}/catalyst-rain.mp4`)]),
        shot("e2-5", "Wide on Nova", "Nova under the tree, the ticket glowing in her hand.", ["nova"], "lot", "Nova under the tree at night, the ticket glowing in her hand, rain past the leaves.", 5, [t(`${M}/catalyst-tree.webp`, `${M}/catalyst-tree.mp4`)]),
      ],
    },
  ];
}

function backToMe(): Scene[] {
  return [
    {
      id: "b1",
      heading: "INT. DANCE STUDIO - DAY",
      shots: [shot("b-1", "Wide", "Two dancers mirror each other across the studio floor.", ["ya", "nine"], "aisles", "Wide on a sunlit dance studio, two girls dancing in step, window light in squares on the floor.", 5, [t(`${D}/indoor-dance.webp`, `${D}/indoor-dance.mp4`)])],
    },
    {
      id: "b2",
      heading: "EXT. ABOVE THE CLOUDS - DAY",
      shots: [
        shot("b-2", "Medium two-shot", "They spin together above the clouds.", ["ya", "nine"], "oasis", "Two girls spinning hand in hand above a sea of clouds, hair streaming, clear sky.", 4, [t(`${D}/cloud-dance.webp`, `${D}/cloud-dance.mp4`)]),
        shot("b-3", "Wide", "Underwater, they reach for each other in the light.", ["ya", "nine"], "oasis", "Underwater, two girls reach for each other's hands, shafts of light from the surface.", 5, [t(`${D}/underwater-dance.webp`, `${D}/underwater-dance.mp4`)]),
      ],
    },
  ];
}

export function initialCanvases(): Canvas[] {
  return [
    { id: "catalyst", name: "Catalyst", cover: `${A}/catalyst.webp`, style: "solera-anime", cast: catalystCast(), episodes: [{ scenes: catalystScenes() }, { scenes: catalystTwo() }] },
    { id: "back-to-me", name: "Back to Me", cover: `${D}/cloud-dance.webp`, style: "solera-anime", cast: castOf(["ya", "nine", "aisles", "oasis"]), episodes: [{ scenes: backToMe() }] },
    { id: "echoes-of-solera", name: "Echoes of Solera", cover: `${A}/hero-bg.webp`, style: "solera-anime", cast: libraryCast(), episodes: [{ scenes: longScenes() }] },
  ];
}

export const statusWord: Record<ShotStatus, string> = { ready: "Ready", generating: "Generating", empty: "Not made", failed: "Failed" };
export const reviewWord: Record<Review, string> = { approved: "Approved", denied: "Denied" };
export const allShots = (e: Episode) => e.scenes.flatMap((s) => s.shots);

/* ---------- A typed script, read into scenes and shots ---------- */

/** Stills a new anime's shots are filled from, in turn. */
const fillPool: Take[] = [
  t(`${S}/storefront-dusk.webp`),
  t(`${A}/catalyst-hero.webp`),
  shop,
  shopClose,
  ticket,
  t(`${S}/nova-ticket-shop.webp`),
  t(`${S}/nova-vr-case.webp`),
  rain,
  t(`${A}/catalyst.webp`, `${A}/catalyst.mp4`),
  t(`${S}/nova-under-tree.webp`),
  t(`${M}/catalyst-aisle.webp`, `${M}/catalyst-aisle.mp4`),
  t(`${M}/catalyst-night.webp`, `${M}/catalyst-night.mp4`),
];

const HEADING = /^(INT|EXT|INT\.?\/EXT|I\/E)[.\s]/i;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x";
const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s-])([a-z])/g, (m) => m.toUpperCase());
const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
/** "EXT. HARBOUR WALL - NIGHT" is at "HARBOUR WALL". */
const locationOf = (heading: string) => heading.replace(HEADING, "").replace(/^[.\s]+/, "").replace(/\s+-\s+[^-]*$/, "").trim();
const cueName = (line: string) => line.replace(/\(.*?\)/g, "").trim();
const isCue = (line: string) => {
  const name = cueName(line);
  return name.length > 0 && name.length <= 28 && /[A-Z]/.test(name) && name === name.toUpperCase() && !HEADING.test(line) && !/[.!?,:;]$/.test(name);
};
const mentions = (text: string, name: string) => new RegExp(`\\b${name.replace(/[^\w ]/g, "")}\\b`, "i").test(text);

/** Words in a scene heading that point at a place the library already has. */
const placeWords: [RegExp, PlaceId][] = [
  [/aisle|counter/i, "aisles"],
  [/storefront|restart|game store|game shop/i, "storefront"],
  [/parking|\blot\b/i, "lot"],
  [/cathedral|ruins/i, "cathedral-ruins"],
  [/market|overlook/i, "market-overlook"],
  [/oasis|canyon/i, "oasis"],
];

export type Parsed = { title: string; scenes: Scene[]; passages: Passage[]; cast: CastItem[] };

/**
 * Reads a script the simple way: a line starting INT. or EXT. opens a scene; a short line in capitals is a
 * character, and the line after it is what they say; anything else is action. Each action or speech is one shot.
 */
export function parseScript(text: string): Parsed {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim());
  const lib = libraryCast();
  const cast: CastItem[] = [];
  const addCast = (c: CastItem) => {
    if (!cast.some((x) => x.id === c.id)) cast.push(c);
  };
  const passages: Passage[] = [];
  const scenes: Scene[] = [];
  let scene: Scene | null = null;
  let n = 0;
  let action: string[] = [];

  const placeFor = (heading: string): PlaceId => {
    const where = locationOf(heading);
    const known = placeWords.find(([re]) => re.test(where));
    const item: CastItem = known ? lib.find((c) => c.id === known[1])! : { id: `place-${slug(where)}`, kind: "place", name: sentence(where) || "Somewhere" };
    addCast(item);
    return item.id;
  };
  const castIn = (body: string, speaker?: string) => {
    for (const c of lib) if (c.kind === "char" && mentions(body, c.name)) addCast(c);
    return cast.filter((c) => c.kind === "char" && (mentions(body, c.name) || c.name.toUpperCase() === speaker)).map((c) => c.id);
  };
  const open = (heading: string) => {
    const sc: Scene = { id: `ps${scenes.length + 1}`, heading, shots: [] };
    scenes.push(sc);
    scene = sc;
    passages.push({ id: `p-${passages.length}`, kind: "heading", n: scenes.length, text: heading });
    return sc;
  };
  const addShot = (body: string, who: string[]) => {
    const sc: Scene = scene ?? open("SCENE 1");
    const place = sc.shots[0]?.place ?? placeFor(sc.heading);
    n++;
    const art = fillPool[(n - 1) % fillPool.length];
    sc.shots.push({ id: `p${n}`, label: `Shot ${n}`, action: body, cast: who, place, prompt: body, seconds: 4, takes: [], take: 0, status: "empty", next: [art] });
  };
  const flush = () => {
    if (!action.length) return;
    const body = action.join(" ");
    passages.push({ id: `p-${passages.length}`, kind: "action", text: body });
    addShot(body, castIn(body));
    action = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      flush();
      continue;
    }
    if (HEADING.test(line)) {
      flush();
      open(line.toUpperCase());
      continue;
    }
    const said = lines[i + 1];
    if (isCue(line) && said && !HEADING.test(said) && !isCue(said)) {
      flush();
      const name = cueName(line);
      const known = lib.find((c) => c.kind === "char" && c.name.toUpperCase() === name);
      addCast(known ?? { id: `char-${slug(name)}`, kind: "char", name: titleCase(name) });
      passages.push({ id: `p-${passages.length}`, kind: "character", text: name });
      passages.push({ id: `p-${passages.length}`, kind: "dialogue", text: said });
      addShot(`${titleCase(name)}: ${said}`, castIn(said, name));
      i++;
      continue;
    }
    action.push(line);
  }
  flush();
  for (const sc of scenes) if (!sc.shots.length) placeFor(sc.heading);

  const first = scenes.find((s) => HEADING.test(s.heading));
  const title = first ? sentence(locationOf(first.heading)) : (lines.find(Boolean) ?? "").slice(0, 48);
  return { title, scenes, passages, cast: [...cast.filter((c) => c.kind === "char"), ...cast.filter((c) => c.kind === "place")] };
}

/** Reads the text out of a Final Draft file: its paragraphs, one per line, a blank line between. */
export function fdxText(xml: string): string {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(doc.querySelectorAll("Paragraph"))
    .map((p) => {
      const type = p.getAttribute("Type") ?? "";
      const body = Array.from(p.querySelectorAll("Text")).map((x) => x.textContent ?? "").join("").trim();
      if (!body) return "";
      return type === "Character" ? body.toUpperCase() : type === "Dialogue" ? body : `${body}\n`;
    })
    .join("\n");
}
