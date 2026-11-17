import type { Metadata } from "next";
import { CanvasBoard } from "@/components/labs/board/Storyboard";

export const metadata: Metadata = { title: "Storyboard" };

export default async function CanvasPage({ params, searchParams }: { params: Promise<{ canvas: string }>; searchParams: Promise<{ ep?: string }> }) {
  const { canvas } = await params;
  const { ep } = await searchParams;
  return <CanvasBoard id={canvas} ep={Number(ep) || 1} />;
}
