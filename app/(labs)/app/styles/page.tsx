import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/labs/app/AppShell";
import { ChipLink, Empty } from "@/components/labs/app/parts";
import { ButtonLink } from "@/components/labs/Button";
import { GestureIcon } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import m from "@/components/labs/app/maker.module.css";
import s from "@/components/labs/styles/styles.module.css";
import { allStyles, isComingSoon, type MediumFilter, type Style } from "@/lib/labs/styles";

export const metadata: Metadata = { title: "Styles" };

const filters: { key?: MediumFilter; label: string }[] = [
  { label: "All" },
  { key: "video", label: "Video" },
  { key: "images", label: "Images" },
];

const groups = ["In use", "Library"] as const;

function Card({ style, eager }: { style: Style; eager?: boolean }) {
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
    <Link href={`/app/styles/${style.slug}`} className={s.card}>
      {inner}
    </Link>
  );
}

export default async function StyleHub({ searchParams }: { searchParams: Promise<{ medium?: string }> }) {
  const { medium } = await searchParams;
  const current = filters.find((f) => f.key === medium)?.key;
  const listed = allStyles.filter((x) => !x.hidden && (!current || x.filter === current));

  const bar = (
    <>
      <ButtonLink href="/app/styles/new">New style</ButtonLink>
      <ButtonLink href="/app/styles/import" variant="secondary" icon={<GestureIcon name="upload" size={18} />}>
        Import guide
      </ButtonLink>
      <span className={m.divider} aria-hidden="true" />
      <nav className={m.chips} aria-label="Filter by medium">
        {filters.map((f) => (
          <ChipLink key={f.label} on={f.key === current} href={f.key ? `/app/styles?medium=${f.key}` : "/app/styles"}>
            {f.label}
          </ChipLink>
        ))}
      </nav>
    </>
  );

  return (
    <AppShell section="/app/styles" title={<span className={m.headerMuted}>Styles</span>} bar={bar}>
      <h1 className="sr-only">Styles</h1>
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
                    <Card style={x} eager={g === "In use" && i < 6} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </AppShell>
  );
}
