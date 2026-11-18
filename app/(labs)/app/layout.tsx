import { CastProvider } from "@/components/labs/app/CastProvider";
import { WaveHost } from "@/components/labs/app/fx/Wave";

export default function MakerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CastProvider>
      {children}
      <WaveHost />
    </CastProvider>
  );
}
