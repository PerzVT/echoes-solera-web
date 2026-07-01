import type { Metadata, Viewport } from "next";
import { Cinzel, Space_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Echoes of Solera ✦ Authentication",
  description:
    "Access terminal for the world of Solera. Identity verification required. Proceed with caution.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Echoes of Solera ✦ Authentication",
    description:
      "Access terminal for the world of Solera. Identity verification required. Proceed with caution.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Echoes of Solera ✦ Authentication",
    description:
      "Access terminal for the world of Solera. Identity verification required. Proceed with caution.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${spaceMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
