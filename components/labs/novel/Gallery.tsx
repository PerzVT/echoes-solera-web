"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { charIds, routeOf, type Cg, type CharId, type Story } from "@/lib/labs/novel";
import styles from "../VisualNovel.module.css";

/** The opening's illustration has all four in it, so it sits with Juri, whose counter it is drawn at. */
const ownerOf = (cg: Cg): CharId => (cg.id.startsWith("prologue") ? "juri" : (charIds.find((c) => cg.id.startsWith(c)) ?? "juri"));

/**
 * Event illustrations seen and endings reached, by character. A locked one is a plain locked tile; an
 * unlocked illustration opens whole, uncropped, over the stage.
 */
export function Gallery({
  story,
  cgs,
  endings,
  panelRef,
  onClose,
  holdTab,
}: {
  story: Story;
  cgs: string[];
  endings: string[];
  panelRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  holdTab: (e: ReactKeyboardEvent<HTMLElement>) => void;
}) {
  const [open, setOpen] = useState<Cg | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const closeView = useRef<HTMLButtonElement>(null);
  const endingScenes = story.scenes.filter((s) => s.ending);
  const total = story.cgs.length + endingScenes.length;
  const found = story.cgs.filter((c) => cgs.includes(c.id)).length + endingScenes.filter((s) => endings.includes(s.id)).length;

  useEffect(() => {
    if (open) closeView.current?.focus();
  }, [open]);

  const shut = () => {
    setOpen(null);
    requestAnimationFrame(() => opener.current?.focus());
  };

  return (
    <section
      ref={panelRef}
      className={styles.gallery}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vn-gallery"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          shut();
          return;
        }
        holdTab(e);
      }}
    >
      <div className={styles.logHead}>
        <h2 id="vn-gallery" className={styles.logTitle}>
          Gallery
        </h2>
        <span className={styles.count}>
          {found} of {total}
        </span>
        <Button variant="secondary" size="small" onClick={onClose} data-first>
          Close
        </Button>
      </div>
      <div className={styles.galleryBody} inert={!!open}>
        {charIds.map((who) => {
          const member = story.cast[who];
          const pics = story.cgs.filter((c) => ownerOf(c) === who);
          const ends = endingScenes.filter((s) => routeOf(s.id) === who);
          return (
            <section key={who} className={styles.galleryGroup} aria-labelledby={`vn-g-${who}`}>
              <h3 id={`vn-g-${who}`} className={styles.galleryName} style={{ color: member.color }}>
                {member.name}
              </h3>
              <ul className={styles.tiles}>
                {pics.map((c) =>
                  cgs.includes(c.id) ? (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={styles.tile}
                        onClick={(e) => {
                          opener.current = e.currentTarget;
                          setOpen(c);
                        }}
                      >
                        <Image src={c.thumb} alt="" width={400} height={225} sizes="(max-width: 700px) 45vw, 240px" />
                        <span className={styles.tileName}>{c.title}</span>
                      </button>
                    </li>
                  ) : (
                    <li key={c.id}>
                      <div className={styles.tile} data-locked="">
                        <span className={styles.lockArt}>
                          <Icon name="lock" />
                        </span>
                        <span className={styles.tileName}>Locked</span>
                      </div>
                    </li>
                  ),
                )}
              </ul>
              <ul className={styles.endings} aria-label={`${member.name.split(" ")[0]}'s endings`}>
                {ends.map((s) =>
                  endings.includes(s.id) ? (
                    <li key={s.id} className={styles.ending}>
                      <span className={styles.endingTitle}>{s.ending!.title}</span>
                      <span className={styles.endingText}>{s.ending!.text}</span>
                    </li>
                  ) : (
                    <li key={s.id} className={styles.ending} data-locked="">
                      <Icon name="lock" />
                      <span className={styles.endingTitle}>Locked</span>
                    </li>
                  ),
                )}
              </ul>
            </section>
          );
        })}
      </div>
      {open && (
        <div className={styles.viewer} role="group" aria-label={open.title}>
          <Image src={open.src} alt={open.title} fill sizes="100vw" style={{ objectFit: "contain" }} />
          <div className={styles.viewerBar}>
            <p className={styles.viewerTitle}>{open.title}</p>
            <Button ref={closeView} variant="secondary" size="small" onClick={shut}>
              Close
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
