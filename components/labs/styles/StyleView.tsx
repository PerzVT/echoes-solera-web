"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/labs/app/AppShell";
import { useCast } from "@/components/labs/app/CastProvider";
import { EpisodeTitle, Facts, Panel } from "@/components/labs/app/parts";
import { Button, ButtonLink } from "@/components/labs/Button";
import { ChevronIcon } from "@/components/labs/fx";
import fx from "@/components/labs/app/fx/motion.module.css";
import { SwapText } from "@/components/labs/app/fx/SwapText";
import m from "@/components/labs/app/maker.module.css";
import { seriesCards } from "@/lib/labs/maker";
import { environmentGuide, environmentSamples, getStyle, ruleFields, type Media } from "@/lib/labs/styles";
import { Lightbox } from "./Lightbox";
import { Chart, GuideText, Slot, chartImages } from "./parts";
import { Review } from "./Review";
import s from "./styles.module.css";

/** One style: its chart, and one panel of facts. "Use in series" pins it to a series in this session. */
export function StyleView({ slug }: { slug: string }) {
  const style = getStyle(slug)!;
  const store = useCast();
  const [guide, setGuide] = useState(false);
  const [usedBy, setUsedBy] = useState(style.usedBy);
  const [choosing, setChoosing] = useState(false);
  const [shown, setShown] = useState<number | null>(null);
  const useButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const rules = ruleFields.map((f) => ({ label: f.label, value: style.rules[f.key] })).filter((r) => r.value);
  const samples = style.samples ? environmentSamples.filter((x) => x.src) : [];
  const name = style.hidden ? `${style.name}, draft` : style.name;
  // A library direction shows its still and clip in place of the chart; the still is what opens full screen.
  const images = useMemo<Media[]>(() => (style.review ? [{ src: style.review.still, alt: `${style.name}, still`, label: "Still" }] : chartImages(style.chart)), [style]);
  const open = (media: Media) => {
    opener.current = document.activeElement as HTMLElement | null;
    setShown(Math.max(0, images.findIndex((x) => x.src === media.src && x.alt === media.alt)));
  };
  // The chart takes the whole height of its panel; samples and the guide follow below it.
  const more = samples.length > 0 || style.hasGuide;
  const mono = (v?: string) => (v ? <span className={s.mono}>{v}</span> : undefined);

  return (
    <AppShell
      section="/app/styles"
      title={<EpisodeTitle series="Styles" seriesHref="/app/styles" page={name} />}
      actions={
        <>
          <ButtonLink href="/app/styles/new" variant="secondary">
            {style.status === "Approved" ? "New version" : "Edit"}
          </ButtonLink>
          <Button ref={useButton} onClick={() => setChoosing(true)}>
            Use in series
          </Button>
        </>
      }
    >
      <div className={`${m.split} ${m.fill} ${s.split} ${s.fillSplit}`}>
        <Panel
          title={style.review ? style.name : "Style chart"}
          level={1}
          bodyClassName={s.fillBody}
          actions={
            style.hasGuide && (
              <Button variant="quiet" size="small" icon={<ChevronIcon open={guide} size={16} />} aria-expanded={guide} aria-controls="style-guide" onClick={() => setGuide(!guide)}>
                {guide ? "Hide guide" : "Show guide"}
              </Button>
            )
          }
        >
          {style.review ? (
            <Review name={style.name} still={style.review.still} clip={style.review.clip} onOpen={() => open(images[0])} />
          ) : (
            <Chart chart={style.chart} onOpen={open} className={more ? s.chartTall : undefined} />
          )}
          {samples.length > 0 && (
            <>
              <h2 className={m.subhead}>Samples</h2>
              <div className={s.samples}>
                {samples.map((x) => (
                  <Slot key={x.name} name={x.name} media={{ src: x.src!, alt: x.name }} />
                ))}
              </div>
            </>
          )}
          {style.hasGuide && guide && (
            <div className={`${s.guideBlock} ${fx.enter}`}>
              <h2 className={m.subhead}>Guide</h2>
              <GuideText id="style-guide" text={environmentGuide} />
            </div>
          )}
        </Panel>

        <Panel as="aside" title="Details">
          <Facts
            omitEmpty
            rows={[
              { label: "Status", value: style.status },
              { label: "Medium", value: style.medium },
              { label: "Used by", value: usedBy ? <SwapText>{usedBy}</SwapText> : undefined },
              { label: "Version", value: style.version },
              { label: "ID", value: mono(style.id) },
              { label: "Source", value: mono(style.source) },
            ]}
          />
          {rules.length > 0 && (
            <>
              <h2 className={m.subhead}>What it fixes</h2>
              <Facts rows={rules} />
            </>
          )}
          {style.versions.length > 0 && (
            <>
              <h2 className={m.subhead}>Versions</h2>
              <Facts rows={style.versions.map((v) => ({ label: v.name, value: v.state }))} />
            </>
          )}
        </Panel>
      </div>

      <Lightbox
        items={images}
        index={shown}
        onIndex={setShown}
        onClose={() => {
          setShown(null);
          opener.current?.focus();
        }}
      />

      <UseIn
        open={choosing}
        styleName={style.name}
        series={[...store.created, ...seriesCards].map((x) => x.title)}
        current={usedBy}
        onClose={() => {
          setChoosing(false);
          useButton.current?.focus();
        }}
        onUse={(title) => {
          setUsedBy(title);
          setChoosing(false);
          useButton.current?.focus();
        }}
      />
    </AppShell>
  );
}

export function UseIn({ open, styleName, series, current, onClose, onUse }: { open: boolean; styleName: string; series: string[]; current?: string; onClose: () => void; onUse: (title: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [pick, setPick] = useState(current && series.includes(current) ? current : series[0]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className={m.dialog} aria-labelledby={id} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <h2 id={id} className="h2">
        Use {styleName}
      </h2>
      <fieldset className={s.choices}>
        <legend className={m.label}>Series</legend>
        {series.map((t) => (
          <label key={t} className={s.choice}>
            <input type="radio" name="use-in" value={t} checked={pick === t} onChange={() => setPick(t)} />
            {t}
          </label>
        ))}
      </fieldset>
      <div className={m.dialogActions}>
        <Button variant="quiet" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onUse(pick)}>Use in {pick}</Button>
      </div>
    </dialog>
  );
}
