import type { Metadata } from "next";
import { MangaStart } from "@/components/labs/app/MangaApp";

export const metadata: Metadata = { title: "Manga" };

/** ?edit=1 comes from the step bar and opens the current manga's story; the plain address starts a new one. */
export default async function MangaPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  return <MangaStart key={edit ? "edit" : "new"} edit={edit === "1"} />;
}
