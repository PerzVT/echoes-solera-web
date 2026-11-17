"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { GestureIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { useCast } from "@/components/labs/app/CastProvider";
import { cleanTag, type CastSheet } from "@/lib/labs/maker";
import { refGroups, type Ref } from "../data";
import { useDialog } from "../hooks";
import { Btn, IconBtn, Pill } from "../ui";
import shared from "./shared.module.css";
import own from "./board.module.css";

const v = { ...shared, ...own };
const kindName = Object.fromEntries(
  refGroups.map((g) => [g.kind, g.label.replace(/s$/, "")]),
) as Record<Ref["kind"], string>;

type Props = {
  refs: Ref[];
  onRetag: (id: string, tag: string) => void;
  onSheet: (id: string, tag: string, src: string) => void;
  onUpload: (id: string) => void;
  onGenerate: (id: string) => void;
};

/** The references board: large images grouped as characters, locations and props, with missing ones as dashed tiles. */
export function ReferencesView({
  refs,
  onRetag,
  onSheet,
  onUpload,
  onGenerate,
}: Props) {
  const cast = useCast().get("second-chance");
  const [viewing, setViewing] = useState<string | null>(null);
  const [choosing, setChoosing] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const shown = refs.filter((x) => x.src);
  const sheetsOf = (r: Ref) =>
    cast.sheets.filter((s) => s.character === r.character);
  const choosingRef = refs.find((x) => x.id === choosing);
  // One grid in group order, so six cards fill the width instead of three short rows.
  const ordered = refGroups.flatMap((g) =>
    refs.filter((x) => x.kind === g.kind),
  );

  return (
    <div className={v.board}>
      <h2 className="sr-only">References</h2>
      <p className={v.meta}>
        {shown.length} of {refs.length} ready
      </p>
      <ul className={v.refs} aria-label="References">
        {ordered.map((x) => {
          const sheets = sheetsOf(x);
          const at = sheets.findIndex((s) => s.tag === x.tag);
          return (
            <li key={x.id} className={v.ref} data-kind={x.kind} data-id={x.id}>
              <span className={v.refKind}>{kindName[x.kind]}</span>
              {x.src ? (
                <button
                  type="button"
                  className={v.refArt}
                  onClick={(e) => {
                    opener.current = e.currentTarget;
                    setViewing(x.id);
                  }}
                  aria-label={`${x.name}, full screen`}
                >
                  <Image
                    src={x.src}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    unoptimized={x.src.startsWith("blob:")}
                  />
                </button>
              ) : (
                <div className={v.refMissing}>
                  <Btn
                    kind="secondary"
                    small
                    icon={<GestureIcon name="upload" size={16} />}
                    onClick={() => onUpload(x.id)}
                  >
                    Upload
                  </Btn>
                  <Btn kind="secondary" small onClick={() => onGenerate(x.id)}>
                    Generate
                  </Btn>
                </div>
              )}
              <div className={v.refText}>
                <span className={v.refName}>{x.name}</span>
                <input
                  className={v.tag}
                  value={x.tag}
                  onChange={(e) => onRetag(x.id, cleanTag(e.target.value))}
                  aria-label={`${x.name} element ID`}
                  spellCheck={false}
                />
                {sheets.length > 1 && (
                  <Pill
                    className={v.variant}
                    onClick={(e) => {
                      opener.current = e.currentTarget;
                      setChoosing(x.id);
                    }}
                    aria-label={`${x.name} sheet, ${sheets[at]?.variant ?? x.tag}, ${at + 1} of ${sheets.length}`}
                  >
                    <span>{sheets[at]?.variant ?? x.tag}</span>
                    <span className={v.count}>
                      {at + 1} of {sheets.length}
                    </span>
                  </Pill>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <Lightbox
        items={shown}
        at={viewing}
        onAt={setViewing}
        onClose={() => {
          setViewing(null);
          opener.current?.focus();
        }}
      />
      <VariantPicker
        name={choosingRef?.name ?? ""}
        sheets={choosingRef ? sheetsOf(choosingRef) : []}
        chosen={choosingRef?.tag}
        open={Boolean(choosingRef)}
        onPick={(s) => {
          if (choosingRef) onSheet(choosingRef.id, s.tag, s.src);
          setChoosing(null);
        }}
        onClose={() => {
          setChoosing(null);
          opener.current?.focus();
        }}
      />
    </div>
  );
}

function Lightbox({
  items,
  at,
  onAt,
  onClose,
}: {
  items: Ref[];
  at: string | null;
  onAt: (id: string) => void;
  onClose: () => void;
}) {
  const ref = useDialog(at !== null);
  const i = items.findIndex((x) => x.id === at);
  const item = items[i];
  const step = (d: number) =>
    onAt(items[(i + d + items.length) % items.length].id);
  return (
    <dialog
      ref={ref}
      className={v.lightbox}
      aria-label={item ? `${item.name}, ${item.tag}` : "Image"}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
    >
      {item?.src && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={`${item.name}, ${item.tag}`}
            className={v.lbImg}
          />
          <p className={v.lbCaption}>
            {item.name} <span className={v.count}>{item.tag}</span>
          </p>
          <div className={v.lbBar}>
            <IconBtn
              label="Previous image"
              onClick={() => step(-1)}
              disabled={items.length < 2}
            >
              <Icon name="back" size={18} />
            </IconBtn>
            <IconBtn
              label="Next image"
              onClick={() => step(1)}
              disabled={items.length < 2}
            >
              <Icon name="arrow" size={18} />
            </IconBtn>
            <IconBtn label="Close" onClick={onClose}>
              <Icon name="close" size={18} />
            </IconBtn>
          </div>
        </>
      )}
    </dialog>
  );
}

function VariantPicker({
  name,
  sheets,
  chosen,
  open,
  onPick,
  onClose,
}: {
  name: string;
  sheets: CastSheet[];
  chosen?: string;
  open: boolean;
  onPick: (s: CastSheet) => void;
  onClose: () => void;
}) {
  const ref = useDialog(open);
  return (
    <dialog
      ref={ref}
      className={v.picker}
      aria-labelledby="vp-title"
      onClose={onClose}
    >
      <div className={v.pickerHead}>
        <h2 id="vp-title" className={v.pickerTitle}>
          {name}
        </h2>
        <IconBtn label="Close" onClick={onClose}>
          <Icon name="close" size={18} />
        </IconBtn>
      </div>
      <ul className={v.sheets}>
        {sheets.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={v.sheet}
              aria-pressed={s.tag === chosen}
              onClick={() => onPick(s)}
            >
              <span className={v.sheetArt}>
                <Image
                  src={s.src}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 50vw, 280px"
                />
              </span>
              <span className={v.sheetText}>
                <span>{s.variant ?? s.tag}</span>
                <span className={v.count}>{s.tag}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
