import type { Metadata } from "next";
import Catalog from "./Catalog";

export const metadata: Metadata = {
  title: "Style Library | Highstreet Studio",
  description: "Explore visual directions for animation and storytelling.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true, noimageindex: true, googleBot: { index: false, follow: false, noimageindex: true } },
  referrer: "no-referrer",
  openGraph: { title: "Style Library | Highstreet Studio", description: "Visual directions for your next story.", images: [] },
  twitter: { card: "summary", title: "Style Library | Highstreet Studio", description: "Visual directions for your next story.", images: [] },
};

export default function Page() { return <Catalog />; }
