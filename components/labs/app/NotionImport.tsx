"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { GestureIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { Btn, IconBtn } from "@/components/labs/chat/ui";
import { ComposerTool } from "@/components/labs/chat/Composer";
import type { NotionImportCastResult, NotionImportScriptResult, NotionImportTextResult, NotionItem, NotionStatus } from "@/lib/labs/ai/contract";
import { api } from "./api";
import { Alert, Status } from "./parts";
import n from "./NotionImport.module.css";

type Common = { label?: string; /** "composer" draws the button like the composer's "Upload a file". */ look?: "button" | "composer"; disabled?: boolean };
type ScriptProps = Common & {
  mode: "script";
  /** Saves the episode first when it is new, and returns its id. Rejects with a message to show. */
  episode: () => Promise<string>;
  onScript: (r: NotionImportScriptResult) => void;
};
type CastProps = Common & { mode: "cast"; seriesId: string; onCast: (r: NotionImportCastResult) => void };
/** A page's text for a box to take in, saved nowhere: the storyboard, manga and cooking starts. */
type TextProps = Common & { mode: "text"; onText: (r: NotionImportTextResult) => void };
type Props = ScriptProps | CastProps | TextProps;

const message = (e: unknown) => (e instanceof Error && e.message ? e.message : "That did not work. Try again.");

/** "Import from Notion": the button and its dialog. A script page's text goes into the episode; cast sheet pages come in with their pictures. */
export function NotionImport(props: Props) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return (
    <>
      {props.look === "composer" ? (
        <ComposerTool ref={button} icon={<Icon name="notion" size={18} />} aria-haspopup="dialog" disabled={props.disabled} onClick={() => setOpen(true)}>
          {props.label ?? "Import from Notion"}
        </ComposerTool>
      ) : (
        <Btn ref={button} kind="secondary" small icon={<Icon name="notion" size={16} />} aria-haspopup="dialog" disabled={props.disabled} onClick={() => setOpen(true)}>
          {props.label ?? "Import from Notion"}
        </Btn>
      )}
      {open && (
        <NotionDialog
          {...props}
          onClose={() => {
            setOpen(false);
            requestAnimationFrame(() => button.current?.focus());
          }}
        />
      )}
    </>
  );
}

type Phase = { at: "pick" } | { at: "importing" } | { at: "done"; text: string };

