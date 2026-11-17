/**
 * The character sheets each series in the creator starts with, from the approved character pages in the Notion
 * "Story Cast & Assets" source, grouped by series and then by character in the page's own order.
 *
 * Each sheet is [file, tag, variant]. `file` is a name under /labs/app/cast/<series>/ (.webp), or a full path when the
 * sheet was already in the repo. `tag` is the element ID written above the sheet in Notion, kept as written. Where the
 * Notion page shows a sheet with no tag, the tag here follows the character's other tags and the sheet carries `made`.
 * `variant` is the episode or outfit label from the page; a character with a single sheet has none.
 */
import type { SeriesCast } from "./maker";

type Entry = [file: string, tag: string, variant?: string, made?: "made"];
type Character = { id: string; name: string; sheets: Entry[] };

const OLD = "/labs/app/sheets";
const SC = "/labs/mini-series/second-chance/cast";

const secondChance: Character[] = [
  {
    id: "chloe",
    name: "Chloe Hayes",
    sheets: [
      [`${OLD}/chloe_ep01`, "@chloe_ep01", "Episode 1"],
      ["chloe_ep03", "@chloe_ep03", "Episodes 3 and 3.5"],
      [`${OLD}/chloe_ep04_5`, "@chloe_ep04_5", "Episode 4"],
      [`${OLD}/chloe_ep06`, "@chloe_ep06", "Episode 6"],
      ["chloe_ep_7", "@chloe_ep_7", "Episode 7"],
      ["chloe_ep08_9", "@chloe_ep08_9", "Episodes 8 and 9"],
      ["chloe_ep10", "@chloe_ep10", "Episode 10"],
      ["chloe_ep11_12", "@chloe_ep11_12", "Episodes 11 and 12"],
      ["chloe_ep12_13", "@chloe_ep12_13", "Episodes 12 and 13"],
      ["chloe_ep14a", "@chloe_ep14a", "Episode 14, first look"],
      ["chloe_ep14b", "@chloe_ep14b", "Episode 14, second look"],
      ["chloe_ep15", "@chloe_ep15", "Episode 15"],
    ],
  },
  {
    id: "elena",
    name: "Elena Vance",
    sheets: [
      [`${OLD}/elena`, "@elena", "Episode 1"],
      ["elena_van_ep2", "@elena_van_ep2", "Episode 2"],
      ["elena_van_ep2_v2", "@elena_van_ep2_v2", "Episode 2, second version"],
      ["elena_van_ep4_4_5", "@elena_van_ep4_4.5", "Episode 4.5"],
      [`${OLD}/elena_van_ep16`, "@elena_van_ep16", "Episode 16"],
    ],
  },
  {
    id: "julian",
    name: "Julian Montgomery",
    sheets: [
      [`${OLD}/julian`, "@julian", "Episode 1"],
      ["julian_ep04_5_v1", "@julian_ep04_5_v1", "Episode 4"],
      ["julian_ep04_5_v2", "@julian_ep04_5_v2", "Episodes 4 and 5"],
      ["julian_ep4_5", "@julian_ep4.5", "Episode 4.5"],
      [`${OLD}/julian_ep06`, "@julian_ep06", "Episode 6"],
      ["julian_ep07", "@julian_ep07", "Episode 7"],
      ["julian_ep08_9", "@julian_ep08_9", "Episodes 8 and 9"],
      ["julian_ep10", "@julian_ep10", "Episode 10"],
      ["julian_ep11_12", "@julian_ep11_12", "Episodes 11 and 12"],
      ["julian_ep12_13", "@julian_ep12_13", "Episodes 12 and 13"],
      ["julian_ep15a", "@julian_ep15a", "Episode 15, first look"],
      ["julian_ep15b", "@julian_ep15b", "Episode 15, second look"],
      ["julian_ep26", "@julian_ep26", "Episode 26"],
    ],
  },
  { id: "madam-sylas", name: "Madam Sylas", sheets: [[`${SC}/madam-sylas`, "@masylas"]] },
  { id: "marcus-vance", name: "Marcus Vance", sheets: [[`${SC}/marcus-vance`, "@marcus_van", "Episode 10"]] },
];

