"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatedMark, ChevronIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { AppIcon } from "@/components/labs/app/AppIcon";
import { artifactName, type ArtifactKey, type Msg } from "./agent";
import { Pill, cx } from "./ui";
import r from "./rail.module.css";

type Props = {
  msgs: Msg[];
  busy: string | null;
  onOpen: (k: ArtifactKey) => void;
  chips: string[];
  onChip: (text: string) => void;
  /** Shown in place of the conversation while it is empty: the recent chats. */
  empty?: ReactNode;
  /** The docked question card, when there is one. */
  question?: ReactNode;
  composer: ReactNode;
  /** Phone only: the rail is a sheet that shows the composer and the last line until pulled up. */
  phone: boolean;
  expanded: boolean;
  onExpanded: (v: boolean) => void;
};

const artifactIcon = (k: ArtifactKey) => (k === "screenplay" ? <AppIcon name="file" size={14} /> : k === "references" ? <Icon name="cast" size={14} /> : k === "prompts" ? <Icon name="script" size={14} /> : <Icon name="play" size={12} />);

/** The agent: the conversation, the question card and replies, and the prompt box at the foot. */
export function Rail({ msgs, empty, busy, onOpen, chips, onChip, question, composer, phone, expanded, onExpanded }: Props) {
  const list = useRef<HTMLOListElement>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs.length, busy, question]);

  const lastAgent = [...msgs].reverse().find((m) => m.from === "agent");
  const collapsed = phone && !expanded;
  const [dragY, setDragY] = useState(0);

  return (
    <div className={r.rail} data-collapsed={collapsed || undefined}>
      {phone && (
        <button
          type="button"
          className={r.handle}
          aria-expanded={expanded}
          aria-label={expanded ? "Hide conversation" : "Show conversation"}
          onClick={() => onExpanded(!expanded)}
          onPointerDown={(e) => (start.current = e.clientY)}
          onPointerMove={(e) => start.current !== null && setDragY(e.clientY - start.current)}
          onPointerUp={() => {
            if (dragY < -24) onExpanded(true);
            if (dragY > 24) onExpanded(false);
            start.current = null;
            setDragY(0);
          }}
        >
          <span className={r.grip} aria-hidden="true" />
        </button>
      )}

      {Boolean(empty) && msgs.length === 0 && <div className={r.empty}>{empty}</div>}
      <ol ref={list} className={cx(r.msgs, Boolean(empty) && msgs.length === 0 && r.none)} role="log" aria-label="Conversation" aria-live="polite">
        {msgs.map((m, i) => (
          <Message key={m.id} m={m} first={m.from === "agent" && msgs[i - 1]?.from !== "agent"} onOpen={onOpen} />
        ))}
      </ol>

      {collapsed && lastAgent && !busy && (
        <p className={r.peek} aria-hidden="true">
          <ChevronIcon open={false} size={14} />
          <span>{lastAgent.text}</span>
        </p>
      )}

      <p className={r.busy} role="status">
        {busy && (
          <>
            <AnimatedMark variant="busy" size={18} />
            <span key={busy} className={r.busyText}>
              {busy}
            </span>
          </>
        )}
      </p>

      <div className={r.foot}>
        {question}
        {chips.length > 0 && (
          <div className={r.chips} role="group" aria-label="Replies">
            {chips.map((c) => (
              <Pill key={c} className={r.chip} onClick={() => onChip(c)}>
                {c}
              </Pill>
            ))}
          </div>
        )}
        {composer}
      </div>
    </div>
  );
}

function Message({ m, first, onOpen }: { m: Msg; first: boolean; onOpen: (k: ArtifactKey) => void }) {
  if (m.from === "me") {
    if (m.action) return <li className={r.action}>{m.text}</li>;
    return (
      <li className={r.me}>
        {m.file && (
          <span className={r.file}>
            <AppIcon name="file" size={16} />
            {m.file}
          </span>
        )}
        {m.notion && (
          <span className={r.file}>
            <Icon name="script" size={16} />
            {m.notion}
          </span>
        )}
        {(m.text || m.quote) && (
          <span className={r.bubble}>
            {m.quote && <span className={r.on}>{m.quote}</span>}
            {m.text}
          </span>
        )}
      </li>
    );
  }
  if (m.artifact)
    return (
      <li className={cx(r.agent, first && r.turn)}>
        <button type="button" className={r.made} onClick={() => onOpen(m.artifact!)} aria-label={`${m.text} Open ${artifactName[m.artifact]}`}>
          <span className={r.madeArt}>{m.thumb ? <Image src={m.thumb} alt="" fill sizes="48px" /> : artifactIcon(m.artifact)}</span>
          <span className={r.madeText}>{m.text}</span>
        </button>
      </li>
    );
  return (
    <li className={cx(r.agent, first && r.turn)}>
      {first && (
        <span className={r.mark} aria-hidden="true">
          <AnimatedMark variant="still" size={14} />
        </span>
      )}
      <p className={r.say}>{m.text}</p>
    </li>
  );
}
