import type { Metadata } from "next";
import { SeriesEpisodesScreen } from "@/components/labs/app/SeriesFrame";

export const metadata: Metadata = { title: "Series" };

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // The screen resolves the slug itself, so a series made in this session opens too.
  return <SeriesEpisodesScreen key={slug} slug={slug} />;
}
