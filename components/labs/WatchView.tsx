import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";
import { BackLink } from "./BackLink";
import { Nav } from "./Nav";
import { VerticalPlayer } from "./VerticalPlayer";
import title from "./Title.module.css";
import styles from "./WatchView.module.css";

export type WatchItem = {
  number: number;
  title?: string;
  video: string;
  poster: string;
  seconds: number;
};

type Props = {
  title: string;
  kind: string;
  hook?: string;
  cover: string;
  items: WatchItem[];
  /** The number asked for in the URL. */
  wanted: number;
  /** This page's path; items are addressed as `${base}?ep=N`. */
  base: string;
  back: { href: string; label: string };
  listLabel: string;
  /** Said in place of "Nothing is out yet" when the title is made but not on the site. */
  awaiting?: string;
  /** Wide key art in two layers, drawn in place of the cover when there is nothing to play. */
  art?: { bg: string; cast: string };
};

const nameOf = (i: WatchItem) => i.title ?? `Episode ${i.number}`;

/** The vertical watch page: player on the left, the title and its items on the right. */
export function WatchView({ title: name, kind, hook, cover, items, wanted, base, back, listLabel, awaiting, art }: Props) {
  const item = items.find((e) => e.number === wanted) ?? items[0];
  const next = item && items.find((e) => e.number === item.number + 1);
  const previous = item && items.find((e) => e.number === item.number - 1);

  return (
    <div className={styles.page}>
      <Nav />
      <main id="main" className={styles.main}>
        <div className={styles.stage}>
          <BackLink href={back.href}>{back.label}</BackLink>
          {item ? (
            <VerticalPlayer
              src={item.video}
              poster={item.poster}
              label={nameOf(item)}
              index={item.number}
              previous={previous && `${base}?ep=${previous.number}`}
              previousLabel={previous && nameOf(previous)}
              next={next && `${base}?ep=${next.number}`}
              nextLabel={next && nameOf(next)}
              seriesHref={back.href}
              backLabel={back.label}
            />
          ) : art ? (
            <div className={styles.artFrame}>
              <Image src={art.bg} alt="" fill sizes="(max-width: 900px) 100vw, 66vw" priority />
              <Image bare src={art.cast} alt={`Key art for ${name}`} fill sizes="(max-width: 900px) 100vw, 66vw" priority />
            </div>
          ) : (
            <div className={styles.coverFrame}>
              <Image src={cover} alt="" width={720} height={1080} sizes="(max-width: 900px) 90vw, 520px" priority />
            </div>
          )}
        </div>

        <aside className={styles.panel}>
          <header className={styles.head}>
            <Image className={styles.thumb} src={cover} alt="" width={112} height={168} sizes="56px" />
            <div>
              <h1 className="h2">{name}</h1>
              <p className="small muted">{kind}</p>
            </div>
          </header>
          {hook && <p className={styles.hook}>{hook}</p>}

          {item ? (
            <>
              <h2 className={styles.heading}>{listLabel}</h2>
              <ol className={styles.episodes}>
                {items.map((e) => (
                  <li key={e.number}>
                    <Link
                      href={`${base}?ep=${e.number}`}
                      scroll={false}
                      aria-current={e.number === item.number ? "true" : undefined}
                      aria-label={nameOf(e)}
                    >
                      <Image src={e.poster} alt="" width={200} height={356} sizes="100px" />
                      <span>{e.number}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              {next && (
                <>
                  <h2 className={styles.heading}>Up next</h2>
                  <Link href={`${base}?ep=${next.number}`} scroll={false} className={styles.upNext}>
                    <Image src={next.poster} alt="" width={96} height={171} sizes="48px" />
                    <span>
                      <span className={styles.upTitle}>{nameOf(next)}</span>
                      <span className="small muted">{next.seconds} seconds</span>
                    </span>
                    <Icon name="play" size={18} />
                  </Link>
                </>
              )}
            </>
          ) : (
            <div className={styles.soon}>
              <p className="h3">{awaiting ? "Not on this site yet" : "Coming soon"}</p>
              <p className="muted">{awaiting ?? "Nothing is out yet."}</p>
              <ButtonLink href={back.href} variant="secondary">
                See all series
              </ButtonLink>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
