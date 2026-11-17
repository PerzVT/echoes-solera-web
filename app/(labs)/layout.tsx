import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { IntroLoader } from "@/components/labs/fx/IntroLoader";
import { INTRO_HTML } from "@/components/labs/fx/introScript";
import { RouteSkeleton } from "@/components/labs/fx/RouteSkeleton";
import { SiteBackdrop } from "@/components/labs/fx/SiteBackdrop";
import { SiteFooter } from "@/components/labs/SiteFooter";
import { SITE_DESCRIPTION, SITE_URL, og } from "@/lib/labs/og";
import "./labs.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz"] });

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: { default: "Nine Lives Labs", template: "%s · Nine Lives Labs" },
  description: SITE_DESCRIPTION,
  robots: { index: false, follow: false },
  ...og("Nine Lives Labs"),
  // The kit's favicons use the ink mark; on a dark tab strip the paper mark reads instead.
  icons: {
    icon: [
      { url: "/labs/brand/mark-ink.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/labs/brand/mark-paper.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  return (
    // The inline script writes data-nl-js and data-nl-intro on this element before hydration.
    <div className={`nl ${dmSans.variable} ${fraunces.variable}`} suppressHydrationWarning>
      {/* Before first paint: marks the site as scripted and decides whether this visit gets the intro. */}
      <span hidden dangerouslySetInnerHTML={{ __html: INTRO_HTML }} />
      <a href="#main" className="nl-skip">
        Skip to content
      </a>
      <SiteBackdrop />
      <IntroLoader />
      {children}
      <SiteFooter />
      <RouteSkeleton />
    </div>
  );
}
