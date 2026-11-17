import { Courier_Prime } from "next/font/google";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-screenplay", display: "swap" });

export default function EpisodeLayout({ children }: { children: React.ReactNode }) {
  return <div className={courier.variable}>{children}</div>;
}
