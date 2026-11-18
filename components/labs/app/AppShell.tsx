"use client";

import { useEffect, type ReactNode } from "react";
import { AppBar, type AppStep, type AppView } from "@/components/labs/chat/AppBar";
import { STEPS, type StepKey } from "@/lib/labs/maker";
import { REACHED, useCast } from "./CastProvider";
import { FileDrops } from "./FileDrops";
import styles from "./AppShell.module.css";

type Props = {
  /** The flow step on screen. Without it the page is a Library page and shows no step bar. */
  step?: StepKey;
  view?: AppView;
  /** The one primary button. */
  action?: ReactNode;
  /** Files dropped anywhere outside a drop zone. Without it such a drop is swallowed, so the browser never opens the file in place of the page. */
  onFiles?: (files: File[]) => void;
  /** On wide screens the work area takes exactly the height under the bar, and its panels scroll inside. */
  fit?: boolean;
  children: ReactNode;
};

/** The mini-series creator, edge to edge: the shared top bar, then the work area. */
export function AppShell({ step, view: asked, action, onFiles, fit, children }: Props) {
  const store = useCast();
  // The steps of an episode already in the Library sit under Library; a new episode is under Create.
  const view = asked ?? (step && store.episodeOf(store.current).isNew ? "create" : "library");
  const at = step ? STEPS.findIndex((s) => s.key === step) : -1;
  const reached = Math.max(store.kept<number>(REACHED) ?? 0, at);
  useEffect(() => {
    if (at >= 0) store.keep(REACHED, Math.max(store.kept<number>(REACHED) ?? 0, at));
    // A saved episode records the furthest step it has reached, so the Library reopens it there.
    if (step) store.reach(store.current, step);
  }, [store, at, step]);

  const steps: AppStep[] | undefined = step
    ? STEPS.map((s, i) => ({ key: s.key, label: s.label, href: s.href, state: i === at ? "current" : i <= reached ? "done" : "todo" }))
    : undefined;

  return (
    <div className={styles.shell} data-fit={fit || undefined}>
      <FileDrops onFiles={onFiles} />
      <AppBar tool="mini-series" view={view} steps={steps} current={step} action={action} />
      <main id="main" tabIndex={-1} className={styles.work}>
        {children}
      </main>
    </div>
  );
}
