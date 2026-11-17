"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatedMark, AsciiField } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { AppIcon } from "@/components/labs/app/AppIcon";
import type { Shot } from "./data";
import b from "./board.module.css";

/** True for the 700 ms after a shot goes from Generating to Ready, while the glyph cover wipes away. */
export function useArriving(status: Shot["status"]) {
  const [seen, setSeen] = useState(status);
  const [arriving, setArriving] = useState(false);
  if (seen !== status) {
    setSeen(status);
    if (seen === "generating" && status === "ready") setArriving(true);
  }
  useEffect(() => {
    if (!arriving) return;
    const t = setTimeout(() => setArriving(false), 700);
    return () => clearTimeout(t);
  }, [arriving]);
  return arriving;
}

/** The glyph scan that covers a shot while it is being made. */
export function Develop({ leaving, cell = 6 }: { leaving?: boolean; cell?: number }) {
  return (
    <span className={b.develop} data-leaving={leaving || undefined}>
      <AsciiField mode="scan" cell={cell} intensity={0.5} speed={1.15} className={b.glyphs} />
    </span>
  );
}

/** A shot as a 16:9 picture: its still, the developing cover, or a dashed empty frame, with a status mark in the corner. */
export function Thumb({ shot, sizes }: { shot: Shot; sizes: string }) {
  const arriving = useArriving(shot.status);
  const take = shot.takes[shot.take];
  const empty = !take || shot.status === "failed" || shot.status === "empty";
  return (
    <span className={b.thumb} data-empty={(empty && shot.status !== "generating") || undefined}>
      {take && shot.status !== "failed" && shot.status !== "empty" && <Image src={take.still} alt="" fill sizes={sizes} />}
      {shot.status === "failed" && <AppIcon name="warning" size={18} />}
      {(shot.status === "generating" || arriving) && <Develop leaving={arriving} />}
      <StatusMark shot={shot} />
    </span>
  );
}

export function StatusMark({ shot }: { shot: Shot }) {
  return (
    <span className={b.mark} data-status={shot.status} aria-hidden="true">
      {shot.status === "generating" ? <AnimatedMark variant="busy" size={14} /> : shot.status === "ready" ? <Icon name="check" size={12} /> : null}
    </span>
  );
}
