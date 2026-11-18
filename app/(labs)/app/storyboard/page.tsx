import type { Metadata } from "next";
import { StoryboardStart } from "@/components/labs/app/StoryboardApp";

export const metadata: Metadata = { title: "Storyboard" };

/** ?edit=1 comes from the step bar and opens the current board's scene; the plain address starts a new board. */
export default async function StoryboardPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  return <StoryboardStart key={edit ? "edit" : "new"} edit={edit === "1"} />;
}
