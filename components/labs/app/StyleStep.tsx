"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MediaFrame } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { Icon } from "@/components/labs/Icon";
import { Btn } from "@/components/labs/chat/ui";
import { allStyles, type Style } from "@/lib/labs/styles";
import { AppShell } from "./AppShell";
import { useCast, useEpisode } from "./CastProvider";
import { SaveAction, revealOnPhone, useSaveThen } from "./parts";
import { generationsFor } from "./script";
import st from "./StyleStep.module.css";

/** Every style that can be listed, each with a picture. */
const listed = allStyles.filter((s) => !s.hidden && s.card);
/** Styles made for live action come first: they suit a mini-series. */
const liveAction = listed.filter((s) => /live-action/i.test(s.medium));
const others = listed.filter((s) => !liveAction.includes(s));
const styles = [...liveAction, ...others];

const stillOf = (s: Style) => s.review?.still ?? s.chart.example?.src ?? s.card!.src;
const clipOf = (s: Style) => s.review?.clip ?? s.chart.example?.video;

/** Style: every style as a large tile, the chosen one previewed at the right. */
export function StyleStep() {
  const router = useRouter();
  const store = useCast();
  const { ep, patch } = useEpisode();
  const saving = useSaveThen(store.flush);
  const [chosen, setChosen] = useState(() => ep.style ?? styles[0].slug);
  useEffect(() => {
    patch({ style: chosen });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen]);
  const choose = (slug: string) => {
    setChosen(slug);
    requestAnimationFrame(() => revealOnPhone(document.getElementById("style-preview")));
  };
  const style = styles.find((s) => s.slug === chosen) ?? styles[0];
  const clip = clipOf(style);

  return (
    <AppShell
      step="style"
      fit
      action={
        <SaveAction error={saving.error}>
          <Btn
            kind="primary"
            loading={saving.busy}
            onClick={() =>
              saving.go(() => {
                // Generating starts the clips over: every one is made again and waits for a decision.
                patch({ gens: generationsFor(ep.blocks, false) });
                router.push("/app/episode/results?state=new");
              })
            }
          >
            Generate
          </Btn>
        </SaveAction>
      }
    >
      <div className={st.layout}>
        <section className={st.list} aria-labelledby="style-title">
          <h1 id="style-title" className={st.title}>
            Style
          </h1>
          <Tiles items={liveAction} chosen={chosen} onChoose={choose} eager />
          <h2 className={st.subTitle}>Other styles</h2>
          <Tiles items={others} chosen={chosen} onChoose={choose} />
        </section>

        <aside id="style-preview" className={st.preview} aria-labelledby="style-name">
          <div className={st.screen}>
            {clip ? (
              <MediaFrame key={clip} fill>
                <video src={clip} poster={stillOf(style)} muted loop playsInline autoPlay preload="metadata" aria-label={`${style.name}, clip`} />
              </MediaFrame>
            ) : (
              <Image key={style.slug} src={stillOf(style)} alt={style.card!.alt} fill sizes="420px" />
            )}
          </div>
          <div className={st.facts}>
            <h2 id="style-name" className={st.previewName}>
              {style.name}
            </h2>
            <p className={st.meta}>
              <span>{style.medium}</span>
              <span aria-hidden="true">·</span>
              <span>{style.status}</span>
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Tiles({ items, chosen, onChoose, eager }: { items: Style[]; chosen: string; onChoose: (slug: string) => void; eager?: boolean }) {
  return (
    <ul className={st.grid}>
      {items.map((s) => (
        <li key={s.slug}>
          <button type="button" className={st.tile} aria-pressed={s.slug === chosen} onClick={() => onChoose(s.slug)}>
            <span className={st.art}>
              <Image src={s.card!.src} alt="" fill sizes="(max-width: 767px) 45vw, 220px" loading={eager ? "eager" : undefined} />
              {s.slug === chosen && (
                <span className={st.on} aria-hidden="true">
                  <Icon name="check" size={16} />
                </span>
              )}
            </span>
            <span className={st.name}>{s.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
