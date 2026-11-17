import type { Metadata } from "next";
import { ScriptStep } from "@/components/labs/app/ScriptStep";

export const metadata: Metadata = { title: "Mini-series" };

export default function AppStartPage() {
  return <ScriptStep />;
}
