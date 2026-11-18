"use client";

import { memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";
import { CardDialog } from "./cards/CardDialog";
import { SettingsSheet } from "./cards/SettingsSheet";
import { Tile, entryKey, type Entry, type TileState } from "./cards/Tile";
import { flockCards, type FlockCard } from "@/lib/labs/cards/flock";
import { demoState, stressStubs, type Stub } from "@/lib/labs/cards/demo";
import { cardById, goalId, has, no3, numberedIn, packs, rangeComplete, rarityName, rarityRank, secrets, type Rarity } from "@/lib/labs/cards/rules";
import { enterDemo, isNew, tally, useCards, type CardsState } from "@/lib/labs/cards/store";
import styles from "./CardCollection.module.css";

type Status = "all" | "missing" | "owned" | "new";
type Sort = "number" | "rarity" | "newest";
type Section = { key: string; title: string; range?: string; count?: [number, number]; complete?: boolean; entries: Entry[] };
type Row = { kind: "head"; sec: Section; top: number; h: number } | { kind: "cards"; entries: Entry[]; top: number; h: number; sec: string };

const RARITIES: Rarity[] = ["C", "U", "R", "SR", "S"];
const BY_RANK: Rarity[] = ["G", "S", "SR", "R", "U", "C"];
const HEAD_H = 68;
const MIN_TILE = 136;

const stateOf = (s: CardsState, e: Entry): TileState => {
  if (e.t !== "card") return { owned: 0, isNew: false };
  return { owned: s.owned[e.card.id] ?? 0, isNew: isNew(s, e.card.id) };
};

/**
 * Builds the sections the grid shows, from the collection, the filters and the sort. In number order they are
 * the three pack ranges, the secrets ("+ ?" until the first is found) and the goal. A hidden card that is
 * missing never matches a rarity filter, so the filter cannot give it away.
 */
function buildSections(s: CardsState, status: Status, rarity: Rarity | null, pack: string | null, sort: Sort, stubs: Stub[] | null): Section[] {
  const okStatus = (n: number, fresh: boolean) => (status === "missing" ? !n : status === "owned" ? n > 0 : status === "new" ? fresh : true);
  const match = (c: FlockCard) => {
    const n = s.owned[c.id] ?? 0;
    if (!okStatus(n, isNew(s, c.id))) return false;
    if (rarity && (c.rarity !== rarity || (!n && c.hidden))) return false;
    if (pack && c.pack !== pack) return false;
    return true;
  };
  const card = (c: FlockCard): Entry => ({ t: "card", card: c });

  if (stubs) {
    const keep = stubs.filter((x) => okStatus(0, false) && (!rarity || x.rarity === rarity));
    if (sort === "rarity") {
      return BY_RANK.map((r) => ({ key: r, title: rarityName[r], entries: keep.filter((x) => x.rarity === r).map((stub) => ({ t: "stub" as const, stub })) })).filter((x) => x.entries.length);
    }
    const ranges = Math.ceil(stubs.length / 50);
    return Array.from({ length: ranges }, (_, i) => {
      const lo = i * 50 + 1;
      const hi = Math.min(stubs.length, lo + 49);
      const entries = keep.filter((x) => x.range === i).map((stub) => ({ t: "stub" as const, stub }));
      return { key: `r${i}`, title: "Range", range: `${no3(lo)} to ${no3(hi)}`, count: [0, hi - lo + 1] as [number, number], entries };
    }).filter((x) => x.entries.length);
  }

  const anySecret = secrets.some((c) => has(s.owned, c.id));
  const teaserOk = !anySecret && okStatus(0, false) && (!rarity || rarity === "S") && !pack;
  const secretEntries: Entry[] = anySecret ? secrets.filter(match).map(card) : teaserOk ? [{ t: "teaser" }] : [];
  const goal = cardById.get(goalId)!;
  const goalOk = okStatus(s.owned[goalId] ?? 0, isNew(s, goalId)) && !rarity && !pack;
  const found = tally(s.owned, s.feathers);

  if (sort === "number") {
    const out: Section[] = packs.map((p) => ({
      key: p.id,
      title: p.name,
      range: `${no3(p.range[0])} to ${no3(p.range[1])}`,
      count: [numberedIn(p).filter((c) => has(s.owned, c.id)).length, 20] as [number, number],
      complete: rangeComplete(s.owned, p),
      entries: numberedIn(p).filter(match).map(card),
    }));
    out.push({ key: "secrets", title: "Secrets", range: "061 to 066", count: [found.secrets, 6], complete: found.secrets === 6, entries: secretEntries });
    out.push({ key: "goal", title: "Goal", range: "067", entries: goalOk ? [card(goal)] : [] });
    return out.filter((x) => x.entries.length);
  }

  const pool = flockCards.filter((c) => !c.secret && c.rarity !== "G").filter(match);
  if (sort === "rarity") {
    const hiddenMissing = pool.filter((c) => c.hidden && !has(s.owned, c.id));
    const shown = pool.filter((c) => !hiddenMissing.includes(c));
    const out: Section[] = BY_RANK.filter((r) => r !== "G" && r !== "S").map((r) => ({ key: r, title: rarityName[r], entries: shown.filter((c) => c.rarity === r).map(card) }));
    out.unshift({ key: "S", title: "Secret", entries: secretEntries });
    out.unshift({ key: "G", title: "Goal", entries: goalOk ? [card(goal)] : [] });
    out.push({ key: "hidden", title: "Hidden", entries: hiddenMissing.map(card) });
    return out.filter((x) => x.entries.length);
  }

  // Newest: what arrived last first, then everything still missing in number order.
  const all = [...pool, ...(anySecret ? secrets.filter(match) : []), ...(goalOk ? [goal] : [])];
  const got = all.filter((c) => has(s.owned, c.id)).sort((a, b) => (s.got[b.id] ?? 0) - (s.got[a.id] ?? 0) || rarityRank[b.rarity] - rarityRank[a.rarity]);
  const missing = all.filter((c) => !has(s.owned, c.id));
  return [
    { key: "newest", title: "Newest first", entries: got.map(card) },
    { key: "missing", title: "Not found yet", entries: [...missing.filter((c) => c.rarity !== "G").map(card), ...(teaserOk ? [{ t: "teaser" } as Entry] : []), ...missing.filter((c) => c.rarity === "G").map(card)] },
  ].filter((x) => x.entries.length);
}

/**
 * The collection, built to grow: a windowed grid in number order (only the rows near the screen are mounted,
 * so 500 entries scroll as lightly as 67), sections by pack range with counts and a stamp when complete,
 * filters, sort, jump to a number, and a binder view of nine-pocket pages. Missing cards are silhouettes cut
 * from each duck's cut-out; hidden ones are "?" with their hint.
 *
 * Links: ?demo=empty|half|complete shows a collection without touching the saved one, ?card=f017 opens a card,
 * ?view=binder opens the binder, ?stress=500 fills the grid with numbered placeholders.
 */
export function CardCollection() {
  const s = useCards();
  const uid = useId();
  const [stress, setStress] = useState(0);
  const [view, setView] = useState<"grid" | "binder">("grid");
  const [status, setStatus] = useState<Status>("all");
  const [rarity, setRarity] = useState<Rarity | null>(null);
  const [pack, setPack] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("number");
  const [open, setOpen] = useState<FlockCard | null>(null);
  const [settings, setSettings] = useState(false);
  const [jump, setJump] = useState("");
  const [jumpMiss, setJumpMiss] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [target, setTarget] = useState<{ key: string; n: number } | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const d = demoState(q.get("demo"));
    if (d) enterDemo(d);
    const n = Number(q.get("stress"));
    if (n > 0) setStress(Math.min(2000, Math.floor(n)));
    if (q.get("view") === "binder") setView("binder");
    const c = cardById.get(q.get("card") ?? "");
    if (c) setOpen(c);
  }, []);

  const stubs = useMemo(() => (stress ? stressStubs(stress) : null), [stress]);
  const sections = useMemo(() => buildSections(s, status, rarity, pack, sort, stubs), [s, status, rarity, pack, sort, stubs]);
  const flat = useMemo(() => sections.flatMap((x) => x.entries), [sections]);
  const t = tally(s.owned, s.feathers);
  const newCount = useMemo(() => flockCards.filter((c) => isNew(s, c.id)).length, [s]);
  const goalOwned = has(s.owned, goalId);

  const show = useCallback((e: Entry, el: HTMLElement) => {
    opener.current = el;
    if (e.t === "card") setOpen(e.card);
    if (e.t === "teaser") setOpen(secrets[0]);
  }, []);

  const closeCard = () => {
    setOpen(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has("card")) {
      url.searchParams.delete("card");
      window.history.replaceState(window.history.state, "", url);
    }
  };

  const doJump = (e: FormEvent) => {
    e.preventDefault();
    const n = parseInt(jump, 10);
    const total = stubs ? stubs.length : 67;
    if (!(n >= 1 && n <= total)) {
      setJumpMiss(true);
      return;
    }
    setJumpMiss(false);
    const key = stubs ? `x${n}` : n >= 61 && n <= 66 && !secrets.some((c) => has(s.owned, c.id)) ? "teaser" : `f${no3(n)}`;
    if (!flat.some((x) => entryKey(x) === key)) {
      setStatus("all");
      setRarity(null);
      setPack(null);
      if (sort === "newest") setSort("number");
    }
    setFlash(key);
    setTarget({ key, n: Date.now() });
    window.setTimeout(() => setFlash((f) => (f === key ? null : f)), 1500);
  };

  const chip = (pressed: boolean, label: string, onClick: () => void, extra?: string) => (
    <button key={label} type="button" className={styles.chip} aria-pressed={pressed} onClick={onClick}>
      {label}
      {extra && <span className={styles.chipN}>{extra}</span>}
    </button>
  );

  return (
    <>
      <header className={styles.head}>
        <div className={styles.titleRow}>
          <h1 className="display">{stubs ? `Flock 01 at ${stubs.length}` : "Flock 01"}</h1>
          <div className={styles.headActions}>
            <button type="button" className={styles.iconBtn} onClick={() => setSettings(true)} aria-label="Settings">
              <Icon name="settings" />
            </button>
            <ButtonLink href="/cards/packs">Open a pack</ButtonLink>
          </div>
        </div>
        <div className={styles.counters}>
          <p className={styles.counter}>
            <strong>{stubs ? `0 / ${stubs.length}` : `${t.found} / 60`}</strong>
            <span>found</span>
          </p>
          {!stubs && (
            <p className={styles.counter}>
              <strong>{`${t.secrets} / 6`}</strong>
              <span>secrets</span>
            </p>
          )}
          <p className={styles.counter}>
            <strong>{t.feathers}</strong>
            <span>feathers</span>
          </p>
          {goalOwned && !stubs && <p className={`${styles.stamp} ${styles.stampBig}`}>Set complete</p>}
        </div>
        <div className={styles.bar} role="progressbar" aria-label="Numbered cards found" aria-valuemin={0} aria-valuemax={stubs ? stubs.length : 60} aria-valuenow={stubs ? 0 : t.found}>
          <span style={{ width: `${stubs ? 0 : (t.found / 60) * 100}%` }} />
        </div>
      </header>

      <div className={styles.controls}>
        <div className={styles.chips}>
          <div role="group" aria-label="Show" className={styles.group}>
            {chip(status === "all", "All", () => setStatus("all"))}
            {chip(status === "missing", "Missing", () => setStatus("missing"))}
            {chip(status === "owned", "Owned", () => setStatus("owned"))}
            {chip(status === "new", "New", () => setStatus("new"), newCount ? String(newCount) : undefined)}
          </div>
          <div role="group" aria-label="Rarity" className={styles.group}>
            {RARITIES.map((r) => chip(rarity === r, r, () => setRarity(rarity === r ? null : r)))}
          </div>
          {!stubs && (
            <div role="group" aria-label="Pack" className={styles.group}>
              {packs.map((p) => chip(pack === p.id, p.name, () => setPack(pack === p.id ? null : p.id)))}
            </div>
          )}
        </div>
        <div className={styles.tools}>
          <label className={styles.sort}>
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="number">Number</option>
              <option value="rarity">Rarity</option>
              <option value="newest">Newest</option>
            </select>
          </label>
          <form className={styles.jump} onSubmit={doJump} role="search">
            <input
              value={jump}
              onChange={(e) => {
                setJump(e.target.value.replace(/\D/g, "").slice(0, 4));
                setJumpMiss(false);
              }}
              inputMode="numeric"
              placeholder="No."
              aria-label="Jump to number"
              aria-invalid={jumpMiss || undefined}
              aria-describedby={jumpMiss ? `${uid}-jm` : undefined}
            />
            <button type="submit" className={styles.go} aria-label="Jump">
              <Icon name="arrow" size={18} />
            </button>
            {jumpMiss && (
              <span id={`${uid}-jm`} className={styles.jumpMiss} role="status">
                {`1 to ${stubs ? stubs.length : 67}`}
              </span>
            )}
          </form>
          <div className={styles.views} role="group" aria-label="View">
            <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
              Grid
            </button>
            <button type="button" aria-pressed={view === "binder"} onClick={() => setView("binder")}>
              Binder
            </button>
          </div>
        </div>
      </div>

      {flat.length === 0 ? (
        <p className={styles.none}>No cards match.</p>
      ) : view === "grid" ? (
        <WindowGrid sections={sections} state={s} onOpen={show} flash={flash} target={target} />
      ) : (
        <Binder entries={flat} state={s} onOpen={show} flash={flash} target={target} />
      )}

      <CardDialog card={open} onClose={closeCard} returnTo={() => opener.current} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
    </>
  );
}

