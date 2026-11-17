/** The early-access screens a URL can open with `?state=`. Plain module so server pages can read it. */
export type SheetName = "unlock" | "wallet" | "topup" | "how";
const SHEETS: SheetName[] = ["unlock", "wallet", "topup", "how"];
export const asSheet = (s: string | undefined): SheetName | null => (SHEETS.includes(s as SheetName) ? (s as SheetName) : null);
