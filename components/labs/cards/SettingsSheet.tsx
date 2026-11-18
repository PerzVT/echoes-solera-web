"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { setMuted, startOver, useCards } from "@/lib/labs/cards/store";
import { silence, unlockSound } from "@/lib/labs/cards/sfx";
import styles from "./SettingsSheet.module.css";

/** The collection's settings in a sheet: sound, and Start over behind a second press. */
export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const s = useCards();
  const [confirm, setConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setConfirm(false);
      setCleared(false);
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.sheet} aria-labelledby={`${uid}-t`} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className={styles.body}>
        <div className={styles.top}>
          <h2 id={`${uid}-t`} className="h2">
            Settings
          </h2>
          <button type="button" className={styles.x} onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className={styles.row}>
          <span id={`${uid}-snd`}>Sound</span>
          <button
            type="button"
            role="switch"
            aria-checked={!s.muted}
            aria-labelledby={`${uid}-snd`}
            className={styles.switch}
            onClick={() => {
              unlockSound();
              if (!s.muted) silence();
              setMuted(!s.muted);
            }}
          >
            <span />
          </button>
        </div>
        <div className={styles.row}>
          <span>{cleared ? "Collection cleared" : confirm ? "Clear every card and feather?" : "Collection"}</span>
          {confirm ? (
            <span className={styles.pair}>
              <Button variant="quiet" size="small" onClick={() => setConfirm(false)}>
                Keep it
              </Button>
              <Button
                variant="solid"
                size="small"
                onClick={() => {
                  startOver();
                  setConfirm(false);
                  setCleared(true);
                }}
              >
                Start over
              </Button>
            </span>
          ) : (
            <Button variant="secondary" size="small" onClick={() => setConfirm(true)} disabled={cleared}>
              Start over
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
