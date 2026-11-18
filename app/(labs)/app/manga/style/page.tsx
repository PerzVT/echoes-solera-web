import type { Metadata } from "next";
import { MangaStyle } from "@/components/labs/app/MangaApp";

export const metadata: Metadata = { title: "Manga" };

export default function Page() {
  return <MangaStyle />;
}
