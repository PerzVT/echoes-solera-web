import type { Metadata } from "next";
import { ScreenplayStep, type Phase } from "@/components/labs/app/ScreenplayStep";

export const metadata: Metadata = { title: "Screenplay" };

type Props = { searchParams: Promise<{ state?: string }> };

/** ?state=processing shows the script being read; ?state=comments opens with two comments from a teammate. */
const states: Phase[] = ["processing", "comments"];

export default async function ScreenplayPage({ searchParams }: Props) {
  const { state } = await searchParams;
  const initial = states.find((x) => x === state) ?? "screenplay";
  return <ScreenplayStep key={initial} initial={initial} />;
}
