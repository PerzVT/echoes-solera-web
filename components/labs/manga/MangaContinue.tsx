"use client";

import { ButtonLink } from "../Button";
import { useAccess } from "../access/store";
import type { SeriesOutline } from "@/lib/labs/manga/outline";
import { continueTarget } from "./progress";

/**
 * A series' main action as a shouldered button: "Read chapter 1" for a new reader, "Continue chapter 2, page 5"
 * once they have started. Renders the first-visit label on the server and the first client pass.
 */
export function MangaContinue({ series, className }: { series: SeriesOutline; className?: string }) {
  const access = useAccess();
  const { label, href } = continueTarget(access, series);
  return (
    <ButtonLink href={href} className={className}>
      {label}
    </ButtonLink>
  );
}
