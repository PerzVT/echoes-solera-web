import { courier } from "@/components/labs/app/fonts";

export default function EpisodeLayout({ children }: { children: React.ReactNode }) {
  return <div className={courier.variable}>{children}</div>;
}
