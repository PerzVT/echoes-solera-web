import type { Metadata } from "next";
import { ResultsStep, type ResultsState } from "@/components/labs/app/ResultsStep";

export const metadata: Metadata = { title: "Results" };

type Props = { searchParams: Promise<{ state?: string; series?: string; episode?: string }> };

/** ?state=new arrives from Generate with every clip still being made; ?series=&episode= opens an episode from the Library. */
export default async function ResultsPage({ searchParams }: Props) {
  const { state, series, episode } = await searchParams;
  const initial: ResultsState = state === "new" ? "new" : "default";
  // The key CastProvider holds the episode under: "<series>/<episode>".
  const open = series && episode ? `${series}/${episode}` : undefined;
  return <ResultsStep key={`${initial}:${open ?? ""}`} initial={initial} open={open} />;
}
