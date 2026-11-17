import { CookingProvider } from "@/components/labs/gen/store";

/** The cooking tool keeps its form and the videos approved this session across Create and Library. */
export default function CookingLayout({ children }: { children: React.ReactNode }) {
  return <CookingProvider>{children}</CookingProvider>;
}
