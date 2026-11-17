"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AppShell, Crumbs } from "./AppShell";
import { Button, ButtonLink } from "@/components/labs/Button";
import { GestureIcon } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { allStyles, isComingSoon, type Style } from "@/lib/labs/styles";
import type { SeriesCard } from "@/lib/labs/maker";
import { findSeries, useCast } from "./CastProvider";
import { episodeCount, episodesOf, nextEpisodeName, seriesExtra, stageHref, type EpisodeItem, type Stage } from "./creator";
import { Empty } from "./parts";
import h from "./Series.module.css";

export type SeriesTab = "episodes" | "cast" | "style";

const tabs: { key: SeriesTab; label: string; path: string }[] = [
  { key: "episodes", label: "Episodes", path: "" },
  { key: "cast", label: "Cast", path: "/cast" },
  { key: "style", label: "Style", path: "/style" },
];

type FrameProps = {
  slug: string;
  tab: SeriesTab;
  /** Actions at the right of the series heading. Episodes gets New episode when none are given. */
  actions?: ReactNode;
  onFiles?: (files: File[]) => void;
  children: (card: SeriesCard) => ReactNode;
};

/** One series: its cover, title and episode count with the actions at the right, the Episodes, Cast and Style tabs, then the tab. */
export function SeriesFrame({ slug, tab, actions, onFiles, children }: FrameProps) {
  const store = useCast();
  const card = findSeries(slug, store.created);

  if (!card)
    return (
      <AppShell section="/app" title={<Crumbs items={[{ label: "Series", href: "/app" }, { label: "Not found" }]} />}>
        <h1 className="sr-only">Series not found</h1>
        <Empty
          art="no-results"
          action={
            <ButtonLink href="/app" variant="secondary">
              All series
            </ButtonLink>
          }
        >
          No series has this address.
        </Empty>
      </AppShell>
    );

  const episodes = episodesOf(card, store.addedEpisodes[card.slug]);
  const base = `/app/series/${card.slug}`;

  return (
    <AppShell section="/app" title={<Crumbs items={[{ label: "Series", href: "/app" }, { label: card.title }]} />} onFiles={onFiles}>
      <div className={h.page}>
        <header className={h.seriesHead}>
          <span className={h.headCover}>{card.cover ? <Image src={card.cover} alt="" fill sizes="96px" loading="eager" /> : <span className={h.coverEmpty}>{card.title.charAt(0)}</span>}</span>
          <div className={h.headText}>
            <h1 className={h.pageTitle}>{card.title}</h1>
            <p className={h.seriesMeta}>
              <span>{card.tool}</span>
              <span className={h.dot} aria-hidden="true" />
              <span>{episodeCount(episodes.length, card.tool === "Cooking")}</span>
            </p>
          </div>
          <div className={h.headActions}>{actions ?? (tab === "episodes" ? <NewEpisode card={card} episodes={episodes} /> : null)}</div>
        </header>

        <nav className={h.tabs} aria-label="Series">
          {tabs.map((t) => (
            <Link key={t.key} href={base + t.path} className={h.tab} aria-current={t.key === tab ? "page" : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>

        {children(card)}
      </div>
    </AppShell>
  );
}

/** Starts the next episode of a series and opens its Script step. */
function useNewEpisode(card: SeriesCard, episodes: EpisodeItem[]) {
  const store = useCast();
  const router = useRouter();
  const cooking = card.tool === "Cooking";
  const name = nextEpisodeName(episodes, cooking);
  return {
    label: cooking ? "New video" : "New episode",
    name,
    start: () => {
      store.addEpisode(card.slug, { name, stage: cooking ? "Recipe" : "Script" });
      store.setWorking({ slug: card.slug, title: card.title, episode: name });
      router.push("/app/episode/script");
    },
  };
}

function NewEpisode({ card, episodes }: { card: SeriesCard; episodes: EpisodeItem[] }) {
  const next = useNewEpisode(card, episodes);
  const [going, setGoing] = useState(false);
  return (
    <Button
      icon={<GestureIcon name="plus" size={18} />}
      loading={going}
      onClick={() => {
        setGoing(true);
        next.start();
      }}
    >
      {next.label}
    </Button>
  );
}

const STEP_OF: Record<Stage, number> = { Script: 1, Recipe: 1, Screenplay: 2, References: 3, Results: 4 };

/** The Episodes tab: one card per episode, each opening at the step it has reached, and an add card at the end. */
export function SeriesEpisodes({ card }: { card: SeriesCard }) {
  const store = useCast();
  const episodes = episodesOf(card, store.addedEpisodes[card.slug]);
  const next = useNewEpisode(card, episodes);

  return (
    <section aria-labelledby="episodes-heading">
      <h2 id="episodes-heading" className="sr-only">
        Episodes
      </h2>
      <ul className={h.episodeGrid}>
        {episodes.map((e, i) => (
          <li key={e.name}>
            <Link href={stageHref[e.stage]} className={h.episodeCard} onClick={() => store.setWorking({ slug: card.slug, title: card.title, episode: e.name })}>
              <span className={h.poster}>
                {e.poster ? <Image src={e.poster} alt="" fill sizes="(max-width: 720px) 50vw, 280px" loading={i < 4 ? "eager" : undefined} /> : <span className={h.posterEmpty} />}
              </span>
              <span className={h.episodeText}>
                <span className={h.episodeName}>{e.name}</span>
                <span className={h.episodeStage}>
                  <span className={h.stageDots} aria-hidden="true">
                    {[1, 2, 3, 4].map((n) => (
                      <span key={n} data-on={n <= STEP_OF[e.stage] || undefined} />
                    ))}
                  </span>
                  {e.stage}
                  <span className="sr-only">, step {STEP_OF[e.stage]} of 4</span>
                </span>
                {e.generations ? (
                  <span className={h.episodeGens}>
                    {e.generations} generations, {e.kept} kept
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
        <li>
          <button type="button" className={h.addCard} onClick={next.start}>
            <span className={h.addIcon}>
              <GestureIcon name="plus" size={24} />
            </span>
            <span className={h.episodeName}>{next.label}</span>
            <span className={h.episodeGens}>{next.name}</span>
          </button>
        </li>
      </ul>
    </section>
  );
}

/** The Style tab: the style the series pins, then the other styles it could pin instead. */
export function SeriesStyle({ card }: { card: SeriesCard }) {
  const store = useCast();
  const key = `style:${card.slug}`;
  const [pinned, setPinned] = useState<string | undefined>(() => store.kept<string>(key) ?? seriesExtra[card.slug]?.style);
  const pin = (slug: string) => {
    store.keep(key, slug);
    setPinned(slug);
  };
  const style = allStyles.find((x) => x.slug === pinned);
  const others = allStyles.filter((x) => !x.hidden && !isComingSoon(x) && x.card && x.slug !== pinned);

  return (
    <div className={h.styleTab}>
      <section aria-labelledby="pinned-heading" className={h.pinned}>
        <h2 id="pinned-heading" className="sr-only">
          Pinned style
        </h2>
        {style ? (
          <div className={h.pinnedCard}>
            <span className={h.pinnedArt}>{style.card && <Image src={style.card.src} alt="" fill sizes="(max-width: 720px) 100vw, 50vw" loading="eager" />}</span>
            <div className={h.pinnedText}>
              <p className={h.pinnedName}>{style.name}</p>
              <p className={h.styleId}>{style.id}</p>
              <p className={h.seriesMeta}>
                <span>{style.medium}</span>
                <span className={h.dot} aria-hidden="true" />
                <span>{style.status}</span>
              </p>
              <ButtonLink href={`/app/styles/${style.slug}`} variant="secondary" iconAfter={<GestureIcon name="arrow" size={18} />}>
                Open style
              </ButtonLink>
            </div>
          </div>
        ) : (
          <Empty
            action={
              <ButtonLink href="/app/styles" variant="secondary">
                Browse styles
              </ButtonLink>
            }
          >
            This series has no style pinned.
          </Empty>
        )}
      </section>

      <section aria-labelledby="other-styles">
        <h2 id="other-styles" className={h.sectionTitle}>
          Other styles
        </h2>
        <ul className={h.styleGrid}>
          {others.map((x) => (
            <StyleCard key={x.slug} style={x} onUse={() => pin(x.slug)} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function StyleCard({ style, onUse }: { style: Style; onUse: () => void }) {
  return (
    <li className={h.styleCard}>
      <span className={h.styleArt}>{style.card && <Image src={style.card.src} alt="" fill sizes="(max-width: 720px) 50vw, 25vw" />}</span>
      <span className={h.styleName}>{style.name}</span>
      <span className={h.styleId}>{style.medium}</span>
      <Button variant="quiet" size="small" onClick={onUse} aria-label={`Pin ${style.name}`}>
        Use this style
      </Button>
    </li>
  );
}

/** /app/series/[slug] */
export function SeriesEpisodesScreen({ slug }: { slug: string }) {
  return (
    <SeriesFrame slug={slug} tab="episodes">
      {(card) => <SeriesEpisodes card={card} />}
    </SeriesFrame>
  );
}

/** /app/series/[slug]/style */
export function SeriesStyleScreen({ slug }: { slug: string }) {
  return (
    <SeriesFrame
      slug={slug}
      tab="style"
      actions={
        <ButtonLink href="/app/styles" variant="secondary">
          Style library
        </ButtonLink>
      }
    >
      {(card) => <SeriesStyle key={card.slug} card={card} />}
    </SeriesFrame>
  );
}
