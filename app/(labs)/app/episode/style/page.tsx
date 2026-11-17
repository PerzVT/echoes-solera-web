import type { Metadata } from "next";
import { StyleStep } from "@/components/labs/app/StyleStep";

export const metadata: Metadata = { title: "Style" };

export default function StylePage() {
  return <StyleStep />;
}
