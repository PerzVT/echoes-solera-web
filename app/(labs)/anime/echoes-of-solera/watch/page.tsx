import type { Metadata } from "next";
import { WatchView } from "@/components/labs/WatchView";
import { shorts, solera } from "@/lib/labs/solera";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: `${solera.title} shorts`, ...og(`${solera.title} shorts`, "anime") };

export default async function WatchShorts({ searchParams }: { searchParams: Promise<{ ep?: string }> }) {
  return (
    <WatchView
      title={solera.title}
      kind="Shorts"
      cover={solera.cover}
      items={shorts}
      wanted={Number((await searchParams).ep ?? 1)}
      base="/anime/echoes-of-solera/watch"
      back={{ href: "/anime/echoes-of-solera", label: "Echoes of Solera" }}
      listLabel="Shorts"
    />
  );
}
