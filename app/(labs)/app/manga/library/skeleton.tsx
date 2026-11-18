/** Shown by RouteSkeleton (components/labs/fx) while this route is on its way. */
import { WorkLoading } from "@/components/labs/app/StoryboardApp";
import { MANGA_STEPS } from "@/components/labs/app/MangaApp";

export default function Loading() {
  return <WorkLoading tool="manga" steps={MANGA_STEPS} />;
}
