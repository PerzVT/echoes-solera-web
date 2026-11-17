import type { Metadata } from "next";
import { CookingLibrary } from "@/components/labs/gen/CookingApp";

export const metadata: Metadata = { title: "Cooking videos" };

export default function CookingLibraryPage() {
  return <CookingLibrary />;
}
