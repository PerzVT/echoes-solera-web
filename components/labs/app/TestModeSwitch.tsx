"use client";

import { setTestMode, useTestMode } from "./testMode";
import s from "./TestModeSwitch.module.css";

/**
 * The test mode switch in the creator header, beside the account. While it is on, a band in the warning colour runs
 * along the top of the header and the switch carries the same colour, so a screen in test mode is never mistaken
 * for real work. Before the browser knows the state it holds its place, so the header does not shift.
 */
export function TestModeSwitch() {
  const on = useTestMode();
  return (
    <div className={s.wrap} data-on={on || undefined}>
      {on && <span className={s.band} aria-hidden="true" />}
      <button
        type="button"
        role="switch"
        aria-checked={on ?? false}
        aria-label="Test mode"
        className={s.switch}
        disabled={on === null}
        onClick={() => setTestMode(!on)}
      >
        <span className={s.label} aria-hidden="true">
          Test mode
        </span>
        <span className={s.track} aria-hidden="true">
          <span className={s.thumb} />
        </span>
      </button>
    </div>
  );
}
