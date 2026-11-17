import type { Metadata } from "next";
import { CookingApp } from "@/components/labs/gen/CookingApp";

export const metadata: Metadata = { title: "Cooking videos" };

export default function CookingPage() {
  return <CookingApp />;
}