function NotionDialog(props: Props & { onClose: () => void }) {
  const { mode, onClose } = props;
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const searchId = useId();
  const [status, setStatus] = useState<NotionStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const [query, setQuery] = useState("");
  const [inDb, setInDb] = useState<NotionItem | null>(null);
  const [items, setItems] = useState<NotionItem[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [picked, setPicked] = useState<NotionItem[]>([]);
  const [phase, setPhase] = useState<Phase>({ at: "pick" });
  const [importError, setImportError] = useState("");
  const asked = useRef(0);

  // A modal dialog: the page behind is inert and Escape closes it. Tab wraps inside it rather than leaving for the browser bar.
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  useEffect(() => {
    api.notionStatus().then(setStatus, (e: unknown) => setStatusError(message(e)));
  }, []);

  const linked = status?.linked === true;
  const load = (more: boolean) => {
    const ask = ++asked.current;
    setLoading(true);
    setListError("");
    api.notionSearch(query, inDb?.id ?? null, more ? next : null).then(
      (r) => {
        if (ask !== asked.current) return;
        setItems((had) => (more ? [...had, ...r.items] : r.items));
        setNext(r.next);
        setLoading(false);
      },
      (e: unknown) => {
        if (ask !== asked.current) return;
        setListError(message(e));
        setLoading(false);
      },
    );
  };
  // Typing searches after a short pause; opening a database lists its pages.
  useEffect(() => {
    if (!linked) return;
    const t = window.setTimeout(() => load(false), inDb ? 0 : 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linked, query, inDb]);

  const isPicked = (it: NotionItem) => picked.some((p) => p.id === it.id);
  const toggle = (it: NotionItem) => {
    if (mode !== "cast") return setPicked(isPicked(it) ? [] : [it]);
    setPicked((all) => (isPicked(it) ? all.filter((p) => p.id !== it.id) : all.length >= 20 ? all : [...all, it]));
  };

  const run = async () => {
    if (!picked.length) return;
    setPhase({ at: "importing" });
    setImportError("");
    try {
      if (props.mode === "script") {
        const episodeId = await props.episode();
        const r = await api.notionImportScript(picked[0].id, episodeId);
        props.onScript(r);
        setPhase({ at: "done", text: r.truncated ? `Imported ${picked[0].title || "the page"}. Notion sent only the first part of it.` : `Imported ${picked[0].title || "the page"}.` });
      } else if (props.mode === "text") {
        const r = await api.notionImportText(picked[0].id);
        props.onText(r);
        setPhase({ at: "done", text: r.truncated ? `Imported ${picked[0].title || "the page"}. Notion sent only the first part of it.` : `Imported ${picked[0].title || "the page"}.` });
      } else {
        const r = await api.notionImportCast(props.seriesId, picked.map((p) => p.id));
        props.onCast(r);
        const got = r.sheets.length;
        const left = r.skipped.length;
        setPhase({ at: "done", text: `Imported ${got} ${got === 1 ? "sheet" : "sheets"}.${left ? ` ${left} ${left === 1 ? "page had" : "pages had"} no picture to use.` : ""}` });
      }
    } catch (e) {
      setImportError(message(e));
      setPhase({ at: "pick" });
    }
  };

  const title = mode === "script" ? "Import a script from Notion" : mode === "text" ? "Import a page from Notion" : "Import cast sheets from Notion";
  const busy = phase.at === "importing";

  let body: ReactNode;
  if (statusError) body = <Alert>{statusError}</Alert>;
  else if (!status) body = <Status icon="spinner">Connecting to Notion</Status>;
  else if (!status.linked) body = <p className={n.line}>Notion integration not set up.</p>;
  else if (phase.at === "done")
    body = (
      <p className={n.line} role="status">
        <Status icon="check" drawn>
          {phase.text}
        </Status>
      </p>
    );
  else
    body = (
      <>
        <div className={n.find}>
          {inDb ? (
            <div className={n.place}>
              <button type="button" className={n.crumb} onClick={() => setInDb(null)}>
                All of Notion
              </button>
              <span aria-hidden="true">/</span>
              <span className={n.here}>{inDb.title || "Untitled"}</span>
            </div>
          ) : (
            <label className={n.search} htmlFor={searchId}>
              <span className="sr-only">Search Notion</span>
              <Icon name="search" size={18} />
              <input id={searchId} type="search" placeholder="Search Notion" value={query} autoComplete="off" onChange={(e) => setQuery(e.target.value)} disabled={busy} />
            </label>
          )}
        </div>
        {listError && <Alert>{listError}</Alert>}
        <ul className={n.list} aria-busy={loading || undefined} aria-label={inDb ? `Pages in ${inDb.title || "the database"}` : "Pages and databases"}>
          {items.map((it) => {
            const meta = Object.values(it.properties).filter(Boolean).slice(0, 2).join(" · ");
            if (it.type === "database")
              return (
                <li key={it.id}>
                  <button type="button" className={n.row} onClick={() => setInDb(it)} disabled={busy}>
                    <span className={n.mark} aria-hidden="true">
                      <Icon name="library" size={18} />
                    </span>
                    <span className={n.rowText}>
                      <span className={n.rowTitle}>{it.title || "Untitled"}</span>
                      <span className={n.rowSub}>Database</span>
                    </span>
                  </button>
                </li>
              );
            const on = isPicked(it);
            return (
              <li key={it.id}>
                <button type="button" className={n.row} aria-pressed={on} onClick={() => toggle(it)} disabled={busy}>
                  <span className={n.mark} data-on={on || undefined} aria-hidden="true">
                    {on ? <Icon name="check" size={16} /> : <Icon name={mode === "cast" ? "cast" : "script"} size={18} />}
                  </span>
                  <span className={n.rowText}>
                    <span className={n.rowTitle}>{it.title || "Untitled"}</span>
                    {meta && <span className={n.rowSub}>{meta}</span>}
                  </span>
                </button>
              </li>
            );
          })}
          {loading &&
            Array.from({ length: items.length ? 1 : 4 }, (_, i) => (
              <li key={`wait-${i}`} className={n.waiting}>
                <span />
              </li>
            ))}
        </ul>
        {!loading && !listError && items.length === 0 && <p className={n.empty}>{query.trim() ? "Nothing in Notion matches that." : "Nothing here."}</p>}
        {next && !loading && (
          <Btn kind="ghost" small icon={<Icon name="down" size={16} />} onClick={() => load(true)} disabled={busy}>
            Show more
          </Btn>
        )}
      </>
    );

  const canImport = linked && phase.at !== "done";
  const count = picked.length;
  return (
    <dialog
      ref={ref}
      className={n.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      onClick={(e) => e.target === ref.current && !busy && onClose()}
      onKeyDown={(e) => {
        if (e.key !== "Tab" || !ref.current) return;
        const all = [...ref.current.querySelectorAll<HTMLElement>("button, input, select, textarea, a[href], [tabindex]:not([tabindex='-1'])")].filter((x) => !x.matches(":disabled"));
        if (!all.length) return;
        const first = all[0];
        const last = all[all.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }}
    >
      <div className={n.head}>
        <h2 id={titleId} className={n.title}>
          {title}
        </h2>
        <IconBtn label="Close" onClick={onClose} disabled={busy}>
          <GestureIcon name="close" size={18} />
        </IconBtn>
      </div>
      <div className={n.body}>{body}</div>
      {(canImport || phase.at === "done") && (
        <div className={n.foot}>
          {importError && <Alert>{importError}</Alert>}
          {phase.at === "done" ? (
            <Btn kind="primary" icon={<Icon name="check" size={16} />} onClick={onClose} autoFocus>
              Done
            </Btn>
          ) : (
            <Btn kind="primary" icon={<Icon name="download" size={16} />} disabled={!count} loading={busy} onClick={() => void run()}>
              {mode === "script" ? "Import script" : mode === "text" ? "Import page" : count > 1 ? `Import ${count} sheets` : "Import sheet"}
            </Btn>
          )}
        </div>
      )}
    </dialog>
  );
}
