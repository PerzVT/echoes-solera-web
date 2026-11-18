/** The early-access screens a URL can open with `?state=`. Plain module so server pages can read it. */
export type SheetName = "subscribe" | "manage" | "how";
const SHEETS: SheetName[] = ["subscribe", "manage", "how"];
/** Links from the coin version land on the nearest screen that exists now. */
const OLD: Record<string, SheetName> = { unlock: "subscribe", topup: "subscribe", wallet: "manage" };
export const asSheet = (s: string | undefined): SheetName | null =>
  SHEETS.includes(s as SheetName) ? (s as SheetName) : s && s in OLD ? OLD[s] : null;
