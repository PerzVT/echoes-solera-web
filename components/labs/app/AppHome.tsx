"use client";

import Link from "next/link";
import { AppShell, Crumbs } from "./AppShell";
import { ButtonLink } from "@/components/labs/Button";
import { GestureIcon } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { seriesCards } from "@/lib/labs/maker";
import { useCast } from "./CastProvider";
import { episodeCount, episodesOf, seriesExtra, type EpisodeItem } from "./creator";
import h from "./Series.module.css";

/** Where a series stands: its latest episode not yet at Results, or its last episode when all are. */
function standing(episodes: EpisodeItem[]) {
  const open = episodes.filter((e) => e.stage !== "Results");
  const e = open.at(-1) ?? episodes.at(-1);
  return e ? `${e.name} at ${e.stage}` : "";
}

/** /app: every series as one full-width card. The card opens the series. */
export function AppHome() {
  const store = useCast();
  const all = [...store.created, ...seriesCards];

  return (
    <AppShell section="/app" title={<Crumbs items={[{ label: "Series" }]} />}>
      <div className={h.page}>
        <div className={h.pageHead}>
          <h1 className={h.pageTitle}>Your series</h1>
          <ButtonLink href="/app/new" icon={<GestureIcon name="plus" size={18} />}>
            New series
          </ButtonLink>
        </div>
        <ul className={h.seriesList}>
          {all.map((c, i) => {
            const extra = seriesExtra[c.slug];
            const episodes = episodesOf(c, store.addedEpisodes[c.slug]);
            return (
              <li key={c.slug}>
                <Link href={`/app/series/${c.slug}`} className={h.seriesCard}>
                  {extra?.backdrop && (
                    <span className={h.backdrop} aria-hidden="true">
                      <Image src={extra.backdrop} alt="" fill sizes="(max-width: 720px) 100vw, 60vw" loading={i < 2 ? "eager" : undefined} />
                    </span>
                  )}
                  <span className={h.cover}>
                    {c.cover ? (
                      <Image src={c.cover} alt="" fill sizes="(max-width: 720px) 72px, 94px" loading={i < 3 ? "eager" : undefined} />
                    ) : (
                      <span className={h.coverEmpty}>{c.title.charAt(0)}</span>
                    )}
                  </span>
                  <span className={h.seriesText}>
                    <span className={h.seriesName}>{c.title}</span>
                    <span className={h.seriesMeta}>
                      <span>{c.tool}</span>
                      <span className={h.dot} aria-hidden="true" />
                      <span>{episodeCount(episodes.length, c.tool === "Cooking")}</span>
                      {episodes.length > 0 && (
                        <>
                          <span className={`${h.dot} ${h.standingDot}`} aria-hidden="true" />
                          <span className={h.standing}>{standing(episodes)}</span>
                        </>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}
