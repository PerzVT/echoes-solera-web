import type { Metadata } from "next";
import { Creator } from "@/components/labs/styles/Creator";
import { CREATOR_STEPS } from "@/lib/labs/styles";

export const metadata: Metadata = { title: "New style" };

export default async function CreatorPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const { step } = await searchParams;
  // The chart is where a draft is made; the other steps open by name.
  const found = CREATOR_STEPS.find((x) => x.key === step)?.key ?? "chart";
  return <Creator initialStep={found} />;
}
