"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { SeriesFrame } from "./SeriesFrame";
import { Button, ButtonLink } from "@/components/labs/Button";
import { Icon } from "@/components/labs/Icon";
import { GestureIcon, MediaFrame } from "@/components/labs/fx";
import { findSeries, tagsIn, useCast } from "./CastProvider";
import { crossfade } from "./fx/crossfade";
import m from "./fx/motion.module.css";
import { usePresence } from "./fx/usePresence";
import {
  Alert,
  BlockedAction,
  Dropzone,
  Empty,
  Panel,
  Select,
  SheetImage,
  UndoLine,
  focusSoon,
  notImages,
  revealOnPhone,
  splitImages,
  useFilePicker,
} from "./parts";
import {
  characterFromFile,
  cleanTag,
  nameFromFile,
  seriesCards,
  slug,
  tagForFile,
  type CastCharacter,
  type CastSheet,
  type SeriesCast,
} from "@/lib/labs/maker";
import s from "./maker.module.css";
import c from "./Cast.module.css";

/** What a removal took away, so Undo can put it back without losing changes made since. `what` names it for the next removal's line. */
type Undo = {
  text: string;
  what: string;
  before: SeriesCast;
  characters: CastCharacter[];
  sheets: CastSheet[];
};

/** A file waiting for its character: an existing one, or a new one with a name. */
type Pending = {
  key: string;
  file: File;
  preview: string;
  to: string;
  name: string;
};
const NEW = "new";

/** Two names are one person when they fold to the same tag: "Dr. Chen" typed is the "Dr Chen" guessed from a file. */
const sameName = (a: string, b: string) => {
  const x = slug(a);
  return x ? x === slug(b) : a.trim().toLowerCase() === b.trim().toLowerCase();
};
const byName = (name: string, characters: CastCharacter[]) =>
  characters.find((x) => sameName(x.name, name));

/**
 * The tag each waiting sheet will get, in order, after the tags already in use. The upload step shows these
 * and "Add sheets" gives exactly these, so two new sheets of one person read @mara and @mara_2 in both places.
 */
function planTags(
  pending: Pending[],
  characters: CastCharacter[],
  taken: string[],
) {
  const used = new Set(taken);
  return pending.map((p) => {
    const who =
      p.to === NEW
        ? p.name.trim()
        : (characters.find((x) => x.id === p.to)?.name ?? "");
    if (!who) return "";
    const tag = tagForFile(who, p.file.name, used);
    used.add(tag);
    return tag;
  });
}

