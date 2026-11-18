/** Shown by RouteSkeleton (components/labs/fx) while this route is on its way. */
import { WorkLoading } from "@/components/labs/app/StoryboardApp";
import { BOARD_STEPS } from "@/components/labs/app/StoryboardApp";

export default function Loading() {
  return <WorkLoading tool="storyboard" steps={BOARD_STEPS} step="scene" />;
}
