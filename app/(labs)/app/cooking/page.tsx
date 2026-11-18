import type { Metadata } from "next";
import { CookingApp } from "@/components/labs/gen/CookingApp";

export const metadata: Metadata = { title: "Cooking videos" };

/** ?again=<n> comes from the step bar on a finished video and opens the start screen again. */
export default async function CookingPage({ searchParams }: { searchParams: Promise<{ again?: string }> }) {
  const { again } = await searchParams;
  return <CookingApp key={again ?? "start"} />;
}
