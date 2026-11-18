import { StoryboardProvider } from "@/components/labs/app/work";

/** The storyboard tool keeps the board being made, and the saved boards, across its pages. */
export default function StoryboardLayout({ children }: { children: React.ReactNode }) {
  return <StoryboardProvider>{children}</StoryboardProvider>;
}