/** Rows for the window: a header row per section, then its cards in rows of `cols`. */
function layout(sections: Section[], cols: number, rowH: number) {
  const rows: Row[] = [];
  const at = new Map<string, { row: number; col: number }>();
  let y = 0;
  for (const sec of sections) {
    rows.push({ kind: "head", sec, top: y, h: HEAD_H });
    y += HEAD_H;
    for (let i = 0; i < sec.entries.length; i += cols) {
      const entries = sec.entries.slice(i, i + cols);
      entries.forEach((e, c) => at.set(entryKey(e), { row: rows.length, col: c }));
      rows.push({ kind: "cards", entries, top: y, h: rowH, sec: sec.key });
      y += rowH;
    }
  }
  return { rows, at, total: y };
}

/** The first row whose bottom is below y. */
function firstBelow(rows: Row[], y: number) {
  let lo = 0;
  let hi = rows.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid].top + rows[mid].h <= y) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

const OVERSCAN = 600;

function WindowGrid({
  sections,
  state,
  onOpen,
  flash,
  target,
}: {
  sections: Section[];
  state: CardsState;
  onOpen: (e: Entry, el: HTMLElement) => void;
  flash: string | null;
  target: { key: string; n: number } | null;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [win, setWin] = useState<[number, number]>([0, 12]);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const pendingFocus = useRef<string | null>(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gap = w < 560 ? 10 : 16;
  const cols = Math.max(3, Math.min(8, Math.floor((w + gap) / (MIN_TILE + gap)) || 3));
  const tileW = w ? (w - gap * (cols - 1)) / cols : MIN_TILE;
  const rowH = Math.round(tileW * 1.4 + gap + 4);
  const { rows, at, total } = useMemo(() => layout(sections, cols, rowH), [sections, cols, rowH]);

  const measure = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    const a = firstBelow(rows, -top - OVERSCAN);
    const b = firstBelow(rows, -top + window.innerHeight + OVERSCAN) + 1;
    setWin((p) => (p[0] === a && p[1] === b ? p : [a, b]));
  }, [rows]);

  useLayoutEffect(() => {
    measure();
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [measure]);

  const scrollToRow = (r: number, block: "center" | "nearest") => {
    const el = box.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + rows[r].top;
    const vh = window.innerHeight;
    const cur = window.scrollY;
    const rowTop = top - 96;
    if (block === "center") window.scrollTo({ top: Math.max(0, top - vh / 2 + rows[r].h / 2) });
    else if (rowTop < cur) window.scrollTo({ top: rowTop });
    else if (top + rows[r].h > cur + vh) window.scrollTo({ top: top + rows[r].h - vh + 16 });
  };

  // A jump scrolls the target's row to the middle and focuses its card once it is mounted.
  useEffect(() => {
    if (!target) return;
    const pos = at.get(target.key);
    if (!pos) return;
    pendingFocus.current = target.key;
    scrollToRow(pos.row, "center");
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, at]);

  useEffect(() => {
    const k = pendingFocus.current;
    if (!k) return;
    const el = box.current?.querySelector<HTMLElement>(`[data-key="${k}"]`);
    if (el) {
      pendingFocus.current = null;
      el.focus({ preventScroll: true });
    }
  });

  // Arrows move between cards by row and column; Home and End go to the ends.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const k = (e.target as HTMLElement).dataset.key;
    if (!k) return;
    const pos = at.get(k);
    if (!pos) return;
    const cardRows = rows.map((r, i) => (r.kind === "cards" ? i : -1)).filter((i) => i >= 0);
    const ri = cardRows.indexOf(pos.row);
    let row = pos.row;
    let col = pos.col;
    const len = (r: number) => (rows[r] as Extract<Row, { kind: "cards" }>).entries.length;
    if (e.key === "ArrowRight") {
      if (col < len(row) - 1) col++;
      else if (ri < cardRows.length - 1) [row, col] = [cardRows[ri + 1], 0];
    } else if (e.key === "ArrowLeft") {
      if (col > 0) col--;
      else if (ri > 0) [row, col] = [cardRows[ri - 1], len(cardRows[ri - 1]) - 1];
    } else if (e.key === "ArrowDown") {
      if (ri < cardRows.length - 1) row = cardRows[ri + 1];
    } else if (e.key === "ArrowUp") {
      if (ri > 0) row = cardRows[ri - 1];
    } else if (e.key === "Home") [row, col] = [cardRows[0], 0];
    else if (e.key === "End") [row, col] = [cardRows[cardRows.length - 1], len(cardRows[cardRows.length - 1]) - 1];
    else return;
    e.preventDefault();
    col = Math.min(col, len(row) - 1);
    const key = entryKey((rows[row] as Extract<Row, { kind: "cards" }>).entries[col]);
    pendingFocus.current = key;
    scrollToRow(row, "nearest");
    measure();
    setFocusKey(key);
  };

  // The focused card's row stays mounted even when it scrolls out of the window, so focus is never dropped.
  const keepRow = focusKey ? at.get(focusKey)?.row : undefined;
  const shown = rows.slice(win[0], win[1]).map((r, i) => [r, win[0] + i] as const);
  if (keepRow !== undefined && (keepRow < win[0] || keepRow >= win[1])) shown.push([rows[keepRow], keepRow]);

  return (
    <div
      ref={box}
      className={styles.win}
      style={{ height: total, "--cols": cols, "--gap": `${gap}px` } as React.CSSProperties}
      onKeyDown={onKey}
      onFocus={(e) => {
        const k = (e.target as HTMLElement).dataset.key;
        if (k) setFocusKey(k);
      }}
    >
      {shown.map(([r, i]) =>
        r.kind === "head" ? (
          <div key={`h-${r.sec.key}`} className={styles.secHead} style={{ transform: `translateY(${r.top}px)`, height: r.h }}>
            <h2 className={styles.secTitle}>
              {r.sec.title}
              {r.sec.range && <span className={styles.secRange}>{r.sec.range}</span>}
            </h2>
            {r.sec.count && <span className={styles.secCount}>{`${r.sec.count[0]} / ${r.sec.count[1]}`}</span>}
            {r.sec.complete && <span className={styles.stamp}>Complete</span>}
          </div>
        ) : (
          <GridRow key={`r-${i}`} entries={r.entries} top={r.top} state={state} flash={flash} onOpen={onOpen} />
        ),
      )}
    </div>
  );
}

