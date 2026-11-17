import { Picture as Image } from "@/components/labs/fx/Picture";
import { cardNo, setBySlug, type CardFace, type CardSet } from "@/lib/labs/cards";
import styles from "./Card.module.css";

/**
 * A card face in the design of Codex's card study (`cards/illustration-study.png`): the art fills the
 * card inside a thin cream border, and a cream nameplate along the foot reads the name, the set and the
 * card's position in its set. Proportion is the kit's 750 x 1050.
 *
 * Text is never drawn below 11 px: the name hides on cards narrower than 204 px and the set line on
 * cards narrower than 367 px (Card.module.css). With `caption`, a card too narrow for its name shows
 * the name under the card instead.
 */
export function Card({
  card,
  sizes = "240px",
  priority,
  foil,
  caption,
}: {
  card: CardFace;
  sizes?: string;
  priority?: boolean;
  foil?: boolean;
  caption?: boolean;
}) {
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

/** The card back from the study: teal, a fine wave lattice and one small diamond, in a thin cream border. */
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
 * A set's foil pack after the study (`cards/card-set-and-packs.png`): cream foil, crimped ends, the
 * set's lead card art in a window and the set's name under it. The top strip is its own element so the
 * pack opening can tear it off; `torn` leaves it off.
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
  /** Plays the tear: light runs along the seam, the strip lifts off, the pack sinks (760 ms). */
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
