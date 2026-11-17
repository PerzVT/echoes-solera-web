"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell, Crumbs } from "./AppShell";
import { Button, ButtonLink } from "@/components/labs/Button";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { useCast } from "./CastProvider";
import m from "./fx/motion.module.css";
import { Alert, BlockedAction, Dropzone, SheetImage, focusSoon, notImages, splitImages } from "./parts";
import { nameFromFile, tagForFile, tools, type Tool } from "@/lib/labs/maker";
import { allStyles, isComingSoon } from "@/lib/labs/styles";
import s from "./maker.module.css";
import n from "./NewSeries.module.css";

/** One uploaded sheet and the character it shows. Sheets with the same name become one character. */
type Row = { key: string; file: File; src: string; name: string };

/** The styles a series can pin, the ones already in use first. */
const styles = allStyles.filter((x) => !x.hidden && !isComingSoon(x)).sort((a, b) => Number(b.group === "In use") - Number(a.group === "In use"));

export function NewSeries() {
  const router = useRouter();
  const store = useCast();
  const [name, setName] = useState("");
  const [tool, setTool] = useState<Tool>("Mini-series");
  const [style, setStyle] = useState(styles[0]?.slug ?? "");
  const [rows, setRows] = useState<Row[]>([]);
  const [rejected, setRejected] = useState("");
  const [creating, setCreating] = useState(false);
  const choose = useRef<HTMLButtonElement>(null);
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);
  const release = store.release;

  // Uploads that never became a series are freed when the page closes.
  useEffect(() => () => release(rowsRef.current.map((r) => r.src)), [release]);

  const add = (files: File[]) => {
    const { images, other } = splitImages(files);
    setRejected(notImages(other));
    setRows((now) => [...now, ...images.map((file, i) => ({ key: `${file.name}-${file.lastModified}-${Date.now()}-${i}`, file, src: URL.createObjectURL(file), name: nameFromFile(file.name) }))]);
  };

  const remove = (r: Row) => {
    release([r.src]);
    setRows((now) => now.filter((x) => x.key !== r.key));
    setRejected("");
    focusSoon(() => choose.current);
  };

  // The tags the sheets will get, so the person sees them before the series exists.
  const used = new Set<string>();
  const tags = rows.map((r) => {
    if (!r.name.trim()) return "";
    const tag = tagForFile(r.name.trim(), r.file.name, used);
    used.add(tag);
    return tag;
  });

  const create = () => {
    const slug = store.addSeries(name.trim(), tool);
    const people = new Map<string, { id: string; name: string; files: File[] }>();
    for (const r of rows) {
      const who = r.name.trim();
      const key = who.toLowerCase();
      if (!people.has(key)) people.set(key, { id: store.addCharacter(slug, who), name: who, files: [] });
      people.get(key)!.files.push(r.file);
    }
    for (const p of people.values()) store.addSheets(slug, p.id, p.files, p.name);
    // The cast now owns the uploads; the page must not free them on its way out.
    rowsRef.current = [];
    // The button works until the script step takes the screen.
    setCreating(true);
    store.keep(`style:${slug}`, style);
    router.push(`/app/series/${slug}`);
  };

  const unnamed = rows.filter((r) => !r.name.trim());
  const reason = !name.trim() ? "Give the series a name first." : unnamed.length ? `Name the character on ${unnamed.map((r) => r.file.name).join(", ")}.` : "";
  // One Create series button: the form's own on wide screens, the pinned bar's on phones.
  const createButton = (id: string) =>
    reason ? (
      <BlockedAction id={id} label="Create series" reason={reason} />
    ) : (
      <Button onClick={create} loading={creating}>
        Create series
      </Button>
    );

  return (
    <AppShell section="/app" title={<Crumbs items={[{ label: "Series", href: "/app" }, { label: "New series" }]} />} actions={<span className={n.phoneAction}>{createButton("create-why-bar")}</span>}>
      <div className={n.form}>
        <h1 className={n.title}>New series</h1>

        <div className={s.field}>
          <label className={s.label} htmlFor="series-name">
            Name
          </label>
          <input id="series-name" className={s.input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        </div>

        <fieldset className={s.fieldset}>
          <legend className={s.label}>Tool</legend>
          <div className={n.tools}>
            {tools.map((t) => (
              <label key={t.value} className={n.tool} data-checked={tool === t.value}>
                <input type="radio" name="tool" value={t.value} checked={tool === t.value} onChange={() => setTool(t.value)} className="sr-only" />
                <span className={n.toolName}>{t.value}</span>
                <span className={s.cardSub}>{t.note}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={s.fieldset}>
          <legend className={s.label}>Style</legend>
          <div className={n.styleRow}>
            {styles.map((x) => (
              <label key={x.slug} className={`${s.tile} ${n.styleTile}`} data-checked={style === x.slug}>
                <input type="radio" name="style" value={x.slug} checked={style === x.slug} onChange={() => setStyle(x.slug)} className="sr-only" />
                <span className={`${s.tileArt} ${n.styleArt}`}>{x.card && <Image src={x.card.src} alt="" fill sizes="132px" />}</span>
                <span className={s.tileName}>{x.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={s.field}>
          <span className={s.label} id="cast-label">
            Cast sheets
          </span>
          <div className={n.cast} role="group" aria-labelledby="cast-label">
            <Dropzone title="Drop cast sheets here" button="Choose files" buttonLabel="Choose cast sheet images" accept="image/*" multiple compact onFiles={add} buttonRef={choose} />
            {rejected && <Alert>{rejected}</Alert>}
            {rows.length > 0 && (
              <ul className={`${s.rows} ${n.castRows}`}>
                {rows.map((r, i) => (
                  <li key={r.key} className={`${s.row} ${n.castRow} ${m.enter}`}>
                    <span className={s.thumb}>
                      <SheetImage src={r.src} sizes="48px" />
                    </span>
                    <span className={n.castText}>
                      <label className="sr-only" htmlFor={`who-${r.key}`}>
                        Character on {r.file.name}
                      </label>
                      <input
                        id={`who-${r.key}`}
                        className={s.input}
                        value={r.name}
                        placeholder="Character name"
                        autoComplete="off"
                        onChange={(e) => setRows((now) => now.map((x) => (x.key === r.key ? { ...x, name: e.target.value } : x)))}
                      />
                      {tags[i] && <span className={s.cardSub}>{tags[i]}</span>}
                    </span>
                    <Button variant="quiet" size="small" onClick={() => remove(r)} aria-label={`Remove ${r.file.name}`}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={n.actions}>
          <span className={n.formCreate}>{createButton("create-why")}</span>
          <ButtonLink href="/app" variant="quiet">
            Cancel
          </ButtonLink>
        </div>
      </div>
    </AppShell>
  );
}
