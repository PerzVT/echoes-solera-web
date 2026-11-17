import type { Metadata } from "next";
import { CastStep } from "@/components/labs/app/CastStep";

export const metadata: Metadata = { title: "Cast" };

export default function CastPage() {
  return <CastStep />;
}
