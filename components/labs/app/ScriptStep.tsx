"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Composer } from "@/components/labs/chat/Composer";
import { scriptTypes } from "@/lib/labs/maker";
import { AppShell } from "./AppShell";
import { DRAFT, episodeKey, useCast } from "./CastProvider";
import type { Episode } from "./api";
import { makeScreenplay } from "./generate";
import { NotionImport } from "./NotionImport";
import { focusSoon } from "./parts";
import { NEW_SERIES as NEW, SeriesPicker } from "./SeriesPicker";
import { fdxToText } from "./script";
import { StartScreen } from "./StartScreen";

/** /app and /app/anime: the start of an episode. One box that takes a typed or pasted script, or a script file, and the series it belongs to. */
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
  const [going, setGoing] = useState(false);
  const [saveError, setSaveError] = useState("");
  /** What a failed submit already saved, so trying again does not make a second series or episode. */
  const made = useRef<{ series?: string; title?: string; episode?: Episode }>({});
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
  const clear = () => {
    setFile("");
    setFileObj(null);
    setFileText(null);
  };

  const isNew = series === NEW;
  const ready = Boolean(file || text.trim()) && (!isNew || Boolean(newName.trim()));

  /** The episode this script belongs to: the one already saved, or a new one (and its series when new). */
  const ensureEpisode = async (): Promise<Episode> => {
    const name = newName.trim();
    const same = resume?.id && resume.step && (isNew ? false : resume.series === series);
    if (same && resume?.id) return { id: resume.id, seriesId: resume.series, title: resume.episode, step: resume.step } as Episode;
    if (made.current.episode && made.current.series === (isNew ? undefined : series) && made.current.title === (isNew ? name : undefined)) return made.current.episode;
    const ep = await store.createEpisode(isNew ? { title: name } : { series });
    made.current = { series: isNew ? undefined : series, title: isNew ? name : undefined, episode: ep };
    return ep;
  };
  /**
   * Saves the series (when new), the episode and its script, then opens processing. Going back to Script on an
   * episode already saved saves its script again rather than making another episode.
   */
  const submit = async () => {
    if (!ready || going) return;
    // A file that cannot be read here keeps its name; the server reads the saved file.
    const source = file ? (fileText ?? (!fileObj && resume?.file === file ? resume.source : "")) : text;
    setGoing(true);
    setSaveError("");
    try {
      const ep = await ensureEpisode();
      // A file saved earlier and still shown stays as it is; one removed on this visit is dropped.
      const cleared = !file && Boolean(resume?.file);
      await store.saveScript(ep.id, source, fileObj, cleared);
      // The episode opens before its screenplay is made, so the later steps stay reachable when generation fails.
      const key = episodeKey(ep.seriesId, ep.title);
      store.start(key, {
        id: ep.id,
        step: ep.step,
        series: ep.seriesId,
        episode: ep.title,
        isNew: true,
        source,
        file: file || undefined,
        blocks: [],
      });
      const { blocks } = await makeScreenplay({ tool: store.tool, source, episodeId: ep.id });
      store.patch(key, { blocks });
      router.push(`${store.profile.steps.screenplay}?state=processing`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "That did not save. Try again.");
      setGoing(false);
    }
  };

  const seriesPicker = (
    <SeriesPicker
      ref={nameField}
      value={series}
      onChange={(v) => {
        setSeries(v);
        if (v === NEW) focusSoon(() => nameField.current);
      }}
      options={store.series.map((s) => ({ value: s.slug, label: s.title }))}
      newName={newName}
      onNewName={setNewName}
      onEnter={submit}
      disabled={going}
    />
  );

  return (
    <AppShell step="script" view="create" onFiles={take}>
      <StartScreen tool={store.tool}>
        <Composer
          value={text}
          onChange={setText}
          onSubmit={submit}
          label="Script"
          placeholder="Paste or write a script"
          submitOn="mod-enter"
          attachment={{ accept: scriptTypes.join(","), file, onAttach: take, onRemove: clear }}
          tools={
            <NotionImport
              mode="script"
              look="composer"
              disabled={going}
              episode={async () => {
                if (isNew && !newName.trim()) throw new Error("Name the new series first.");
                return (await ensureEpisode()).id;
              }}
              onScript={({ script }) => {
                clear();
                setText(script.text);
              }}
            />
          }
          leading={seriesPicker}
          ready={ready}
          sending={going}
          error={rejected || saveError}
          autoFocus
        />
      </StartScreen>
    </AppShell>
  );
}
