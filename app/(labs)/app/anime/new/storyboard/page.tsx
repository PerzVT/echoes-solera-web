import type { Metadata } from "next";
import { DraftBoard } from "@/components/labs/board/Storyboard";

export const metadata: Metadata = { title: "Storyboard" };

export default function Page() {
  return <DraftBoard />;
}
