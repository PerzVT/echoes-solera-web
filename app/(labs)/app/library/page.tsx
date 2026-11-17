import type { Metadata } from "next";
import { LibraryScreen } from "@/components/labs/app/Library";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  return <LibraryScreen />;
}
