"use client";

import { useRef, useState } from "react";
import { Composer } from "@/components/labs/chat/Composer";
import { NotionImport } from "./NotionImport";
import { focusSoon } from "./parts";
import { fdxToText } from "./script";
import { NEW_SERIES, NO_SERIES, SeriesPicker } from "./SeriesPicker";
import { createSeriesOption, useSeriesOptions } from "./seriesOptions";
import { StartScreen } from "./StartScreen";
import { WorkShell, type WorkStepDef } from "./WorkShell";

const TYPES = [".txt", ".fdx"];

type Props = {
  tool: "storyboard" | "manga";
  steps: WorkStepDef[];
  reached?: string;
  /** The field's name: "Scene" or "Story". */
  label: string;
  placeholder: string;
  initial?: string;
  /** The series the work being edited belongs to; null or left out for none. */
  initialSeries?: string | null;
  sending: boolean;
  error: string;
  /** The text to make from and the series it belongs to (null for none). */
  onSubmit: (source: string, seriesId: string | null) => void | Promise<void>;
};

/**
 * The first step of the storyboard and manga tools, laid out like every other start: the question, the tools, and
 * one box with Upload a file, Import from Notion and the series picker. A .txt or .fdx file is read into it; a
 * storyboard or manga can belong to a series or stand alone.
 */
export function SourceStart({ tool, steps, reached, label, placeholder, initial = "", initialSeries = null, sending, error, onSubmit }: Props) {
  const options = useSeriesOptions();
  const [text, setText] = useState(initial);
  const [file, setFile] = useState("");
  const [fileText, setFileText] = useState("");
  const [rejected, setRejected] = useState("");
  const [series, setSeries] = useState(initialSeries ?? NO_SERIES);
  const [newName, setNewName] = useState("");
  const [seriesError, setSeriesError] = useState("");
  const [saving, setSaving] = useState(false);
  const nameField = useRef<HTMLInputElement>(null);

  const take = (files: File[]) => {
    const [f] = files;
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!TYPES.includes(ext)) return setRejected(`${f.name} cannot be read here. Use a .txt or .fdx file, or paste the text.`);
    setRejected("");
    f.text()
      .then((t) => {
        setFile(f.name);
        setFileText(ext === ".fdx" && t.trimStart().startsWith("<") ? fdxToText(t) : t);
      })
      .catch(() => setRejected(`${f.name} could not be read. Paste the text instead.`));
  };
  const source = file ? fileText : text;
  const isNew = series === NEW_SERIES;
  const ready = Boolean(source.trim()) && (!isNew || Boolean(newName.trim()));
  const busy = sending || saving;

  const submit = async () => {
    if (!ready || busy) return;
    setSeriesError("");
    let seriesId: string | null = series === NO_SERIES ? null : series;
    if (isNew) {
      setSaving(true);
      try {
        const made = await createSeriesOption(newName.trim(), tool === "manga" ? "anime" : "mini-series");
        seriesId = made.id;
        setSeries(made.id);
        setNewName("");
      } catch (e) {
        setSeriesError(e instanceof Error && e.message ? e.message : "The series did not save. Try again.");
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    await onSubmit(source, seriesId);
  };

  // An id not in the list yet (the list is still loading) keeps its place as a choice.
  const shown = options.map((o) => ({ value: o.id, label: o.title }));
  if (series !== NO_SERIES && series !== NEW_SERIES && !shown.some((o) => o.value === series)) shown.unshift({ value: series, label: "This series" });

  return (
    <WorkShell tool={tool} view="create" steps={steps} step={steps[0].key} reached={reached} onFiles={take}>
      <StartScreen tool={tool}>
        <Composer
          value={text}
          onChange={setText}
          onSubmit={() => void submit()}
          label={label}
          placeholder={placeholder}
          attachment={{
            accept: TYPES.join(","),
            file,
            onAttach: take,
            onRemove: () => {
              setFile("");
              setFileText("");
            },
          }}
          tools={
            <NotionImport
              mode="text"
              look="composer"
              disabled={busy}
              onText={(r) => {
                setFile("");
                setFileText("");
                setText(r.text);
              }}
            />
          }
          leading={
            <SeriesPicker
              ref={nameField}
              value={series}
              onChange={(v) => {
                setSeries(v);
                if (v === NEW_SERIES) focusSoon(() => nameField.current);
              }}
              options={shown}
              none="No series"
              newName={newName}
              onNewName={setNewName}
              onEnter={() => void submit()}
              disabled={busy}
            />
          }
          ready={ready}
          sending={busy}
          error={rejected || seriesError || error}
          autoFocus
        />
      </StartScreen>
    </WorkShell>
  );
}
