"use client";

import Image from "next/image";
import { useState } from "react";
import { GestureIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import type { Style } from "@/lib/labs/styles";
import { notionPages, productionTypes, type ProductionType } from "../data";
import { Popover, StyleGrid } from "../Settings";
import { Btn } from "../ui";
import shared from "./shared.module.css";
import own from "./new.module.css";

const v = { ...shared, ...own };

type Props = {
  type: ProductionType;
  style: Style;
  onType: (t: ProductionType) => void;
  onStyle: (s: Style) => void;
  onScript: () => void;
  onNotion: (chat: string, title: string) => void;
  dragging: boolean;
};

/** A new chat: a drop target for the script, then one band for the type and Notion, then the styles. All of it in one screen at 1440x900. */
export function NewChat({ type, style, onType, onStyle, onScript, onNotion, dragging }: Props) {
  const [connected, setConnected] = useState(false);
  return (
    <div className={v.new}>
      <h2 className={v.newTitle}>What are we making?</h2>

      <button type="button" className={v.drop} data-over={dragging || undefined} onClick={onScript}>
        <GestureIcon name="upload" size={24} />
        <span className={v.dropTitle}>Drop a script</span>
        <span className={v.dropButton}>Upload a script</span>
      </button>

      <div className={v.band}>
        <section className={v.bandPart} aria-labelledby="nc-type">
          <h3 id="nc-type" className={v.groupName}>
            Type
          </h3>
          <div className={v.segment} role="radiogroup" aria-labelledby="nc-type">
            {productionTypes.map((t) => (
              <button key={t} type="button" role="radio" aria-checked={t === type} className={v.segmentItem} onClick={() => onType(t)}>
                {t}
              </button>
            ))}
          </div>
        </section>
        <section className={v.bandPart} aria-labelledby="nc-notion">
          <h3 id="nc-notion" className={v.groupName}>
            Notion
          </h3>
          {connected ? (
            <span className={v.connected}>
              <Icon name="check" size={14} />
              Notion connected
            </span>
          ) : (
            <Btn kind="secondary" small onClick={() => setConnected(true)}>
              Connect Notion
            </Btn>
          )}
        </section>
      </div>

      {connected && (
        <ul className={v.pages} aria-label="Script pages in Notion">
          {notionPages.map((n) => (
            <li key={n.chat}>
              <button type="button" className={v.page} onClick={() => onNotion(n.chat, n.title)}>
                <span className={v.pageArt}>
                  <Image src={n.cover} alt="" fill sizes="(max-width: 767px) 30vw, 200px" />
                </span>
                <span className={v.pageName}>{n.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <section className={v.styleRow} aria-labelledby="nc-style">
        <div className={v.newHead}>
          <h3 id="nc-style" className={v.groupName}>
            Style
          </h3>
          <Popover label="All styles" align="end" wide trigger={() => <span>All styles</span>}>
            {(close) => (
              <StyleGrid
                value={style}
                onPick={(s) => {
                  onStyle(s);
                  close();
                }}
              />
            )}
          </Popover>
        </div>
        <StyleGrid value={style} onPick={onStyle} limit={6} />
      </section>
    </div>
  );
}
