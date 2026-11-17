import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/labs/app/AppShell";
import { ChipLink, Empty, Panel } from "@/components/labs/app/parts";
import { ButtonLink } from "@/components/labs/Button";
import { GestureIcon } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import m from "@/components/labs/app/maker.module.css";
import { Clip } from "@/components/labs/styles/Clip";
import { CardLink, UseInSeries } from "@/components/labs/styles/Library";
import { chartImages } from "@/components/labs/styles/parts";
import s from "@/components/labs/styles/styles.module.css";
import { allStyles, isComingSoon, type MediumFilter, type Style } from "@/lib/labs/styles";

export const metadata: Metadata = { title: "Styles" };

const filters: { key?: MediumFilter; label: string }[] = [
  { label: "All" },
  { key: "video", label: "Video" },
  { key: "images", label: "Images" },
];

const groups = ["In use", "Library"] as const;

/** The address of the hub with this filter and, when given, this style open in the preview. */
function hubHref(medium?: MediumFilter, style?: string) {
  const q = new URLSearchParams();
  if (medium) q.set("medium", medium);
  if (style) q.set("style", style);
  const qs = q.toString();
  return qs ? `/app/styles?${qs}` : "/app/styles";
}

function Card({ style, eager, medium, selected }: { style: Style; eager?: boolean; medium?: MediumFilter; selected: boolean }) {
  const soon = isComingSoon(style);
  const inner = (
    <>
      <span className={s.cardArt}>{style.card && <Image src={style.card.src} alt="" fill loading={eager ? "eager" : undefined} sizes="(max-width: 720px) 50vw, (max-width: 1280px) 25vw, 18vw" />}</span>
      <span className={s.cardName}>{style.name}</span>
      <span className={s.cardMeta}>
        <span>{style.medium}</span>
        <span className={s.status} data-status={soon ? "Coming soon" : style.status}>
          {soon ? "Coming soon" : style.status}
        </span>
      </span>
    </>
  );
  if (soon) return <div className={`${s.card} ${s.cardSoon}`}>{inner}</div>;
  return (
    <CardLink href={hubHref(medium, style.slug)} page={`/app/styles/${style.slug}`} className={s.card} aria-current={selected || undefined}>
      {inner}
    </CardLink>
  );
}

/** The preview beside the grid: the still (which plays the clip when there is one), the chart as a strip, and the two ways on. */
function Preview({ style, medium }: { style: Style; medium?: MediumFilter }) {
  const still = style.review?.still ?? style.card?.src ?? style.chart.inScene?.src;
  const clip = style.review?.clip ?? style.chart.example?.video;
  const strip = chartImages(style.chart);
  return (
    <Panel
      as="aside"
      className={s.preview}
      title={style.name}
      sub={
        <span className={s.previewMeta}>
          <span>{style.medium}</span>
          <span className={s.status} data-status={style.status}>
            {style.status}
          </span>
        </span>
      }
      actions={
        <Link href={hubHref(medium)} scroll={false} className={s.previewClose} aria-label="Close preview">
          <GestureIcon name="close" size={20} />
        </Link>
      }
      foot={
        <>
          <ButtonLink href={`/app/styles/${style.slug}`} variant="secondary">
            Open
          </ButtonLink>
          <UseInSeries styleName={style.name} usedBy={style.usedBy} />
        </>
      }
    >
      <span className={s.previewStill} data-ratio={style.review ? "tall" : undefined}>
        {clip ? (
          <Clip key={style.slug} src={clip} poster={still} label={`${style.name}, clip`} />
        ) : (
          still && <Image key={style.slug} src={still} alt={`${style.name}, still`} fill loading="eager" sizes="360px" />
        )}
      </span>
      {strip.length > 1 && (
        <ul className={s.strip} aria-label="Style chart">
          {strip.map((x) => (
            <li key={x.src + x.alt} className={s.stripItem}>
              <Image src={x.src} alt={x.alt} fill sizes="80px" />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export default async function StyleHub({ searchParams }: { searchParams: Promise<{ medium?: string; style?: string }> }) {
  const { medium, style: open } = await searchParams;
  const current = filters.find((f) => f.key === medium)?.key;
  const listed = allStyles.filter((x) => !x.hidden && (!current || x.filter === current));
  const selected = listed.find((x) => x.slug === open && !isComingSoon(x));

  const bar = (
    <nav className={m.chips} aria-label="Filter by medium">
      {filters.map((f) => (
        <ChipLink key={f.label} on={f.key === current} href={hubHref(f.key, selected?.slug)}>
          {f.label}
        </ChipLink>
      ))}
    </nav>
  );
  const actions = (
    <>
      <ButtonLink href="/app/styles/import" variant="secondary" icon={<GestureIcon name="upload" size={18} />}>
        Import guide
      </ButtonLink>
      <ButtonLink href="/app/styles/new">New style</ButtonLink>
    </>
  );

  return (
    <AppShell section="/app/styles" title={<span className={m.headerMuted}>Styles</span>} bar={bar} actions={actions}>
      <h1 className="sr-only">Styles</h1>
      <div className={s.library} data-preview={selected ? "true" : undefined}>
        <div className={s.libraryGrid}>
          {listed.length === 0 ? (
            <Empty
              action={
                <ButtonLink href="/app/styles" variant="secondary">
                  Show all styles
                </ButtonLink>
              }
            >
              No style has this medium yet.
            </Empty>
          ) : (
            groups.map((g) => {
              const items = listed.filter((x) => x.group === g);
              if (items.length === 0) return null;
              // Open styles first, then any still waiting for art.
              items.sort((a, b) => Number(isComingSoon(a)) - Number(isComingSoon(b)));
              const id = `group-${g.replace(" ", "-").toLowerCase()}`;
              return (
                <section key={g} className={s.group} aria-labelledby={id}>
                  <h2 id={id} className={`h3 ${s.groupHead}`}>
                    {g}
                  </h2>
                  <ul className={s.grid}>
                    {items.map((x, i) => (
                      <li key={x.slug}>
                        <Card style={x} eager={g === "In use" && i < 6} medium={current} selected={x.slug === selected?.slug} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </div>
        {selected && <Preview key={selected.slug} style={selected} medium={current} />}
      </div>
    </AppShell>
  );
}
