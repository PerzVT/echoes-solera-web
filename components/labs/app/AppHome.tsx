"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AppShell } from "./AppShell";
import { ButtonLink } from "@/components/labs/Button";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { crossfade } from "./fx/crossfade";
import { seriesCards, type SeriesCard, type Tool } from "@/lib/labs/maker";
import { useCast } from "./CastProvider";
import { Chip } from "./parts";
import s from "./maker.module.css";
import h from "./AppHome.module.css";

const filters: ("All" | Tool)[] = ["All", "Mini-series", "Anime", "Cooking"];

export function AppHome() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const store = useCast();
  const grid = useRef<HTMLUListElement>(null);
  const shown = [...store.created, ...seriesCards].filter((c) => filter === "All" || c.tool === filter);
  /** The episode screens show the series the person opened from here. */
  const open = (c: SeriesCard) => store.setWorking({ slug: c.slug, title: c.title });

  return (
    <AppShell
      section="/app"
      title={<span className={s.headerMuted}>Your series</span>}
      bar={
        <>
          <ButtonLink href="/app/new">New series</ButtonLink>
          <span className={s.divider} aria-hidden="true" />
          <div className={s.chips} role="group" aria-label="Filter by tool">
            {filters.map((f) => (
              <Chip
                key={f}
                on={filter === f}
                onClick={() => {
                  // The old set dissolves into the new one: nothing is seen to jump to a new place.
                  if (f !== filter) crossfade(grid.current);
                  setFilter(f);
                }}
              >
                {f}
              </Chip>
            ))}
          </div>
        </>
      }
    >
      <h1 className="sr-only">Your series</h1>
      <ul ref={grid} className={h.grid}>
        {shown.map((c) => (
          <li key={c.slug} className={`${s.card} ${h.series}`}>
            <div className={h.top}>
              <div className={`${s.thumb} ${h.cover}`}>
                {c.cover && <Image src={c.cover} alt="" fill sizes="64px" />}
              </div>
              <div>
                <h2 className="h3">{c.title}</h2>
                <p className={s.cardSub}>{c.tool}</p>
              </div>
            </div>
            <ul className={h.eps}>
              {c.episodes.map((e) => (
                <li key={e.name}>
                  <Link href={e.href} className={h.episode} onClick={() => open(c)}>
                    <span>{e.name}</span>
                    <span className={h.stage}>{e.stage}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className={h.add}>
              <ButtonLink href="/app/episode/script" variant="quiet" size="small" onClick={() => open(c)} aria-label={`${c.add} in ${c.title}`}>
                {c.add}
              </ButtonLink>
              <ButtonLink href={`/app/cast?series=${c.slug}`} variant="quiet" size="small" aria-label={`Cast of ${c.title}`}>
                Cast
              </ButtonLink>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
