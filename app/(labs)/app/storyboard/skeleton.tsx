/** Shown by RouteSkeleton (components/labs/fx) while this route is on its way. */
import { StartSkeleton } from "@/components/labs/app/fx/StartSkeleton";
import { BOARD_STEPS } from "@/components/labs/app/StoryboardApp";

export default function Loading() {
  return <StartSkeleton tool="storyboard" steps={BOARD_STEPS} label="Scene" placeholder="Paste a scene or a script passage" />;
}