const moonflower: Character[] = [
  {
    id: "yeon-hee",
    name: "Yeon-hee",
    sheets: [
      ["yeon-hee", "@yeon-hee", "Episodes 1, 3 and 4"],
      ["yeon-hee_ep2", "@yeon-hee_ep2", "Episode 2"],
      ["yeon-hee_ep5", "@yeon-hee_ep5", "Episode 5"],
      ["yeon-hee_ep6_v1", "@yeon-hee_ep6_v1", "Episode 6, robe off the shoulders"],
      ["yeon-hee_ep6_v2", "@yeon-hee_ep6_v2", "Episode 6, robe on the shoulders"],
      ["yeonhee_ep7_8", "@yeonhee_ep7_8", "Episodes 7 and 8"],
      ["yeonhee_ep8_10", "@yeonhee_ep8_10", "Episodes 8 to 10"],
      ["yeon-hee_ep11", "@yeon-hee_ep11", "Episode 11"],
      ["yeon-hee_ep12", "@yeon-hee_ep12", "Episode 12"],
      ["yeon-hee_ep13", "@yeon-hee_ep13", "Episode 13"],
      ["yeon-hee_ep14_16", "@yeon-hee_ep14_16", "Episodes 14 to 16"],
      ["yeon-hee_ep17", "@yeon-hee_ep17", "Episode 17"],
      ["yeon-hee_ep18_22", "@yeon-hee_ep18_22", "Episodes 18 to 22"],
      ["yeon-hee_ep23", "@yeon-hee_ep23", "Episode 23"],
      ["yeon-hee_ep24_25", "@yeon-hee_ep24_25", "Episodes 24 and 25, wedding"],
      ["yeon-hee_16", "@yeon-hee_extra", "Extra", "made"],
    ],
  },
  {
    id: "king-yi-sun",
    name: "King Yi Sun",
    sheets: [
      ["king-yi-sun_1", "@yisun_ep2", "Episode 2, dream outfit", "made"],
      ["king-yi-sun_2", "@yisun_ep3", "Episode 3", "made"],
      ["king-yi-sun_3", "@yisun_ep4", "Episode 4", "made"],
      ["king-yi-sun_4", "@yisun_ep5", "Episode 5", "made"],
      ["yisun_6", "@yisun_6", "Episode 6"],
      ["yisun_ep8_10", "@yisun_ep8_10", "Episodes 8 to 10"],
      ["yisun_ep13", "@yisun_ep13", "Episode 13"],
      ["yisun_ep15_16a", "@yisun_ep15_16a", "Episodes 15 and 16, first look"],
      ["yisun_ep15_16b", "@yisun_ep15_16b", "Episodes 15 and 16, second look"],
      ["yisun_ep15_16c", "@yisun_ep15_16c", "Episodes 15 and 16, third look"],
      ["yisun_ep17", "@yisun_ep17", "Episode 17"],
      ["yisun_ep18_21", "@yisun_ep18_21", "Episodes 18 to 21"],
      ["yisun_ep22", "@yisun_ep22", "Episode 22"],
      ["king-yi-sun_14", "@yisun_ep22b", "Episode 22, second look", "made"],
      ["yisun_ep23", "@yisun_ep23", "Episode 23"],
      ["yisun_ep24_25", "@yisun_ep24_25", "Episodes 24 and 25, wedding"],
    ],
  },
  {
    id: "queen-min",
    name: "Queen Min",
    sheets: [
      ["queenmin_5", "@queenmin_5", "Episode 5"],
      ["queenmin_ep7_8", "@queenmin_ep7_8", "Episodes 7 and 8"],
      ["queenmin_11", "@queenmin_11", "Episode 11"],
      ["queenmin_17", "@queenmin_17", "Episode 17"],
      ["queenmin_18_21", "@queenmin_18_21", "Episodes 18 to 21"],
    ],
  },
  { id: "lord-min", name: "Lord Min", sheets: [["lordmin", "@lordmin"]] },
  { id: "chief-eunuch", name: "Chief Eunuch", sheets: [["chief-eunuch_1", "@chief_eunuch", undefined, "made"]] },
  {
    id: "captain-kang",
    name: "Captain Kang",
    sheets: [
      ["cptkang", "@cptkang"],
      ["cptkang15", "@cptkang15", "Second look"],
    ],
  },
  { id: "guard-a", name: "Guard A", sheets: [["guarda", "@guardA"]] },
  { id: "guard-b", name: "Guard B", sheets: [["guardb", "@guardB"]] },
  { id: "palace-guards", name: "Palace guards", sheets: [["randomguards", "@randomguards", "Group"]] },
  { id: "head-court-lady", name: "Queen Min's head court lady", sheets: [["mincourtlady", "@mincourtlady"]] },
  { id: "lady-in-waiting-1", name: "Lady-in-waiting 1", sheets: [["ladiesinwaiting1", "@ladiesinwaiting1"]] },
  // The spy is drawn on the same Notion file as the first lady-in-waiting, under her own tag.
  { id: "lady-in-waiting-spy", name: "Lady-in-waiting, the spy", sheets: [["ladiesinwaiting1", "@liw_spy"]] },
  { id: "lady-in-waiting-2", name: "Lady-in-waiting 2", sheets: [["ladiesinwaiting2", "@ladiesinwaiting2"]] },
  { id: "lady-in-waiting-3", name: "Lady-in-waiting 3", sheets: [["ladiesinwaiting3", "@ladiesinwaiting3"]] },
  { id: "lady-in-waiting-4", name: "Lady-in-waiting 4", sheets: [["ladiesinwaiting4", "@ladiesinwaiting4"]] },
  { id: "lady-in-waiting-5", name: "Lady-in-waiting 5", sheets: [["ladiesinwaiting5", "@ladiesinwaiting5"]] },
  { id: "maid-choi", name: "Maid Choi", sheets: [["maid-choi_1", "@maid_choi", undefined, "made"]] },
  { id: "junior-maid", name: "Junior maid", sheets: [["yh_maid", "@yh_maid"]] },
  { id: "royal-physician", name: "Head royal physician", sheets: [["royalphysician", "@royalphysician"]] },
  { id: "royal-brewer", name: "Royal brewer", sheets: [["royalbrewer", "@royalbrewer"]] },
  { id: "assassin", name: "The assassin", sheets: [["assassin", "@assassin"]] },
  { id: "bandit-a", name: "Bandit A", sheets: [["bandita", "@banditA"]] },
  { id: "bandit-b", name: "Bandit B", sheets: [["banditb", "@banditB"]] },
  { id: "bandit-c", name: "Bandit C", sheets: [["banditc", "@banditC"]] },
  { id: "bandit-d", name: "Bandit D", sheets: [["banditd", "@banditD"]] },
  { id: "bandit-e", name: "Bandit E", sheets: [["bandite", "@banditE"]] },
];