/** One row of the window. Memoised, so a scroll that mounts new rows leaves the mounted ones alone. */
const GridRow = memo(function GridRow({
  entries,
  top,
  state,
  flash,
  onOpen,
}: {
  entries: Entry[];
  top: number;
  state: CardsState;
  flash: string | null;
  onOpen: (e: Entry, el: HTMLElement) => void;
}) {
  return (
    <ul className={styles.row} style={{ transform: `translateY(${top}px)` }}>
      {entries.map((e) => {
        const k = entryKey(e);
        return (
          <li key={k}>
            <Tile entry={e} state={stateOf(state, e)} flash={flash === k} data-key={k} onClick={(ev) => onOpen(e, ev.currentTarget)} />
          </li>
        );
      })}
    </ul>
  );
});

/** Nine-pocket pages over the same filtered list: one page on a phone, a spread of two from 900 px. */
function Binder({
  entries,
  state,
  onOpen,
  flash,
  target,
}: {
  entries: Entry[];
  state: CardsState;
  onOpen: (e: Entry, el: HTMLElement) => void;
  flash: string | null;
  target: { key: string; n: number } | null;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [spread, setSpread] = useState(1);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(entries.length / 9));

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setSpread(el.clientWidth >= 900 ? 2 : 1);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const first = Math.min(page - (page % spread), (pages - 1) - ((pages - 1) % spread));
  useEffect(() => {
    if (page >= pages) setPage(0);
  }, [page, pages]);

  useEffect(() => {
    if (!target) return;
    const i = entries.findIndex((e) => entryKey(e) === target.key);
    if (i < 0) return;
    setPage(Math.floor(i / 9));
    requestAnimationFrame(() => box.current?.querySelector<HTMLElement>(`[data-key="${target.key}"]`)?.focus());
  }, [target, entries]);

  const go = (d: number) => setPage((p) => Math.max(0, Math.min(pages - 1, p - (p % spread) + d * spread)));
  const shownPages = Array.from({ length: spread }, (_, k) => first + k).filter((p) => p < pages);
  const label = spread === 2 && shownPages.length === 2 ? `Pages ${first + 1} and ${first + 2} of ${pages}` : `Page ${first + 1} of ${pages}`;

  return (
    <div
      ref={box}
      className={styles.binderWrap}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).tagName === "INPUT") return;
        if (e.key === "PageDown") (e.preventDefault(), go(1));
        if (e.key === "PageUp") (e.preventDefault(), go(-1));
      }}
    >
      <div className={styles.binder} data-spread={spread} aria-label={label} role="region">
        {shownPages.map((p) => (
          <ul key={p} className={styles.bPage}>
            {Array.from({ length: 9 }, (_, j) => {
              const e = entries[p * 9 + j];
              if (!e) return <li key={j} className={styles.bEmpty} aria-hidden="true" />;
              const k = entryKey(e);
              return (
                <li key={k}>
                  <Tile entry={e} state={stateOf(state, e)} flash={flash === k} data-key={k} onClick={(ev) => onOpen(e, ev.currentTarget)} />
                </li>
              );
            })}
          </ul>
        ))}
        {spread === 2 && <span className={styles.rings} aria-hidden="true" />}
      </div>
      <div className={styles.pager}>
        <button type="button" onClick={() => go(-1)} disabled={first === 0} aria-label="Previous page">
          <Icon name="back" />
        </button>
        <span aria-live="polite">{spread === 2 && shownPages.length === 2 ? `Page ${first + 1}-${first + 2} / ${pages}` : `Page ${first + 1} / ${pages}`}</span>
        <button type="button" onClick={() => go(1)} disabled={first + spread >= pages} aria-label="Next page">
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}
