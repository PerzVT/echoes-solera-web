/** Shown by RouteSkeleton (components/labs/fx) while this route is on its way. */
import { StartSkeleton } from "@/components/labs/app/fx/StartSkeleton";
import { MANGA_STEPS } from "@/components/labs/app/MangaApp";

export default function Loading() {
  return <StartSkeleton tool="manga" steps={MANGA_STEPS} label="Story" placeholder="Paste a story or a script passage" />;
}
