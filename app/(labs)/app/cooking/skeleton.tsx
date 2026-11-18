/** Shown by RouteSkeleton (components/labs/fx) while this route is on its way. */
import { StartSkeleton } from "@/components/labs/app/fx/StartSkeleton";
import { COOKING_STEPS } from "@/components/labs/gen/CookingApp";

export default function Loading() {
  return <StartSkeleton tool="cooking" steps={COOKING_STEPS()} label="Recipe" placeholder="Name a dish or paste a recipe" />;
}
