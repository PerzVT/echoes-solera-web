"use client";

import type { ReactNode } from "react";
import { MediaFrame } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { Icon } from "@/components/labs/Icon";
import type { Style } from "@/lib/labs/styles";
import { revealOnPhone } from "./parts";
import st from "./StyleStep.module.css";

const stillOf = (s: Style) => s.review?.still ?? s.chart.example?.src ?? s.card!.src;
const clipOf = (s: Style) => s.review?.clip ?? s.chart.example?.video;

type Props = {
  /** Tile groups in order; the first has no heading of its own, the page heading stands over it. */
  groups: { title?: string; items: Style[] }[];
  chosen: string;
  onChoose: (slug: string) => void;
  /** Controls under the heading, such as a page count. */
  extra?: ReactNode;
};

/** Every style as a large tile, the chosen one previewed at the right (a clip where there is one). Used by every tool's Style step. */
export function StylePicker({ groups, chosen, onChoose, extra }: Props) {
  const all = groups.flatMap((g) => g.items);
  const style = all.find((s) => s.slug === chosen) ?? all[0];
  const clip = clipOf(style);
  const choose = (slug: string) => {
    onChoose(slug);
    requestAnimationFrame(() => revealOnPhone(document.getElementById("style-preview")));
  };
  return (
    <div className={st.layout}>
      <section className={st.list} aria-labelledby="style-title">
        <h1 id="style-title" className={st.title}>
          Style
        </h1>
        {extra}
        {groups.map((g, i) => (
          <div key={g.title ?? i} className={st.group}>
            {g.title && <h2 className={st.subTitle}>{g.title}</h2>}
            <Tiles items={g.items} chosen={style.slug} onChoose={choose} eager={i === 0} />
          </div>
        ))}
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
