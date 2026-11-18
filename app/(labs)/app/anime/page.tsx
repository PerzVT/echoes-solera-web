import type { Metadata } from "next";
import { ScriptStep } from "@/components/labs/app/ScriptStep";

export const metadata: Metadata = { title: "Anime" };

export default function AnimeStartPage() {
  return <ScriptStep />;
}
