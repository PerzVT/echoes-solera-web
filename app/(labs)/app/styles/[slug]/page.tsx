import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StyleView } from "@/components/labs/styles/StyleView";
import { allStyles, getStyle, isComingSoon } from "@/lib/labs/styles";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allStyles.filter((x) => !isComingSoon(x)).map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const style = getStyle((await params).slug);
  return { title: style ? `${style.name}, style` : "Style" };
}

export default async function StylePage({ params }: Params) {
  const style = getStyle((await params).slug);
  // A style without enough art has no page yet; the hub lists it as coming soon.
  if (!style || isComingSoon(style)) notFound();
  return <StyleView slug={style.slug} />;
}
