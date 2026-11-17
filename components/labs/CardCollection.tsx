"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button, ButtonLink } from "./Button";
import { Card, CardBack } from "./Card";
import { GestureIcon, ReplayIcon } from "./fx/AnimatedIcon";
import { cardsIn, sets, setBySlug, type CardFace } from "@/lib/labs/cards";
import styles from "./CardCollection.module.css";

/**
 * The colour of a card's art: its pixels averaged at 24 x 24, each weighted by how saturated it is, so
 * the hue comes from the picture and not from its pale ground. Read once per card and kept.
 */
const tints = new Map<string, Promise<string | null>>();
function tintOf(src: string) {
  let t = tints.get(src);
  if (!t) {
    t = new Promise((resolve) => {
      const img = new window.Image();
      img.decoding = "async";
      img.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = c.height = 24;
          const g = c.getContext("2d", { willReadFrequently: true });
          if (!g) return resolve(null);
          g.drawImage(img, 0, 0, 24, 24);
          const d = g.getImageData(0, 0, 24, 24).data;
          let r = 0, gr = 0, b = 0, w = 0;
          for (let i = 0; i < d.length; i += 4) {
            const max = Math.max(d[i], d[i + 1], d[i + 2]);
            const min = Math.min(d[i], d[i + 1], d[i + 2]);
            const k = 0.05 + (max - min) / 255;
            r += d[i] * k;
            gr += d[i + 1] * k;
            b += d[i + 2] * k;
            w += k;
          }
          resolve(`rgb(${Math.round(r / w)} ${Math.round(gr / w)} ${Math.round(b / w)})`);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
    tints.set(src, t);
  }
  return t;
}

/**
 * The collection as a binder, one set to a spread. A set has four cards, so each page holds two
 * pockets and every pocket is filled (the kit's binder photograph has nine pockets on one page and a
 * cloth cover opposite, which would leave most of it empty). A card opens large.
 */
export function CardCollection() {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<CardFace | null>(null);
  const [foil, setFoil] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [turns, setTurns] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const binder = useRef<HTMLDivElement>(null);
  // The desk takes the colour of the card under the pointer or keyboard focus, and keeps the last one
  // until another card is chosen. Off under reduced motion.
  const [tint, setTint] = useState<string | null>(null);
  const want = useRef<string | null>(null);
  const tintTo = (c: CardFace) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    want.current = c.art;
    tintOf(c.art).then((col) => {
      if (col && want.current === c.art) setTint(col);
    });
  };
  const uid = useId();
  const set = sets[page];
  const cards = cardsIn(set.slug);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // Focus starts on the finish that is on, not on the first button.
      d.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  // ?card=<id> opens that card, so a card can be linked to.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("card");
    const found = id && cardsIn(sets[0].slug).concat(...sets.slice(1).map((s) => cardsIn(s.slug))).find((c) => c.id === id);
    if (found) {
      setPage(Math.max(0, sets.findIndex((s) => s.slug === found.set)));
      setOpen(found);
    }
  }, []);

  const show = (c: CardFace) => {
    setFlipped(false);
    setOpen(c);
  };

  // Closing a card opened from ?card= drops the parameter, so a refresh does not open it again.
  // The native dialog hands focus back to whatever opened it. A card opened from the link had no opener,
  // so focus goes to that card's pocket instead of being dropped on the page.
  const close = () => {
    const was = open;
    setOpen(null);
    requestAnimationFrame(() => {
      const a = document.activeElement;
      if (was && (!a || a === document.body)) binder.current?.querySelector<HTMLButtonElement>(`[data-card="${was.id}"]`)?.focus();
    });
    const url = new URL(window.location.href);
    if (url.searchParams.has("card")) {
      url.searchParams.delete("card");
      window.history.replaceState(window.history.state, "", url);
    }
  };

  // The tabs follow the ARIA pattern: one tab stop, arrows move between sets, Home and End jump to the ends.
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = sets.length - 1;
    const keys: Record<string, number> = { ArrowRight: page === last ? 0 : page + 1, ArrowLeft: page === 0 ? last : page - 1, Home: 0, End: last };
    const to = keys[e.key];
    if (to === undefined) return;
    e.preventDefault();
    setPage(to);
    tabs.current[to]?.focus();
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
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const rest = () => {
    big.current?.style.setProperty("--rx", "0deg");
    big.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <>
      <span className={styles.tint} style={tint ? ({ "--tint": tint } as React.CSSProperties) : undefined} data-on={tint ? "" : undefined} aria-hidden="true" />
      <div className={styles.head}>
        <h1 className="display">Collection</h1>
        <div className={styles.tabs} role="tablist" aria-label="Sets">
          {sets.map((s, i) => (
            <button
              key={s.slug}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`${uid}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={i === page}
              aria-controls={`${uid}-panel`}
              tabIndex={i === page ? 0 : -1}
              onClick={() => setPage(i)}
              onKeyDown={onTabKey}
            >
              {s.name}
            </button>
          ))}
        </div>
        <ButtonLink href="/cards/packs">Open a pack</ButtonLink>
      </div>

      <div className={styles.book} id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${page}`}>
        <div className={styles.binder} key={set.slug} ref={binder}>
          {[cards.slice(0, 2), cards.slice(2, 4)].map((pageCards, p) => (
            <ul key={p} className={styles.page}>
              {pageCards.map((c, i) => (
                <li key={c.id} className={styles.pocket} style={{ "--i": p * 2 + i } as React.CSSProperties}>
                  <button
                    type="button"
                    className={styles.slot}
                    data-card={c.id}
                    onClick={() => show(c)}
                    onPointerEnter={() => tintTo(c)}
                    onFocus={() => tintTo(c)}
                    aria-label={`${c.name}, ${set.name}`}
                  >
                    <Card card={c} caption sizes="(max-width: 720px) 40vw, (max-width: 1100px) 30vw, 300px" />
                  </button>
                </li>
              ))}
            </ul>
          ))}
          <span className={styles.rings} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.pager}>
        <button type="button" onClick={() => setPage((p) => (p + sets.length - 1) % sets.length)} aria-label="Previous set">
          <GestureIcon name="back" />
        </button>
        <span>{set.name}</span>
        <button type="button" onClick={() => setPage((p) => (p + 1) % sets.length)} aria-label="Next set">
          <GestureIcon name="arrow" />
        </button>
      </div>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${uid}-card`} onClose={close} onClick={(e) => e.target === dialog.current && close()}>
        {open && (
          <div className={styles.detail}>
            <div className={styles.scene} onPointerMove={tilt} onPointerLeave={rest}>
              <div ref={big} className={styles.big}>
                {/* Both faces are always there, back to back; the turner rotates them as one. */}
                <div className={styles.turner} data-flipped={flipped}>
                  <div className={styles.face} aria-hidden={flipped}>
                    <Card card={open} sizes="(max-width: 720px) 80vw, 420px" priority />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={styles.foil} data-on={foil} src="/labs/cards/layers/foil-overlay.svg" alt="" />
                    <span className={styles.glare} data-on={foil} />
                  </div>
                  <div className={`${styles.face} ${styles.back}`} aria-hidden={!flipped}>
                    <CardBack />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.info}>
              <h2 id={`${uid}-card`} className="h1">
                {open.name}
              </h2>
              <p className={styles.from}>{setBySlug(open.set).name}</p>
              <div className={styles.finish} role="group" aria-label="Finish">
                <button type="button" aria-pressed={!foil} onClick={() => setFoil(false)}>
                  Matte
                </button>
                <button type="button" aria-pressed={foil} onClick={() => setFoil(true)}>
                  Foil
                </button>
              </div>
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
                <Button variant="quiet" onClick={close}>
                  Back to the collection
                </Button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
