import type { Metadata } from "next";
import { StartStep } from "@/components/labs/board/Flow";

export const metadata: Metadata = { title: "New anime" };

export default function Page() {
  return <StartStep />;
}
