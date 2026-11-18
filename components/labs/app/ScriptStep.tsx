"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import { ChevronIcon, GestureIcon } from "@/components/labs/fx";
import { Btn, IconBtn } from "@/components/labs/chat/ui";
import { scriptTypes, screenplay } from "@/lib/labs/maker";
import { AppIcon } from "./AppIcon";
import { AppShell } from "./AppShell";
import { DRAFT, episodeKey, useCast } from "./CastProvider";
import type { Episode } from "./api";
import { Alert, SaveError, focusSoon, useFilePicker } from "./parts";
import { fdxToText, parseScript } from "./script";
import st from "./ScriptStep.module.css";

const NEW = "__new";

/** /app: the start of a mini-series episode. One box that takes a typed or pasted script, or a script file, and the series it belongs to. */
export function ScriptStep() {
  const router = useRouter();
  const store = useCast();
  // An episode submitted and not yet finished opens with what was submitted, so going back to Script loses nothing.
  const open = store.current !== DRAFT ? store.episodeOf(store.current) : undefined;
  const resume = open?.isNew ? open : undefined;
  const [file, setFile] = useState(resume?.file ?? "");
  /** The file chosen on this visit. A file saved earlier is only a name here and stays on the server. */
  const [fileObj, setFileObj] = useState<File | null>(null);
  /** The file's text, or null for a file that cannot be read here (.docx, .pdf). */
  const [fileText, setFileText] = useState<string | null>(null);
  const [text, setText] = useState(resume && !resume.file ? resume.source : "");
  const [series, setSeries] = useState(resume ? (resume.newSeries ? NEW : resume.series) : (store.series[0]?.slug ?? NEW));
  const [newName, setNewName] = useState(resume?.newSeries ?? "");
  const [rejected, setRejected] = useState("");
  const [over, setOver] = useState(false);
  const [going, setGoing] = useState(false);
  const [saveError, setSaveError] = useState("");
  /** What a failed submit already saved, so trying again does not make a second series or episode. */
  const made = useRef<{ series?: string; title?: string; episode?: Episode }>({});
  const upload = useRef<HTMLButtonElement>(null);
  const nameField = useRef<HTMLInputElement>(null);

  /** One script per episode: the first file is used. A .txt or .fdx file is read; others keep their name only. */
  const take = (files: File[]) => {
    const [f] = files;
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!scriptTypes.includes(ext)) {
      setRejected(`${f.name} is not a script. Use a .txt, .docx, .fdx or .pdf file.`);
      return;
    }
    setRejected("");
    setFile(f.name);
    setFileObj(f);
    setFileText(null);
    if (ext === ".txt" || ext === ".fdx")
      f.text()
        .then((t) => setFileText(ext === ".fdx" && t.trimStart().startsWith("<") ? fdxToText(t) : t))
        .catch(() => setFileText(null));
  };
  const picker = useFilePicker(scriptTypes.join(","), take, false);

  const onDragOver = (e: DragEvent) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    setOver(true);
  };
  const onDragLeave = (e: DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
  };
  const onDrop = (e: DragEvent) => {
    if (!e.dataTransfer.files.length) return;
    e.preventDefault();
    setOver(false);
    take(Array.from(e.dataTransfer.files));
  };

  const isNew = series === NEW;
  const ready = Boolean(file || text.trim()) && (!isNew || Boolean(newName.trim()));
  /**
   * Saves the series (when new), the episode and its script, then opens processing. Going back to Script on an
   * episode already saved saves its script again rather than making another episode.
   */
  const submit = async () => {
    if (!ready || going) return;
    const name = newName.trim();
    // A file that cannot be read here keeps its name and opens on the demo script.
    const source = file ? (fileText ?? (!fileObj && resume?.file === file ? resume.source : "")) : text;
    setGoing(true);
    setSaveError("");
    try {
      let ep: Episode;
      const same = resume?.id && resume.step && (isNew ? false : resume.series === series);
      if (same && resume?.id) {
        ep = { id: resume.id, seriesId: resume.series, title: resume.episode, step: resume.step } as Episode;
      } else if (made.current.episode && made.current.series === (isNew ? undefined : series) && made.current.title === (isNew ? name : undefined)) {
        ep = made.current.episode;
      } else {
        ep = await store.createEpisode(isNew ? { title: name } : { series });
        made.current = { series: isNew ? undefined : series, title: isNew ? name : undefined, episode: ep };
      }
      // A file saved earlier and still shown stays as it is; one removed on this visit is dropped.
      const cleared = !file && Boolean(resume?.file);
      await store.saveScript(ep.id, source, fileObj, cleared);
      const blocks = source.trim() ? parseScript(source) : screenplay;
      store.start(episodeKey(ep.seriesId, ep.title), {
        id: ep.id,
        step: ep.step,
        series: ep.seriesId,
        episode: ep.title,
        isNew: true,
        source,
        file: file || undefined,
        blocks,
      });
      router.push("/app/episode/screenplay?state=processing");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "That did not save. Try again.");
      setGoing(false);
    }
  };

  return (
    <AppShell step="script" view="create" onFiles={take}>
      <div className={st.page}>
        <h1 className={st.title}>What do you want to make?</h1>
        <div className={st.box} data-over={over} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
          <label htmlFor="script-text" className="sr-only">
            Script
          </label>
          <textarea
            id="script-text"
            className={st.text}
            placeholder="Paste or write a script"
            value={text}
            spellCheck={false}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
          />
          {over && (
            <div className={st.dropping} aria-hidden="true">
              <GestureIcon name="upload" size={28} active />
            </div>
          )}
          {rejected && <Alert className={st.alert}>{rejected}</Alert>}
          <div className={st.foot}>
            {picker.node}
            {file ? (
              <p className={st.chosen}>
                <AppIcon name="file" size={16} />
                <span className={st.chosenName}>{file}</span>
                <IconBtn
                  label={`Remove ${file}`}
                  onClick={() => {
                    setFile("");
                    setFileObj(null);
                    setFileText(null);
                    focusSoon(() => upload.current);
                  }}
                >
                  <GestureIcon name="close" size={16} />
                </IconBtn>
              </p>
            ) : (
              <Btn ref={upload} kind="ghost" icon={<GestureIcon name="upload" size={18} />} onClick={picker.open}>
                Upload a file
              </Btn>
            )}
            <div className={st.end}>
              <label className={st.series}>
                <span className={st.seriesLabel}>Series</span>
                <span className={st.selectWrap}>
                  <select
                    className={st.select}
                    value={series}
                    onChange={(e) => {
                      setSeries(e.target.value);
                      if (e.target.value === NEW) focusSoon(() => nameField.current);
                    }}
                  >
                    {store.series.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.title}
                      </option>
                    ))}
                    <option value={NEW}>New series</option>
                  </select>
                  <ChevronIcon open={false} size={16} />
                </span>
              </label>
              {isNew && (
                <input
                  ref={nameField}
                  className={st.name}
                  aria-label="Series name"
                  placeholder="Series name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
                />
              )}
              <SaveError>{saveError}</SaveError>
              <Btn kind="primary" className={st.submit} disabled={!ready} loading={going} onClick={submit}>
                Submit
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
