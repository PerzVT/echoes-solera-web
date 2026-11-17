import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WatchView } from "@/components/labs/WatchView";
import { series, seriesBySlug } from "@/lib/labs/series";
import { og } from "@/lib/labs/og";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ ep?: string }> };

export function generateStaticParams() {
  return series.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = seriesBySlug((await params).slug);
  if (!s) return { title: "Page not found" };
  return { title: s.title, ...og(s.title, "mini-series") };
}

export default async function Watch({ params, searchParams }: Props) {
  const s = seriesBySlug((await params).slug);
  if (!s) notFound();

  return (
    <WatchView
      title={s.title}
      kind={s.genre}
      hook={s.hook}
      cover={s.cover}
      items={s.episodes}
      wanted={Number((await searchParams).ep ?? 1)}
      base={`/mini-series/${s.slug}`}
      back={{ href: "/mini-series", label: "All series" }}
      listLabel={s.listLabel ?? "Episodes"}
      awaiting={s.awaiting}
      art={s.episodes.length ? undefined : s.art}
    />
  );
}
