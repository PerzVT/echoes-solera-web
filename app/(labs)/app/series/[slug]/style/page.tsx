import type { Metadata } from "next";
import { SeriesStyleScreen } from "@/components/labs/app/SeriesFrame";

export const metadata: Metadata = { title: "Style" };

export default async function SeriesStylePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SeriesStyleScreen key={slug} slug={slug} />;
}