export function CastScreen({
  series: slugParam,
  from,
}: {
  series?: string;
  from?: string;
}) {
  const store = useCast();
  // With no series in the address, Cast shows the series being worked on.
  const card =
    findSeries(slugParam ?? store.working.slug, store.created) ??
    seriesCards[0];
  const series = card.slug;
  const cast = store.get(series);
  const [selected, setSelected] = useState<string | null>(
    cast.sheets[0]?.id ?? null,
  );
  const [renaming, setRenaming] = useState<string | null>(null);
  /** A character made with New character that has not been named yet: leaving it unnamed takes it away again. */
  const [stub, setStub] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [undo, setUndo] = useState<Undo | null>(null);
  const [rejected, setRejected] = useState("");
  const [pending, setPending] = useState<Pending[]>([]);
  const [over, setOver] = useState(false);
  const [full, setFull] = useState(false);
  const [said, setSaid] = useState("");
  /** Sheets added a moment ago: they land in their group. */
  const [fresh, setFresh] = useState<string[]>([]);
  /** The waiting files have just been added: the button says so before the step closes. */
  const [added, setAdded] = useState(false);
  const line = usePresence(undo);
  const detail = useRef<HTMLElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const castHeading = useRef<HTMLHeadingElement>(null);
  const assign = useRef<HTMLDivElement>(null);
  const undoButton = useRef<HTMLButtonElement>(null);
  const newButton = useRef<HTMLButtonElement>(null);

  const sheet = cast.sheets.find((x) => x.id === selected);
  /** The character whose sheets the grid shows. Falls back to the first character when the chosen one is gone. */
  const [chosen, setChosen] = useState<string | null>(
    cast.characters[0]?.id ?? null,
  );
  const current =
    cast.characters.find((x) => x.id === chosen) ?? cast.characters[0];
  const sheetsOf = (id: string) => cast.sheets.filter((x) => x.character === id);

  /** Picking a character shows its sheets and its first sheet in the detail. */
  const choose = (id: string) => {
    if (id === current?.id) return;
    setChosen(id);
    const first = sheetsOf(id)[0];
    if (first && first.id !== selected) crossfade(detail.current);
    setSelected(first?.id ?? null);
  };

  useEffect(() => {
    if (!fresh.length) return;
    const t = setTimeout(() => setFresh([]), 700);
    return () => clearTimeout(t);
  }, [fresh]);

  /** Any new action clears an old file-type message. The undo line stays: it has its own time. */
  const change = () => setRejected("");

  const select = (id: string) => {
    if (id !== selected) crossfade(detail.current);
    setSelected(id);
    requestAnimationFrame(() => revealOnPhone(detail.current));
  };

  /** Files from the top button or dropped on the page: each one waits in the inline step for its character. */
  const stage = (files: File[]) => {
    const { images, other } = splitImages(files);
    setRejected(notImages(other));
    if (!images.length) return;
    setRemoving(null);
    setPending((now) => [
      ...now,
      ...images.map((file, i) => {
        const known = characterFromFile(file.name, cast.characters);
        return {
          key: `${file.name}-${file.lastModified}-${Date.now()}-${i}`,
          file,
          preview: URL.createObjectURL(file),
          to: known?.id ?? NEW,
          name: known ? "" : nameFromFile(file.name),
        };
      }),
    ]);
    requestAnimationFrame(() => {
      revealOnPhone(assign.current);
      assign.current?.querySelector("select")?.focus({ preventScroll: true });
    });
  };

  /** Files dropped on a character's own Add sheet tile go straight to that character. */
  const addTo = (character: string, files: File[]) => {
    const { images, other } = splitImages(files);
    setRejected(notImages(other));
    if (!images.length) return;
    const added = store.addSheets(series, character, images);
    setChosen(character);
    setFresh(added.map((x) => x.id));
    setSelected(added[0].id);
    setSaid(`Added ${added.map((x) => x.tag).join(", ")}.`);
    focusSoon(() => detailHeading.current);
  };

  /** Adds every waiting file to the character chosen for it, making each new character once. */
  const commit = () => {
    change();
    const tags = planTags(pending, cast.characters, tagsIn(cast));
    const made = new Map<string, string>();
    const groups = new Map<
      string,
      { name?: string; files: File[]; tags: string[] }
    >();
    pending.forEach((p, i) => {
      let id = p.to;
      let name: string | undefined;
      if (p.to === NEW) {
        const typed = p.name.trim();
        const existing = byName(typed, cast.characters);
        if (existing) id = existing.id;
        else {
          const key = slug(typed) || typed.toLowerCase();
          if (!made.has(key)) made.set(key, store.addCharacter(series, typed));
          id = made.get(key)!;
          name = typed;
        }
      }
      const g = groups.get(id) ?? { name, files: [], tags: [] };
      g.files.push(p.file);
      g.tags.push(tags[i]);
      groups.set(id, g);
    });
    const added: CastSheet[] = [];
    for (const [id, g] of groups)
      added.push(...store.addSheets(series, id, g.files, g.name, g.tags));
    // The files are local, so this is done as soon as it is pressed. The button shows its tick, then the step closes.
    const previews = pending.map((p) => p.preview);
    setFresh(added.map((x) => x.id));
    setAdded(true);
    setTimeout(() => {
      store.release(previews);
      setPending((now) => now.filter((p) => !previews.includes(p.preview)));
      setAdded(false);
    }, 750);
    if (added[0]) {
      setSelected(added[0].id);
      setChosen(added[0].character);
    }
    setSaid(`Added ${added.map((x) => x.tag).join(", ")}.`);
    focusSoon(() => detailHeading.current);
    requestAnimationFrame(() => revealOnPhone(detail.current));
  };

  const cancelPending = () => {
    store.release(pending.map((p) => p.preview));
    setPending([]);
    focusSoon(() => castHeading.current);
  };

  const picker = useFilePicker("image/*", stage);

  const newCharacter = () => {
    change();
    const id = store.addCharacter(series, "New character");
    setStub(id);
    setChosen(id);
    setSelected(null);
    setRenaming(id);
  };

  /**
   * The name field has closed. A new character left without a name is taken away again, and one named like a
   * character already in the cast (by folded tag) is that character: the stub goes and the existing one is offered.
   */
  const named = (ch: CastCharacter, name: string) => {
    setRenaming(null);
    const isStub = stub === ch.id;
    if (isStub) setStub(null);
    const clash = name
      ? cast.characters.find((x) => x.id !== ch.id && sameName(x.name, name))
      : undefined;
    if (isStub && (!name || clash)) {
      store.removeCharacter(series, ch.id);
      if (clash) {
        setRejected(
          `${clash.name} is already in this cast. Add the sheets to ${clash.name}.`,
        );
        setChosen(clash.id);
        setSelected(sheetsOf(clash.id)[0]?.id ?? null);
        focusSoon(() => document.getElementById(`add-${clash.id}`));
      } else focusSoon(() => newButton.current);
      return;
    }
    if (clash) {
      setRejected(
        `${clash.name} is already in this cast. ${ch.name} keeps its name.`,
      );
      return;
    }
    if (name && name !== ch.name) {
      change();
      store.renameCharacter(series, ch.id, name);
    }
  };

  /** A newer removal replaces the old undo, and its line says so; the old removal's uploads are freed. */
  const remember = (
    text: string,
    what: string,
    characters: CastCharacter[],
    sheets: CastSheet[],
  ) => {
    if (undo) store.release(undo.sheets.map((x) => x.src));
    setUndo({
      text: undo ? `${text} Undo brings back ${what}, not ${undo.what}.` : text,
      what,
      before: cast,
      characters,
      sheets,
    });
    focusSoon(() => undoButton.current);
  };

  const removeCharacter = (id: string) => {
    const who = cast.characters.find((x) => x.id === id);
    if (!who) return;
    change();
    const gone = cast.sheets.filter((x) => x.character === id);
    remember(
      gone.length
        ? `Removed ${who.name} and its sheets.`
        : `Removed ${who.name}.`,
      who.name,
      [who],
      gone,
    );
    store.removeCharacter(series, id);
    setRemoving(null);
    const rest = cast.characters.filter((x) => x.id !== id);
    const next = rest[Math.max(0, cast.characters.findIndex((x) => x.id === id) - 1)];
    setChosen(next?.id ?? null);
    setSelected(next ? (sheetsOf(next.id)[0]?.id ?? null) : null);
    focusSoon(() => (next ? document.getElementById(`who-${next.id}`) : newButton.current));
  };

  const removeSheet = (x: CastSheet) => {
    change();
    remember(`Removed ${x.tag}.`, x.tag, [], [x]);
    store.removeSheet(series, x.id);
    setSelected(null);
  };

  /** Puts the removed characters and sheets back in their old places, keeping whatever was added since. */
  const restore = () => {
    if (!undo) return;
    const now = store.get(series);
    const order = <T extends { id: string }>(
      before: T[],
      current: T[],
      back: T[],
    ) => {
      const keep = new Map([...current, ...back].map((x) => [x.id, x]));
      const placed = before
        .filter((x) => keep.has(x.id))
        .map((x) => keep.get(x.id)!);
      return [
        ...placed,
        ...current.filter((x) => !before.some((y) => y.id === x.id)),
      ];
    };
    store.set(series, {
      ...now,
      characters: order(
        undo.before.characters,
        now.characters,
        undo.characters,
      ),
      sheets: order(undo.before.sheets, now.sheets, undo.sheets),
    });
    const first = undo.sheets[0];
    setUndo(null);
    if (first) {
      setSelected(first.id);
      setChosen(first.character);
      focusSoon(() => document.getElementById(`tile-${first.id}`));
    } else {
      setChosen(undo.characters[0]?.id ?? chosen);
      focusSoon(() =>
        document.getElementById(`more-${undo.characters[0]?.id}`),
      );
    }
  };

  const dismiss = () => {
    if (undo) store.release(undo.sheets.map((x) => x.src));
    const hadFocus =
      document.activeElement === undoButton.current || undo?.text === undefined;
    setUndo(null);
    if (hadFocus) focusSoon(() => castHeading.current);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    stage(Array.from(e.dataTransfer.files));
  };

  const fromRefs = from === "references";

  return (
    <SeriesFrame
      slug={series}
      tab="cast"
      onFiles={(files) => {
        change();
        stage(files);
      }}
      actions={
        <>
          <Button
            icon={<GestureIcon name="upload" size={18} />}
            onClick={picker.open}
          >
            Upload sheets
          </Button>
          <Button
            ref={newButton}
            variant="secondary"
            icon={<GestureIcon name="plus" size={18} />}
            onClick={newCharacter}
          >
            New character
          </Button>
          {fromRefs && (
            <ButtonLink
              href="/app/episode/references"
              variant="quiet"
              icon={<GestureIcon name="back" size={18} />}
            >
              Back to references
            </ButtonLink>
          )}
          {picker.node}
        </>
      }
    >
      {() => (
        <>
          <p className="sr-only" aria-live="polite">
            {said}
          </p>
          <div className={`${s.split} ${s.fill} ${c.split}`}>
            <Panel title="Characters" headingRef={castHeading}>
              <div
                className={c.dropArea}
                data-over={over || undefined}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(true);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node))
                    setOver(false);
                }}
                onDrop={onDrop}
              >
                {rejected && <Alert>{rejected}</Alert>}

                {pending.length > 0 && (
                  <Assign
                    ref={assign}
                    pending={pending}
                    characters={cast.characters}
                    taken={tagsIn(cast)}
                    added={added}
                    onChange={setPending}
                    onAdd={commit}
                    onCancel={cancelPending}
                  />
                )}

                {cast.characters.length === 0
                  ? pending.length === 0 && (
                      <>
                        <Empty>No characters in this series yet.</Empty>
                        <Dropzone
                          title="Drop sheet images here"
                          hint=".png, .jpg or .webp"
                          button="Choose images"
                          buttonLabel="Choose sheet images"
                          accept="image/*"
                          multiple
                          onFiles={stage}
                        />
                      </>
                    )
                  : current && (
                      <>
                        <Characters
                          characters={cast.characters}
                          current={current.id}
                          sheetsOf={sheetsOf}
                          onChoose={choose}
                        />
                        <Group
                          key={current.id}
                          id={current.id}
                          name={current.name}
                          sheets={sheetsOf(current.id)}
                          selected={selected}
                          fresh={fresh}
                          renaming={renaming === current.id}
                          removing={removing === current.id}
                          onRename={() => {
                            change();
                            setRenaming(current.id);
                          }}
                          onRenamed={(name) => named(current, name)}
                          onRemove={() => {
                            // A character with sheets asks once: the undo is single-level.
                            if (sheetsOf(current.id).length)
                              setRemoving(current.id);
                            else removeCharacter(current.id);
                          }}
                          onRemoveConfirmed={() => removeCharacter(current.id)}
                          onRemoveCancelled={() => setRemoving(null)}
                          onSelect={select}
                          onFiles={(files) => {
                            change();
                            addTo(current.id, files);
                          }}
                        />
                      </>
                    )}
              </div>
            </Panel>

            <aside ref={detail} className={c.detailWrap} aria-label="Sheet">
              {sheet ? (
                <Detail
                  key={sheet.id}
                  sheet={sheet}
                  cast={cast}
                  headingRef={detailHeading}
                  onMove={(character) => {
                    change();
                    const who =
                      cast.characters.find((x) => x.id === character)?.name ??
                      "";
                    // A sheet added here takes the new character's tag unless someone typed one.
                    const tag = sheet.tagEdited
                      ? sheet.tag
                      : tagForFile(who, sheet.file, tagsIn(cast, sheet.id));
                    store.updateSheet(series, sheet.id, { character, tag });
                    setChosen(character);
                    // The sheet changes group; the keyboard stays on the field it was moved with.
                    focusSoon(() =>
                      document.activeElement === document.body
                        ? document.getElementById("sheet-character")
                        : null,
                    );
                  }}
                  onTag={(tag) => {
                    change();
                    store.updateSheet(series, sheet.id, {
                      tag,
                      tagEdited: true,
                    });
                  }}
                  onRemove={() => removeSheet(sheet)}
                  onFull={() => setFull(true)}
                />
              ) : (
                <Panel as="section" title="Sheet" headingRef={detailHeading}>
                  <Empty art="no-results">No sheet selected</Empty>
                </Panel>
              )}
            </aside>
          </div>

          {line.item && (
            <UndoLine
              text={line.item.text}
              onUndo={restore}
              onDismiss={dismiss}
              undoRef={undoButton}
              leaving={line.leaving}
            />
          )}
          {sheet && (
            <FullSize
              open={full}
              onClose={() => setFull(false)}
              sheet={sheet}
            />
          )}
        </>
      )}
    </SeriesFrame>
  );
}

