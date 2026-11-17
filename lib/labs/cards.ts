const L = "/labs/cards/art";

/** `lead` is the card art printed on the set's pack. */
export type CardSet = { slug: string; name: string; tint: string; lead: string };
export type CardFace = { id: string; name: string; set: string; art: string };

export const sets: CardSet[] = [
  { slug: "solera", name: "Echoes of Solera", tint: "#1f4a4f", lead: `${L}/nova-sunset.webp` },
  { slug: "tidebell", name: "Tidebell Cove", tint: "#2d5f86", lead: `${L}/fomo-heart-knit.webp` },
  { slug: "shoujo", name: "Shoujo Supper", tint: "#7a4a2c", lead: `${L}/akane-tartlets.webp` },
];

const card = (id: string, name: string, set: string): CardFace => ({ id, name, set, art: `${L}/${id}.webp` });

/** Concept cards. No rarity, odds or game values exist for them. */
export const cards: CardFace[] = [
  card("nova-sunset", "Nova, sunset", "solera"),
  card("nine-moonlight", "Nine, moonlight", "solera"),
  card("ya-garden", "YA, garden", "solera"),
  card("oren-pond", "Or-en, pond", "solera"),
  card("fomo-heart-knit", "FOMO, heart knit", "tidebell"),
  card("fomo-dinosaur", "FOMO, dinosaur", "tidebell"),
  card("fomo-shark", "FOMO, shark", "tidebell"),
  card("fomo-star-wizard", "FOMO, star wizard", "tidebell"),
  card("akane-tartlets", "Akane, tartlets", "shoujo"),
  card("hisui-tea", "Hisui, tea", "shoujo"),
  card("kohaku-bakery", "Kohaku, bakery", "shoujo"),
  card("yukiha-shaved-ice", "Yukiha, shaved ice", "shoujo"),
];

export const setBySlug = (slug: string) => sets.find((s) => s.slug === slug)!;
export const cardsIn = (set: string) => cards.filter((c) => c.set === set);

/** "No. 001": the card's position in its set, the only number a card has. */
export const cardNo = (c: CardFace) => `No. ${String(cardsIn(c.set).indexOf(c) + 1).padStart(3, "0")}`;
