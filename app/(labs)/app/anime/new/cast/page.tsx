import type { Metadata } from "next";
import { CastStep } from "@/components/labs/board/Flow";

export const metadata: Metadata = { title: "Cast" };

export default function Page() {
  return <CastStep />;
}
