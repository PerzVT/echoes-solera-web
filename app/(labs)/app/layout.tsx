import { CastProvider } from "@/components/labs/app/CastProvider";

export default function MakerLayout({ children }: { children: React.ReactNode }) {
  return <CastProvider>{children}</CastProvider>;
}
