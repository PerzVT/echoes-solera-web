const L = "/labs/shop";

export type Product = {
  slug: string;
  name: string;
  world: string;
  description: string;
  image: { src: string; width: number; height: number; alt: string };
  /** Where the square grid crop sits on wide images. */
  focus?: string;
  /** A sheet of six views, where one exists. */
  gallery?: { src: string; alt: string };
};

const sheet = { width: 1536, height: 1024 };

export const products: Product[] = [
  {
    slug: "fomo-duck-backpack",
    name: "FOMO duck backpack",
    world: "Tidebell Cove",
    description:
      "A cream duck backpack with a curly, fleecy finish and orange feet. The head zips open, each wing is a small zip pouch, and the straps adjust.",
    image: { src: `${L}/fomo-backpack.webp`, width: 1254, height: 1254, alt: "Cream duck backpack with orange feet and two wing pouches" },
    gallery: { src: `${L}/gallery-fomo-backpack.webp`, alt: "The backpack from the front, side and back, open, a wing pouch close up, and worn" },
  },
  {
    slug: "fomo-plush-wardrobe",
    name: "FOMO plush with wardrobe",
    world: "Tidebell Cove",
    description:
      "A cream duck plush with six outfits on a wooden rail: a knit hat and vest, a bathrobe, a frog hood, a bear hood with overalls, a wizard hood and cape, and a shark hood with a vest.",
    image: { src: `${L}/fomo-plush-wardrobe.webp`, width: 1400, height: 788, alt: "Duck plush beside a wooden rail of six small outfits" },
    focus: "0% 50%",
    gallery: { src: `${L}/gallery-fomo-plush.webp`, alt: "The plush from the front, side and back, its face close up, held in a knit outfit, and boxed with its outfits" },
  },
  {
    slug: "fomo-blind-box",
    name: "FOMO blind box",
    world: "Tidebell Cove",
    description:
      "Six small duck figures, each in a different outfit. Each box holds one, and you see which only when you open it.",
    image: { src: `${L}/fomo-blind-box.webp`, width: 1400, height: 788, alt: "Six duck figures in outfits in front of a Tidebell Cove Series 01 box" },
    focus: "42% 50%",
    gallery: { src: `${L}/gallery-fomo-blind-box.webp`, alt: "The knit hat figure from the front, side and back, close up, in a hand, and beside its box" },
  },
  {
    slug: "fomo-capsules",
    name: "FOMO capsules",
    world: "Tidebell Cove",
    description:
      "Round capsules in yellow, green, pink and purple, each wrapped in a FOMO Series 01 band. Each opens to a duck figure and a fold-out card of all six.",
    image: { src: `${L}/fomo-capsules.webp`, width: 1254, height: 1254, alt: "Four pastel capsules, one open with a wizard duck figure inside" },
    gallery: { src: `${L}/gallery-fomo-capsule.webp`, alt: "A purple capsule closed, open, the wizard figure front and back, the capsule in a hand, and on a desk" },
  },
  {
    slug: "chef-aprons",
    name: "Chef aprons",
    world: "Shoujo Supper",
    description:
      "Three cross-back aprons with two front pockets and a tie at the waist. One has rust trim and a small bell, one green trim and stitched sprigs, and one is lavender with a stitched moon.",
    image: { src: `${L}/chef-aprons.webp`, width: 1254, height: 1254, alt: "Three aprons on hangers in rust, green and lavender trims" },
    gallery: { src: `${L}/gallery-botanical-apron.webp`, alt: "The green apron front and back, laid flat, its stitching close up, worn in a kitchen, and boxed" },
  },
  {
    slug: "moonflower-charm",
    name: "Moonflower charm",
    world: "The Scent of the Moonflower",
    description:
      "A bag charm with a carved pale green disc of a moonflower, knotted cords and a long lilac tassel. A small stitched pouch hangs beside it, and it clips on with a brass clasp.",
    image: { src: `${L}/moonflower-charm.webp`, width: 1254, height: 1254, alt: "Charm with a carved green moonflower disc, lilac tassel and small pouch beside a box" },
    gallery: { src: `${L}/gallery-moonflower-pendant.webp`, alt: "The charm from the front and back, the carved disc and tassel close up, on a tote bag, and boxed" },
  },
  {
    slug: "illustrated-card-binder",
    name: "Illustrated card binder",
    world: "Echoes of Solera",
    description:
      "A zip binder for Echoes of Solera art cards, with clear pockets nine to a page. The cover carries a portrait of Nova.",
    image: { src: `${L}/illustrated-binder.webp`, width: 1400, height: 933, alt: "Open zip binder holding illustrated cards of Nova and Nine" },
    focus: "62% 50%",
  },
  {
    slug: "solera-crystal-charm",
    name: "Solera crystal bag charm",
    world: "Echoes of Solera",
    description: "A blue crystal on a brass cap, hung from a brown strap loop that fastens around a bag handle.",
    image: { src: `${L}/solera-crystal-charm.webp`, width: 482, height: 482, alt: "Blue crystal charm on a brass cap and brown loop" },
    gallery: { src: `${L}/gallery-solera-crystal-charm.webp`, alt: "The charm from three angles, the cap close up, on a tote bag, and boxed" },
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);

export const sameWorld = (p: Product) => products.filter((o) => o.world === p.world && o.slug !== p.slug);

export const gallerySize = sheet;
