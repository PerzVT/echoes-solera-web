"use client";

import { useEffect, useRef, useState } from "react";
import { Button, ButtonLink } from "./Button";
import { Card, CardBack, Pack } from "./Card";
import { cardsIn, sets, setBySlug, type CardFace, type CardSet } from "@/lib/labs/cards";
import styles from "./PackOpening.module.css";

type Stage = "choose" | "sealed" | "tearing" | "open";

/** Three of the set's cards, in a random order. */
function draw(set: CardSet): CardFace[] {
  const pool = [...cardsIn(set.slug)];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

/** Tear length in ms; matches @keyframes pack-tear in Card.module.css. */
const TEAR_MS = 760;

/**
 * Choose a set's pack, tear it open, and its cards come out face down on the teal stage; turn each one
 * over. `?set=<slug>` starts at that set's pack; `?state=open|turned` opens part-way, for links and checks.
 */
export function PackOpening() {
  const [stage, setStage] = useState<Stage>("choose");
  const [set, setSet] = useState<CardSet>(sets[0]);
  const [pulled, setPulled] = useState<CardFace[]>([]);
  const [turned, setTurned] = useState<boolean[]>([false, false, false]);
  const allTurned = turned.every(Boolean);
  const sealedRef = useRef<HTMLButtonElement>(null);
  const firstCard = useRef<HTMLButtonElement>(null);
  const firstPack = useRef<HTMLButtonElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const s = sets.find((x) => x.slug === q.get("set"));
    const state = q.get("state");
    if (s) setSet(s);
    if (state === "open" || state === "turned") {
      const from = s ?? sets[0];
      setPulled(cardsIn(from.slug).slice(0, 3));
      setTurned(state === "turned" ? [true, true, true] : [false, false, false]);
      setStage("open");
    } else if (s) setStage("sealed");
  }, []);

  // Focus follows the stage once the visitor has acted, so a keyboard user is never left on a removed button.
  useEffect(() => {
    if (!moved.current) return;
    if (stage === "sealed") sealedRef.current?.focus();
    if (stage === "open") firstCard.current?.focus();
    if (stage === "choose") firstPack.current?.focus();
  }, [stage]);

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const choose = (s: CardSet) => {
    moved.current = true;
    setSet(s);
    setStage("sealed");
  };
  const tear = () => {
    if (stage !== "sealed") return;
    moved.current = true;
    setPulled(draw(set));
    setTurned([false, false, false]);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage("open");
      return;
    }
    setStage("tearing");
    timer.current = setTimeout(() => setStage("open"), TEAR_MS);
  };
  const again = () => {
    moved.current = true;
    setStage("choose");
  };

  if (stage === "choose") {
    return (
      <div className={styles.wrap}>
        <h1 className="h1">Choose a pack</h1>
        <ul className={styles.choices}>
          {sets.map((s, i) => (
            <li key={s.slug} style={{ "--i": i } as React.CSSProperties}>
              <button ref={i === 0 ? firstPack : undefined} type="button" className={styles.choice} onClick={() => choose(s)}>
                <Pack set={s} sizes="(max-width: 720px) 30vw, 240px" priority />
                <span className={styles.choiceName}>{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (stage !== "open") {
    const tearing = stage === "tearing";
    return (
      <div className={styles.wrap}>
        <h1 className="h1">{set.name}</h1>
        <button
          ref={sealedRef}
          type="button"
          className={styles.sealed}
          data-tearing={tearing}
          onClick={tear}
          aria-label={`Tear the ${set.name} pack open`}
        >
          <Pack set={set} sizes="(max-width: 720px) 60vw, 320px" priority tearing={tearing} />
        </button>
        <div className={styles.actions}>
          <Button onClick={tear} loading={tearing}>
            Tear it open
          </Button>
          <Button variant="quiet" onClick={again} disabled={tearing}>
            Choose another pack
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1 className="h1">{allTurned ? "Your cards" : "Turn them over"}</h1>
      <ul className={styles.spread}>
        {pulled.map((c, i) => (
          <li key={c.id} style={{ "--i": i } as React.CSSProperties}>
            <button
              ref={i === 0 ? firstCard : undefined}
              type="button"
              className={styles.flip}
              data-turned={turned[i]}
              onClick={() => setTurned((t) => t.map((v, j) => (j === i ? true : v)))}
              aria-label={turned[i] ? `${c.name}, ${setBySlug(c.set).name}` : "Turn this card over"}
              aria-disabled={turned[i]}
            >
              <span className={styles.faceBack}>
                <CardBack />
              </span>
              <span className={styles.faceFront}>
                <Card card={c} sizes="(max-width: 720px) 30vw, 300px" foil />
              </span>
            </button>
            {/* The name under a card too narrow to print it (PackOpening.module.css). */}
            <span className={styles.under} aria-hidden="true">
              {turned[i] ? c.name : ""}
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        {allTurned ? (
          <>
            <Button onClick={again}>Open another pack</Button>
            <ButtonLink href="/cards" variant="secondary">
              See the collection
            </ButtonLink>
          </>
        ) : (
          <>
            <Button onClick={() => setTurned([true, true, true])}>Turn them all over</Button>
            <Button variant="secondary" onClick={again}>
              Open another pack
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
