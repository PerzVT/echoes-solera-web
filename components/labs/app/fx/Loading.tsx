import type { CSSProperties, ReactNode } from "react";
import { Skeleton, SkeletonButton, SkeletonGroup, SkeletonText } from "@/components/labs/fx";
import { AppShell, Crumbs } from "../AppShell";
import { Panel, Stepper, TitleSkeleton as EpisodeTitle } from "../parts";
import { generations, recentScripts, seriesCards, tools } from "@/lib/labs/maker";
import { elementGroups, startingElements } from "../creator";
import { CREATOR_STEPS, allStyles, chartSlots, getStyle, isComingSoon, ruleFields } from "@/lib/labs/styles";
import s from "../maker.module.css";
import h from "../Series.module.css";
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
 * lays it over the page being left when a navigation takes longer than 180 ms). Every one is drawn inside
 * the real shell with the real header, stepper and panel frames, and with the screen's own layout classes,
 * so the columns and the big blocks are where the page will put them: only what a route has to fetch is a
 * placeholder, cut to the size of the thing it stands for. The stepper holds the step the person came from
 * and moves on when the page arrives.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
/** A placeholder that sits in a line of text, as in the header trail. */
const inline: CSSProperties = { display: "inline-block", verticalAlign: "middle" };

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

/** A quiet small button's place: its label as a line, in the button's own box, so a panel header wraps as the real one does. */
function QuietSk({ width }: { width: number }) {
  return (
    <span className={l.quiet} aria-hidden="true">
      <Skeleton width={width} height={14} />
    </span>
  );
}

/** A labelled field: its label as the page sets it, and its control. */
function FieldSk({ label, height = 48 }: { label: string; height?: number }) {
  return (
    <div className={s.field} aria-hidden="true">
      <span className={s.label}>{label}</span>
      <Skeleton width="100%" height={height} radius="var(--r-control)" />
    </div>
  );
}

/** A tile: its art at the tile's ratio, its name and its tag. */
function TileSk({ ratio = "4 / 3", index = 0 }: { ratio?: string; index?: number }) {
  return (
    <li className={l.tile}>
      <Skeleton ratio={ratio} width="100%" radius="var(--r-control)" index={index} />
      <Skeleton width="68%" height={12} index={index} />
      <Skeleton width="52%" height={12} index={index} />
    </li>
  );
}

