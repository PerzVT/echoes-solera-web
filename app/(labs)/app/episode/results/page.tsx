import type { Metadata } from "next";
import { ResultsStep, type ResultsState } from "@/components/labs/app/ResultsStep";

export const metadata: Metadata = { title: "Results" };

type Props = { searchParams: Promise<{ state?: string }> };

const states: ResultsState[] = ["new", "failed", "harvest", "edits"];

export default async function ResultsPage({ searchParams }: Props) {
  const { state } = await searchParams;
  const initial = states.find((x) => x === state) ?? "default";
  return <ResultsStep key={initial} initial={initial} />;
}
