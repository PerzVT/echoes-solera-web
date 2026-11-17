import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ series?: string; from?: string }> };

/** Cast lives inside a series now: the old address opens that series' Cast tab. */
export default async function CastPage({ searchParams }: Props) {
  const { series, from } = await searchParams;
  redirect(`/app/series/${encodeURIComponent(series ?? "second-chance")}/cast${from ? `?from=${encodeURIComponent(from)}` : ""}`);
}
