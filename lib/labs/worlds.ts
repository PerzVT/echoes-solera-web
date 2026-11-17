const W = "/labs/worlds";

export type WorldImage = { src: string; alt: string; caption: string; width: number; height: number };

/** Tidebell Cove. Captures come from an earlier build; plates and cutouts are concept art. */
export const tidebell = {
  title: "Tidebell Cove",
  heroPlate: `${W}/pier.webp`,
  heroCast: [
    { src: `${W}/cast/fomo-heart-knit.webp`, alt: "FOMO in a knitted hat and heart jumper" },
    { src: `${W}/cast/fomo-dinosaur.webp`, alt: "FOMO in a dinosaur hood and vest" },
  ],
  captures: [
    {
      src: `${W}/capture-beach-arrival.webp`,
      alt: "Ducks on the beach by the pier, with the fishing club behind them",
      caption: "Arriving on the beach",
      width: 1250,
      height: 703,
    },
    {
      src: `${W}/capture-pip-print-counter.webp`,
      alt: "FOMO on the porch facing Pip at the print counter",
      caption: "Pip at the print counter",
      width: 1250,
      height: 703,
    },
  ] satisfies WorldImage[],
  outfits: {
    src: `${W}/six-outfit-study-alpha.webp`,
    alt: "Six outfits: a heart knit with a hat, a bathrobe and towel, a dinosaur hood, a bear hood with overalls, a wizard cape, and a shark hood with a backpack",
    caption: "Six-outfit study",
    width: 1536,
    height: 1024,
    /** The sheet is a 3 x 2 grid; two outfits also exist drawn on FOMO. */
    items: [
      { name: "Heart knit", col: 0, row: 0, worn: `${W}/cast/fomo-heart-knit.webp` },
      { name: "Bathrobe and towel", col: 1, row: 0 },
      { name: "Dinosaur hood", col: 2, row: 0, worn: `${W}/cast/fomo-dinosaur.webp` },
      { name: "Bear hood and overalls", col: 0, row: 1 },
      { name: "Star wizard cape", col: 1, row: 1 },
      { name: "Shark hood and backpack", col: 2, row: 1 },
    ],
  },
  residents: [
    { src: `${W}/cast/nursery-keeper.webp`, role: "Nursery keeper", alt: "A yellow duck in a cap and red scarf, waving" },
    { src: `${W}/cast/pip-printmaker.webp`, role: "Pip, the printmaker", alt: "Pip, a yellow duck in a beret and scarf, holding an ink roller" },
  ],
  places: [
    { src: `${W}/beach.webp`, caption: "Beach" },
    { src: `${W}/print-porch.webp`, caption: "Print porch" },
    { src: `${W}/rock-arch.webp`, caption: "Rock arch" },
  ],
};
