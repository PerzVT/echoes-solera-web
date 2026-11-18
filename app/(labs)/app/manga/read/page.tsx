import type { Metadata } from "next";
import { MangaRead } from "@/components/labs/app/MangaApp";

export const metadata: Metadata = { title: "Manga" };

export default function Page() {
  return <MangaRead />;
}
