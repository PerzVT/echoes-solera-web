"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronIcon } from "./fx/AnimatedIcon";
import { Reveal } from "./fx/Reveal";
import styles from "./Library.module.css";

export type Title = {
  slug: string;
  title: string;
  genres: string[];
  cover: string;
  href: string;
};

const ALL = "All";
/** How many titles show before "Show all": two rows on a wide screen, six on a phone. */
const FIRST = 12;

/**
 * Every series with a cover, filtered by genre. The filter lives in ?genre= (read on the server, so a
 * linked filter never flashes the full list) and Back returns to it; the list stops after the first
 * rows until asked.
 */
export function Library({ titles, genres, initial }: { titles: Title[]; genres: string[]; initial?: string }) {
  const options = [ALL, ...genres];
  const [filter, setFilter] = useState(initial && options.includes(initial) ? initial : ALL);
  const [expanded, setExpanded] = useState(false);
  const firstHidden = useRef<HTMLAnchorElement | null>(null);

  const choose = (g: string) => {
    setFilter(g);
    setExpanded(false);
    const url = new URL(window.location.href);
    if (g === ALL) url.searchParams.delete("genre");
    else url.searchParams.set("genre", g);
    window.history.replaceState(window.history.state, "", url);
  };

  const matching = titles.filter((t) => filter === ALL || t.genres.includes(filter));
  const shown = expanded ? matching : matching.slice(0, FIRST);
  const more = matching.length - shown.length;

  const showAll = () => {
    setExpanded(true);
    // Move focus to the first title that was hidden, so keyboard readers carry on where the list stopped.
    requestAnimationFrame(() => firstHidden.current?.focus());
  };

  return (
    <section aria-labelledby="all-series">
      <div className={styles.head}>
        <h2 id="all-series" className="h2">
          All series
        </h2>
        <div className={styles.chips} role="group" aria-label="Filter by genre">
          {options.map((g) => (
            <button key={g} type="button" aria-pressed={filter === g} onClick={() => choose(g)}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <p className="sr-only" role="status">
        {filter === ALL ? "Showing every series." : `Showing ${filter}.`}
      </p>

      <Reveal as="ul" stagger className={styles.grid}>
        {shown.map((t, i) => (
          <li key={t.slug}>
            <Link href={t.href} className={styles.poster} ref={expanded && i === FIRST ? firstHidden : undefined}>
              <span className={styles.cover}>
                <Image src={t.cover} alt="" width={360} height={540} sizes="(max-width: 720px) 45vw, 210px" />
              </span>
              <span className={styles.name}>{t.title}</span>
              {t.genres.length > 0 && <span className="small muted">{t.genres.join(", ")}</span>}
            </Link>
          </li>
        ))}
      </Reveal>

      {more > 0 && (
        <div className={styles.moreRow}>
          <button type="button" className={styles.more} onClick={showAll}>
            Show all
            <ChevronIcon open={false} size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
