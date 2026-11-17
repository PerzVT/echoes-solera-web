import type { Metadata } from "next";
import { NewSeries } from "@/components/labs/app/NewSeries";

export const metadata: Metadata = { title: "New series" };

export default function NewSeriesPage() {
  return <NewSeries />;
}
