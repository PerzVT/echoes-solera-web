import type { WatchItem } from "@/components/labs/WatchView";

const L = "/labs/cooking";

export type Release = WatchItem & { chef: string; dish: string };

const ep = (number: number, slug: string, title: string, chef: string, seconds = 30): Release => ({
  number,
  title,
  chef,
  seconds,
  video: `${L}/episodes/${slug}.mp4`,
  poster: `${L}/stills/${slug}.webp`,
  dish: `${L}/dishes/${slug}.webp`,
});

export const supper = {
  title: "Shoujo Supper",
  kind: "Cooking show",
  hook: "Short recipe videos. One chef, one dish, under a minute.",
  art: `${L}/hero-akane.webp`,
  cover: `${L}/stills/masala-dosa.webp`,
  chefs: ["Akane", "Aoba", "Hisui", "Kaede", "Kohaku", "Kuroha", "Shion", "Sumika", "Yukiha"].map((name) => ({
    name,
    src: `${L}/chefs/${name.toLowerCase()}.webp`,
  })),
};

export const releases: Release[] = [
  ep(1, "mushroom-stroganoff", "Mushroom stroganoff", "Akane", 25),
  ep(2, "apple-crisp", "Apple crisp", "Sumika"),
  ep(3, "margherita-pizza", "Margherita pizza", "Kohaku"),
  ep(4, "masala-dosa", "Masala dosa", "Hisui"),
  ep(5, "kayseri-manti", "Kayseri manti", "Sumika"),
  ep(6, "cobb-salad", "Cobb salad", "Aoba"),
  ep(7, "gambas-al-ajillo", "Gambas al ajillo", "Shion", 25),
  ep(8, "oyakodon", "Oyakodon", "Yukiha"),
  ep(9, "gamjajeon", "Gamjajeon", "Kuroha"),
  ep(10, "kacchi-biryani", "Kacchi biryani", "Akane"),
  ep(11, "cheesy-stuffed-shells", "Cheesy stuffed shells", "Aoba"),
  ep(12, "mercimek-koftesi", "Mercimek koftesi", "Hisui", 25),
  ep(13, "lemon-ricotta-pancakes", "Lemon ricotta pancakes", "Kohaku"),
];
