"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { AccessSheets } from "./AccessSheets";
import type { SheetName } from "./sheets";
import { useAccess } from "./store";
import styles from "./access.module.css";

/** Whether this browser has dismissed the early-access banner. One flag for every page that shows it. */
const KEY = "nl-early-banner-dismissed";
const listeners = new Set<() => void>();
const readDismissed = () => {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
let dismissedNow = false;
const listen = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
function dismiss() {
  dismissedNow = true;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // Storage is blocked: the banner stays hidden for this visit.
  }
  listeners.forEach((l) => l());
}

/** True when the banner should not show. Hidden on the server and the first client pass, so it never flashes away. */
function useHidden() {
  const { subscribed } = useAccess();
  const dismissed = useSyncExternalStore(
    listen,
    () => dismissedNow || readDismissed(),
    () => true,
  );
  return dismissed || subscribed;
}

export function useBannerShown() {
  return !useHidden();
}

type Props = {
  /** "panel" sits at the top of the watch page's side panel; "wide" spans a page above a grid. */
  layout: "panel" | "wide";
  /** Opens a screen. Without it the banner opens its own sheet, for pages with none. */
  onOpen?: (s: SheetName) => void;
};

/** One sentence on what early access is, with Subscribe, the how-it-works screen and a dismiss that sticks. */
export function EarlyAccessBanner({ layout, onOpen }: Props) {
  const hidden = useHidden();
  const [own, setOwn] = useState<SheetName | null>(null);
  const open = onOpen ?? setOwn;

  return (
    <>
      {!hidden && (
        <section className={styles.banner} data-layout={layout} aria-label="Early access">
          <p className={styles.bannerText}>Early access lets subscribers watch new episodes a week before they are free for everyone.</p>
          <div className={styles.bannerActions}>
            <Button size="small" variant="solid" onClick={() => open("subscribe")} data-access-control>
              Subscribe
            </Button>
            <Button size="small" variant="quiet" onClick={() => open("how")}>
              How early access works
            </Button>
          </div>
          <button type="button" className={`${styles.close} ${styles.bannerClose}`} onClick={(e) => {
              // Focus moves on to what follows the banner, so it is not lost with the button.
              const after = e.currentTarget.closest("section")?.nextElementSibling;
              const target = after?.matches("a, button") ? after : after?.querySelector("a[href], button");
              dismiss();
              requestAnimationFrame(() => (target as HTMLElement | null | undefined)?.focus({ preventScroll: true }));
            }}
            aria-label="Dismiss early access banner">
            <Icon name="close" size={18} />
          </button>
        </section>
      )}
      {!onOpen && <AccessSheets sheet={own} onChange={setOwn} onClose={() => setOwn(null)} />}
    </>
  );
}
