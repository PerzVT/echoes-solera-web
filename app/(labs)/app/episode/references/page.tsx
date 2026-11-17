import type { Metadata } from "next";
import { ReferencesStep, type RefState } from "@/components/labs/app/ReferencesStep";

export const metadata: Metadata = { title: "References" };

type Props = { searchParams: Promise<{ state?: string }> };

export default async function ReferencesPage({ searchParams }: Props) {
  const { state } = await searchParams;
  const initial: RefState = state === "outfit" || state === "confirm" ? state : "default";
  return <ReferencesStep key={initial} initial={initial} />;
}
