import type { CSSProperties, ReactNode } from "react";
import { Skeleton, SkeletonButton, SkeletonGroup, SkeletonText } from "@/components/labs/fx";
import { AppShell, Crumbs } from "../AppShell";
import { Panel, Stepper, TitleSkeleton as EpisodeTitle } from "../parts";
import { generations, recentScripts, seriesCards, tools } from "@/lib/labs/maker";
import { elementGroups, startingElements } from "../creator";
import { CREATOR_STEPS, allStyles, chartSlots, ruleFields } from "@/lib/labs/styles";
import s from "../maker.module.css";
import home from "../Series.module.css";
import script from "../ScriptStep.module.css";
import cast from "../Cast.module.css";
import series from "../NewSeries.module.css";
import refs from "../ReferencesStep.module.css";
import results from "../ResultsStep.module.css";
import screenplay from "../ScreenplayStep.module.css";
import styles from "../../styles/styles.module.css";
import l from "./loading.module.css";

/*
 * What each creator route shows while it is on its way (the skeleton.tsx beside each page; RouteSkeleton
 * lays it over the page being left when a navigation takes longer than 180 ms). Every one is drawn inside the real shell, with the
 * real header, stepper and panel frames, so the rail and the header never flash: only what a route
 * has to fetch is a placeholder, cut to the size of the thing it stands for. The stepper holds the
 * step the person came from and moves on when the page arrives.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

function Work({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <SkeletonGroup label="Loading" className={className}>
      {children}
    </SkeletonGroup>
  );
}

/** A filter chip's place. */
function ChipsSk({ widths }: { widths: number[] }) {
  return (
    <span className={s.chips} aria-hidden="true">
      {widths.map((w, i) => (
        <Skeleton key={i} width={w} height={36} radius="var(--r-pill)" index={i} />
      ))}
    </span>
  );
}

/** A labelled field: its label and its 48px control. */
function FieldSk({ height = 48, label = 72 }: { height?: number; label?: number }) {
  return (
    <span className={l.field} aria-hidden="true">
      <Skeleton width={label} height={12} />
      <Skeleton width="100%" height={height} radius="var(--r-control)" />
    </span>
  );
}

/** A tile: its art at the tile's ratio and its name. */
function TileSk({ ratio = "4 / 3", index = 0 }: { ratio?: string; index?: number }) {
  return (
    <li className={l.tile}>
      <Skeleton ratio={ratio} width="100%" radius="var(--r-control)" index={index} />
      <Skeleton width="68%" height={12} index={index} />
    </li>
  );
}

/** Label and value rows. */
function FactsSk({ rows }: { rows: number }) {
  return (
    <span className={l.facts} aria-hidden="true">
      {range(rows).map((i) => (
        <span key={i}>
          <Skeleton width={72} height={12} index={i} />
          <Skeleton width={`${46 + ((i * 17) % 40)}%`} height={12} index={i} />
        </span>
      ))}
    </span>
  );
}

/** The episode steps at the left of the bar, the main action's place at the right. */
const episodeBar = (current: string, button = 168) => ({
  bar: <Stepper current={current} pending />,
  actions: <SkeletonButton width={button} />,
});

