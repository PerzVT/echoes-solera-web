import type { Metadata } from "next";
import { CastScreen } from "@/components/labs/app/CastScreen";

export const metadata: Metadata = { title: "Cast" };

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string }> };

export default async function SeriesCastPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;
  return <CastScreen key={slug} series={slug} from={from} />;
}
