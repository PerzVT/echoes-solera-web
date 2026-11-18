"use client";

import { Button } from "../Button";
import { Icon } from "../Icon";
import { PLAN } from "./plan";
import { Sheet } from "./Sheet";
import type { SheetName } from "./sheets";
import { cancel, subscribe, useAccess } from "./store";
import { longDay } from "./timer";
import styles from "./access.module.css";

type Props = {
  sheet: SheetName | null;
  onChange: (s: SheetName | null) => void;
  onClose: () => void;
  /** After a subscription starts and the sheet has closed. */
  onSubscribed?: () => void;
  /** After a cancel and the sheet has closed. */
  onCancelled?: () => void;
};

/**
 * The subscribe, manage and how-it-works screens, in one sheet. Subscribe and manage swap to match the
 * visitor's state, so a link to either always lands on the screen that applies.
 */
export function AccessSheets({ sheet, onChange, onClose, onSubscribed, onCancelled }: Props) {
  const { subscribed, since } = useAccess();
  const shown: SheetName | null = sheet === "manage" && !subscribed ? "subscribe" : sheet === "subscribe" && subscribed ? "manage" : sheet;

  const titles: Record<SheetName, string> = {
    subscribe: "Nine Lives early access",
    manage: "Your subscription",
    how: "How early access works",
  };

  return (
    <Sheet open={!!shown} title={shown ? titles[shown] : ""} onClose={onClose}>
      {shown === "subscribe" && (
        <div className={styles.stack}>
          <ul className={styles.perks}>
            <li>
              <Icon name="check" size={18} />
              <span>Every early-access episode and chapter on every series</span>
            </li>
            <li>
              <Icon name="check" size={18} />
              <span>New episodes and chapters a week before their release</span>
            </li>
            <li>
              <Icon name="check" size={18} />
              <span>Cancel any time</span>
            </li>
          </ul>
          <p className={styles.price}>{PLAN.price}</p>
          <Button
            className={styles.wide}
            data-autofocus
            onClick={() => {
              subscribe();
              onClose();
              onSubscribed?.();
            }}
          >
            Subscribe
          </Button>
        </div>
      )}

      {shown === "manage" && (
        <div className={styles.stack}>
          <dl className={styles.rows}>
            <div>
              <dt>Subscribed since</dt>
              <dd>{since ? longDay(since) : "Today"}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{PLAN.price}</dd>
            </div>
          </dl>
          <div className={styles.actions}>
            <Button data-autofocus onClick={onClose}>
              Done
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                cancel();
                onClose();
                onCancelled?.();
              }}
            >
              Cancel subscription
            </Button>
          </div>
        </div>
      )}

      {shown === "how" && (
        <div className={styles.stack}>
          <div className={styles.how}>
            <p>Every episode and chapter has a public release date. Before that date it is early access.</p>
            <p>Subscribers watch or read early-access episodes and chapters as soon as they are out, usually a week before release.</p>
            <p>On its release date it is free for everyone.</p>
            <p>One subscription covers every series. If you cancel, early episodes and chapters lock again until their release dates.</p>
          </div>
          {!subscribed && (
            <div className={styles.actions}>
              <Button variant="secondary" data-autofocus onClick={() => onChange("subscribe")}>
                Subscribe
              </Button>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
