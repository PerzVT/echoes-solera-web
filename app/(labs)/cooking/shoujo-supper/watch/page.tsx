import type { Metadata } from "next";
import { WatchView } from "@/components/labs/WatchView";
import { releases, supper } from "@/lib/labs/supper";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: `${supper.title} episodes`, ...og(`${supper.title} episodes`, "cooking") };

export default async function WatchSupper({ searchParams }: { searchParams: Promise<{ ep?: string }> }) {
  return (
    <WatchView
      title={supper.title}
      kind={supper.kind}
      hook={supper.hook}
      cover={supper.cover}
      items={releases}
      wanted={Number((await searchParams).ep ?? 1)}
      base="/cooking/shoujo-supper/watch"
      back={{ href: "/cooking/shoujo-supper", label: "Shoujo Supper" }}
      listLabel="Episodes"
    />
  );
}
