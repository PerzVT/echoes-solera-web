import type { Metadata } from "next";
import { SeriesEpisodes } from "@/components/labs/app/Library";

export const metadata: Metadata = { title: "Library" };

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SeriesEpisodes key={slug} slug={slug} />;
}
