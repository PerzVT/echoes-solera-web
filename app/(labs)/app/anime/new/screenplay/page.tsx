import type { Metadata } from "next";
import { ScreenplayStep } from "@/components/labs/board/Flow";

export const metadata: Metadata = { title: "Screenplay" };

export default function Page() {
  return <ScreenplayStep />;
}
