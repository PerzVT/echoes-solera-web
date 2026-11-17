"use client";

import { ButtonLink } from "../Button";
import { Icon } from "../Icon";
import type { Episode } from "@/lib/labs/series";
import { lastEpisode } from "./SeriesWatch";
import { episodeKey, useAccess, watched } from "./store";

/** The hero's watch action: episode 1 for a new visitor, otherwise the episode they are on. */
export function ContinueLink({ slug, base, episodes }: { slug: string; base: string; episodes: Episode[] }) {
  const access = useAccess();
  const last = lastEpisode(access, slug);
  let n = 1;
  let label = "Watch episode 1";
  if (last !== undefined) {
    const p = access.progress[episodeKey(slug, last)];
    const after = episodes.find((e) => e.number === last + 1);
    if (watched(p) && after) {
      n = after.number;
      label = `Watch ${after.title ?? `episode ${n}`}`.replace("Watch Episode", "Watch episode");
    } else {
      n = last;
      const e = episodes.find((x) => x.number === last);
      label = `Continue ${e?.title ?? `episode ${n}`}`.replace("Continue Episode", "Continue episode");
    }
  }
  return (
    <ButtonLink href={`${base}?ep=${n}#watch`} icon={<Icon name="play" size={18} />}>
      {label}
    </ButtonLink>
  );
}
