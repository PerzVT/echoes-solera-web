import type { Metadata } from "next";
import { CastScreen } from "@/components/labs/app/CastScreen";

export const metadata: Metadata = { title: "Cast" };

type Props = { searchParams: Promise<{ series?: string; from?: string }> };

export default async function CastPage({ searchParams }: Props) {
  const { series, from } = await searchParams;
  // The screen resolves the slug itself, so a series made in this session opens too.
  return <CastScreen key={series ?? "default"} series={series} from={from} />;
}
