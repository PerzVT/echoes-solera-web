"use client";

import { useState } from "react";
import { Composer } from "@/components/labs/chat/Composer";
import { fdxToText } from "./script";
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
  sending: boolean;
  error: string;
  onSubmit: (source: string) => void;
};

/** The first step of the storyboard and manga tools: the question, the tools, and one box for a scene or a story. A .txt or .fdx file is read into it. */
export function SourceStart({ tool, steps, reached, label, placeholder, initial = "", sending, error, onSubmit }: Props) {
  const [text, setText] = useState(initial);
  const [file, setFile] = useState("");
  const [fileText, setFileText] = useState("");
  const [rejected, setRejected] = useState("");

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

  return (
    <WorkShell tool={tool} view="create" steps={steps} step={steps[0].key} reached={reached} onFiles={take}>
      <StartScreen tool={tool}>
        <Composer
          value={text}
          onChange={setText}
          onSubmit={() => onSubmit(source)}
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
          ready={Boolean(source.trim())}
          sending={sending}
          error={rejected || error}
          autoFocus
        />
      </StartScreen>
    </WorkShell>
  );
}
