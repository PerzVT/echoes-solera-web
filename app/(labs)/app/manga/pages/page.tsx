import type { Metadata } from "next";
import { MangaPages } from "@/components/labs/app/MangaApp";

export const metadata: Metadata = { title: "Manga" };

export default function Page() {
  return <MangaPages />;
}
