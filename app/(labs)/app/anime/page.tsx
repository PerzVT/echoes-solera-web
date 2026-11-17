import type { Metadata } from "next";
import { CanvasList } from "@/components/labs/board/CanvasList";

export const metadata: Metadata = { title: "Anime" };

export default function AnimePage() {
  return <CanvasList />;
}
