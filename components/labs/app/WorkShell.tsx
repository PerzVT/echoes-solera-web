"use client";

import type { ReactNode } from "react";
import { AppBar, type AppStep, type AppView } from "@/components/labs/chat/AppBar";
import { FileDrops } from "./FileDrops";
import styles from "./AppShell.module.css";

export type WorkStepDef = { key: string; label: string; href: string };

type Props = {
  tool: "storyboard" | "manga";
  view: AppView;
  /** The tool's steps, in order. Without `step` the page is a Library page and shows no step bar. */
  steps: WorkStepDef[];
  step?: string;
  /** The furthest step the work on screen has reached. */
  reached?: string;
  action?: ReactNode;
  onFiles?: (files: File[]) => void;
  fit?: boolean;
  children: ReactNode;
};

/** The storyboard and manga tools, edge to edge: the shared top bar with their own steps, then the work area. */
export function WorkShell({ tool, view, steps, step, reached, action, onFiles, fit, children }: Props) {
  const at = step ? steps.findIndex((s) => s.key === step) : -1;
  const far = Math.max(at, reached ? steps.findIndex((s) => s.key === reached) : -1);
  const bar: AppStep[] | undefined = step ? steps.map((s, i) => ({ key: s.key, label: s.label, href: s.href, state: i === at ? "current" : i <= far ? "done" : "todo" })) : undefined;
  return (
    <div className={styles.shell} data-fit={fit || undefined}>
      <FileDrops onFiles={onFiles} />
      <AppBar tool={tool} view={view} steps={bar} current={step} action={action} />
      <main id="main" tabIndex={-1} className={styles.work}>
        {children}
      </main>
    </div>
  );
}