/** /app: the heading with New series, and one full-width card per series. */
export function HomeLoading() {
  return (
    <AppShell section="/app" title={<Crumbs items={[{ label: "Series" }]} />}>
      <Work className={home.page}>
        <div className={home.pageHead}>
          <h1 className={home.pageTitle}>Your series</h1>
          <SkeletonButton width={148} />
        </div>
        <ul className={home.seriesList} aria-hidden="true">
          {seriesCards.map((c, i) => (
            <li key={c.slug}>
              <div className={home.seriesCard}>
                <Skeleton width="100%" ratio="5 / 7" radius="var(--r-control)" index={i} />
                <span className={l.lines}>
                  <Skeleton width={320} height={28} index={i} />
                  <Skeleton width={160} height={12} index={i} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Work>
    </AppShell>
  );
}

/** /app/new: the form on the left, the cast sheets on the right. */
export function NewSeriesLoading() {
  return (
    <AppShell
      section="/app"
      title={<Crumbs items={[{ label: "Series", href: "/app" }, { label: "New series" }]} />}
      actions={
        <>
          <SkeletonButton width={104} />
          <SkeletonButton width={152} />
        </>
      }
    >
      <Work className={cx(s.split, s.fill, series.split)}>
        <Panel title="New series" level={1}>
          <FieldSk label={44} />
          <span className={l.field} aria-hidden="true">
            <Skeleton width={36} height={12} />
            <span className={series.tools}>
              {tools.map((t, i) => (
                <Skeleton key={t.value} width="100%" height={96} radius="var(--r-control)" index={i} />
              ))}
            </span>
          </span>
          <span className={l.field} aria-hidden="true">
            <Skeleton width={40} height={12} />
            <span className={series.styles}>
              {range(3).map((i) => (
                <Skeleton key={i} width="100%" height={74} radius="var(--r-control)" index={i} />
              ))}
            </span>
          </span>
        </Panel>
        <Panel as="aside" title="Cast sheets">
          <SkeletonText lines={2} widths={["88%", "56%"]} />
          <Skeleton width="100%" height={72} radius="var(--r-control)" />
        </Panel>
      </Work>
    </AppShell>
  );
}

/** /app/cast: two character groups of sheet tiles, and the sheet at the side. */
export function CastLoading() {
  return (
    <AppShell
      section="/app/cast"
      title={<EpisodeTitle page="Cast" />}
      bar={
        <>
          <SkeletonButton width={176} />
          <SkeletonButton width={176} />
        </>
      }
    >
      <Work className={cx(s.split, s.fill, cast.split)}>
        <Panel title="Characters" level={1}>
          {range(2).map((g) => (
            <div key={g} className={cast.group} aria-hidden="true">
              <div className={cast.groupHead}>
                <Skeleton width={120} height={20} index={g} />
              </div>
              <ul className={s.tiles}>
                {range(g ? 3 : 4).map((i) => (
                  <TileSk key={i} index={i} />
                ))}
              </ul>
            </div>
          ))}
        </Panel>
        <div className={cast.detailWrap}>
          <Panel title={<Skeleton width={140} height={16} />} sub={<Skeleton width={72} height={12} style={{ marginTop: 6 }} />}>
            <Skeleton ratio="4 / 3" width="100%" radius="var(--r-control)" />
            <FieldSk />
            <FieldSk label={28} />
          </Panel>
        </div>
      </Work>
    </AppShell>
  );
}

/** /app/episode/script: the heading, then the upload, paste and recent scripts cards. */
export function ScriptLoading() {
  return (
    <AppShell section="/app" title={<EpisodeTitle />} {...episodeBar("script", 164)}>
      <Work className={script.page}>
        <h1 className={script.title}>Bring your script</h1>
        <div className={script.grid} aria-hidden="true">
          {["Upload a file", "Paste the text"].map((t, i) => (
            <div key={t} className={script.card}>
              <p className={script.cardTitle}>{t}</p>
              <Skeleton width="100%" height={280} radius="var(--r-control)" index={i} />
            </div>
          ))}
          <div className={script.card}>
            <p className={script.cardTitle}>Recent scripts</p>
            <span className={l.stack}>
              {recentScripts.map((r, i) => (
                <span key={r.title} className={l.lines}>
                  <Skeleton width="64%" height={12} index={i} />
                  <Skeleton width={84} height={12} index={i} />
                </span>
              ))}
            </span>
          </div>
        </div>
      </Work>
    </AppShell>
  );
}

/** Lines set as a screenplay page is: a scene heading, a camera break, action, a cue and its line. */
const PAGE: ("heading" | "camera" | "cue" | number)[] = ["heading", "camera", 96, 84, "cue", 52, "camera", 60, "camera", 78, "heading", "camera", 88, 46];

/** /app/episode/screenplay: the page as skeleton lines, and the comments panel. */
export function ScreenplayLoading() {
  return (
    <AppShell section="/app" title={<EpisodeTitle />} {...episodeBar("screenplay", 228)}>
      <Work className={cx(s.split, s.fill)}>
        <Panel title="Screenplay" level={1} flush>
          <div className={cx(screenplay.page, l.page)} aria-hidden="true">
            {PAGE.map((x, i) =>
              x === "heading" ? (
                <Skeleton key={i} width="58%" height={14} index={i} className={l.pageHeading} />
              ) : x === "camera" ? (
                <Skeleton key={i} width={132} height={10} index={i} className={l.pageCamera} />
              ) : x === "cue" ? (
                <Skeleton key={i} width={104} height={12} index={i} className={l.pageCue} />
              ) : (
                <Skeleton key={i} width={`${x}%`} height={12} index={i} className={x < 56 && PAGE[i - 1] === "cue" ? l.pageLine : undefined} />
              ),
            )}
          </div>
        </Panel>
        <Panel as="aside" title="Comments">
          <span className={l.centre} aria-hidden="true">
            <SkeletonText lines={2} widths={["74%", "48%"]} />
          </span>
        </Panel>
      </Work>
    </AppShell>
  );
}

/** /app/episode/references: the groups of element cards, each a picture box, a name and an ID. */
export function ReferencesLoading() {
  const elements = startingElements("default");
  return (
    <AppShell section="/app" title={<EpisodeTitle />} {...episodeBar("references", 184)}>
      <Work className={refs.page}>
        <h1 className={refs.title}>References</h1>
        {elementGroups.map((g) => (
          <section key={g.kind} className={refs.group}>
            <h2 className={refs.groupTitle}>{g.label}</h2>
            <ul className={refs.grid} aria-hidden="true">
              {elements
                .filter((x) => x.kind === g.kind)
                .map((x, i) => (
                  <li key={x.id} className={refs.card}>
                    <Skeleton width="100%" ratio="4 / 3" radius="var(--r-control)" index={i} />
                    <span className={l.lines}>
                      <Skeleton width={96} height={16} index={i} />
                      <Skeleton width={140} height={12} index={i} />
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </Work>
    </AppShell>
  );
}

/** /app/episode/results: one vertical tile per generation, and the clip with its actions at the side. */
export function ResultsLoading() {
  return (
    <AppShell
      section="/app"
      title={<EpisodeTitle />}
      bar={<Stepper current="results" pending />}
      actions={
        <>
          <SkeletonButton width={236} />
          <SkeletonButton width={164} />
        </>
      }
    >
      <Work className={cx(s.split, s.fill, results.split)}>
        <Panel title="Generations" level={1}>
          <Skeleton width="100%" height={8} radius="var(--r-pill)" />
          <ul className={results.tiles} aria-hidden="true">
            {generations.map((g, i) => (
              <TileSk key={g.n} ratio="9 / 16" index={i} />
            ))}
          </ul>
        </Panel>
        <Panel as="aside" className={results.side} title={<Skeleton width={128} height={16} />} sub={<Skeleton width={200} height={12} style={{ marginTop: 6 }} />}>
          <div className={results.head} aria-hidden="true">
            <Skeleton ratio="9 / 16" width="100%" radius="var(--r-control)" />
            <span className={l.stack}>
              <Skeleton width={44} height={12} />
              <Skeleton width={84} height={36} radius="var(--r-pill)" />
              <Skeleton width={104} height={12} />
              <Skeleton width={92} height={12} />
            </span>
          </div>
          <span className={s.actions} aria-hidden="true">
            <SkeletonButton small width={164} />
            <SkeletonButton small width={84} />
          </span>
        </Panel>
      </Work>
    </AppShell>
  );
}

const hubGroups = (["In use", "Library"] as const).map((g) => ({ name: g, count: allStyles.filter((x) => !x.hidden && x.group === g).length }));

/** /app/styles: the intro line and both groups of style cards. */
export function StylesLoading() {
  return (
    <AppShell
      section="/app/styles"
      title={<span className={s.headerMuted}>Styles</span>}
      bar={
        <>
          <SkeletonButton width={124} />
          <SkeletonButton width={164} />
          <span className={s.divider} aria-hidden="true" />
          <ChipsSk widths={[56, 72, 80]} />
        </>
      }
    >
      <Work>
        <p className={styles.intro}>A style fixes how a project is drawn: line, colour, light and texture. A series pins one.</p>
        {hubGroups.map((g) => (
          <section key={g.name} className={styles.group}>
            <h2 className={`h3 ${styles.groupHead}`}>{g.name}</h2>
            <ul className={styles.grid} aria-hidden="true">
              {range(g.count).map((i) => (
                <li key={i} className={styles.card}>
                  <Skeleton ratio="3 / 4" width="100%" radius="var(--r-control)" index={i} />
                  <Skeleton width="62%" height={14} index={i} style={{ marginBlock: 3 }} />
                  <Skeleton width="100%" height={12} index={i} style={{ marginBlock: 4 }} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Work>
    </AppShell>
  );
}

/** The chart's five slots: one tall, four beside it. */
function ChartSk() {
  return (
    <span className={styles.chart} aria-hidden="true">
      {chartSlots.map((c, i) => (
        <Skeleton key={c.key} width="100%" height="100%" radius="var(--r-control)" index={i} style={{ minHeight: 150 } as CSSProperties} />
      ))}
    </span>
  );
}

/** /app/styles/[slug]: the chart and the details. */
export function StyleLoading() {
  return (
    <AppShell
      section="/app/styles"
      title={<EpisodeTitle series="Styles" page={<Skeleton width={160} height={14} style={{ display: "inline-block", verticalAlign: "middle" }} />} />}
      bar={
        <>
          <SkeletonButton width={156} />
          <SkeletonButton width={124} />
        </>
      }
    >
      <Work className={cx(s.split, styles.split)}>
        <Panel title="Style chart" level={1}>
          <ChartSk />
        </Panel>
        <Panel as="aside" title="Details">
          <FactsSk rows={6} />
          <Skeleton width={104} height={14} style={{ marginTop: 12 }} />
          <FactsSk rows={4} />
        </Panel>
      </Work>
    </AppShell>
  );
}

/** /app/styles/import: the file as text on the left, the fields read from it on the right. */
export function ImportLoading() {
  return (
    <AppShell
      section="/app/styles"
      title={<EpisodeTitle series="Styles" page="Import guide" />}
      bar={
        <>
          <SkeletonButton width={148} />
          <SkeletonButton width={212} />
        </>
      }
    >
      <Work className={cx(s.split, styles.splitEven)}>
        <Panel title={<Skeleton width={260} height={24} />} level={1} sub="Kept as it is. Drop a .md, .txt or .json file here to replace it.">
          <SkeletonText lines={5} widths={["64%", "92%", "88%", "96%", "40%"]} />
          <SkeletonText lines={4} widths={["48%", "90%", "94%", "58%"]} />
          <SkeletonText lines={4} widths={["52%", "86%", "92%", "34%"]} />
        </Panel>
        <Panel as="aside" title="Extracted fields" sub="A field the file does not hold reads Not set.">
          <FactsSk rows={6 + ruleFields.length} />
        </Panel>
      </Work>
    </AppShell>
  );
}

/** /app/styles/new: the creator opens on the chart, with the rules beside it. */
export function CreatorLoading() {
  return (
    <AppShell
      section="/app/styles"
      title={<EpisodeTitle series="Styles" page={<Skeleton width={200} height={14} style={{ display: "inline-block", verticalAlign: "middle" }} />} />}
      bar={
        <>
          <SkeletonButton width={152} />
          <span className={s.divider} aria-hidden="true" />
          <Stepper current="chart" steps={CREATOR_STEPS} label="Style steps" pending />
        </>
      }
    >
      <Work className={cx(s.split, styles.split)}>
        <Panel title="Style chart" level={1}>
          <ChartSk />
          <Skeleton width={56} height={14} style={{ marginTop: 8 }} />
          <span className={styles.avoid} aria-hidden="true">
            {range(3).map((i) => (
              <Skeleton key={i} width="100%" height={72} radius="var(--r-control)" index={i} />
            ))}
          </span>
        </Panel>
        <Panel as="aside" title="Rules">
          {ruleFields.slice(0, 5).map((f) => (
            <FieldSk key={f.key} height={96} />
          ))}
        </Panel>
      </Work>
    </AppShell>
  );
}
