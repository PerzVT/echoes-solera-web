import type { Metadata } from "next";
import { VisualNovel } from "@/components/labs/VisualNovel";
import { afterHours } from "@/lib/labs/novel/after-hours";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: afterHours.title, ...og(afterHours.title, "visual-novel") };

export default function AfterHours() {
  return <VisualNovel story={afterHours} exitHref="/?p=visual-novel" />;
}
