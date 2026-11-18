import type { Metadata } from "next";
import { StoryboardStyle } from "@/components/labs/app/StoryboardApp";

export const metadata: Metadata = { title: "Storyboard" };

export default function Page() {
  return <StoryboardStyle />;
}
