"use client";

import { useCallback, useState } from "react";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { AccessSheets } from "../access/AccessSheets";
import { EarlyAccessBanner, useBannerShown } from "../access/Banner";
import type { SheetName } from "../access/sheets";
import { useAccess } from "../access/store";
import styles from "./series.module.css";

/**
 * Early access on a manga series page, from the mini-series components: the banner while it has not been
 * dismissed, otherwise a quiet Subscribe or Subscribed control, and the subscribe, manage and how-it-works
 * sheets. One subscription in one browser store covers manga and mini-series alike.
 */
export function SeriesAccess({ sheet: fromUrl }: { sheet: SheetName | null }) {
  const { subscribed } = useAccess();
  const banner = useBannerShown();
  const [sheet, setSheet] = useState<SheetName | null>(fromUrl);
  const close = useCallback(() => {
    setSheet(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has("state")) {
      url.searchParams.delete("state");
      window.history.replaceState(window.history.state, "", url);
    }
  }, []);
  const focusControl = () => requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-access-control]")?.focus({ preventScroll: true }));

  return (
    <>
      {subscribed ? (
        <div className={styles.purse}>
          <Button variant="quiet" size="small" icon={<Icon name="check" size={16} />} onClick={() => setSheet("manage")} aria-label="Subscribed, manage subscription" data-access-control>
            Subscribed
          </Button>
        </div>
      ) : banner ? (
        <EarlyAccessBanner layout="wide" onOpen={setSheet} />
      ) : (
        <div className={styles.purse}>
          <Button variant="quiet" size="small" onClick={() => setSheet("subscribe")} data-access-control>
            Subscribe
          </Button>
          <Button variant="quiet" size="small" onClick={() => setSheet("how")}>
            How early access works
          </Button>
        </div>
      )}
      <AccessSheets sheet={sheet} onChange={setSheet} onClose={close} onSubscribed={focusControl} onCancelled={focusControl} />
    </>
  );
}
