"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Picture as Image } from "../fx/Picture";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { VerticalPlayer } from "../VerticalPlayer";
import type { Episode } from "@/lib/labs/series";
import { Coin, coins } from "./Coin";
import { Sheet } from "./Sheet";
import { addCoins, episodeKey, resumeAt, saveProgress, unlock, useAccess, watched, type AccessState } from "./store";
import type { SheetName } from "./sheets";
import styles from "./access.module.css";


type Props = {
  slug: string;
  title: string;
  episodes: Episode[];
  /** The episode in the URL, if any. Without one the visitor's last episode of this series is shown. */
  wanted?: number;
  /** A screen opened from the URL. */
  sheet: SheetName | null;
  /** A start position from the URL, in seconds. */
  t?: number;
  base: string;
  seriesHref: string;
  backLabel: string;
  listLabel: string;
};

const nameOf = (e: Episode) => e.title ?? `Episode ${e.number}`;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const day = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** The episode the visitor was last on in this series, if any. */
export function lastEpisode(a: AccessState, slug: string) {
  const key = [...a.history].reverse().find((k) => k.startsWith(`${slug}:`));
  return key ? Number(key.slice(slug.length + 1)) : undefined;
}

/** The series watch section: player or locked screen, the balance, the episode list and the early-access sheets. */
export function SeriesWatch({ slug, title, episodes, wanted, sheet: fromUrl, t, base, seriesHref, backLabel, listLabel }: Props) {
  const access = useAccess();
  const isOpen = (e: Episode) => !e.early || access.unlocked.includes(episodeKey(slug, e.number));

  const resumeNumber = wanted ?? lastEpisode(access, slug);
  const item = episodes.find((e) => e.number === resumeNumber) ?? episodes[0];
  const key = episodeKey(slug, item.number);
  const next = episodes.find((e) => e.number === item.number + 1);
  const previous = episodes.find((e) => e.number === item.number - 1);
  const open = isOpen(item);
  const href = (n: number) => `${base}?ep=${n}#watch`;

  // The sheet follows the URL when it changes, and local actions otherwise.
  const [sheet, setSheet] = useState<SheetName | null>(fromUrl);
  const [urlSheet, setUrlSheet] = useState(fromUrl);
  if (urlSheet !== fromUrl) {
    setUrlSheet(fromUrl);
    setSheet(fromUrl);
  }
  // An unlock sheet only makes sense on an episode that is still locked.
  const shown = sheet === "unlock" && open ? null : sheet;

  const closeSheet = useCallback(() => {
    setSheet(null);
    // Drop the screen from the address so a reload lands on the page, not the sheet.
    const url = new URL(window.location.href);
    if (url.searchParams.has("state")) {
      url.searchParams.delete("state");
      window.history.replaceState(window.history.state, "", url);
    }
  }, []);

  const confirmUnlock = () => {
    unlock(key, item.price ?? 1, `${title}, ${nameOf(item)}`);
    closeSheet();
    // The unlock button is gone once the video mounts; focus moves to the episode in the list.
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-episode="${item.number}"]`)?.focus({ preventScroll: true }));
  };

  const onProgress = useCallback((time: number, length: number, done: boolean) => saveProgress(key, time, length, done), [key]);
  const start = t ?? resumeAt(access.progress[key]);

  const titles: Record<SheetName, string> = {
    unlock: `Unlock ${nameOf(item)}`,
    wallet: "Your coins",
    topup: "Add coins",
    how: "How early access works",
  };

  return (
    <>
      <div className={styles.watchRow}>
        <div className={styles.player}>
          <VerticalPlayer
            src={item.video}
            poster={item.poster}
            label={nameOf(item)}
            index={item.number}
            previous={previous && href(previous.number)}
            previousLabel={previous && nameOf(previous)}
            next={next && href(next.number)}
            nextLabel={next && nameOf(next)}
            seriesHref={seriesHref}
            backLabel={backLabel}
            start={start}
            onProgress={onProgress}
            locked={
              open ? undefined : (
                <div className={styles.locked}>
                  <span className={styles.lockMark}>
                    <Icon name="lock" size={26} />
                  </span>
                  <p className="h2">{nameOf(item)} is out early</p>
                  <p className={styles.lockMeta}>
                    {clock(item.seconds)} <span aria-hidden="true">·</span> {coins(item.price ?? 1)}
                  </p>
                  <Button onClick={() => setSheet("unlock")} icon={<Coin size={18} />}>
                    Unlock for {coins(item.price ?? 1)}
                  </Button>
                  <button type="button" className={styles.textButton} onClick={() => setSheet("how")}>
                    How early access works
                  </button>
                </div>
              )
            }
          />
        </div>

        <div className={styles.side}>
          <div className={styles.purse}>
            <Button variant="secondary" size="small" icon={<Coin size={16} />} onClick={() => setSheet("wallet")} aria-label={`Your coins: ${coins(access.balance)}`}>
              {coins(access.balance)}
            </Button>
            <Button variant="quiet" size="small" onClick={() => setSheet("how")}>
              How early access works
            </Button>
          </div>

          <h3 className="sr-only">{listLabel}</h3>
          <ol className={styles.episodes}>
            {episodes.map((e) => {
              const k = episodeKey(slug, e.number);
              const p = access.progress[k];
              const locked = !isOpen(e);
              const done = watched(p);
              const part = p && !done ? Math.min(1, p.t / p.d) : done ? 1 : 0;
              const status = locked
                ? coins(e.price ?? 1)
                : done
                  ? "Watched"
                  : p && p.t >= 3
                    ? `${clock(Math.max(0, p.d - p.t))} left`
                    : e.early
                      ? "Unlocked"
                      : clock(e.seconds);
              return (
                <li key={e.number}>
                  <Link
                    href={href(e.number)}
                    scroll={false}
                    data-episode={e.number}
                    data-locked={locked || undefined}
                    aria-current={e.number === item.number ? "true" : undefined}
                  >
                    <span className={styles.thumb}>
                      <Image src={e.poster} alt="" width={200} height={356} sizes="120px" />
                      {part > 0 && (
                        <span className={styles.progress} aria-hidden="true">
                          <span style={{ width: `${part * 100}%` }} />
                        </span>
                      )}
                    </span>
                    <span className={styles.epName}>
                      <span>{nameOf(e)}</span>
                      <span className="small muted">
                        {locked || done || (p && p.t >= 3) || e.early ? `${clock(e.seconds)} · ${status}` : status}
                      </span>
                    </span>
                    {locked && <span className="sr-only">, early access</span>}
                    <span className={styles.epEnd} aria-hidden="true">
                      {locked ? <Icon name="lock" size={18} /> : done ? <Icon name="check" size={18} /> : <Icon name="play" size={16} />}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <Sheet open={!!shown} title={shown ? titles[shown] : ""} onClose={closeSheet}>
        {shown === "unlock" && <UnlockBody episode={item} title={title} balance={access.balance} onConfirm={confirmUnlock} onCancel={closeSheet} onHow={() => setSheet("how")} />}
        {shown === "wallet" && <WalletBody access={access} onTopUp={() => setSheet("topup")} onHow={() => setSheet("how")} />}
        {shown === "topup" && (
          <TopUpBody
            onAdd={(n) => {
              addCoins(n);
              setSheet("wallet");
            }}
          />
        )}
        {shown === "how" && <HowBody onWallet={() => setSheet("wallet")} />}
      </Sheet>
    </>
  );
}

function UnlockBody({
  episode,
  title,
  balance,
  onConfirm,
  onCancel,
  onHow,
}: {
  episode: Episode;
  title: string;
  balance: number;
  onConfirm: () => void;
  onCancel: () => void;
  onHow: () => void;
}) {
  const price = episode.price ?? 1;
  const short = Math.max(0, price - balance);
  return (
    <div className={styles.stack}>
      <div className={styles.story}>
        <Image src={episode.poster} alt="" width={120} height={213} sizes="60px" />
        <div>
          <p className={styles.storyTitle}>{title}</p>
          <p className="small muted">
            {nameOf(episode)} · {clock(episode.seconds)}
          </p>
        </div>
      </div>
      <dl className={styles.rows}>
        <div>
          <dt>Episode price</dt>
          <dd>{coins(price)}</dd>
        </div>
        <div>
          <dt>Your balance</dt>
          <dd>{coins(balance)}</dd>
        </div>
        {short > 0 && (
          <div>
            <dt>Coins added now</dt>
            <dd>{coins(short)}</dd>
          </div>
        )}
        <div className={styles.total}>
          <dt>Balance after</dt>
          <dd>{coins(balance + short - price)}</dd>
        </div>
      </dl>
      <p className="small muted">A one-time unlock. Replay it any time. No subscription.</p>
      <div className={styles.actions}>
        <Button onClick={onConfirm} data-autofocus icon={<Coin size={18} />}>
          {short ? `Add ${coins(short)} and unlock` : `Unlock for ${coins(price)}`}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Not now
        </Button>
      </div>
      <button type="button" className={styles.textButton} onClick={onHow}>
        How early access works
      </button>
    </div>
  );
}

function WalletBody({ access, onTopUp, onHow }: { access: AccessState; onTopUp: () => void; onHow: () => void }) {
  const receipts = [...access.receipts].reverse();
  return (
    <div className={styles.stack}>
      <div className={styles.balance}>
        <Coin size={34} />
        <span className={styles.balanceNumber}>{access.balance}</span>
        <span className="muted">{access.balance === 1 ? "coin" : "coins"}</span>
      </div>
      <div className={styles.actions}>
        <Button onClick={onTopUp} data-autofocus icon={<Icon name="plus" size={18} />}>
          Add coins
        </Button>
        <Button variant="secondary" onClick={onHow}>
          How early access works
        </Button>
      </div>
      <h3 className={styles.subhead}>Recent activity</h3>
      {receipts.length ? (
        <ul className={styles.receipts}>
          {receipts.map((r) => (
            <li key={r.id}>
              <span className={styles.receiptIcon} aria-hidden="true">
                {r.kind === "unlock" ? <Icon name="lock" size={16} /> : <Coin size={16} />}
              </span>
              <span className={styles.receiptText}>
                <span>{r.title}</span>
                <span className="small muted">
                  {day(r.at)} · {r.kind === "unlock" ? "Early access" : "Coins added"}
                </span>
              </span>
              <span className={styles.receiptAmount} data-kind={r.kind}>
                {r.kind === "unlock" ? "−" : "+"}
                {coins(r.coins)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Your unlocks and added coins appear here.</p>
      )}
    </div>
  );
}

const PACKS = [1, 5, 10];

function TopUpBody({ onAdd }: { onAdd: (n: number) => void }) {
  const [amount, setAmount] = useState(5);
  return (
    <form
      className={styles.stack}
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(amount);
      }}
    >
      <fieldset className={styles.packs}>
        <legend className="sr-only">How many coins</legend>
        {PACKS.map((n) => (
          <label key={n} className={styles.pack}>
            <input type="radio" name="coins" value={n} checked={amount === n} onChange={() => setAmount(n)} data-autofocus={n === amount || undefined} />
            <Coin size={22} />
            <span className={styles.packCount}>{n}</span>
            <span className="small muted">{n === 1 ? "coin" : "coins"}</span>
          </label>
        ))}
      </fieldset>
      <p className="small muted">One coin unlocks one early episode.</p>
      <div className={styles.actions}>
        <Button type="submit" icon={<Icon name="plus" size={18} />}>
          Add {coins(amount)}
        </Button>
      </div>
    </form>
  );
}

function HowBody({ onWallet }: { onWallet: () => void }) {
  return (
    <div className={styles.stack}>
      <ul className={styles.rules}>
        <li>
          <Icon name="play" size={16} />
          <span>Released episodes are free to watch.</span>
        </li>
        <li>
          <Icon name="lock" size={18} />
          <span>The two newest episodes of a series come out early. Each one unlocks for 1 coin.</span>
        </li>
        <li>
          <Coin size={18} />
          <span>The price and your balance show before you unlock. If you are short, the unlock adds exactly the coins you need.</span>
        </li>
        <li>
          <Icon name="check" size={18} />
          <span>An unlock is a one-time purchase you can replay. No subscription, and nothing unlocks by itself.</span>
        </li>
      </ul>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onWallet} data-autofocus icon={<Coin size={18} />}>
          See your coins
        </Button>
      </div>
    </div>
  );
}
