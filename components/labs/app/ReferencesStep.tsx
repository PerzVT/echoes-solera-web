"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "./AppShell";
import { Button, ButtonLink } from "@/components/labs/Button";
import { CheckIcon, GestureIcon, Skeleton, SkeletonButton, SkeletonText } from "@/components/labs/fx";
import { tagsIn, useCast } from "./CastProvider";
import { crossfade } from "./fx/crossfade";
import m from "./fx/motion.module.css";
import { SwapText } from "./fx/SwapText";
import {
  Alert,
  BlockedAction,
  Chip,
  ConfirmDialog,
  Dropzone,
  Empty,
  EpisodeTitle,
  Panel,
  Progress,
  SheetImage,
  Status,
  Stepper,
  focusSoon,
  notImages,
  revealOnPhone,
  splitImages,
  useFilePicker,
} from "./parts";
import { confirmEpisode, outfitClash, outfitRows, refGroups, refRows, sheets, type RefKind, type RefRow } from "@/lib/labs/maker";
import s from "./maker.module.css";
import r from "./ReferencesStep.module.css";

export type RefState = "default" | "outfit" | "confirm";

type Pick = { tag: string; who: string; src?: string; face?: string };

function startRows(state: RefState): RefRow[] {
  if (state === "outfit") return outfitRows.map((x) => ({ ...x }));
  if (state === "confirm")
    return refRows.map((x) => ({ ...x, tag: x.tag ?? (x.id === "chloe" ? "@chloe_ep01" : x.id === "ballroom" ? "@ballroom_wide" : undefined) }));
  return refRows.map((x) => ({ ...x }));
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const kindName: Record<RefKind, string> = { character: "Character", location: "Location", prop: "Prop", continuity: "Continuity frame" };

/** The first form of a hand-off tag no other sheet uses: @start-gen4, then @start-gen4-2. */
const freeTag = (base: string, taken: string[]) => {
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
};

export function ReferencesStep({ initial }: { initial: RefState }) {
  const router = useRouter();
  const store = useCast();
  const series = store.working.slug;
  const cast = store.get(series);
  const memoKey = `references:${series}:${initial}`;
  const [rows, setRows] = useState<RefRow[]>(() => store.kept<RefRow[]>(memoKey) ?? startRows(initial));
  const [selected, setSelected] = useState<string>(() => store.kept<string>(`${memoKey}:selected`) ?? "chloe");
  const [clash, setClash] = useState(() => initial === "outfit" && !rows.find((x) => x.id === outfitClash.row)?.tag);
  const [confirm, setConfirm] = useState(initial === "confirm");
  const [starting, setStarting] = useState(false);
  const [rejected, setRejected] = useState("");
  const [said, setSaid] = useState("");
  /**
   * Arriving from the screenplay, each thing the script needs is looked up by name, one row after another.
   * `found` counts the rows that have their answer. Coming back to matches already made, or opening a
   * state by address, there is nothing to look up and every row is there at once.
   */
  const [looked] = useState(() => initial === "default" && !store.kept(memoKey));
  const [found, setFound] = useState(() => (looked ? 0 : rows.length));
  const matching = found < rows.length;
  /** Rows matched by hand here: their ticks draw too. */
  const [byHand, setByHand] = useState<string[]>([]);
  const side = useRef<HTMLDivElement>(null);
  const sideHeading = useRef<HTMLHeadingElement>(null);
  const generate = useRef<HTMLButtonElement>(null);

  // Matches made here are kept when the person opens the cast and comes back.
  useEffect(() => {
    store.keep(memoKey, rows);
    store.keep(`${memoKey}:selected`, selected);
  }, [store, memoKey, rows, selected]);

  useEffect(() => {
    if (found >= rows.length) return;
    // Under reduced motion the rows wait as still placeholders and all answer together.
    const t = setTimeout(() => setFound((n) => (reduced() ? rows.length : n + 1)), found === 0 ? 520 : 140);
    return () => clearTimeout(t);
  }, [found, rows.length]);

  const others = cast.others ?? [];
  /** What can be picked for each kind: characters from the series cast, locations and props from the library plus uploads. */
  const pools: Record<Exclude<RefKind, "continuity">, Pick[]> = {
    character: cast.sheets.map((x) => ({ tag: x.tag, who: cast.characters.find((c) => c.id === x.character)?.name ?? "", src: x.src, face: x.face })),
    location: [...sheets.location, ...others.filter((x) => x.kind === "location")],
    prop: [...sheets.prop, ...others.filter((x) => x.kind === "prop")],
  };
  const sheetOf = (tag?: string): Pick | undefined =>
    [...pools.character, ...pools.location, ...pools.prop, ...others.filter((x) => x.kind === "continuity")].find((x) => x.tag === tag);

  const row = rows.find((x) => x.id === selected) ?? rows[0];
  const open = rows.filter((x) => !x.tag);

  /** Shows a row in the side panel; on a phone the panel is under the list, so it comes into view. */
  const order = (id: string) => rows.findIndex((x) => x.id === id);
  const show = (id: string) => {
    if (id !== selected) crossfade(side.current, { dy: order(id) > order(selected) ? 6 : -6 });
    setSelected(id);
    requestAnimationFrame(() => revealOnPhone(side.current));
  };

  const match = (id: string, tag: string) => {
    const next = rows.map((x) => (x.id === id ? { ...x, tag } : x));
    crossfade(side.current, { dy: 6 });
    setByHand((all) => [...all, id]);
    setRows(next);
    if (id === outfitClash.row) setClash(false);
    const name = rows.find((x) => x.id === id)?.name;
    const after = next.find((x) => !x.tag);
    setSaid(after ? `${name} matched to ${tag}. Next: ${after.name}.` : `${name} matched to ${tag}. Every reference is matched.`);
    if (after) setSelected(after.id);
    // The side panel now shows another row: focus its heading so the place is not lost.
    focusSoon(() => sideHeading.current);
  };

  /** An upload for a row is kept: a character sheet joins the cast under that character, anything else is kept with its kind. Only then is the row matched. */
  const uploadFor = (x: RefRow, files: File[]) => {
    const { images, other } = splitImages(files);
    const extra = images.slice(1).map((f) => f.name);
    const notes = [notImages(other, x.kind === "continuity" ? "Continuity frames are" : "Sheets are"), extra.length ? `${extra.join(", ")} not added. A row takes one image.` : ""];
    setRejected(notes.filter(Boolean).join(" "));
    const f = images[0];
    if (!f) return;
    if (x.kind === "character") {
      const who = x.who ?? x.name;
      const known = cast.characters.find((c) => c.name.toLowerCase() === who.toLowerCase());
      const id = known?.id ?? store.addCharacter(series, who);
      const [added] = store.addSheets(series, id, [f], who);
      return match(x.id, added.tag);
    }
    if (x.kind === "continuity") {
      const kept = store.addOther(series, "continuity", x.name, f, freeTag("@start-gen4", tagsIn(cast)));
      return match(x.id, kept.tag);
    }
    const kept = store.addOther(series, x.kind, x.name, f);
    match(x.id, kept.tag);
  };

  const uploadRow = useRef("");
  const picker = useFilePicker(
    "image/*",
    (files) => {
      const x = rows.find((y) => y.id === uploadRow.current);
      if (x) uploadFor(x, files);
    },
    false,
  );
  const startUpload = (id: string) => {
    uploadRow.current = id;
    setSelected(id);
    picker.open();
  };

  const stateOf = (x: RefRow) => {
    if (x.tag) return { text: x.tag, icon: "check" as const };
    if (x.kind === "continuity") return { text: "Not found", icon: "warning" as const };
    if (clash && x.id === outfitClash.row) return { text: "Two sheets match", icon: "warning" as const };
    return { text: "Not matched", icon: "warning" as const };
  };

  return (
    <AppShell
      section="/app"
      title={<EpisodeTitle />}
      bar={
        <>
          {open.length || matching ? (
            <BlockedAction
              id="generate-why"
              label="Generate episode"
              reason={
                // While the rows are looked up, the reason that will stand keeps its place unseen, so the bar does not move when it shows.
                <span className={r.reasonSwap}>
                  <span data-hidden={matching || undefined}>{open.length ? `Match these first: ${open.map((x) => x.name).join("; ")}.` : ""}</span>
                  {matching && <span>Matching the references to sheets.</span>}
                </span>
              }
            />
          ) : (
            <Button ref={generate} onClick={() => setConfirm(true)}>
              Generate episode
            </Button>
          )}
          <span className={s.divider} aria-hidden="true" />
          <Stepper current="references" />
        </>
      }
    >
      {picker.node}
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      <div className={`${s.split} ${s.fill} ${r.split}`}>
        <Panel title="Cast and references" level={1} flush bodyClassName={r.list} busy={matching}>
          <div className={r.progress}>
            <Progress label="Matched references" items={rows.map((x, i) => ({ name: x.name, done: i < found && Boolean(x.tag) }))} />
          </div>
          {rejected && <Alert className={r.progress}>{rejected}</Alert>}
          {refGroups.map((g) => {
            const inGroup = rows.filter((x) => x.kind === g.kind);
            if (!inGroup.length) return null;
            return (
              <div key={g.kind} role="group" aria-labelledby={`g-${g.kind}`}>
                <h2 id={`g-${g.kind}`} className={s.groupLabel}>
                  {g.label}
                </h2>
                <ul className={s.rows}>
                  {inGroup.map((x) => {
                    const st = stateOf(x);
                    const waiting = order(x.id) >= found;
                    const sheet = waiting ? undefined : sheetOf(x.tag);
                    const art = sheet?.face ?? sheet?.src;
                    return (
                      <li key={x.id} className={`${s.row} ${r.refRow}`} data-actions="true" aria-current={x.id === selected && !matching ? "true" : undefined}>
                        {waiting ? (
                          <Skeleton width={48} height={48} radius="var(--r-thumb)" className={r.thumbCell} />
                        ) : art ? (
                          <span className={`${s.thumb} ${r.thumbCell}`}>
                            <SheetImage src={art} sizes="48px" />
                          </span>
                        ) : (
                          <span className={`${x.tag ? "" : s.slot} ${s.thumb} ${r.thumbCell} ${looked ? m.fade : ""}`} aria-hidden="true">
                            {!x.tag && "?"}
                          </span>
                        )}
                        <span className={`${s.rowText} ${r.text}`}>
                          <span className={r.name}>{x.name}</span>
                          <span className={`${s.cardSub} ${r.used}`}>{x.used}</span>
                        </span>
                        {/* A waiting row already holds its answer, unseen under a placeholder, so nothing moves when it shows. */}
                        <span className={r.status} data-waiting={waiting || undefined}>
                          {waiting && <Skeleton height={12} className={r.cover} />}
                          <Status key={String(waiting)} icon={st.icon} drawn={looked || byHand.includes(x.id)}>
                            <SwapText>{st.text}</SwapText>
                          </Status>
                        </span>
                        <span className={`${s.rowActions} ${r.rowActions}`} data-waiting={waiting || undefined} inert={waiting || undefined}>
                          {waiting && <SkeletonButton small width="100%" className={r.cover} />}
                          {x.tag ? (
                            <Button variant="quiet" size="small" onClick={() => show(x.id)} aria-label={`Change sheet for ${x.name}`}>
                              Change
                            </Button>
                          ) : x.kind === "continuity" ? (
                            <Button variant="secondary" size="small" onClick={() => startUpload(x.id)} aria-label={`Attach ${x.name}`}>
                              Attach
                            </Button>
                          ) : (
                            <>
                              <Button variant="secondary" size="small" onClick={() => show(x.id)} aria-label={`Choose a sheet for ${x.name}`}>
                                Choose
                              </Button>
                              <Button variant="quiet" size="small" onClick={() => startUpload(x.id)} aria-label={`Upload a sheet for ${x.name}`}>
                                Upload
                              </Button>
                            </>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </Panel>

        <div ref={side} className={r.side}>
          {matching ? (
            <Panel as="aside" title="Sheets" busy>
              <Skeleton width="100%" height={48} radius="var(--r-control)" />
              <ul className={`${s.tiles} ${r.sheets}`} aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className={r.waitTile}>
                    <Skeleton ratio="4 / 3" width="100%" radius="var(--r-control)" index={i} />
                    <SkeletonText lines={1} widths={["70%"]} />
                  </li>
                ))}
              </ul>
            </Panel>
          ) : clash && row.id === outfitClash.row && !row.tag ? (
            <Outfit row={row} sheetOf={sheetOf} onUse={(tag) => match(row.id, tag)} onFiles={(f) => uploadFor(row, f)} headingRef={sideHeading} />
          ) : row.kind === "continuity" ? (
            <Panel as="aside" title={row.name} sub={kindName.continuity} headingRef={sideHeading}>
              {row.tag && sheetOf(row.tag)?.src ? (
                <span className={`${s.tileArt} ${r.frameArt}`}>
                  <SheetImage src={sheetOf(row.tag)!.src!} sizes="(max-width: 900px) 100vw, 400px" />
                </span>
              ) : null}
              <p className="small muted">{row.tag ? `Attached as ${row.tag}.` : "Not found in the results of this episode."}</p>
              <Dropzone
                title={row.tag ? "Drop another frame here" : "Drop the frame here"}
                button={row.tag ? "Replace frame" : "Attach frame"}
                buttonLabel={`${row.tag ? "Replace" : "Attach"} ${row.name}`}
                accept="image/*"
                compact
                onFiles={(f) => uploadFor(row, f)}
              />
            </Panel>
          ) : (
            <Picker key={row.id} row={row} pool={pools[row.kind]} onPick={(tag) => match(row.id, tag)} onFiles={(f) => uploadFor(row, f)} headingRef={sideHeading} />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => {
          setConfirm(false);
          // Opened from the address, the dialog has no opener to return to.
          focusSoon(() => (document.activeElement === document.body ? generate.current : null));
        }}
        onConfirm={() => {
          // The button works until Results takes the screen.
          setStarting(true);
          router.push("/app/episode/results?state=new");
        }}
        busy={starting}
        title={confirmEpisode.title}
        makes={confirmEpisode.makes}
        confirmLabel="Generate episode"
      />
    </AppShell>
  );
}

function SheetTile({ sheet }: { sheet: Pick }) {
  return (
    <span className={s.tileArt} data-empty={!sheet.src || undefined}>
      {sheet.src ? <SheetImage src={sheet.src} sizes="(max-width: 900px) 30vw, 140px" /> : "Sheet"}
    </span>
  );
}

type PickerProps = {
  row: RefRow;
  pool: Pick[];
  onPick: (tag: string) => void;
  onFiles: (f: File[]) => void;
  headingRef: React.Ref<HTMLHeadingElement>;
};

function Picker({ row, pool, onPick, onFiles, headingRef }: PickerProps) {
  const people = [...new Set(pool.map((x) => x.who))];
  const [who, setWho] = useState<string>(row.who && people.includes(row.who) ? row.who : "All");
  const [query, setQuery] = useState("");
  const shown = pool.filter((x) => (who === "All" || x.who === who) && x.tag.includes(query.trim().toLowerCase().replace(/^@/, "")));

  return (
    <Panel
      as="aside"
      title={row.name}
      sub={kindName[row.kind]}
      headingRef={headingRef}
      actions={
        row.kind === "character" ? (
          <ButtonLink href="/app/cast?from=references" variant="quiet" size="small">
            Open cast
          </ButtonLink>
        ) : undefined
      }
    >
      {/* A label, so the glass answers the pointer over the field, and holds while there is a query. */}
      <label className={r.search}>
        <GestureIcon name="search" active={Boolean(query)} />
        <span className="sr-only">Search sheets by tag</span>
        <input id="sheet-search" className={s.input} placeholder="Search sheets by tag" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
      </label>
      {people.length > 1 && (
        <div className={s.chips} role="group" aria-label="Filter sheets">
          {["All", ...people].map((p) => (
            <Chip key={p} on={who === p} onClick={() => setWho(p)}>
              {p}
            </Chip>
          ))}
        </div>
      )}
      {shown.length ? (
        <ul className={`${s.tiles} ${r.sheets}`}>
          {shown.map((x) => (
            <li key={x.tag}>
              <button type="button" className={s.tile} aria-pressed={row.tag === x.tag} onClick={() => onPick(x.tag)} aria-label={`Use ${x.tag}`}>
                <SheetTile sheet={x} />
                <span className={s.tileSub}>{x.tag}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty art="no-results">{pool.length ? "No sheet has that tag." : "The cast has no sheets of this kind yet. Upload one below."}</Empty>
      )}
      <Dropzone title="Or drop a new sheet here" button="Upload sheet" buttonLabel={`Upload a sheet for ${row.name}`} accept="image/*" compact onFiles={onFiles} />
    </Panel>
  );
}

type OutfitProps = {
  row: RefRow;
  sheetOf: (tag?: string) => Pick | undefined;
  onUse: (tag: string) => void;
  onFiles: (f: File[]) => void;
  headingRef: React.Ref<HTMLHeadingElement>;
};

function Outfit({ row, sheetOf, onUse, onFiles, headingRef }: OutfitProps) {
  const [choice, setChoice] = useState(outfitClash.options[0]);
  const [scope, setScope] = useState(outfitClash.scopes[0]);
  return (
    <Panel as="aside" title={row.name} sub="Two sheets match" headingRef={headingRef}>
      <figure className={s.inset}>
        <figcaption className="label muted">{outfitClash.scene}</figcaption>
        <p className={r.screenplayLine}>{outfitClash.line}</p>
      </figure>
      <fieldset className={s.fieldset}>
        <legend className={s.label}>Sheet</legend>
        <div className={r.options}>
          {outfitClash.options.map((tag) => (
            <label key={tag} className={s.tile} data-checked={choice === tag}>
              <input type="radio" name="outfit" value={tag} checked={choice === tag} onChange={() => setChoice(tag)} className="sr-only" />
              <SheetTile sheet={sheetOf(tag) ?? { tag, who: "" }} />
              <span className={s.tileSub}>{tag}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className={s.fieldset}>
        <legend className={s.label}>Applies to</legend>
        <div className={s.chips}>
          {outfitClash.scopes.map((x) => (
            <label key={x} className={s.chip} data-checked={scope === x}>
              <input type="radio" name="scope" value={x} checked={scope === x} onChange={() => setScope(x)} className="sr-only" />
              {scope === x && <CheckIcon size={16} />}
              {x}
            </label>
          ))}
        </div>
      </fieldset>
      <div className={s.actions}>
        <Button variant="secondary" size="small" onClick={() => onUse(choice)}>
          Use this sheet
        </Button>
      </div>
      <Dropzone title="Or drop another sheet here" button="Upload sheet" buttonLabel={`Upload another sheet for ${row.name}`} accept="image/*" compact onFiles={onFiles} />
    </Panel>
  );
}
