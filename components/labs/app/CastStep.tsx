"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronIcon, GestureIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { Btn, IconBtn, cx } from "@/components/labs/chat/ui";
import { useDialog } from "@/components/labs/chat/hooks";
import type { CastSheet } from "@/lib/labs/maker";
import { AppShell } from "./AppShell";
import { useCast, useEpisode } from "./CastProvider";
import { libraryPlaces, startingElements, type Element } from "./creator";
import { SheetImage, useFilePicker } from "./parts";
import c from "./CastStep.module.css";

/** What the open picker chooses from: the sheets of one character, or the whole library for one element. */
type Picking = { id: string; mode: "sheet" | "library" };
type Choice = { key: string; src: string; tag: string; name: string; label?: string; group?: string };


/** Cast: the characters and places the script needs, as cards. Each can take another sheet of the same character, a picture from the library, or an upload. */
export function CastStep() {
  const router = useRouter();
  const store = useCast();
  const { ep, patch } = useEpisode();
  // The demo cast library is Second Chance at Your Heart's; a new series has no sheets of its own yet.
  const series = store.get("second-chance");
  const [elements, setElements] = useState<Element[]>(() => ep.elements ?? startingElements);
  const [picking, setPicking] = useState<Picking | null>(null);
  const uploadFor = useRef<string | null>(null);
  useEffect(() => {
    patch({ elements });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  const set = (id: string, patch: Partial<Element>) => setElements((all) => all.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const sheetsOf = (who?: string) => series.sheets.filter((s) => s.character === who);
  const nameOf = (who: string) => series.characters.find((x) => x.id === who)?.name ?? who;

  const picker = useFilePicker("image/*", (files) => {
    const f = files.find((x) => x.type.startsWith("image/"));
    if (!f || !uploadFor.current) return;
    set(uploadFor.current, { src: URL.createObjectURL(f), variant: undefined });
  }, false);
  const upload = (id: string) => {
    uploadFor.current = id;
    picker.open();
  };

  const pickingEl = picking ? elements.find((x) => x.id === picking.id) : undefined;
  let choices: Choice[] = [];
  if (pickingEl && picking?.mode === "sheet") choices = sheetsOf(pickingEl.who).map((s) => fromSheet(s));
  else if (pickingEl && pickingEl.kind === "character")
    choices = series.characters.flatMap((ch) => sheetsOf(ch.id).map((s) => ({ ...fromSheet(s), group: ch.name })));
  else if (pickingEl) choices = libraryPlaces.map((p) => ({ key: p.tag, src: p.src, tag: p.tag, name: p.name }));

  const choose = (x: Choice) => {
    if (!pickingEl) return;
    set(pickingEl.id, { src: x.src, tag: x.tag, variant: x.label });
    setPicking(null);
  };

  const groups: { kind: Element["kind"]; title: string }[] = [
    { kind: "character", title: "Characters" },
    { kind: "location", title: "Locations" },
  ];

  return (
    <AppShell
      step="cast"
      onFiles={(files) => {
        const missing = elements.find((x) => !x.src);
        const f = files.find((x) => x.type.startsWith("image/"));
        if (missing && f) set(missing.id, { src: URL.createObjectURL(f) });
      }}
      action={
        <Btn kind="primary" onClick={() => router.push("/app/episode/style")}>
          Next
        </Btn>
      }
    >
      {picker.node}
      <div className={c.page}>
        <h1 className={c.title}>Cast</h1>
        {groups.map((g) => (
          <section key={g.kind} className={c.group} aria-labelledby={`cast-${g.kind}`}>
            <h2 id={`cast-${g.kind}`} className={c.groupTitle}>
              {g.title}
            </h2>
            <ul className={c.grid}>
              {elements
                .filter((x) => x.kind === g.kind)
                .map((x) => (
                  <li key={x.id}>
                    <Card
                      el={x}
                      sheets={x.who ? sheetsOf(x.who).length : 0}
                      onSheet={() => setPicking({ id: x.id, mode: "sheet" })}
                      onLibrary={() => setPicking({ id: x.id, mode: "library" })}
                      onUpload={() => upload(x.id)}
                    />
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>

      <Picker
        open={Boolean(picking)}
        title={pickingEl ? (picking?.mode === "sheet" ? nameOf(pickingEl.who ?? "") : pickingEl.name) : ""}
        current={pickingEl?.src}
        choices={choices}
        onChoose={choose}
        onClose={() => setPicking(null)}
      />
    </AppShell>
  );
}

const fromSheet = (s: CastSheet): Choice => ({ key: s.id, src: s.src, tag: s.tag, name: s.tag, label: s.variant });

type CardProps = { el: Element; sheets: number; onSheet: () => void; onLibrary: () => void; onUpload: () => void };

function Card({ el, sheets, onSheet, onLibrary, onUpload }: CardProps) {
  const id = useId();
  const tools = (
    <div className={c.tools}>
      <Btn kind="secondary" small onClick={onLibrary}>
        Choose from library
      </Btn>
      <Btn kind="secondary" small icon={<GestureIcon name="upload" size={16} />} onClick={onUpload}>
        Upload
      </Btn>
    </div>
  );
  if (!el.src)
    return (
      <article className={cx(c.card, c.missing)} aria-labelledby={id}>
        <div className={c.art} data-kind={el.kind}>
          <GestureIcon name="plus" size={24} />
        </div>
        <div className={c.text}>
          <h3 id={id} className={c.name}>
            {el.name}
          </h3>
          <p className={c.tag}>{el.tag}</p>
        </div>
        {tools}
      </article>
    );
  return (
    <article className={c.card} aria-labelledby={id}>
      <div className={c.art} data-kind={el.kind}>
        <SheetImage src={el.src} sizes="(max-width: 767px) 50vw, 280px" />
      </div>
      <div className={c.text}>
        <h3 id={id} className={c.name}>
          {el.name}
        </h3>
        <p className={c.tag}>{el.tag}</p>
      </div>
      {el.kind === "character" && sheets > 1 && (
        <button type="button" className={c.variant} onClick={onSheet} aria-label={`Choose another sheet of ${el.name}`}>
          <span>{el.variant ?? "Other sheet"}</span>
          <ChevronIcon open={false} size={16} />
        </button>
      )}
      {tools}
    </article>
  );
}

type PickerProps = { open: boolean; title: string; current?: string; choices: Choice[]; onChoose: (x: Choice) => void; onClose: () => void };

/** A grid of pictures to choose from, in a sheet over the page. */
function Picker({ open, title, current, choices, onChoose, onClose }: PickerProps) {
  const ref = useDialog(open);
  const id = useId();
  const byGroup = new Map<string, Choice[]>();
  for (const x of choices) byGroup.set(x.group ?? "", [...(byGroup.get(x.group ?? "") ?? []), x]);
  let body: ReactNode = null;
  if (open)
    body = [...byGroup].map(([group, items]) => (
      <section key={group || "all"} className={c.pickGroup}>
        {group && <h3 className={c.pickGroupTitle}>{group}</h3>}
        <ul className={c.pickGrid}>
          {items.map((x) => (
            <li key={x.key}>
              <button type="button" className={c.pick} aria-pressed={x.src === current} onClick={() => onChoose(x)}>
                <span className={c.pickArt}>
                  <SheetImage src={x.src} sizes="(max-width: 767px) 45vw, 200px" />
                  {x.src === current && (
                    <span className={c.pickOn} aria-hidden="true">
                      <Icon name="check" size={16} />
                    </span>
                  )}
                </span>
                <span className={c.pickLabel}>{x.label ?? x.name}</span>
                {x.label && <span className={c.pickTag}>{x.tag}</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>
    ));
  return (
    <dialog ref={ref} className={c.dialog} aria-labelledby={id} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className={c.dialogHead}>
        <h2 id={id} className={c.dialogTitle}>
          {title}
        </h2>
        <IconBtn label="Close" onClick={onClose}>
          <GestureIcon name="close" size={18} />
        </IconBtn>
      </div>
      <div className={c.dialogBody}>{body}</div>
    </dialog>
  );
}
