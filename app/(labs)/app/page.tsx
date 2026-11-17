import type { Metadata } from "next";
import { AppHome } from "@/components/labs/app/AppHome";

export const metadata: Metadata = { title: "Your series" };

export default function AppHomePage() {
  return <AppHome />;
}
