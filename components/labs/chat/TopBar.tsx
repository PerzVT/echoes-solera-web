"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatedMark, ChevronIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import type { Style } from "@/lib/labs/styles";
import { chatGroups, type ProductionType } from "./data";
import { useDismiss } from "./hooks";
import { SettingsControl, StyleControl, TypeControl } from "./Settings";
import { ToolSwitch } from "./ui";
import a from "./app.module.css";

type Props = {
  /** The open chat, or none on a new chat. */
  current?: string;
  series?: string;
  title?: string;
  type: ProductionType;
  style: Style;
  onType: (t: ProductionType) => void;
  onStyle: (s: Style) => void;
};

const statusName = { working: "Working", "needs-you": "Needs you", done: "Done" } as const;

/** The slim bar: the mark, the project switcher, and the production type and style. */
export function TopBar({ current, series, title, type, style, onType, onStyle }: Props) {
  return (
    <header className={a.top}>
      <Link href="/" className={a.mark} aria-label="Nine Lives home">
        <AnimatedMark variant="still" size={26} />
      </Link>
      <ToolSwitch current="mini-series" />
      <Projects current={current} series={series} title={title} />
      <div className={a.topEnd}>
        <span className={a.wide}>
          <TypeControl value={type} onChange={onType} align="end" />
          <StyleControl value={style} onChange={onStyle} align="end" />
        </span>
        <span className={a.narrow}>
          <SettingsControl type={type} style={style} onType={onType} onStyle={onStyle} />
        </span>
      </div>
    </header>
  );
}

function Projects({ current, series, title }: { current?: string; series?: string; title?: string }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useDismiss(open, panel, () => setOpen(false), button);

  return (
    <div className={a.projects}>
      <button ref={button} type="button" className={a.switcher} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}>
        {series ? (
          <h1 className={a.chatTitle}>
            <span className={a.chatSeries}>{series}</span>
            <span className={a.chatSep} aria-hidden="true">
              /
            </span>
            <span className={a.chatEp}>{title}</span>
          </h1>
        ) : (
          <h1 className={a.chatTitle}>New chat</h1>
        )}
        <ChevronIcon open={open} size={16} />
      </button>
      {open && (
        <div ref={panel} className={a.projectMenu}>
          <Link href="/app" className={a.projectNew} onClick={() => setOpen(false)}>
            <Icon name="plus" size={18} />
            New chat
          </Link>
          <nav aria-label="Chats">
            {chatGroups.map((g) => (
              <section key={g.slug} className={a.group} aria-labelledby={`g-${g.slug}`}>
                <h2 id={`g-${g.slug}`} className={a.groupLabel}>
                  <span className={a.groupCover}>
                    <Image src={g.cover} alt="" fill sizes="48px" />
                  </span>
                  {g.series}
                </h2>
                <ul className={a.chats}>
                  {g.chats.map((c) => (
                    <li key={c.id}>
                      <Link href={`/app/c/${c.id}`} className={a.chatRow} aria-current={c.id === current ? "page" : undefined} onClick={() => setOpen(false)}>
                        <span className={a.chatLabel}>{c.label}</span>
                        <span className={a.dot} data-status={c.status} role="img" aria-label={statusName[c.status]} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
          <Link href="/app/styles" className={a.projectFoot} onClick={() => setOpen(false)}>
            Styles
          </Link>
        </div>
      )}
    </div>
  );
}
