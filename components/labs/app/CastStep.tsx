"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronIcon, GestureIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { Btn, IconBtn, cx } from "@/components/labs/chat/ui";
import { useDialog } from "@/components/labs/chat/hooks";
import type { CastSheet } from "@/lib/labs/maker";
import { api, fileUrl, type CastSheet as Upload } from "./api";
import { AppShell } from "./AppShell";
import { useCast, useEpisode } from "./CastProvider";
import type { Element } from "./creator";
import { matchCast } from "./generate";
import { NotionImport } from "./NotionImport";
import { Alert, SaveAction, SaveError, SheetImage, Status, useFilePicker, useSaveThen } from "./parts";
import c from "./CastStep.module.css";

/** What the open picker chooses from: the sheets of one character, or the whole library for one element. */
type Picking = { id: string; mode: "sheet" | "library" };
type Choice = { key: string; src: string; tag: string; name: string; label?: string; group?: string; sheet?: string };
/** What a card is doing on the server, and what went wrong last. */
type Busy = { work?: "upload" | "rename" | "remove"; done?: boolean; error?: string };


/** Cast: the characters and places the script needs, as cards. Each can take another sheet of the same character, a picture from the library, or an upload. */
export function CastStep() {
  const router = useRouter();
  const store = useCast();
  const { ep, patch } = useEpisode();
  const series = store.get(ep.series);
  const [elements, setElements] = useState<Element[]>(() => ep.elements ?? []);
  const [picking, setPicking] = useState<Picking | null>(null);
  const uploadFor = useRef<string | null>(null);
  /** Sheets uploaded to this series, saved on the server. Only a saved episode reads and adds them. */
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [busy, setBusy] = useState<Record<string, Busy>>({});
  const saving = useSaveThen(store.flush);
  const saved = Boolean(ep.id);
  /** A saved episode with no cast chosen yet is matched against the series' sheets. */
  const [unmatched] = useState(() => saved && !ep.elements?.length);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [matchTry, setMatchTry] = useState(0);
  useEffect(() => {
    if (!saved) return;
    const stop = new AbortController();
    void (async () => {
      const list = await api.listCast(ep.series).catch(() => [] as Upload[]);
      if (stop.signal.aborted) return;
      setUploads(list);
      if (!unmatched || stop.signal.aborted) return;
      setMatching(true);
      setMatchError("");
      setElements([]);
      try {
        const r = await matchCast({ tool: store.tool, episodeId: ep.id, seriesId: ep.series, blocks: ep.blocks, texts: ep.texts, library: series, uploads: list }, stop.signal);
        setElements(r.elements);
        setMatching(false);
      } catch (e) {
        if (stop.signal.aborted) return;
        setMatchError(e instanceof Error && e.message ? e.message : "The cast did not come back. Try again.");
        setMatching(false);
      }
    })();
    return () => stop.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved, ep.series, matchTry]);
  const mark = (id: string, b: Busy) => setBusy((all) => ({ ...all, [id]: b }));
  const failed = (id: string, e: unknown) => mark(id, { error: e instanceof Error && e.message ? e.message : "That did not save. Try again." });
  useEffect(() => {
    patch({ elements });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  const set = (id: string, patch: Partial<Element>) => setElements((all) => all.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const sheetsOf = (who?: string) => series.sheets.filter((s) => s.character === who);
  const nameOf = (who: string) => series.characters.find((x) => x.id === who)?.name ?? who;

  /** A saved episode keeps the upload as a cast sheet of its series; the demo draft only shows it for this visit. */
  const take = async (id: string, f: File) => {
    const el = elements.find((x) => x.id === id);
    if (!el) return;
    if (!saved) return set(id, { src: URL.createObjectURL(f), variant: undefined });
    mark(id, { work: "upload" });
    try {
      const sheet = await api.addCast(ep.series, el.name, el.tag, f);
      setUploads((all) => [...all, sheet]);
      set(id, { src: fileUrl(sheet.image), variant: undefined, sheet: sheet.id });
      mark(id, { done: true });
      window.setTimeout(() => mark(id, {}), 1200);
    } catch (e) {
      failed(id, e);
    }
  };
  const picker = useFilePicker("image/*", (files) => {
    const f = files.find((x) => x.type.startsWith("image/"));
    if (!f || !uploadFor.current) return;
    void take(uploadFor.current, f);
  }, false);

  const rename = async (id: string, name: string) => {
    const el = elements.find((x) => x.id === id);
    if (!el?.sheet || !name || name === el.name) return;
    const before = el.name;
    set(id, { name });
    mark(id, { work: "rename" });
    try {
      const sheet = await api.patchCast(el.sheet, { character: name });
      setUploads((all) => all.map((s) => (s.id === sheet.id ? sheet : s)));
      mark(id, {});
    } catch (e) {
      set(id, { name: before });
      failed(id, e);
    }
  };
  const remove = async (id: string) => {
    const sheet = elements.find((x) => x.id === id)?.sheet;
    if (!sheet) return;
    mark(id, { work: "remove" });
    try {
      await api.deleteCast(sheet);
      setUploads((all) => all.filter((s) => s.id !== sheet));
      // Every card that showed the removed sheet goes back to needing a picture.
      setElements((all) => all.map((x) => (x.sheet === sheet ? { ...x, src: undefined, sheet: undefined, variant: undefined } : x)));
      mark(id, {});
    } catch (e) {
      failed(id, e);
    }
  };
  const upload = (id: string) => {
    uploadFor.current = id;
    picker.open();
  };

  const pickingEl = picking ? elements.find((x) => x.id === picking.id) : undefined;
  let choices: Choice[] = [];
  const fromUpload = (s: Upload): Choice => ({ key: s.id, src: fileUrl(s.image), tag: s.tag, name: s.character, label: s.variant ?? undefined, group: s.character, sheet: s.id });
  if (pickingEl && picking?.mode === "sheet") choices = sheetsOf(pickingEl.who).map((s) => fromSheet(s));
  else if (pickingEl && pickingEl.kind === "character")
    choices = [...series.characters.flatMap((ch) => sheetsOf(ch.id).map((s) => ({ ...fromSheet(s), group: ch.name }))), ...uploads.map(fromUpload)];
  else if (pickingEl) choices = [...store.profile.places.map((p) => ({ key: p.tag, src: p.src, tag: p.tag, name: p.name })), ...uploads.map(fromUpload)];

  const choose = (x: Choice) => {
    if (!pickingEl) return;
    set(pickingEl.id, { src: x.src, tag: x.tag, variant: x.label, sheet: x.sheet });
    setPicking(null);
  };

  const groups: { kind: Element["kind"]; title: string }[] = [
    { kind: "character", title: "Characters" },
    { kind: "location", title: "Locations" },
  ];

  return (
    <AppShell
      step="cast"
      onFiles={(files) => {
        const missing = elements.find((x) => !x.src);
        const f = files.find((x) => x.type.startsWith("image/"));
        if (missing && f) void take(missing.id, f);
      }}
      action={
        <SaveAction error={saving.error}>
          <Btn kind="primary" disabled={matching} loading={saving.busy} iconAfter={<Icon name="arrow" size={16} />} onClick={() => saving.go(() => router.push(store.profile.steps.style))}>
            Next
          </Btn>
        </SaveAction>
      }
    >
      {picker.node}
      <div className={c.page}>
        <div className={c.head}>
          <h1 className={c.title}>Cast</h1>
          <NotionImport
            mode="cast"
            label="Import sheets from Notion"
            seriesId={ep.series}
            disabled={matching}
            onCast={({ sheets }) => {
              setUploads((all) => [...all, ...sheets.filter((s) => !all.some((x) => x.id === s.id))]);
              setElements((all) => {
                const next = [...all];
                for (const s of sheets) {
                  const src = fileUrl(s.image);
                  const name = s.character.toLowerCase();
                  const at = next.findIndex((x) => x.name.toLowerCase() === name && !x.src);
                  if (at >= 0) next[at] = { ...next[at], src, sheet: s.id, variant: s.variant ?? undefined, question: undefined };
                  else if (!next.some((x) => x.sheet === s.id || (x.name.toLowerCase() === name && x.src)))
                    next.push({ id: `notion-${s.id}`, kind: "character", name: s.character, tag: s.tag, src, sheet: s.id, variant: s.variant ?? undefined });
                }
                return next;
              });
            }}
          />
        </div>
        {matchError && (
          <div className={c.failed}>
            <Alert>{matchError}</Alert>
            <Btn kind="secondary" icon={<Icon name="replay" size={16} />} onClick={() => setMatchTry((t) => t + 1)}>
              Try again
            </Btn>
          </div>
        )}
        {matching && (
          <p role="status">
            <Status icon="spinner">Finding who the screenplay needs</Status>
          </p>
        )}
        {!matching && groups.filter((g) => elements.some((x) => x.kind === g.kind)).map((g) => (
          <section key={g.kind} className={c.group} aria-labelledby={`cast-${g.kind}`}>
            <h2 id={`cast-${g.kind}`} className={c.groupTitle}>
              {g.title}
            </h2>
            <ul className={c.grid}>
              {elements
                .filter((x) => x.kind === g.kind)
                .map((x) => (
                  <li key={x.id}>
                    <Card
                      el={x}
                      sheets={x.who ? sheetsOf(x.who).length : 0}
                      onSheet={() => setPicking({ id: x.id, mode: "sheet" })}
                      onLibrary={() => setPicking({ id: x.id, mode: "library" })}
                      onUpload={() => upload(x.id)}
                      busy={busy[x.id] ?? {}}
                      onRename={(name) => void rename(x.id, name)}
                      onRemove={() => void remove(x.id)}
                    />
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>

      <Picker
        open={Boolean(picking)}
        title={pickingEl ? (picking?.mode === "sheet" ? nameOf(pickingEl.who ?? "") : pickingEl.name) : ""}
        current={pickingEl?.src}
        choices={choices}
        onChoose={choose}
        onClose={() => setPicking(null)}
      />
    </AppShell>
  );
}

const fromSheet = (s: CastSheet): Choice => ({ key: s.id, src: s.src, tag: s.tag, name: s.tag, label: s.variant });

type CardProps = {
  el: Element;
  sheets: number;
  onSheet: () => void;
  onLibrary: () => void;
  onUpload: () => void;
  busy: Busy;
  onRename: (name: string) => void;
  onRemove: () => void;
};

function Card({ el, sheets, onSheet, onLibrary, onUpload, busy, onRename, onRemove }: CardProps) {
  const id = useId();
  const [naming, setNaming] = useState(false);
  const [draft, setDraft] = useState(el.name);
  const name = () => {
    setNaming(false);
    onRename(draft.trim());
  };
  const tools = (
    <div className={c.tools}>
      <Btn kind="secondary" small icon={<Icon name="library" size={16} />} onClick={onLibrary}>
        Choose from library
      </Btn>
      <Btn kind="secondary" small icon={<GestureIcon name="upload" size={16} />} loading={busy.work === "upload"} success={busy.done} onClick={onUpload}>
        Upload
      </Btn>
      {el.sheet && (
        <>
          <Btn
            kind="ghost"
            small
            icon={<Icon name="create" size={16} />}
            loading={busy.work === "rename"}
            onClick={() => {
              setDraft(el.name);
              setNaming(true);
            }}
          >
            Rename
          </Btn>
          <Btn kind="ghost" small icon={<Icon name="close" size={16} />} loading={busy.work === "remove"} onClick={onRemove}>
            Remove
          </Btn>
        </>
      )}
      <SaveError>{busy.error}</SaveError>
    </div>
  );
  const title = naming ? (
    <input
      className={c.rename}
      aria-label="Name"
      value={draft}
      autoFocus
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={name}
      onKeyDown={(e) => {
        if (e.key === "Enter") name();
        if (e.key === "Escape") setNaming(false);
      }}
    />
  ) : (
    <h3 id={id} className={c.name}>
      {el.name}
    </h3>
  );
  if (!el.src)
    return (
      <article className={cx(c.card, c.missing)} aria-labelledby={id}>
        <div className={c.art} data-kind={el.kind}>
          <GestureIcon name="plus" size={24} />
        </div>
        <div className={c.text}>
          {title}
          <p className={c.tag}>{el.tag}</p>
          {el.question && <p className={c.question}>{el.question}</p>}
        </div>
        {tools}
      </article>
    );
  return (
    <article className={c.card} aria-labelledby={id}>
      <div className={c.art} data-kind={el.kind}>
        <SheetImage src={el.src} sizes="(max-width: 767px) 50vw, 280px" />
      </div>
      <div className={c.text}>
        {title}
        <p className={c.tag}>{el.tag}</p>
        {el.question && <p className={c.question}>{el.question}</p>}
      </div>
      {el.kind === "character" && sheets > 1 && (
        <button type="button" className={c.variant} onClick={onSheet} aria-label={`Choose another sheet of ${el.name}`}>
          <span>{el.variant ?? "Other sheet"}</span>
          <ChevronIcon open={false} size={16} />
        </button>
      )}
      {tools}
    </article>
  );
}

type PickerProps = { open: boolean; title: string; current?: string; choices: Choice[]; onChoose: (x: Choice) => void; onClose: () => void };

/** A grid of pictures to choose from, in a sheet over the page. */
function Picker({ open, title, current, choices, onChoose, onClose }: PickerProps) {
  const ref = useDialog(open);
  const id = useId();
  const byGroup = new Map<string, Choice[]>();
  for (const x of choices) byGroup.set(x.group ?? "", [...(byGroup.get(x.group ?? "") ?? []), x]);
  let body: ReactNode = null;
  if (open)
    body = [...byGroup].map(([group, items]) => (
      <section key={group || "all"} className={c.pickGroup}>
        {group && <h3 className={c.pickGroupTitle}>{group}</h3>}
        <ul className={c.pickGrid}>
          {items.map((x) => (
            <li key={x.key}>
              <button type="button" className={c.pick} aria-pressed={x.src === current} onClick={() => onChoose(x)}>
                <span className={c.pickArt}>
                  <SheetImage src={x.src} sizes="(max-width: 767px) 45vw, 200px" />
                  {x.src === current && (
                    <span className={c.pickOn} aria-hidden="true">
                      <Icon name="check" size={16} />
                    </span>
                  )}
                </span>
                <span className={c.pickLabel}>{x.label ?? x.name}</span>
                {x.label && <span className={c.pickTag}>{x.tag}</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>
    ));
  return (
    <dialog ref={ref} className={c.dialog} aria-labelledby={id} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className={c.dialogHead}>
        <h2 id={id} className={c.dialogTitle}>
          {title}
        </h2>
        <IconBtn label="Close" onClick={onClose}>
          <GestureIcon name="close" size={18} />
        </IconBtn>
      </div>
      <div className={c.dialogBody}>{body}</div>
    </dialog>
  );
}
