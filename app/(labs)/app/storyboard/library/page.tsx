import type { Metadata } from "next";
import { StoryboardLibrary } from "@/components/labs/app/StoryboardApp";

export const metadata: Metadata = { title: "Storyboard" };

export default function Page() {
  return <StoryboardLibrary />;
}
