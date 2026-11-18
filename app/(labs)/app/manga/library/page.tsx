import type { Metadata } from "next";
import { MangaLibrary } from "@/components/labs/app/MangaApp";

export const metadata: Metadata = { title: "Manga" };

export default function Page() {
  return <MangaLibrary />;
}
