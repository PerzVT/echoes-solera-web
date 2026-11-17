import type { Metadata } from "next";
import { BoardApp } from "@/components/labs/board/BoardApp";

export const metadata: Metadata = { title: "Catalyst" };

export default function AnimeBoardPage() {
  return <BoardApp />;
}