type AssignProps = {
  ref: React.Ref<HTMLDivElement>;
  pending: Pending[];
  characters: CastCharacter[];
  taken: string[];
  /** The sheets have just been added. */
  added: boolean;
  onChange: (next: Pending[]) => void;
  onAdd: () => void;
  onCancel: () => void;
};

/** The small step between choosing files and adding them: who each sheet is of, and the tag it will get. */
function Assign({
  ref,
  pending,
  characters,
  taken,
  added,
  onChange,
  onAdd,
  onCancel,
}: AssignProps) {
  const set = (key: string, patch: Partial<Pending>) =>
    onChange(pending.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  const unnamed = pending.filter((p) => p.to === NEW && !p.name.trim());

  // The tags these sheets will get, in order: the same call "Add sheets" makes.
  const tags = useMemo(
    () => planTags(pending, characters, taken),
    [pending, characters, taken],
  );
  // Once the sheets are in, their tags are taken: hold the line as it read when "Add sheets" was pressed.
  const held = useRef(tags);
  useEffect(() => {
    if (!added) held.current = tags;
  }, [added, tags]);
  const shownTags = added ? held.current : tags;

  return (
    <div
      ref={ref}
      className={`${c.assign} ${m.enter}`}
      role="group"
      aria-labelledby="assign-title"
    >
      <h2 id="assign-title" className={s.subhead}>
        Who is on each sheet
      </h2>
      <ul className={c.assignList}>
        {pending.map((p, i) => (
          <li key={p.key} className={c.assignRow}>
            <span className={s.thumb}>
              <SheetImage src={p.preview} sizes="48px" />
            </span>
            <span className={c.assignFile}>
              <span className={c.fileName}>{p.file.name}</span>
              <span className={s.cardSub}>
                {shownTags[i] || "Tag follows the name"}
                {p.to === NEW && p.name.trim() && byName(p.name, characters)
                  ? `, added to ${byName(p.name, characters)!.name}`
                  : ""}
              </span>
            </span>
            <span className={c.assignFields}>
              <label className="sr-only" htmlFor={`to-${p.key}`}>
                Character for {p.file.name}
              </label>
              <Select
                id={`to-${p.key}`}
                value={p.to}
                onChange={(e) => set(p.key, { to: e.target.value })}
              >
                {characters.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
                <option value={NEW}>New character</option>
              </Select>
              {p.to === NEW && (
                <>
                  <label className="sr-only" htmlFor={`name-${p.key}`}>
                    New character's name for {p.file.name}
                  </label>
                  <input
                    id={`name-${p.key}`}
                    className={s.input}
                    value={p.name}
                    placeholder="Character name"
                    autoComplete="off"
                    onChange={(e) => set(p.key, { name: e.target.value })}
                  />
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className={s.actions}>
        {unnamed.length ? (
          <BlockedAction
            id="assign-why"
            variant="secondary"
            size="small"
            label="Add sheets"
            reason={`Name the new character for ${unnamed.map((p) => p.file.name).join(", ")}.`}
          />
        ) : (
          <Button
            variant="secondary"
            size="small"
            onClick={onAdd}
            success={added}
          >
            Add sheets
          </Button>
        )}
        {!added && (
          <Button variant="quiet" size="small" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

type CharactersProps = {
  characters: CastCharacter[];
  current: string;
  sheetsOf: (id: string) => CastSheet[];
  onChoose: (id: string) => void;
};

/** One tab per character: face, name and sheet count. Arrow keys, Home and End move between them. */
function Characters({ characters, current, sheetsOf, onChoose }: CharactersProps) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = characters.findIndex((x) => x.id === current);
    const to =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (i + 1) % characters.length
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (i - 1 + characters.length) % characters.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? characters.length - 1
              : -1;
    if (to < 0) return;
    e.preventDefault();
    const id = characters[to].id;
    onChoose(id);
    const el = document.getElementById(`who-${id}`);
    el?.focus();
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };
  return (
    <div className={c.who} role="tablist" aria-label="Characters" onKeyDown={onKey}>
      {characters.map((ch) => {
        const mine = sheetsOf(ch.id);
        const face = mine[0]?.face ?? mine[0]?.src;
        const on = ch.id === current;
        return (
          <button
            key={ch.id}
            id={`who-${ch.id}`}
            type="button"
            role="tab"
            className={c.whoTab}
            aria-selected={on}
            aria-controls="cast-sheets"
            tabIndex={on ? 0 : -1}
            onClick={() => onChoose(ch.id)}
          >
            <span className={c.face}>
              {face ? <SheetImage src={face} sizes="48px" /> : <span aria-hidden="true">{ch.name.slice(0, 1)}</span>}
            </span>
            <span className={c.whoText}>
              <span className={c.whoName}>{ch.name}</span>
              <span className={c.whoCount}>
                {mine.length} {mine.length === 1 ? "sheet" : "sheets"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

type GroupProps = {
  id: string;
  name: string;
  sheets: CastSheet[];
  selected: string | null;
  fresh: string[];
  renaming: boolean;
  removing: boolean;
  onRename: () => void;
  onRenamed: (name: string) => void;
  onRemove: () => void;
  onRemoveConfirmed: () => void;
  onRemoveCancelled: () => void;
  onSelect: (id: string) => void;
  onFiles: (files: File[]) => void;
};

function Group({
  id,
  name,
  sheets,
  selected,
  fresh,
  renaming,
  removing,
  onRename,
  onRenamed,
  onRemove,
  onRemoveConfirmed,
  onRemoveCancelled,
  onSelect,
  onFiles,
}: GroupProps) {
  const [draft, setDraft] = useState(name === "New character" ? "" : name);
  const [over, setOver] = useState(false);
  const picker = useFilePicker("image/*", onFiles);
  const input = useRef<HTMLInputElement>(null);
  const addTile = useRef<HTMLButtonElement>(null);
  const renameButton = useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const keepButton = useRef<HTMLButtonElement>(null);
  const fieldId = useId();
  /** Where focus goes when the name field closes: the next step after naming, or back to Rename. */
  const next = useRef<"add" | "rename">("rename");
  /** The field has closed once; a blur as it leaves the page must not close it again. */
  const closed = useRef(false);

  useEffect(() => {
    if (!renaming) return;
    closed.current = false;
    setDraft(name === "New character" ? "" : name);
    next.current = name === "New character" ? "add" : "rename";
    input.current?.focus();
  }, [renaming, name]);

  useEffect(() => {
    if (removing) keepButton.current?.focus();
  }, [removing]);

  // The More menu: its first item takes focus; Escape, a click outside or focus leaving closes it.
  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector("button")?.focus();
    const away = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !renameButton.current?.contains(t)) setMenu(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [menu]);
  const pick = (run: () => void) => {
    setMenu(false);
    run();
  };

  const close = (value: string) => {
    if (closed.current) return false;
    closed.current = true;
    onRenamed(value);
    return true;
  };
  const finish = (value: string) => {
    if (!close(value)) return;
    focusSoon(() =>
      next.current === "add" && value ? addTile.current : renameButton.current,
    );
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOver(false);
    onFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <section id="cast-sheets" className={c.group} role="tabpanel" aria-labelledby={`who-${id}`}>
      <div className={c.groupHead}>
        {renaming ? (
          <form
            className={c.renameForm}
            onSubmit={(e) => {
              e.preventDefault();
              finish(draft.trim());
            }}
          >
            <label className="sr-only" htmlFor={fieldId}>
              Character name
            </label>
            <input
              ref={input}
              id={fieldId}
              className={s.input}
              value={draft}
              placeholder="Character name"
              autoComplete="off"
              onChange={(e) => setDraft(e.target.value)}
              onBlur={(e) => {
                // The window losing focus is not leaving the field.
                if (!e.relatedTarget && !document.hasFocus()) return;
                // Leaving by Tab or a click on a control keeps what was typed, and focus goes where the person went.
                // A click on empty space closes the field too, and the keyboard lands on the next step.
                if (e.relatedTarget) close(draft.trim());
                else finish(draft.trim());
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  next.current = "rename";
                  setDraft(name);
                  finish("");
                }
              }}
            />
          </form>
        ) : (
          <h2 className={c.groupName}>{name}</h2>
        )}
        {!renaming && !removing && (
          <div className={c.more}>
            <button
              ref={renameButton}
              id={`more-${id}`}
              type="button"
              className={c.moreButton}
              aria-label={`More for ${name}`}
              aria-expanded={menu}
              aria-controls={menu ? menuId : undefined}
              onClick={() => setMenu((x) => !x)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="4" cy="10" r="1.75" fill="currentColor" />
                <circle cx="10" cy="10" r="1.75" fill="currentColor" />
                <circle cx="16" cy="10" r="1.75" fill="currentColor" />
              </svg>
            </button>
            {menu && (
              <div
                ref={menuRef}
                id={menuId}
                className={`${c.menu} ${m.enter}`}
                onKeyDown={(e) => {
                  const items = Array.from(menuRef.current?.querySelectorAll("button") ?? []);
                  const i = items.indexOf(document.activeElement as HTMLButtonElement);
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setMenu(false);
                    renameButton.current?.focus();
                  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const by = e.key === "ArrowDown" ? 1 : -1;
                    items[(i + by + items.length) % items.length]?.focus();
                  }
                }}
                onBlur={(e) => {
                  const to = e.relatedTarget as Node | null;
                  if (to && !e.currentTarget.contains(to) && to !== renameButton.current) setMenu(false);
                }}
              >
                <button type="button" className={c.menuItem} onClick={() => pick(onRename)}>
                  Rename
                </button>
                <button type="button" className={c.menuItem} onClick={() => pick(onRemove)}>
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {removing && (
        <div
          className={`${s.inset} ${c.confirm} ${m.enter}`}
          role="group"
          aria-label={`Remove ${name}`}
        >
          <p className="small">
            Removes {name} and every sheet under it from this series.
          </p>
          <div className={s.actions}>
            <Button
              variant="secondary"
              size="small"
              onClick={onRemoveConfirmed}
            >
              Remove {name}
            </Button>
            <Button
              ref={keepButton}
              variant="quiet"
              size="small"
              onClick={() => {
                onRemoveCancelled();
                focusSoon(() => renameButton.current);
              }}
            >
              Keep {name}
            </Button>
          </div>
        </div>
      )}
      <ul className={s.tiles}>
        {sheets.map((x, i) => (
          <li key={x.id} className={fresh.includes(x.id) ? m.land : undefined}>
            <button
              type="button"
              id={`tile-${x.id}`}
              className={s.tile}
              aria-pressed={selected === x.id}
              onClick={() => onSelect(x.id)}
            >
              <span className={s.tileArt}>
                <SheetImage
                  src={x.src}
                  sizes="(max-width: 900px) 45vw, 180px"
                  eager={i < 4}
                />
              </span>
              {x.variant ? (
                <>
                  <span className={s.tileName}>{x.variant}</span>
                  <span className={`${s.tileSub} ${c.mono}`}>{x.tag}</span>
                </>
              ) : (
                <span className={`${s.tileName} ${c.mono}`}>{x.tag}</span>
              )}
            </button>
          </li>
        ))}
        <li>
          <button
            ref={addTile}
            id={`add-${id}`}
            type="button"
            className={s.tile}
            onClick={picker.open}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
            aria-label={`Add sheets to ${name}`}
          >
            <span
              className={`${s.tileArt} ${c.addArt}`}
              data-empty="true"
              data-over={over}
            >
              <span className={c.addLine}>
                <GestureIcon name="upload" active={over} />
                Drop or choose
              </span>
            </span>
            <span className={`${s.tileName} muted`}>Add sheet</span>
          </button>
          {picker.node}
        </li>
      </ul>
    </section>
  );
}

type DetailProps = {
  sheet: CastSheet;
  cast: SeriesCast;
  headingRef: React.Ref<HTMLHeadingElement>;
  onMove: (character: string) => void;
  onTag: (tag: string) => void;
  onRemove: () => void;
  onFull: () => void;
};

function Detail({
  sheet,
  cast,
  headingRef,
  onMove,
  onTag,
  onRemove,
  onFull,
}: DetailProps) {
  const [draft, setDraft] = useState(sheet.tag);
  const [error, setError] = useState("");
  const who = cast.characters.find((x) => x.id === sheet.character);

  // A rename or a move can change the tag of a new sheet; show it.
  useEffect(() => {
    if (!sheet.tagEdited) setDraft(sheet.tag);
  }, [sheet.tag, sheet.tagEdited]);

  const typed = (value: string) => {
    const tag = cleanTag(value);
    setDraft(tag);
    if (tag === "@")
      return setError("A tag needs at least one letter or digit after the @.");
    if (tagsIn(cast, sheet.id).includes(tag))
      return setError(
        `${tag} is already used by another sheet. Keep ${sheet.tag} or type a different tag.`,
      );
    setError("");
    if (tag !== sheet.tag) onTag(tag);
  };

  return (
    <Panel
      title={sheet.tag}
      sub={[who?.name, sheet.variant].filter(Boolean).join(", ")}
      headingRef={headingRef}
      actions={
        <Button
          variant="quiet"
          size="small"
          icon={<Icon name="fullscreen" size={16} />}
          onClick={onFull}
        >
          Full size
        </Button>
      }
    >
      <button
        type="button"
        className={c.large}
        onClick={onFull}
        aria-label={`Open ${sheet.tag} at full size`}
      >
        <SheetImage
          src={sheet.src}
          sizes="(max-width: 900px) 100vw, 480px"
          className={c.contain}
          eager
        />
      </button>

      <div className={s.field}>
        <label className={s.label} htmlFor="sheet-character">
          Character
        </label>
        {sheet.added ? (
          <Select
            id="sheet-character"
            value={sheet.character}
            onChange={(e) => onMove(e.target.value)}
          >
            {cast.characters.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </Select>
        ) : (
          <>
            <input
              id="sheet-character"
              className={s.input}
              value={who?.name ?? ""}
              readOnly
            />
          </>
        )}
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="sheet-tag">
          Tag
        </label>
        {sheet.added ? (
          <>
            <input
              id="sheet-tag"
              className={s.input}
              value={draft}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "sheet-tag-hint" : undefined}
              onChange={(e) => typed(e.target.value)}
              onBlur={() => {
                if (error) {
                  setDraft(sheet.tag);
                  setError("");
                }
              }}
            />
            {error && (
              <Alert id="sheet-tag-hint" className={c.fieldNote}>
                {error}
              </Alert>
            )}
          </>
        ) : (
          <input
            id="sheet-tag"
            className={s.input}
            value={sheet.tag}
            readOnly
          />
        )}
      </div>

      <div className={s.actions}>
        <Button
          variant="quiet"
          size="small"
          onClick={onRemove}
          aria-label={`Remove ${sheet.tag}`}
        >
          Remove sheet
        </Button>
      </div>
    </Panel>
  );
}

function FullSize({
  open,
  onClose,
  sheet,
}: {
  open: boolean;
  onClose: () => void;
  sheet: CastSheet;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`${s.dialog} ${c.fullDialog}`}
      aria-label={`${sheet.tag} at full size`}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <MediaFrame key={sheet.src} className={c.fullFrame}>
        <img
          src={sheet.src}
          alt={`Character sheet ${sheet.tag}`}
          className={c.fullImg}
        />
      </MediaFrame>
      <div className={c.fullFoot}>
        <p className={s.tileName}>{sheet.tag}</p>
        <Button variant="quiet" onClick={onClose}>
          Close
        </Button>
      </div>
    </dialog>
  );
}
