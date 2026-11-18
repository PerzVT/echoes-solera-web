import type { Metadata } from "next";
import { StoryboardBoard } from "@/components/labs/app/StoryboardApp";

export const metadata: Metadata = { title: "Storyboard" };

export default function Page() {
  return <StoryboardBoard />;
}
