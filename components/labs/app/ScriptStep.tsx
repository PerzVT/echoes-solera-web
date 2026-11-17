"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { AppShell } from "./AppShell";
import { Button } from "@/components/labs/Button";
import { GestureIcon } from "@/components/labs/fx";
import { AppIcon } from "./AppIcon";
import m from "./fx/motion.module.css";
import { useCast } from "./CastProvider";
import { Alert, EpisodeTitle, Status, Stepper, focusSoon, useFilePicker } from "./parts";
import { recentScripts, scriptTypes } from "@/lib/labs/maker";
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
  const [over, setOver] = useState(false);
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
  const picker = useFilePicker(".txt,.docx,.fdx,.pdf", take, false);

  // A file dropped anywhere on the box loads it; the drop never lands in the text as a path.
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

  const ready = Boolean(file || text.trim());
  const empty = !text;

  const process = () => {
    // With nothing added yet, the button leads to the box.
    if (!ready) {
      focusSoon(() => paste.current);
      return;
    }
    try {
      sessionStorage.setItem("maker-script", file || "Pasted text");
    } catch {}
    setGoing(true);
    router.push("/app/episode/screenplay?state=processing");
  };

  return (
    <AppShell section="/app" title={<EpisodeTitle />} onFiles={take} bar={<Stepper current="script" />}>
      <div className={st.layout}>
        <section className={st.box} aria-labelledby="script-heading" data-over={over} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
          <h1 id="script-heading" className="sr-only">
            Script
          </h1>
          <div className={st.field}>
            {empty && !file && (
              <div className={st.invite} aria-hidden="true">
                <GestureIcon name="upload" size={28} active={over} />
                <span>Drop a script or paste it here</span>
              </div>
            )}
            <textarea
              ref={paste}
              id="script-text"
              className={st.text}
              placeholder="EXT. CEMETERY - DAY, RAIN"
              value={text}
              spellCheck={false}
              aria-labelledby="script-heading"
              aria-describedby={file && text.trim() ? "script-both" : undefined}
              onChange={(e) => setText(e.target.value)}
            />
            {file && text.trim() && (
              <span id="script-both" className="sr-only">
                {file} is used, not this text.
              </span>
            )}
          </div>
          {rejected && <Alert className={st.alert}>{rejected}</Alert>}
          <div className={st.foot}>
            <div className={st.source}>
              {picker.node}
              {file ? (
                <p className={`${st.chosen} ${m.enter}`}>
                  <AppIcon name="file" size={16} />
                  <span className={st.chosenName}>{file}</span>
                  <Button
                    variant="quiet"
                    size="small"
                    className={st.iconButton}
                    onClick={() => {
                      setFile("");
                      focusSoon(() => choose.current);
                    }}
                    aria-label={`Remove ${file}`}
                  >
                    <GestureIcon name="close" size={16} />
                  </Button>
                </p>
              ) : (
                <>
                  <Button ref={choose} variant="secondary" size="small" onClick={picker.open} aria-label="Choose a script file">
                    Choose file
                  </Button>
                  <span className={st.types}>.txt, .docx, .fdx or .pdf</span>
                </>
              )}
            </div>
            <Button className={st.process} onClick={process} loading={going} aria-disabled={!ready || undefined}>
              Process script
            </Button>
          </div>
        </section>

        <section className={st.recentCard} aria-labelledby="recent-heading">
          <h2 id="recent-heading" className={st.recentTitle}>
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
    </AppShell>
  );
}
