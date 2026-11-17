"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "./AppShell";
import { Button } from "@/components/labs/Button";
import { AppIcon } from "./AppIcon";
import m from "./fx/motion.module.css";
import { useCast } from "./CastProvider";
import { Alert, BlockedAction, Dropzone, EpisodeTitle, Panel, RecentScripts, Stepper, focusSoon } from "./parts";
import { scriptTypes } from "@/lib/labs/maker";
import s from "./maker.module.css";
import st from "./ScriptStep.module.css";

export function ScriptStep() {
  const router = useRouter();
  const store = useCast();
  // The chosen file and the pasted text survive going on to Screenplay and coming Back.
  const [file, setFile] = useState<string>(() => store.kept<string>("script:file") ?? "");
  const [text, setText] = useState(() => store.kept<string>("script:text") ?? "");
  useEffect(() => {
    store.keep("script:file", file);
    store.keep("script:text", text);
  }, [store, file, text]);
  const [rejected, setRejected] = useState("");
  const [going, setGoing] = useState(false);
  const choose = useRef<HTMLButtonElement>(null);

  /** One script per episode: the first file is used and any others are named as not added. */
  const take = (files: File[]) => {
    const [f, ...rest] = files;
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!scriptTypes.includes(ext)) {
      setRejected(`${f.name} is not a script file and was not added. Use a .txt, .docx, .fdx or .pdf file.`);
      return;
    }
    setRejected(rest.length ? `${rest.map((x) => x.name).join(", ")} not added. An episode takes one script; ${f.name} is used.` : "");
    setFile(f.name);
  };

  const process = () => {
    try {
      sessionStorage.setItem("maker-script", file || "Pasted text");
    } catch {}
    // The button works until the reading screen takes over.
    setGoing(true);
    router.push("/app/episode/screenplay?state=processing");
  };

  const ready = Boolean(file || text.trim());
  const firstLine = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find(Boolean);

  return (
    <AppShell
      section="/app"
      title={<EpisodeTitle />}
      onFiles={take}
      bar={
        <>
          {ready ? (
            <Button onClick={process} loading={going}>
              Process script
            </Button>
          ) : (
            <BlockedAction id="process-why" label="Process script" reason="Add a script file or paste the text first." />
          )}
          <span className={s.divider} aria-hidden="true" />
          <Stepper current="script" />
        </>
      }
    >
      <div className={`${s.split} ${s.fill}`}>
        <Panel title="Bring your script" level={1}>
          <Dropzone
            title="Drop your script here"
            hint=".txt, .docx, .fdx or .pdf"
            button="Choose file"
            buttonLabel="Choose a script file"
            accept=".txt,.docx,.fdx,.pdf"
            onFiles={take}
            buttonRef={choose}
          >
            {file && (
              <p className={`${st.chosen} ${m.enter}`}>
                <AppIcon name="file" size={16} />
                <span className={st.chosenName}>{file}</span>
                <Button variant="quiet" size="small" onClick={() => {
                    setFile("");
                    focusSoon(() => choose.current);
                  }} aria-label={`Remove ${file}`}>
                  Remove
                </Button>
              </p>
            )}
            {rejected && <Alert>{rejected}</Alert>}
          </Dropzone>

          <div className={s.field}>
            <label className={s.label} htmlFor="script-text">
              Or paste it
            </label>
            <textarea
              id="script-text"
              className={`${s.textarea} ${st.paste}`}
              placeholder="EXT. CEMETERY - DAY, RAIN"
              value={text}
              spellCheck={false}
              aria-describedby={firstLine ? "script-first" : undefined}
              onChange={(e) => setText(e.target.value)}
            />
            <p id="script-first" className={`${s.hint} ${st.first}`} aria-live="polite">
              {file && text.trim() ? `${file} is used, not this text. Remove the file to use the text.` : firstLine ? `Starts with: ${firstLine}` : ""}
            </p>
          </div>
        </Panel>

        <RecentScripts />
      </div>
    </AppShell>
  );
}
