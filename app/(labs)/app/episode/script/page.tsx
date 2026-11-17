import type { Metadata } from "next";
import { ScriptStep } from "@/components/labs/app/ScriptStep";

export const metadata: Metadata = { title: "Script" };

export default function ScriptPage() {
  return <ScriptStep />;
}