/** Label and value rows, in the real rows' frame. `lines` gives the value's lines on each row. */
function FactsSk({ rows, lines }: { rows: number; lines?: number[] }) {
  return (
    <dl className={s.facts} aria-hidden="true">
      {range(rows).map((i) => (
        <div key={i}>
          <dt>
            <Skeleton width={72} height={12} index={i} className={l.factLine} />
          </dt>
          <dd className={l.factValue}>
            {range(lines?.[i] ?? 1).map((j, _, all) => (
              <Skeleton key={j} width={j === all.length - 1 ? `${46 + ((i * 17) % 40)}%` : "96%"} height={12} index={i} className={l.factLine} />
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The chart: its picture slots as placeholders, the empty slots it is known to have as the page draws them. */
function ChartSk({ count, empty = [] }: { count?: number; empty?: string[] }) {
  return (
    <div className={styles.chartWrap} aria-hidden="true">
      <div className={styles.chartArt} data-count={count}>
        {range(count ?? 5).map((i) => (
          <Skeleton key={i} width="100%" height="100%" radius="var(--r-control)" index={i} className={l.slot} />
        ))}
      </div>
      {empty.length > 0 && (
        <div className={styles.chartEmpty}>
          {empty.map((x) => (
            <div key={x} className={styles.slot}>
              <span className={styles.slotLabel}>{x}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Series ---------- */

/** /app: the heading with New series, and one full-width card per series. */
export function HomeLoading() {
  return (
    <AppShell section="/app" title={<Crumbs items={[{ label: "Series" }]} />}>
      <Work className={h.page}>
        <div className={h.pageHead}>
          <h1 className={h.pageTitle}>Your series</h1>
          <SkeletonButton width={156} />
        </div>
        <ul className={h.seriesList} aria-hidden="true">
          {seriesCards.map((c, i) => (
            <li key={c.slug}>
              <div className={h.seriesCard}>
                <Skeleton width="100%" ratio="5 / 7" radius="var(--r-control)" index={i} />
                <span className={h.seriesText}>
                  <Skeleton width="min(360px, 90%)" height={28} index={i} />
                  <Skeleton width="min(320px, 70%)" height={14} index={i} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Work>
    </AppShell>
  );
}

/** /app/new: one centred column, the fields top to bottom and the actions at its foot. On a phone Create series is pinned. */
export function NewSeriesLoading() {
  return (
    <AppShell
      section="/app"
      title={<Crumbs items={[{ label: "Series", href: "/app" }, { label: "New series" }]} />}
      actions={
        <span className={series.phoneAction}>
          <SkeletonButton width="100%" />
        </span>
      }
    >
      <Work className={series.form}>
        <h1 className={series.title}>New series</h1>
        <FieldSk label="Name" />
        <div className={s.field} aria-hidden="true">
          <span className={s.label}>Tool</span>
          <div className={series.tools}>
            {tools.map((t, i) => (
              <div key={t.value} className={cx(series.tool, l.tool)}>
                <Skeleton width={96} height={16} index={i} />
                <Skeleton width="84%" height={12} index={i} />
              </div>
            ))}
          </div>
        </div>
        <div className={s.field} aria-hidden="true">
          <span className={s.label}>Style</span>
          <div className={series.styleRow}>
            {range(6).map((i) => (
              <span key={i} className={l.styleTile}>
                <Skeleton ratio="4 / 5" width="100%" radius="var(--r-control)" index={i} />
                <Skeleton width="80%" height={12} index={i} />
              </span>
            ))}
          </div>
        </div>
        <FieldSk label="Cast sheets" height={72} />
        <div className={series.actions} aria-hidden="true">
          <span className={series.formCreate}>
            <SkeletonButton width={156} />
          </span>
          <Skeleton width={64} height={16} />
        </div>
      </Work>
    </AppShell>
  );
}

type SeriesTab = "episodes" | "cast" | "style";

/** One series: the cover, title and count with the tab's actions at the right, the three tabs, then the tab. */
function SeriesFrameSk({ tab, actions, children }: { tab: SeriesTab; actions?: ReactNode; children: ReactNode }) {
  return (
    <AppShell section="/app" title={<Crumbs items={[{ label: "Series", href: "/app" }, { label: <Skeleton width={200} height={14} style={inline} /> }]} />}>
      <Work className={h.page}>
        <div className={h.seriesHead}>
          <Skeleton width="100%" ratio="5 / 7" radius="var(--r-control)" />
          <span className={h.headText}>
            <Skeleton width="min(420px, 90%)" height={34} />
            <Skeleton width={160} height={14} />
          </span>
          {actions && (
            <span className={h.headActions} aria-hidden="true">
              {actions}
            </span>
          )}
        </div>
        <div className={h.tabs} aria-hidden="true">
          {(["episodes", "cast", "style"] as const).map((t) => (
            <span key={t} className={h.tab} aria-current={t === tab ? "page" : undefined}>
              {t === "episodes" ? "Episodes" : t === "cast" ? "Cast" : "Style"}
            </span>
          ))}
        </div>
        {children}
      </Work>
    </AppShell>
  );
}

/** /app/series/[slug]: the episode cards with the add card at the end, then the cast strip. */
export function SeriesLoading() {
  return (
    <SeriesFrameSk tab="episodes">
      <div className={h.episodesTab} aria-hidden="true">
        <section>
        <ul className={h.episodeGrid}>
          {range(2).map((i) => (
            <li key={i}>
              <div className={cx(h.episodeCard, l.onSurface)}>
                <Skeleton ratio="4 / 5" width="100%" radius="var(--r-control)" index={i} />
                <span className={h.episodeText}>
                  <Skeleton width="72%" height={16} index={i} />
                  <Skeleton width="48%" height={12} index={i} />
                </span>
              </div>
            </li>
          ))}
          <li>
            <div className={cx(h.addCard, l.onSurface)}>
              <span className={h.addArt}>
                <span className={h.addIcon} />
              </span>
              <span className={h.episodeText}>
                <Skeleton width="56%" height={16} index={2} />
                <Skeleton width="36%" height={12} index={2} />
              </span>
            </div>
          </li>
        </ul>
        </section>
        <section className={l.onSurface}>
          <h2 className={h.sectionTitle}>Cast</h2>
          <div className={h.castStrip}>
          <ul className={h.faces}>
            {range(5).map((i) => (
              <li key={i} className={h.face}>
                <Skeleton width={56} height={56} radius="var(--r-pill)" index={i} className={l.faceArt} />
                <Skeleton width="80%" height={12} index={i} />
              </li>
            ))}
          </ul>
          </div>
        </section>
      </div>
    </SeriesFrameSk>
  );
}

/** /app/series/[slug]/style: the pinned style's card at the left, the other styles filling the rest. */
export function SeriesStyleLoading() {
  const others = allStyles.filter((x) => !x.hidden && !isComingSoon(x) && x.card).length - 1;
  return (
    <SeriesFrameSk tab="style" actions={<SkeletonButton width={148} />}>
      <div className={h.styleTab} aria-hidden="true">
        <div className={cx(h.pinnedCard, l.onSurface)}>
          <Skeleton ratio="9 / 16" width="100%" radius="var(--r-control)" />
          <span className={h.pinnedText}>
            <Skeleton width={168} height={30} />
            <Skeleton width={140} height={14} />
            <SkeletonButton width={164} />
          </span>
        </div>
        <section>
          <h2 className={h.sectionTitle}>Other styles</h2>
          <ul className={h.styleGrid}>
            {range(Math.max(others, 3)).map((i) => (
              <li key={i} className={h.styleCard}>
                <Skeleton ratio="4 / 3" width="100%" radius="var(--r-control)" index={i} className={l.styleArt} />
                <Skeleton width="60%" height={16} index={i} />
                <Skeleton width="36%" height={12} index={i} />
                <Skeleton width={112} height={16} index={i} className={l.styleUse} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SeriesFrameSk>
  );
}

/** /app/series/[slug]/cast: the character tabs, the chosen character's sheets, and the sheet at the side. */
export function CastLoading() {
  return (
    <SeriesFrameSk
      tab="cast"
      actions={
        <>
          <SkeletonButton width={168} />
          <SkeletonButton width={176} />
        </>
      }
    >
      <div className={cx(s.split, s.fill, cast.split)}>
        <Panel title="Characters">
          <div className={cast.dropArea}>
          <div className={cast.who} aria-hidden="true">
            {range(4).map((i) => (
              <span key={i} className={cx(cast.whoTab, l.whoTab)}>
                <Skeleton width={48} height={48} radius="var(--r-pill)" index={i} />
                <span className={l.lines}>
                  <Skeleton width={96} height={14} index={i} />
                  <Skeleton width={64} height={12} index={i} />
                </span>
              </span>
            ))}
          </div>
          <div className={cast.group} aria-hidden="true">
            <div className={cast.groupHead}>
              <Skeleton width={140} height={22} />
            </div>
            <ul className={s.tiles}>
              {range(10).map((i) => (
                <TileSk key={i} index={i} />
              ))}
            </ul>
          </div>
          </div>
        </Panel>
        <div className={cast.detailWrap}>
          <Panel
            title={<Skeleton width={120} height={16} style={{ marginBlock: 4 }} />}
            sub={<Skeleton width={160} height={12} style={{ marginBlock: 4 }} />}
            actions={<QuietSk width={104} />}
          >
            <Skeleton ratio="4 / 3" width="100%" radius="var(--r-control)" />
            <FieldSk label="Character" />
            <FieldSk label="Tag" />
          </Panel>
        </div>
      </div>
    </SeriesFrameSk>
  );
}

/* ---------- Episode ---------- */

/** /app/episode/script: the one script box with its foot row, recent scripts in the narrow column. */
export function ScriptLoading() {
  return (
    <AppShell section="/app" title={<EpisodeTitle />} bar={<Stepper current="script" pending />}>
      <Work className={script.layout}>
        <div className={cx(script.box, l.onSurface)} aria-hidden="true">
          <div className={script.field}>
            <span className={script.invite}>
              <Skeleton width={28} height={28} />
              <Skeleton width={220} height={14} />
            </span>
          </div>
          <div className={script.foot}>
            <span className={script.source}>
              <SkeletonButton small width={124} />
              <Skeleton width={150} height={12} />
            </span>
            <SkeletonButton width={156} className={script.process} />
          </div>
        </div>
        <div className={cx(script.recentCard, l.onSurface)} aria-hidden="true">
          <p className={script.recentTitle}>Recent scripts</p>
          <ul className={script.recent}>
            {recentScripts.map((r, i) => (
              <li key={r.title}>
                <div className={script.recentRow}>
                  <span className={script.recentText}>
                    <Skeleton width={140} height={14} index={i} />
                    <Skeleton width={84} height={12} index={i} />
                  </span>
                  <Skeleton width={48} height={12} index={i} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Work>
    </AppShell>
  );
}

/** Lines set as a screenplay page is: a scene heading, a camera break, action, a cue and its line. */
const PAGE: ("heading" | "camera" | "cue" | number)[] = ["heading", "camera", 96, 84, "cue", 52, "camera", 60, "camera", 78, "heading", "camera", 88, 46];

/** /app/episode/screenplay: the script, full width, as skeleton lines under its title. */
export function ScreenplayLoading() {
  return (
    <AppShell section="/app" title={<EpisodeTitle />} bar={<Stepper current="screenplay" pending />} actions={<SkeletonButton width={228} />}>
      <Work className={cx(screenplay.layout, s.fill)}>
        <Panel title={recentScripts[0].title} level={1} flush actions={<QuietSk width={112} />}>
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
      </Work>
    </AppShell>
  );
}

/** /app/episode/references: the groups of element cards, each a picture box, a name and a tag. Groups share a row on wide screens. */
export function ReferencesLoading() {
  const elements = startingElements("default");
  return (
    <AppShell section="/app" title={<EpisodeTitle />} bar={<Stepper current="references" pending />} actions={<SkeletonButton width={184} />}>
      <Work className={refs.page}>
        {elementGroups.map((g) => {
          const items = elements.filter((x) => x.kind === g.kind);
          if (!items.length) return null;
          return (
            <section key={g.kind} className={refs.group} style={{ "--span": Math.min(items.length, 4) } as CSSProperties}>
              <h2 className={refs.groupTitle}>{g.label}</h2>
              <ul className={refs.grid} aria-hidden="true">
                {items.map((x, i) => (
                  <li key={x.id} className={cx(refs.card, l.onSurface)}>
                    <Skeleton width="100%" ratio="4 / 3" radius="var(--r-control)" index={i} />
                    <span className={refs.meta}>
                      <Skeleton width={96} height={16} index={i} className={l.metaLine} />
                      <Skeleton width={120} height={12} index={i} className={l.metaLine} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </Work>
    </AppShell>
  );
}

/** /app/episode/results: the generations list, the clip on the stage with its action row, and the take's side panel. */
export function ResultsLoading() {
  const first = generations[0];
  return (
    <AppShell section="/app" title={<EpisodeTitle />} bar={<Stepper current="results" pending />} actions={<SkeletonButton width={164} />}>
      <Work className={cx(s.fill, results.split)}>
        <Panel title="Generations" level={1} className={results.list} flush>
          <ul className={results.gens} aria-hidden="true">
            {generations.map((g, i) => (
              <li key={g.n}>
                <span className={results.gen}>
                  <span className={results.genArt}>
                    <Skeleton width="100%" height="100%" radius={0} index={i} />
                  </span>
                  <span className={results.genText}>
                    <span className={results.genName}>
                      <Skeleton width="62%" height={12} index={i} className={l.metaLine} />
                    </span>
                    <span className={results.genNum}>
                      <Skeleton width={12} height={12} index={i} style={inline} />
                    </span>
                    <span className={results.genSummary}>
                      <Skeleton width="88%" height={12} index={i} className={l.metaLine} />
                    </span>
                    <span className={results.statusWord}>
                      <Skeleton width="40%" height={12} index={i} className={l.metaLine} />
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className={results.stage} aria-hidden="true">
          <div className={results.screenBox}>
            <div className={results.screen}>
              <Skeleton width="100%" height="100%" radius={0} />
            </div>
          </div>
          <div className={cx(results.under, results.actions)}>
            {[148, 76, 116, 88, 152].map((w, i) => (
              <Skeleton key={i} shape="shoulder" height={40} index={i} className={l.action} style={{ "--w": `${w}px` } as CSSProperties} />
            ))}
          </div>
        </div>

        <Panel as="aside" className={results.side} bodyClassName={results.sideBody} title={`Generation ${first.n}`} sub={first.summary}>
          <section aria-hidden="true">
            <p className={s.label}>Takes</p>
            <ul className={results.takes}>
              {first.takes.map((t, i) => (
                <li key={t.name} className={l.take}>
                  <Skeleton ratio="9 / 16" width="100%" radius="var(--r-control)" index={i} />
                  <Skeleton width="70%" height={12} index={i} />
                </li>
              ))}
            </ul>
          </section>
          <section aria-hidden="true">
            <p className={s.label}>Prompt</p>
            <span className={s.inset}>
              <SkeletonText lines={6} widths={["92%", "96%", "88%", "94%", "90%", "48%"]} />
            </span>
          </section>
        </Panel>
      </Work>
    </AppShell>
  );
}

/* ---------- Styles ---------- */

const hubGroups = (["In use", "Library"] as const).map((g) => ({ name: g, count: allStyles.filter((x) => !x.hidden && x.group === g).length }));

/** /app/styles: the medium chips in the bar, Import guide and New style at the right, and both groups of style cards. */
export function StylesLoading() {
  return (
    <AppShell
      section="/app/styles"
      title={<span className={s.headerMuted}>Styles</span>}
      bar={<ChipsSk widths={[64, 76, 84]} />}
      actions={
        <>
          <SkeletonButton width={164} />
          <SkeletonButton width={128} />
        </>
      }
    >
      <Work className={styles.library}>
        <div className={styles.libraryGrid}>
          {hubGroups.map((g) => (
            <section key={g.name} className={styles.group}>
              <h2 className={`h3 ${styles.groupHead}`}>{g.name}</h2>
              <ul className={styles.grid} aria-hidden="true">
                {range(g.count).map((i) => (
                  <li key={i}>
                    <span className={styles.card}>
                      <Skeleton ratio="3 / 4" width="100%" radius="var(--r-control)" index={i} />
                      <Skeleton width="62%" height={14} index={i} className={l.metaLine} />
                      <span className={styles.cardMeta}>
                        <Skeleton width="40%" height={12} index={i} className={l.metaLine} />
                        <Skeleton width="28%" height={12} index={i} className={l.metaLine} />
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Work>
    </AppShell>
  );
}

/** The trail of a style page: the section is the switch, so the trail is the page's own name. */
const styleTrail = (page: ReactNode) => <Crumbs items={[{ label: "Styles", href: "/app/styles" }, { label: page }]} />;

/** /app/styles/[slug]: the chart filling its panel, the details at the side. */
export function StyleLoading() {
  return (
    <AppShell
      section="/app/styles"
      title={styleTrail(<Skeleton width={160} height={14} style={inline} />)}
      actions={
        <>
          <SkeletonButton width={140} />
          <SkeletonButton width={148} />
        </>
      }
    >
      <Work className={cx(s.split, s.fill, styles.split, styles.fillSplit)}>
        <Panel title="Style chart" level={1} bodyClassName={styles.fillBody}>
          <ChartSk />
        </Panel>
        <Panel as="aside" title="Details">
          <FactsSk rows={5} />
        </Panel>
      </Work>
    </AppShell>
  );
}

/** /app/styles/import: the fields read from the file, in one centred panel; the source stays closed. */
export function ImportLoading() {
  return (
    <AppShell
      section="/app/styles"
      title={styleTrail("Import guide")}
      actions={
        <>
          <SkeletonButton width={204} />
          <SkeletonButton width={144} />
        </>
      }
    >
      <Work className={cx(s.split, s.fill, styles.importSplit)}>
        <div className={styles.drop}>
          <Panel
            title={<Skeleton width={260} height={28} style={{ marginBlock: 4 }} />}
            level={1}
            sub={<Skeleton width={180} height={12} style={{ marginBlock: 4 }} />}
            actions={<QuietSk width={120} />}
          >
            <FactsSk rows={6 + ruleFields.length} lines={[1, 1, 1, 1, 1, 1, ...ruleFields.map((_, i) => (i % 3 === 2 ? 1 : 2))]} />
          </Panel>
        </div>
      </Work>
    </AppShell>
  );
}

/** The draft the creator opens on: which chart slots hold art and which are still empty. */
const draftChart = getStyle("solera-environments-draft")?.chart ?? {};
const draftFilled = chartSlots.filter((c) => draftChart[c.key]).length;
const draftEmpty = chartSlots.filter((c) => !draftChart[c.key]).map((c) => c.label);

/** /app/styles/new: the step bar and Save version, the chart filling its panel, the rules to read at the side. */
export function CreatorLoading() {
  return (
    <AppShell
      section="/app/styles"
      title={styleTrail("Solera environments, draft")}
      bar={<Stepper current="chart" steps={CREATOR_STEPS} label="Style steps" pending />}
      actions={<SkeletonButton width={152} />}
    >
      <Work className={cx(s.split, s.fill, styles.split, styles.fillSplit)}>
        <Panel title="Style chart" level={1} bodyClassName={styles.fillBody} actions={<QuietSk width={120} />}>
          <ChartSk count={draftFilled || undefined} empty={draftEmpty} />
          <h2 className={s.subhead}>Avoid</h2>
          <span className={styles.avoid} aria-hidden="true">
            {range(3).map((i) => (
              <Skeleton key={i} width="100%" height={48} radius="var(--r-control)" index={i} />
            ))}
          </span>
        </Panel>
        <Panel as="aside" title="Rules">
          <FactsSk rows={ruleFields.length} lines={ruleFields.map((_, i) => 2 + (i % 2))} />
        </Panel>
      </Work>
    </AppShell>
  );
}
