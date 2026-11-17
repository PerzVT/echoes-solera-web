"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type DragEvent } from "react";
import { AppShell } from "@/components/labs/app/AppShell";
import { Alert, EpisodeTitle, Facts, Panel, useFilePicker } from "@/components/labs/app/parts";
import { Button } from "@/components/labs/Button";
import { ChevronIcon, GestureIcon } from "@/components/labs/fx";
import fx from "@/components/labs/app/fx/motion.module.css";
import m from "@/components/labs/app/maker.module.css";
import { environmentGuide, GUIDE_FILE, readGuide, ruleFields } from "@/lib/labs/styles";
import { GuideText, IMPORT_KEY } from "./parts";
import s from "./styles.module.css";

const ACCEPT = [".md", ".txt", ".json"];

/** Import: the fields read from the file lead; the file itself, kept as it is, opens beside them on request. A file dropped anywhere replaces it. */
export function ImportGuide() {
  const router = useRouter();
  const [file, setFile] = useState({ name: GUIDE_FILE, text: environmentGuide });
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  /** Files read on this page. Each one fills the fields again, row after row. */
  const [reads, setReads] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const read = useMemo(() => readGuide(file.text, file.name), [file]);

  async function take(files: File[]) {
    const f = files[0];
    if (!f) return;
    if (!ACCEPT.some((ext) => f.name.toLowerCase().endsWith(ext))) {
      setError(`${f.name} is not a .md, .txt or .json file. Nothing was imported. Choose another file.`);
      return;
    }
    const extra = files.length > 1 ? ` Only ${f.name} was read; import one guide at a time.` : "";
    setError(extra.trim());
    setFile({ name: f.name, text: await f.text() });
    setReads((n) => n + 1);
  }
  const picker = useFilePicker(ACCEPT.join(","), (files) => void take(files), false);

  function save() {
    try {
      sessionStorage.setItem(IMPORT_KEY, JSON.stringify(file));
    } catch {
      // Without storage the creator opens on the sample guide.
    }
    // The button works until the creator takes the screen.
    setSaving(true);
    router.push("/app/styles/new");
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    void take(Array.from(e.dataTransfer.files));
  }

  const sourceId = "guide-source";
  const title = read.name ?? file.name;

  return (
    <AppShell
      section="/app/styles"
      title={<EpisodeTitle series="Styles" seriesHref="/app/styles" page="Import guide" />}
      onFiles={(files) => void take(files)}
      actions={
        <>
          <Button variant="secondary" icon={<GestureIcon name="upload" size={18} />} onClick={picker.open}>
            Choose another file
          </Button>
          <Button onClick={save} loading={saving}>
            Save as draft
          </Button>
          {picker.node}
        </>
      }
    >
      <div className={`${m.split} ${m.fill} ${s.importSplit}`} data-source={showSource || undefined}>
        <div
          className={s.drop}
          data-over={over}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
          }}
          onDrop={onDrop}
        >
          <Panel
            title={title}
            level={1}
            sub={title !== file.name ? file.name : undefined}
            actions={
              <Button variant="quiet" size="small" icon={<ChevronIcon open={showSource} size={16} />} aria-expanded={showSource} aria-controls={sourceId} onClick={() => setShowSource(!showSource)}>
                {showSource ? "Hide source" : "Show source"}
              </Button>
            }
          >
            {error && <Alert>{error}</Alert>}
            {read.conflict && (
              <div key={`conflict-${reads}`} className={reads ? `${s.conflict} ${fx.enter}` : s.conflict} role="note">
                <strong>Differs from {read.conflict.withStyle}</strong>
                <span>
                  Rendering says &quot;{read.conflict.term}&quot;. {read.conflict.text}
                </span>
              </div>
            )}
            <Facts
              key={reads}
              fill={reads > 0}
              rows={[
                { label: "Name", value: read.name },
                { label: "ID", value: read.id },
                { label: "Version", value: read.version },
                { label: "Status", value: read.status },
                { label: "Medium", value: read.medium },
                { label: "Owner", value: read.owner },
                ...ruleFields.map((f) => ({ label: f.label, value: read.rules[f.key] })),
              ]}
            />
          </Panel>
        </div>

        {showSource && (
          <Panel as="aside" title="Source" className={fx.enter}>
            <div key={reads} id={sourceId} className={reads ? fx.fade : undefined}>
              <GuideText text={file.text} term={read.conflict?.term} />
            </div>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
