import type { Metadata } from "next";
import { ImportGuide } from "@/components/labs/styles/ImportGuide";

export const metadata: Metadata = { title: "Import guide" };

export default function ImportPage() {
  return <ImportGuide />;
}
