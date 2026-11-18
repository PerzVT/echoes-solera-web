import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Card } from "../Card";
import { maskOf } from "@/lib/labs/cards";
import type { FlockCard } from "@/lib/labs/cards/flock";
import { no3, packById, rarityName } from "@/lib/labs/cards/rules";
import type { Stub } from "@/lib/labs/cards/demo";
import styles from "./Tile.module.css";

const F = "/labs/cards/flock";

/** One entry in the collection. "card" covers numbered cards, secrets and the goal; "teaser" is the "+ ?" tile. */
export type Entry = { t: "card"; card: FlockCard } | { t: "teaser" } | { t: "stub"; stub: Stub };
export const entryKey = (e: Entry) => (e.t === "card" ? e.card.id : e.t === "stub" ? e.stub.id : "teaser");

export type TileState = { owned: number; isNew: boolean; goalLeft?: number };

type Props = { entry: Entry; state: TileState; flash?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>;

export function tileLabel(e: Entry, s: TileState) {
  if (e.t === "teaser") return "Secret cards, none found yet";
  if (e.t === "stub") return `${no3(e.stub.no)}, missing`;
  const c = e.card;
  const n = `${no3(c.no)}/060`;
  if (c.rarity === "G") return s.owned ? `${n} ${c.name}, goal card` : `${n}, goal card, locked. Find all 66`;
  if (s.owned) return `${n} ${c.name}, ${rarityName[c.rarity]}${s.owned > 1 ? `, ${s.owned} copies` : ""}${s.isNew ? ", new" : ""}`;
  if (c.hidden || c.secret) return `${n}, hidden. ${c.hint}`;
  return `${n}, missing, ${rarityName[c.rarity]}, in ${packById(c.pack!)!.name} packs`;
}

/**
 * A pocket in the grid or binder. Owned: the card face from its thumbnail, with New and the copy count.
 * Missing: the duck's silhouette from its mask, the number and the rarity mark. Hidden and secret: "?" and the
 * hint line. The goal: locked with "Find all 66" until it is won.
 */
export const Tile = forwardRef<HTMLButtonElement, Props>(function Tile({ entry, state, flash, className, ...rest }, ref) {
  const cls = [styles.tile, className].filter(Boolean).join(" ");
  const label = tileLabel(entry, state);
  if (entry.t === "teaser") {
    return (
      <button ref={ref} type="button" className={cls} data-kind="teaser" aria-label={label} {...rest}>
        <span className={styles.slot} data-look="secret">
          <span className={styles.big} aria-hidden="true">
            + ?
          </span>
        </span>
      </button>
    );
  }
  if (entry.t === "stub") {
    const s = entry.stub;
    return (
      <button ref={ref} type="button" className={cls} data-kind="missing" data-flash={flash || undefined} aria-label={label} {...rest}>
        <span className={styles.slot}>
          <span className={styles.shadow} style={{ "--mask": `url(${maskOf(s)})` } as React.CSSProperties} />
          <span className={styles.no}>{no3(s.no)}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.mark} src={`${F}/marks/rarity-${s.rarity.toLowerCase()}.svg`} alt="" />
        </span>
      </button>
    );
  }
  const c = entry.card;
  if (state.owned) {
    return (
      <button ref={ref} type="button" className={cls} data-kind="owned" data-card={c.id} data-flash={flash || undefined} aria-label={label} {...rest}>
        <Card card={c} thumb />
        {state.isNew && <span className={styles.newTag}>New</span>}
        {state.owned > 1 && <span className={styles.count}>{`x${state.owned}`}</span>}
      </button>
    );
  }
  if (c.rarity === "G") {
    return (
      <button ref={ref} type="button" className={cls} data-kind="goal" data-card={c.id} data-flash={flash || undefined} aria-label={label} {...rest}>
        <span className={styles.slot} data-look="goal">
          <span className={styles.lock} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 10h14v11H5ZM8 10V6a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <span className={styles.hint}>Find all 66</span>
          <span className={styles.no}>067</span>
        </span>
      </button>
    );
  }
  if (c.hidden || c.secret) {
    return (
      <button ref={ref} type="button" className={cls} data-kind="hidden" data-card={c.id} data-flash={flash || undefined} aria-label={label} {...rest}>
        <span className={styles.slot} data-look={c.secret ? "secret" : "hidden"}>
          <span className={styles.big} aria-hidden="true">
            ?
          </span>
          <span className={styles.hint}>{c.hint}</span>
          <span className={styles.no}>{no3(c.no)}</span>
        </span>
      </button>
    );
  }
  return (
    <button ref={ref} type="button" className={cls} data-kind="missing" data-card={c.id} data-flash={flash || undefined} aria-label={label} {...rest}>
      <span className={styles.slot}>
        <span className={styles.shadow} style={{ "--mask": `url(${maskOf(c)})` } as React.CSSProperties} />
        <span className={styles.no}>{no3(c.no)}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.mark} src={`${F}/marks/rarity-${c.rarity.toLowerCase()}.svg`} alt="" />
      </span>
    </button>
  );
});
