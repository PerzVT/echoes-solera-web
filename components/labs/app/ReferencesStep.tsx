"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type CSSProperties, type DragEvent, type KeyboardEvent } from "react";
import { AppShell } from "./AppShell";
import { Button, ButtonLink } from "@/components/labs/Button";
import { Icon } from "@/components/labs/Icon";
import { GestureIcon } from "@/components/labs/fx";
import { useCast } from "./CastProvider";
import { Alert, ConfirmDialog, EpisodeTitle, SheetImage, Stepper, focusSoon, notImages, splitImages, useFilePicker } from "./parts";
import { elementGroups, libraryImages, startingElements, type Element, type PoolImage } from "./creator";
import { confirmEpisode, listOf } from "@/lib/labs/maker";
import r from "./ReferencesStep.module.css";

export type RefState = "default" | "outfit" | "confirm";

/**
 * References: every element the episode needs, grouped as characters, locations and props. Each card shows the
 * picture itself, the element's name and its full element ID. A card opens its picture full screen; an element
 * with no picture takes a dropped file or opens the picker, which also uploads.
 */
export function ReferencesStep({ initial }: { initial: RefState }) {
  const router = useRouter();
  const store = useCast();
  const series = store.working.slug;
  const cast = store.get(series);
  const memoKey = `references:${series}:${store.working.episode}:${initial}`;
  const [elements, setElements] = useState<Element[]>(() => store.kept<Element[]>(memoKey) ?? startingElements(initial));
  const [viewing, setViewing] = useState<string | null>(null);
  const [choosing, setChoosing] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(initial === "confirm");
  const [starting, setStarting] = useState(false);
  const [rejected, setRejected] = useState("");
  const [said, setSaid] = useState("");
  const generate = useRef<HTMLButtonElement>(null);
  /** The card that opened a dialog, so focus goes back to it. */
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    store.keep(memoKey, elements);
  }, [store, memoKey, elements]);

  // Screen order: group by group, as the cards are laid out.
  const shown = elementGroups.flatMap((g) => elements.filter((x) => x.kind === g.kind && x.src));
  const missing = elements.filter((x) => !x.src);

  /** Pictures an element can be matched to: the series cast for a character, the library and this session's uploads otherwise. */
  const poolFor = (x: Element): PoolImage[] => {
    if (x.kind === "character") {
      const nameOf = (id: string) => cast.characters.find((c) => c.id === id)?.name ?? "";
      const all = cast.sheets.map((sh) => ({ tag: sh.tag, name: nameOf(sh.character), src: sh.src }));
      // Sheets of this character first ("Chloe" is Chloe Hayes in the cast), then the rest of the cast.
      const mine = (p: PoolImage) => p.name.toLowerCase().split(" ")[0] === x.name.toLowerCase();
      return [...all.filter(mine), ...all.filter((p) => !mine(p))];
    }
    const uploaded = (cast.others ?? []).filter((o) => o.kind === x.kind).map((o) => ({ tag: o.tag, name: o.who, src: o.src }));
    return [...libraryImages[x.kind], ...uploaded];
  };

  const setPicture = (id: string, tag: string, src: string) => {
    setElements((all) => all.map((x) => (x.id === id ? { ...x, tag, src } : x)));
    const name = elements.find((x) => x.id === id)?.name;
    setSaid(`${name} now shows ${tag}.`);
  };

  const upload = (x: Element, files: File[]) => {
    const { images, other } = splitImages(files);
    const extra = images.slice(1).map((f) => f.name);
    setRejected([notImages(other, "References are"), extra.length ? `${extra.join(", ")} not added. An element takes one image.` : ""].filter(Boolean).join(" "));
    const f = images[0];
    if (!f) return;
    if (x.kind === "character") {
      // A character's picture joins the series cast under that character.
      const known = cast.characters.find((c) => c.name.toLowerCase().split(" ")[0] === x.name.toLowerCase());
      const id = known?.id ?? store.addCharacter(series, x.name);
      const [added] = store.addSheets(series, id, [f], x.name);
      return setPicture(x.id, added.tag, added.src);
    }
    const kept = store.addOther(series, x.kind, x.name, f, x.tag);
    setPicture(x.id, kept.tag, kept.src);
  };

  const uploadFor = useRef("");
  const picker = useFilePicker(
    "image/*",
    (files) => {
      const x = elements.find((y) => y.id === uploadFor.current);
      if (x) upload(x, files);
    },
    false,
  );
  const startUpload = (id: string) => {
    uploadFor.current = id;
    picker.open();
  };

  const backTo = () => {
    const el = opener.current;
    focusSoon(() => (el && document.contains(el) ? el : null));
  };

  const choosingEl = elements.find((x) => x.id === choosing);

  return (
    <AppShell
      section="/app"
      title={<EpisodeTitle />}
      bar={<Stepper current="references" />}
      actions={
        <Button ref={generate} onClick={() => setConfirm(true)}>
          Generate episode
        </Button>
      }
    >
      {picker.node}
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      <div className={r.page}>
        <h1 className="sr-only">References</h1>
        {rejected && (
          <div className={r.wide}>
            <Alert>{rejected}</Alert>
          </div>
        )}
        {elementGroups.map((g) => {
          const items = elements.filter((x) => x.kind === g.kind);
          if (!items.length) return null;
          return (
            <section
              key={g.kind}
              className={r.group}
              aria-labelledby={`g-${g.kind}`}
              style={{ "--span": Math.min(items.length, 4) } as CSSProperties}
            >
              <h2 id={`g-${g.kind}`} className={r.groupTitle}>
                {g.label}
              </h2>
              <ul className={r.grid}>
                {items.map((x) => (
                  <li key={x.id} className={r.card}>
                    {x.src ? (
                      <div className={r.artWrap}>
                        <button
                          type="button"
                          className={r.art}
                          onClick={(e) => {
                            opener.current = e.currentTarget;
                            setViewing(x.id);
                          }}
                          aria-label={`View ${x.name} full screen`}
                        >
                          <SheetImage src={x.src} sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 25vw" className={r.img} />
                        </button>
                        <span className={r.change}>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={(e) => {
                              opener.current = e.currentTarget;
                              setChoosing(x.id);
                            }}
                            aria-label={`Change the image for ${x.name}`}
                          >
                            Change
                          </Button>
                        </span>
                      </div>
                    ) : (
                      <EmptyArt
                        name={x.name}
                        onChoose={(el) => {
                          opener.current = el;
                          setChoosing(x.id);
                        }}
                        onFiles={(files) => upload(x, files)}
                      />
                    )}
                    <div className={r.meta}>
                      <p className={r.name}>{x.name}</p>
                      <p className={r.tag}>{x.tag}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <Lightbox
        items={shown}
        current={viewing}
        onMove={setViewing}
        onClose={() => {
          setViewing(null);
          backTo();
        }}
      />

      {choosingEl && (
        <ChooseDialog
          element={choosingEl}
          pool={poolFor(choosingEl)}
          castHref={`/app/series/${series}/cast?from=references`}
          onPick={(p) => {
            setPicture(choosingEl.id, p.tag, p.src);
            setChoosing(null);
            backTo();
          }}
          onUpload={() => {
            const id = choosingEl.id;
            setChoosing(null);
            startUpload(id);
          }}
          onClose={() => {
            setChoosing(null);
            backTo();
          }}
        />
      )}

      <ConfirmDialog
        open={confirm}
        onClose={() => {
          setConfirm(false);
          // Opened from the address, the dialog has no opener to return to.
          focusSoon(() => (document.activeElement === document.body ? generate.current : null));
        }}
        onConfirm={() => {
          // The button works until Results takes the screen.
          setStarting(true);
          router.push("/app/episode/results?state=new");
        }}
        busy={starting}
        title={`Generate ${store.working.episode.toLowerCase()}`}
        makes={confirmEpisode.makes}
        facts={missing.length ? [{ label: "Missing", value: listOf(missing.map((x) => x.name)) }] : []}
        confirmLabel="Generate episode"
      />
    </AppShell>
  );
}

type EmptyArtProps = { name: string; onChoose: (el: HTMLElement) => void; onFiles: (files: File[]) => void };

/** An element with no picture: the whole box takes a dropped image, and one button opens the picker. */
function EmptyArt({ name, onChoose, onFiles }: EmptyArtProps) {
  const [over, setOver] = useState(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    onFiles(Array.from(e.dataTransfer.files));
  };
  return (
    <div
      className={r.art}
      data-empty="true"
      data-over={over || undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
      }}
      onDrop={onDrop}
    >
      <span className={r.emptyIcon} aria-hidden="true">
        <GestureIcon name="upload" size={24} active={over} />
      </span>
      <p className={r.emptyText}>No image</p>
      <Button variant="secondary" size="small" onClick={(e) => onChoose(e.currentTarget)} aria-label={`Choose an image for ${name}`}>
        Choose image
      </Button>
    </div>
  );
}

type LightboxProps = { items: Element[]; current: string | null; onMove: (id: string) => void; onClose: () => void };

/** The picture full screen. Arrow keys move between elements, Escape closes, focus stays inside while it is open. */
function Lightbox({ items, current, onMove, onClose }: LightboxProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const id = useId();
  const index = items.findIndex((x) => x.id === current);
  const item = items[index];

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (item && !d.open) {
      d.showModal();
      close.current?.focus();
    }
    if (!item && d.open) d.close();
  }, [item]);

  const step = (by: number) => {
    if (items.length < 2) return;
    onMove(items[(index + by + items.length) % items.length].id);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <dialog ref={ref} className={r.lightbox} aria-labelledby={id} onClose={onClose} onKeyDown={onKey}>
      {item && (
        <>
          <div className={r.lbBar}>
            <div className={r.lbText}>
              <h2 id={id} className={r.lbName}>
                {item.name}
              </h2>
              <p className={r.tag}>{item.tag}</p>
            </div>
            <p className={r.lbCount} aria-live="polite">
              {index + 1} of {items.length}
            </p>
            <Button ref={close} variant="secondary" size="small" icon={<GestureIcon name="close" size={16} />} onClick={() => ref.current?.close()}>
              Close
            </Button>
          </div>
          <div className={r.lbStage}>
            {/* A plain image: the full picture at its own proportions, as large as the screen allows. */}
            <img key={item.src} src={item.src} alt={`${item.name}, ${item.tag}`} className={r.lbImg} />
            {items.length > 1 && (
              <>
                <button type="button" className={`${r.lbNav} ${r.lbPrev}`} onClick={() => step(-1)} aria-label="Previous element">
                  <Icon name="back" size={20} />
                </button>
                <button type="button" className={`${r.lbNav} ${r.lbNext}`} onClick={() => step(1)} aria-label="Next element">
                  <Icon name="arrow" size={20} />
                </button>
              </>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}

type ChooseProps = {
  element: Element;
  pool: PoolImage[];
  castHref: string;
  onPick: (p: PoolImage) => void;
  onUpload: () => void;
  onClose: () => void;
};

/** The pictures an element can show, large enough to tell apart, with Upload for one that is not there. */
function ChooseDialog({ element, pool, castHref, onPick, onUpload, onClose }: ChooseProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog ref={ref} className={r.choose} aria-labelledby={id} onClose={onClose} onClick={(e) => e.target === ref.current && ref.current?.close()}>
      <div className={r.chooseHead}>
        <h2 id={id} className={r.chooseTitle}>
          Choose an image for {element.name}
        </h2>
        <Button variant="quiet" size="small" onClick={() => ref.current?.close()} aria-label="Close">
          <GestureIcon name="close" size={16} />
        </Button>
      </div>
      {pool.length ? (
        <ul className={r.chooseGrid}>
          {pool.map((p) => (
            <li key={p.tag}>
              <button type="button" className={r.option} aria-pressed={element.tag === p.tag && Boolean(element.src)} onClick={() => onPick(p)}>
                <span className={r.optionArt}>
                  <SheetImage src={p.src} sizes="(max-width: 720px) 50vw, 240px" className={r.img} />
                </span>
                <span className={r.name}>{p.name}</span>
                <span className={r.tag}>{p.tag}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={r.chooseEmpty}>The series has no {element.kind} images yet.</p>
      )}
      <div className={r.chooseFoot}>
        {element.kind === "character" && (
          <ButtonLink href={castHref} variant="quiet" size="small">
            Open cast
          </ButtonLink>
        )}
        <Button variant="secondary" size="small" icon={<GestureIcon name="upload" size={16} />} onClick={onUpload}>
          Upload image
        </Button>
      </div>
    </dialog>
  );
}
