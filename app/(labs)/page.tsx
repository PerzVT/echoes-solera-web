import { Home } from "@/components/labs/Home";
import { projectBySlug } from "@/lib/labs/projects";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  return (
    <>
      {/* The material the intro's reveal lands on; only a plain / plays the intro. */}
      {!p && <link rel="preload" as="image" href="/labs/brand/materials/04-pigment-paper.webp" fetchPriority="high" />}
      <Home active={projectBySlug(p)} />
    </>
  );
}
