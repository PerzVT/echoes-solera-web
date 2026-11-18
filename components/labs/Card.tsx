import { Picture as Image } from "@/components/labs/fx/Picture";
import { cardNo, setBySlug, type AnyCard, type CardFace, type CardSet } from "@/lib/labs/cards";
import type { FlockCard } from "@/lib/labs/cards/flock";
import styles from "./Card.module.css";

const F = "/labs/cards/flock";
const isFlock = (c: AnyCard): c is FlockCard => "rarity" in c;

/**
 * A card face. Flock 01 cards are drawn from the package's layers: the full art, the rarity's frame SVG
 * (750 x 1050, its marks baked in) and live text on the nameplate: the name and "017/060". Foil is part of
 * the frame on Rare and above, a sheen cut to the frame's own shape. The concept cards keep their cream
 * study frame.
 *
 * Text is never drawn below 11 px: on a card narrower than 200 px only the number stays on the plate.
 * `thumb` draws the 320 px thumbnail with a plain img (grid tiles, where the optimiser would only add work).
 */
export function Card({
  card,
  sizes = "240px",
  priority,
  foil,
  caption,
  thumb,
  plain,
  bare,
}: {
  card: AnyCard;
  sizes?: string;
  priority?: boolean;
  foil?: boolean;
  caption?: boolean;
  thumb?: boolean;
  /** The full 1060 px art as a plain img, for the pack opening, which preloads it before the flip. */
  plain?: boolean;
  /** No live text: for a card drawn too small to read it, such as one scaled into the opening's row. */
  bare?: boolean;
}) {
  if (isFlock(card)) return <FlockFace card={card} sizes={sizes} priority={priority} thumb={thumb} plain={plain} bare={bare} />;
  return <ConceptFace card={card} sizes={sizes} priority={priority} foil={foil} caption={caption} />;
}

export const frameOf = (r: FlockCard["rarity"]) => `${F}/frames/frame-${r.toLowerCase()}.svg`;

function FlockFace({ card, sizes, priority, thumb, plain, bare }: { card: FlockCard; sizes: string; priority?: boolean; thumb?: boolean; plain?: boolean; bare?: boolean }) {
  const frame = frameOf(card.rarity);
  return (
    <span className={styles.wrap}>
      <span className={styles.flock} data-rarity={card.rarity}>
        <span className={styles.fArt}>
          {thumb || plain ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={plain ? card.art : card.thumb} alt="" width={plain ? 1060 : 320} height={plain ? 1484 : 448} loading={plain ? "eager" : "lazy"} decoding="async" />
          ) : (
            <Image src={card.art} alt="" fill sizes={sizes} priority={priority} />
          )}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.layer} src={frame} alt="" />
        <span className={styles.fFoil} style={{ "--frame": `url(${frame})` } as React.CSSProperties} aria-hidden="true" />
        <span className={styles.fPlate} hidden={bare}>
          <span className={styles.fName}>{card.name}</span>
          <span className={styles.fNo}>{`${String(card.no).padStart(3, "0")}/060`}</span>
        </span>
      </span>
    </span>
  );
}

/** The Flock 01 back from the package: one back for the set, so a face-down card gives nothing away. */
export function FlockBack() {
  return (
    <span className={styles.wrap}>
      <span className={`${styles.flock} ${styles.fBack}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.layer} src={`${F}/back/card-back.webp`} alt="" decoding="async" />
      </span>
    </span>
  );
}

function ConceptFace({ card, sizes, priority, foil, caption }: { card: CardFace; sizes: string; priority?: boolean; foil?: boolean; caption?: boolean }) {
  return (
    <span className={styles.wrap}>
      <span className={styles.card}>
        <span className={styles.art}>
          <Image src={card.art} alt="" fill sizes={sizes} priority={priority} />
        </span>
        <span className={styles.plate}>
          <span className={styles.name}>{card.name}</span>
          <span className={styles.meta}>
            <span>{setBySlug(card.set).name}</span>
            <span className={styles.rule} />
            <span>{cardNo(card)}</span>
          </span>
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {foil && <img className={styles.layer} src="/labs/cards/layers/foil-overlay.svg" alt="" />}
      </span>
      {caption && <span className={styles.caption}>{card.name}</span>}
    </span>
  );
}

/* The back's wave lattice: two families of sine lines, one the mirror of the other, built once here. */
const waves = (() => {
  const rows: string[] = [];
  const amp = 17;
  const len = 150;
  for (let y = 40; y <= 1010; y += 44) {
    for (const sign of [1, -1]) {
      let d = `M0 ${y}`;
      for (let x = 0; x < 750; x += len) {
        d += ` Q${x + len / 4} ${y - sign * amp} ${x + len / 2} ${y} T${x + len} ${y}`;
      }
      rows.push(d);
    }
  }
  return rows.join(" ");
})();

/** The concept sets' back: teal, a fine wave lattice and one small diamond, in a thin cream border. */
export function CardBack() {
  return (
    <span className={styles.wrap}>
      <span className={`${styles.card} ${styles.backCard}`}>
        <svg className={styles.layer} viewBox="0 0 750 1050" aria-hidden="true">
          <rect x="22" y="22" width="706" height="1006" rx="14" fill="#173f47" />
          <svg x="22" y="22" width="706" height="1006" viewBox="22 22 706 1006">
            <path d={waves} fill="none" stroke="#d8b98a" strokeOpacity="0.34" strokeWidth="1.6" />
          </svg>
          <path d="M375 493 L392 525 L375 557 L358 525 Z" fill="#d9774a" />
        </svg>
      </span>
    </span>
  );
}

/**
 * A concept set's foil pack (`cards/card-set-and-packs.png`). The top strip is its own element so it can be
 * torn off; `torn` leaves it off.
 */
export function Pack({
  set,
  sizes = "300px",
  priority,
  torn,
  tearing,
}: {
  set: CardSet;
  sizes?: string;
  priority?: boolean;
  torn?: boolean;
  tearing?: boolean;
}) {
  return (
    <span className={styles.packWrap} data-torn={torn || undefined} data-tearing={tearing || undefined}>
      <span className={styles.pack}>
        <span className={styles.packArt}>
          <Image src={set.lead} alt="" fill sizes={sizes} priority={priority} />
        </span>
        <span className={styles.packLabel} aria-hidden="true">
          <span className={styles.packSet}>{set.name}</span>
          <span className={styles.packKind}>Art cards</span>
        </span>
      </span>
      <span className={styles.packTop} />
      <span className={styles.tearLine} />
    </span>
  );
}