const grayWinter: Character[] = [
  {
    id: "claire-sindrae",
    name: "Claire Sindrae",
    sheets: [
      ["claire", "@claire", "Episodes 1 to 5"],
      ["claire_sin_ep07_10", "@claire_sin_ep07_10", "Episode 7"],
      ["claire_sin_ep11", "@claire_sin_ep11", "Episode 11"],
      ["claire_sin_ep13a", "@claire_sin_ep13a", "Episode 13, first look"],
      ["claire_sin_ep13b", "@claire_sin_ep13b", "Episode 13, second look"],
      ["claire_sin_ep14", "@claire_sin_ep14", "Episode 14"],
      ["claire_sin_ep15_19", "@claire_sin_ep15_19"],
      ["claire_sin_ep20", "@claire_sin_ep20", "Episode 18"],
    ],
  },
  {
    id: "kalore",
    name: "Kalore",
    sheets: [
      ["/labs/mini-series/gray-winter/cast/kalore", "@kalore", "Episodes 1 to 6"],
      ["kalore_ep07_10", "@kalore_ep07_10", "Episodes 7 to 10"],
      ["kalore_ep7_5", "@kalore_ep7.5", "Episode 7.5"],
      ["kalore_ep08", "@kalore_ep08", "Episode 8"],
      ["kalore_ep10", "@kalore_ep10", "Episode 10"],
      ["kalore_ep11a", "@kalore_ep11a", "Episode 11, first look"],
      ["kalore_ep11b", "@kalore_ep11b", "Episode 11, second look"],
      ["kalore_ep13", "@kalore_ep13", "Episode 13"],
      ["kalore_ep14_19", "@kalore_ep14_19", "Episode 14"],
      ["kalore_ep20", "@kalore_ep20", "Episode 18"],
      ["kalore_ep22", "@kalore_ep22", "Episode 20"],
    ],
  },
  {
    id: "stretched-graygore",
    name: "Stretched Graygore",
    sheets: [
      ["gaunt", "@gaunt"],
      ["stretched-graygore_2", "@gaunt_2", undefined, "made"],
    ],
  },
];

/** Sheets already in the repo that have a face crop beside them (<name>-face.webp). */
const withFace = new Set(["chloe_ep01", "chloe_ep04_5", "chloe_ep06", "elena", "elena_van_ep16", "julian", "julian_ep06"].map((x) => `${OLD}/${x}`));

function build(series: string, characters: Character[]): SeriesCast {
  return {
    characters: characters.map(({ id, name }) => ({ id, name })),
    sheets: characters.flatMap((c) =>
      c.sheets.map(([file, tag, variant, made]) => {
        const base = file.startsWith("/") ? file : `/labs/app/cast/${series}/${file}`;
        return {
          id: tag,
          tag,
          character: c.id,
          src: `${base}.webp`,
          face: withFace.has(base) ? `${base}-face.webp` : undefined,
          ...(variant ? { variant } : {}),
          ...(made ? { tagMade: true } : {}),
        };
      }),
    ),
  };
}

/** The cast of the three mini-series, keyed by series slug. */
export const notionCast: Record<string, SeriesCast> = {
  "second-chance": build("second-chance", secondChance),
  moonflower: build("moonflower", moonflower),
  "gray-winter": build("gray-winter", grayWinter),
};
