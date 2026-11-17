"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/labs/app/AppShell";
import { Alert, EpisodeTitle, Facts, Panel, Stepper, focusSoon, useFilePicker } from "@/components/labs/app/parts";
import { Button, ButtonLink } from "@/components/labs/Button";
import { GestureIcon } from "@/components/labs/fx";
import fx from "@/components/labs/app/fx/motion.module.css";
import m from "@/components/labs/app/maker.module.css";
import { chartSlots, environmentGuide, environmentSamples, getStyle, GUIDE_FILE, readGuide, ruleFields, type ChartKey, type CreatorStep as StepKey, type RuleKey, type Style, CREATOR_STEPS } from "@/lib/labs/styles";
import { Chart, GuideText, RulesList, Slot, readImported } from "./parts";
import s from "./styles.module.css";


/** The guide's anti-pattern rules, as the chart's Avoid row. */
const avoid = ["Black outlines", "Airbrush shading", "Over-detail"];

/** Creator: the stepped builder for a style draft. Nothing leaves this page. */
export function Creator({ initialStep = "chart" }: { initialStep?: StepKey }) {
  const [file, setFile] = useState({ name: GUIDE_FILE, text: environmentGuide });
  const [imported, setImported] = useState(false);
  const source = useMemo(() => readGuide(file.text, file.name), [file]);
  const [step, setStep] = useState<StepKey>(initialStep);
  const [rules, setRules] = useState<Partial<Record<RuleKey, string>>>(source.rules);
  const [refs, setRefs] = useState<Partial<Record<ChartKey, string>>>({});
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const base = useMemo(() => getStyle("solera-environments-draft")?.chart ?? {}, []);
  const refsRef = useRef(refs);
  useEffect(() => {
    refsRef.current = refs;
  }, [refs]);

  // A guide saved on Import opens here in place of the sample.
  useEffect(() => {
    const imported = readImported();
    if (!imported) return;
    setFile(imported);
    setImported(true);
    setRules(readGuide(imported.text, imported.name).rules);
  }, []);

  // Added references are local files; free them when the page closes.
  useEffect(() => () => Object.values(refsRef.current).forEach((u) => u && URL.revokeObjectURL(u)), []);

  const chart: Style["chart"] = { ...base };
  for (const c of chartSlots) if (refs[c.key]) chart[c.key] = { src: refs[c.key]!, alt: `${c.label}, added reference` };

  const addReference = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setNote(`${f.name} is not an image. Nothing was added. Choose a .png, .jpg or .webp file.`);
    const free = chartSlots.find((c) => !chart[c.key]);
    if (!free) return setNote("Every chart slot has art. Nothing was added.");
    setNote("");
    setRefs((r) => ({ ...r, [free.key]: URL.createObjectURL(f) }));
  };
  const picker = useFilePicker("image/*", addReference, false);

  const go = (key: string) => {
    setStep(key as StepKey);
    setNote("");
    setSaved("");
    focusSoon(() => heading.current);
  };

  // The sample guide is the Solera environments draft; an imported guide goes by the name it gives itself.
  const name = (imported && source.name) || "Solera environments";
  const version = source.version ?? "v1";

  const ruleEditor = (
    <>
      {ruleFields.map((f) => (
        <div className={m.field} key={f.key}>
          <label className={m.label} htmlFor={`rule-${f.key}`}>
            {f.label}
          </label>
          <textarea
            id={`rule-${f.key}`}
            className={`${m.input} ${m.textarea}`}
            rows={f.key === "avoid" ? 5 : 3}
            value={rules[f.key] ?? ""}
            placeholder="Not set"
            onChange={(e) => setRules((r) => ({ ...r, [f.key]: e.target.value }))}
          />
        </div>
      ))}
    </>
  );

  // Chart and Samples show the rules to look at, not to edit: only the ones that hold a value.
  const rulesPanel = (
    <Panel as="aside" title="Rules">
      <RulesList rules={rules} />
    </Panel>
  );

  let main;
  let side;
  if (step === "source") {
    main = (
      <Panel title={file.name} level={1} headingRef={heading}>
        <GuideText text={file.text} term={source.conflict?.term} />
      </Panel>
    );
    side = (
      <Panel
        as="aside"
        title="Source"
        actions={
          <ButtonLink href="/app/styles/import" variant="quiet" size="small">
            Import another file
          </ButtonLink>
        }
      >
        <Facts
          rows={[
            { label: "File", value: file.name },
            { label: "Name", value: name },
            { label: "ID", value: source.id },
            { label: "Version", value: version },
            { label: "Medium", value: source.medium ?? "Images" },
          ]}
        />
      </Panel>
    );
  } else if (step === "rules") {
    main = (
      <Panel title="Rules" level={1} headingRef={heading}>
        {ruleEditor}
      </Panel>
    );
    side = (
      <Panel as="aside" title="Source">
        {source.conflict && (
          <div className={s.conflict} role="note">
            <strong>Differs from {source.conflict.withStyle}</strong>
            <span>{source.conflict.text}</span>
          </div>
        )}
        <Facts
          rows={[
            { label: "File", value: file.name },
            { label: "Version", value: version },
          ]}
        />
      </Panel>
    );
  } else if (step === "chart") {
    main = (
      <Panel
        title="Style chart"
        level={1}
        headingRef={heading}
        bodyClassName={s.fillBody}
        actions={
          <Button variant="quiet" size="small" icon={<GestureIcon name="plus" size={16} />} onClick={picker.open}>
            Add reference
          </Button>
        }
      >
        {note && <Alert>{note}</Alert>}
        <Chart chart={chart} />
        <h2 className={m.subhead}>Avoid</h2>
        <div className={s.avoid}>
          {avoid.map((a) => (
            <Slot key={a} name={a} />
          ))}
        </div>
        {picker.node}
      </Panel>
    );
    side = rulesPanel;
  } else {
    main = (
      <Panel title="Samples" level={1} headingRef={heading}>
        <div className={s.samples}>
          {environmentSamples.map((x) => (
            <Slot key={x.name} name={x.name} media={x.src ? { src: x.src, alt: x.name } : undefined} />
          ))}
        </div>
      </Panel>
    );
    side = rulesPanel;
  }

  return (
    <AppShell
      section="/app/styles"
      title={<EpisodeTitle series="Styles" seriesHref="/app/styles" page={`${name}, draft`} />}
      bar={<Stepper current={step} steps={CREATOR_STEPS} label="Style steps" onSelect={go} />}
      actions={
        <>
          <p className={`${m.reason} ${s.saved}`} role="status">
            {saved}
          </p>
          <Button onClick={() => setSaved(`Saved ${name} ${version} as a draft.`)}>Save version</Button>
        </>
      }
    >
      {/* A new step fades up as it arrives. It is not dissolved from the old one: copying two panels of pictures
          on every press cost a frame, and this stepper is pressed often. */}
      <div key={step} className={`${m.split} ${m.fill} ${s.split} ${s.fillSplit} ${fx.enter}`}>
        {main}
        {side}
      </div>
    </AppShell>
  );
}
