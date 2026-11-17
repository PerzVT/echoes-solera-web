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
  {
    slug: "echoes-of-solera-puzzle",
    name: "Echoes of Solera jigsaw puzzle",
    world: "Echoes of Solera",
    description: "A jigsaw puzzle of Nova on the steps at sunset, from her card. The box lid shows the finished picture.",
    image: { src: `${L}/puzzle-echoes-of-solera.webp`, width: 1254, height: 1254, alt: "Part-built puzzle of Nova at sunset with loose pieces and the box lid" },
  },
  {
    slug: "tidebell-cove-puzzle",
    name: "Tidebell Cove jigsaw puzzle",
    world: "Tidebell Cove",
    description: "A jigsaw puzzle of the cove: the pier, the lighthouse and the fishing club hut. The box lid shows the finished picture.",
    image: { src: `${L}/puzzle-tidebell-cove-box.webp`, width: 1536, height: 1024, alt: "Nearly finished puzzle of Tidebell Cove in front of its box, with loose pieces and shells" },
  },
  {
    slug: "illustrated-collection-packs",
    name: "Illustrated collection card packs",
    world: "Nine Lives cards",
    description: "Foil packs in deep green with gold botanical line work. Each tears open at the top to a small stack of art cards.",
    image: { src: `${L}/card-packs.webp`, width: 1254, height: 1254, alt: "Two green foil card packs, one torn open with cards showing" },
  },
  {
    slug: "fomo-lamp-and-hug-pillow",
    name: "FOMO lamp and hug pillow",
    world: "Tidebell Cove",
    description:
      "A FOMO night light whose body glows warm, and a long plush FOMO to hug. Both wear the yellow knit hat and the vest with three hearts.",
    image: { src: `${L}/fomo-lamp-pillow.webp`, width: 1536, height: 1024, alt: "Glowing duck night light on a bedside table beside a long duck hug pillow on the bed" },
    focus: "30% 50%",
  },
  {
    slug: "fomo-bag-charms",
    name: "FOMO bag charms",
    world: "Tidebell Cove",
    description: "Small plush FOMOs in the knit hat and heart vest, each with a brass clasp to hang on a bag.",
    image: { src: `${L}/fomo-bag-charms.webp`, width: 1536, height: 1024, alt: "Duck plush charm clipped to a canvas tote, with a second charm standing beside it" },
  },
  {
    slug: "nova-and-nine-figures",
    name: "Nova and Nine figures",
    world: "Echoes of Solera",
    description: "Painted figures of Nova and Nine in their current outfits, each standing on a round stone base.",
    image: { src: `${L}/nova-nine-figures.webp`, width: 1536, height: 1024, alt: "Painted figures of Nova in her cream coat and Nine in his blue scarf on stone bases" },
  },
  {
    slug: "moonflower-book-nook",
    name: "Moonflower book nook",
    world: "The Scent of the Moonflower",
    description: "A small palace garden in a wooden case that stands between books, with lattice screens, moonflowers and lit lanterns.",
    image: { src: `${L}/moonflower-book-nook.webp`, width: 1536, height: 1024, alt: "Wooden book nook of a lantern-lit palace garden standing between books on a shelf" },
  },
  {
    slug: "aoba-tableware",
    name: "Aoba tableware",
    world: "Shoujo Supper",
    description: "A cream noodle bowl with green sprigs, a cup with a portrait of Aoba, and a leaf-shaped chopstick rest.",
    image: { src: `${L}/aoba-tableware.webp`, width: 1536, height: 1024, alt: "Cream noodle bowl, a cup with a portrait of Aoba, and chopsticks on a leaf rest" },
  },
  {
    slug: "studio-cap",
    name: "Studio cap",
    world: "Nine Lives",
    description: "A washed cotton cap with the Nine Lives mark embroidered on the front and an adjustable strap at the back.",
    image: { src: `${L}/studio-cap.webp`, width: 1254, height: 1254, alt: "Washed cap with the Nine Lives mark embroidered on the front" },
    gallery: { src: `${L}/gallery-studio-cap.webp`, alt: "The cap from the back and the embroidery close up" },
  },
  {
    slug: "studio-tee",
    name: "Studio jersey tee",
    world: "Nine Lives",
    description: "A heavy jersey tee with the Nine Lives mark on the chest and side slits at the hem.",
    image: { src: `${L}/studio-tee.webp`, width: 1254, height: 1254, alt: "Jersey tee with the Nine Lives mark on the chest" },
    gallery: { src: `${L}/gallery-studio-tee.webp`, alt: "The tee from the back and the side slit close up" },
  },
  {
    slug: "studio-hoodie",
    name: "Studio hoodie",
    world: "Nine Lives",
    description: "A heavyweight pullover hoodie with the Nine Lives mark.",
    image: { src: `${L}/studio-hoodie.webp`, width: 1254, height: 1254, alt: "Pullover hoodie with the Nine Lives mark" },
    gallery: { src: `${L}/gallery-studio-hoodie.webp`, alt: "The hoodie from the back and a detail close up" },
  },
  {
    slug: "fomo-pocket-tee",
    name: "FOMO pocket tee",
    world: "Tidebell Cove",
    description: "A tee with FOMO peeking out of the chest pocket.",
    image: { src: `${L}/fomo-pocket-tee.webp`, width: 1536, height: 1024, alt: "Tee with a small duck looking out of the chest pocket" },
    gallery: { src: `${L}/gallery-fomo-pocket-tee.webp`, alt: "The tee from the back and the pocket close up" },
  },
  {
    slug: "aoba-body-pillow",
    name: "Aoba body pillow",
    world: "Shoujo Supper",
    description: "A two-sided body pillow of Aoba, with a different pose on each side.",
    image: { src: `${L}/aoba-body-pillow.webp`, width: 1536, height: 1024, alt: "Body pillow of Aoba shown from both sides" },
    gallery: { src: `${L}/gallery-aoba-body-pillow.webp`, alt: "The front and reverse artwork" },
  },
  {
    slug: "sumika-body-pillow",
    name: "Sumika body pillow",
    world: "Shoujo Supper",
    description: "A two-sided body pillow of Sumika, with a different pose on each side.",
    image: { src: `${L}/sumika-body-pillow.webp`, width: 1536, height: 1024, alt: "Body pillow of Sumika shown from both sides" },
    gallery: { src: `${L}/gallery-sumika-body-pillow.webp`, alt: "The front and reverse artwork" },
  },
  {
    slug: "solera-travel-overshirt",
    name: "Solera travel overshirt",
    world: "Echoes of Solera",
    description: "A light overshirt cut for travel, with details drawn from Solera.",
    image: { src: `${L}/solera-travel-overshirt.webp`, width: 1536, height: 1024, alt: "Travel overshirt from the front" },
    gallery: { src: `${L}/gallery-solera-travel-overshirt.webp`, alt: "The overshirt from the back and a construction detail" },
  },
  {
    slug: "aoba-botanical-knit",
    name: "Aoba botanical knit",
    world: "Shoujo Supper",
    description: "A knit sweater embroidered with the herbs and leaves from Aoba's kitchen.",
    image: { src: `${L}/aoba-botanical-knit.webp`, width: 1536, height: 1024, alt: "Knit sweater with botanical embroidery" },
    gallery: { src: `${L}/gallery-aoba-botanical-knit.webp`, alt: "The knit from the back and the embroidery close up" },
  },
  {
    slug: "catalyst-sampler",
    name: "Catalyst sampler",
    world: "Echoes of Solera",
    description: "A printed sampler of Book One: Catalyst.",
    image: { src: `${L}/catalyst-sampler.webp`, width: 1536, height: 1024, alt: "Printed Catalyst sampler" },
    gallery: { src: `${L}/gallery-catalyst-sampler.webp`, alt: "The sampler open" },
  },
  {
    slug: "moonflower-art-print",
    name: "Moonflower palace garden print",
    world: "The Scent of the Moonflower",
    description: "An art print of the palace garden at dusk.",
    image: { src: `${L}/moonflower-art-print.webp`, width: 1536, height: 1024, alt: "Art print of a palace garden at dusk" },
    gallery: { src: `${L}/gallery-moonflower-art-print.webp`, alt: "The paper and print close up" },
  },
  {
    slug: "wallpaper-solera-oasis",
    name: "Solera: Oasis Crossing",
    world: "Echoes of Solera",
    description: "A wallpaper of the oasis crossing.",
    image: { src: `${L}/wallpaper-solera-oasis.webp`, width: 1600, height: 900, alt: "Painted view of an oasis crossing in Solera" },
  },
  {
    slug: "wallpaper-shoujo-supper",
    name: "Shoujo Supper: Dumpling Afternoon",
    world: "Shoujo Supper",
    description: "A wallpaper of an afternoon making dumplings.",
    image: { src: `${L}/wallpaper-shoujo-supper.webp`, width: 1600, height: 900, alt: "Illustration of an afternoon making dumplings" },
  },
  {
    slug: "wallpaper-tidebell-cove",
    name: "Tidebell Cove: A Quiet Cast",
    world: "Tidebell Cove",
    description: "A wallpaper of the pier at Tidebell Cove.",
    image: { src: `${L}/wallpaper-tidebell-cove.webp`, width: 1600, height: 900, alt: "A quiet cast from the pier at Tidebell Cove" },
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);

export const sameWorld = (p: Product) => products.filter((o) => o.world === p.world && o.slug !== p.slug);

export const gallerySize = sheet;
