"use client";

import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { Button, ButtonLink } from "../Button";
import { Card, FlockBack } from "../Card";
import { Icon } from "../Icon";
import { ReplayIcon } from "../fx/AnimatedIcon";
import { maskOf } from "@/lib/labs/cards";
import type { FlockCard } from "@/lib/labs/cards/flock";
import { cardNumber, has, packById, priceOf, rarityName } from "@/lib/labs/cards/rules";
import { buyCard, markSeen, useCards } from "@/lib/labs/cards/store";
import styles from "./CardDialog.module.css";

const TRAITS: [keyof FlockCard["traits"], string][] = [
  ["skin", "Plumage"],
  ["body", "Outfit"],
  ["hat", "Hat"],
  ["face", "Face"],
  ["foot", "Feet"],
  ["background", "Ground"],
];

/**
 * A card opened large in a modal dialog. The native dialog traps focus and hands it back to the pocket that
 * opened it. An owned card tilts under the pointer (the frame's foil follows) and turns over. A missing card
 * says which pack holds it and what it costs in feathers, and can be bought when the balance allows.
 */
export function CardDialog({ card, onClose, returnTo }: { card: FlockCard | null; onClose: () => void; returnTo?: () => HTMLElement | null }) {
  const ref = useRef<HTMLDialogElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const uid = useId();
  const s = useCards();
  const [flipped, setFlipped] = useState(false);
  const [turns, setTurns] = useState(0);
  const [bought, setBought] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (card && !d.open) {
      setFlipped(false);
      setBought(false);
      d.showModal();
    }
    if (!card && d.open) d.close();
  }, [card]);

  const owned = card ? (s.owned[card.id] ?? 0) : 0;
  // Looking at a card clears its New mark.
  useEffect(() => {
    if (card && owned) markSeen([card.id]);
  }, [card, owned]);

  const close = () => {
    onClose();
    requestAnimationFrame(() => {
      const a = document.activeElement;
      if (!a || a === document.body) returnTo?.()?.focus();
    });
  };

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = big.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 14).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 18).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
  };
  const rest = () => {
    big.current?.style.setProperty("--rx", "0deg");
    big.current?.style.setProperty("--ry", "0deg");
  };

  const pack = card?.pack ? packById(card.pack) : undefined;
  const price = card ? priceOf(card) : null;
  const masked = card && !owned && (card.hidden || card.secret);
  const goal = card?.rarity === "G";
  const title = !card ? "" : owned ? card.name : goal ? "The goal card" : masked ? "Not found yet" : `Card ${cardNumber(card).slice(0, 3)}`;

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby={`${uid}-t`} onClose={close} onClick={(e) => e.target === ref.current && close()}>
      {card && (
        <div className={styles.detail}>
          <button type="button" className={styles.x} onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
          <div className={styles.scene} onPointerMove={owned ? tilt : undefined} onPointerLeave={rest}>
            <div ref={big} className={styles.big}>
              {owned ? (
                <div className={styles.turner} data-flipped={flipped}>
                  <div className={styles.face} aria-hidden={flipped}>
                    <Card card={card} sizes="(max-width: 720px) 80vw, 420px" priority />
                    <span className={styles.glare} />
                  </div>
                  <div className={`${styles.face} ${styles.back}`} aria-hidden={!flipped}>
                    <FlockBack />
                  </div>
                </div>
              ) : (
                <div className={styles.empty} data-look={goal || card.secret ? "dark" : undefined}>
                  {masked || goal ? (
                    <span className={styles.q} aria-hidden="true">
                      ?
                    </span>
                  ) : (
                    <span className={styles.shadow} style={{ "--mask": `url(${maskOf(card)})` } as React.CSSProperties} />
                  )}
                  <span className={styles.emptyNo}>{cardNumber(card)}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.info}>
            <h2 id={`${uid}-t`} className="h1">
              {title}
            </h2>
            <p className={styles.meta}>
              <span>{cardNumber(card)}</span>
              {(owned || !masked) && <span>{rarityName[card.rarity]}</span>}
              {pack && <span>{pack.name}</span>}
            </p>

            {owned ? (
              <>
                <p className={styles.flavor}>{card.flavor}</p>
                <dl className={styles.traits}>
                  {TRAITS.map(([k, label]) => (
                    <div key={k}>
                      <dt>{label}</dt>
                      <dd>{card.traits[k]}</dd>
                    </div>
                  ))}
                </dl>
                <p className={styles.copies}>{owned > 1 ? `${owned} copies, ${owned - 1} ${owned === 2 ? "duplicate" : "duplicates"}` : "1 copy"}</p>
                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFlipped((f) => !f);
                      setTurns((n) => n + 1);
                    }}
                    icon={<ReplayIcon turn={turns} size={18} />}
                  >
                    {flipped ? "Show the front" : "Turn it over"}
                  </Button>
                </div>
              </>
            ) : goal ? (
              <>
                <p className={styles.hint}>Find all 66</p>
                <p className={styles.copies}>{`${Object.keys(s.owned).filter((id) => id !== card.id && has(s.owned, id)).length} of 66 found`}</p>
              </>
            ) : (
              <>
                {masked && <p className={styles.hint}>{card.hint}</p>}
                {pack && <p className={styles.where}>{`In ${pack.name} packs, ${String(pack.range[0]).padStart(3, "0")} to ${String(pack.range[1]).padStart(3, "0")}`}</p>}
                {price !== null ? (
                  <>
                    <p className={styles.price}>
                      <strong>{`${price} feathers`}</strong>
                      <span>{`You have ${s.feathers}`}</span>
                    </p>
                    <div className={styles.actions}>
                      <Button disabled={s.feathers < price} success={bought} onClick={() => buyCard(card.id).ok && setBought(true)}>
                        Buy with feathers
                      </Button>
                      {pack && (
                        <ButtonLink variant="secondary" href={`/cards/packs?pack=${pack.id}`}>
                          {`Open a ${pack.name} pack`}
                        </ButtonLink>
                      )}
                    </div>
                  </>
                ) : (
                  pack && (
                    <div className={styles.actions}>
                      <ButtonLink href={`/cards/packs?pack=${pack.id}`}>{`Open a ${pack.name} pack`}</ButtonLink>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
