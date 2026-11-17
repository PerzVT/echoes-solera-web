"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "./AppShell";
import { Button } from "@/components/labs/Button";
import { AppIcon } from "./AppIcon";
import m from "./fx/motion.module.css";
import { useCast } from "./CastProvider";
import { Alert, Dropzone, EpisodeTitle, Status, Stepper, focusSoon } from "./parts";
import { recentScripts, scriptTypes } from "@/lib/labs/maker";
import s from "./maker.module.css";
import st from "./ScriptStep.module.css";

export function ScriptStep() {
  const router = useRouter();
  const store = useCast();
  // The chosen file and the pasted text survive going on to Screenplay and coming back.
  const [file, setFile] = useState<string>(() => store.kept<string>("script:file") ?? "");
  const [text, setText] = useState(() => store.kept<string>("script:text") ?? "");
  useEffect(() => {
    store.keep("script:file", file);
    store.keep("script:text", text);
  }, [store, file, text]);
  const [rejected, setRejected] = useState("");
  const [going, setGoing] = useState(false);
  const choose = useRef<HTMLButtonElement>(null);
  const paste = useRef<HTMLTextAreaElement>(null);

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

  const ready = Boolean(file || text.trim());

  const process = () => {
    // With nothing added yet, the button leads to the two ways of adding a script.
    if (!ready) {
      focusSoon(() => choose.current);
      return;
    }
    try {
      sessionStorage.setItem("maker-script", file || "Pasted text");
    } catch {}
    setGoing(true);
    router.push("/app/episode/screenplay?state=processing");
  };

  return (
    <AppShell
      section="/app"
      title={<EpisodeTitle />}
      onFiles={take}
      bar={<Stepper current="script" />}
      actions={
        <Button onClick={process} loading={going} aria-disabled={!ready || undefined}>
          Process script
        </Button>
      }
    >
      <div className={st.page}>
        <h1 className={st.title}>Bring your script</h1>
        <div className={st.grid}>
          <section className={st.card} aria-labelledby="upload-heading">
            <h2 id="upload-heading" className={st.cardTitle}>
              Upload a file
            </h2>
            <div className={st.cardBody}>
              <Dropzone
                title="Drop your script here"
                hint=".txt, .docx, .fdx or .pdf"
                button="Choose file"
                buttonLabel="Choose a script file"
                accept=".txt,.docx,.fdx,.pdf"
                onFiles={take}
                buttonRef={choose}
              />
              {file && (
                <p className={`${st.chosen} ${m.enter}`}>
                  <AppIcon name="file" size={16} />
                  <span className={st.chosenName}>{file}</span>
                  <Button
                    variant="quiet"
                    size="small"
                    onClick={() => {
                      setFile("");
                      focusSoon(() => choose.current);
                    }}
                    aria-label={`Remove ${file}`}
                  >
                    Remove
                  </Button>
                </p>
              )}
              {rejected && <Alert>{rejected}</Alert>}
            </div>
          </section>

          <section className={st.card} aria-labelledby="paste-heading">
            <h2 id="paste-heading" className={st.cardTitle}>
              <label htmlFor="script-text">Paste the text</label>
            </h2>
            <div className={st.cardBody}>
              <textarea
                ref={paste}
                id="script-text"
                className={`${s.textarea} ${st.paste}`}
                placeholder="EXT. CEMETERY - DAY, RAIN"
                value={text}
                spellCheck={false}
                aria-describedby={file && text.trim() ? "script-both" : undefined}
                onChange={(e) => setText(e.target.value)}
              />
              {file && text.trim() && (
                <p id="script-both" className={st.note}>
                  {file} is used, not this text.
                </p>
              )}
            </div>
          </section>

          <section className={st.card} aria-labelledby="recent-heading">
            <h2 id="recent-heading" className={st.cardTitle}>
              Recent scripts
            </h2>
            <ul className={st.recent}>
              {recentScripts.map((r) => {
                const body = (
                  <>
                    <span className={st.recentText}>
                      <span className={st.recentName}>{r.title}</span>
                      <Status icon={r.state === "Processed" ? "check" : "dot"}>{r.state}</Status>
                    </span>
                    <span className={st.recentDate}>{r.date}</span>
                  </>
                );
                return (
                  <li key={r.title}>
                    {r.href ? (
                      <Link href={r.href} className={st.recentRow}>
                        {body}
                      </Link>
                    ) : (
                      <div className={st.recentRow}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
