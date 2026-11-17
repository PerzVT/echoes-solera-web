import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedMark } from "@/components/labs/fx";
import { ToolSwitch, cx, type ToolKey } from "./ui";
import b from "./AppBar.module.css";

export type AppView = "create" | "library";
export type StepState = "done" | "current" | "todo";
export type AppStep = { key: string; label: string; href?: string; state: StepState };

const views: Record<ToolKey, Record<AppView, string>> = {
  "mini-series": { create: "/app", library: "/app/library" },
  anime: { create: "/app/anime/new", library: "/app/anime" },
  cooking: { create: "/app/cooking", library: "/app/cooking/library" },
};

type Props = {
  tool: ToolKey;
  view: AppView;
  /** The wizard's steps, in order. A step with an href and a state other than "todo" is a link. */
  steps?: AppStep[];
  /** The key of the step on screen; overrides that step's state with "current". */
  current?: string;
  /** The one primary button. Pinned to the bottom of the screen on phones. */
  action?: ReactNode;
  title?: string;
};

/** The creator's top bar: the mark, the tool switch, Create and Library, the step bar and the primary action. */
export function AppBar({ tool, view, steps, current, action, title }: Props) {
  const routes = views[tool];
  return (
    <header className={cx(b.bar, steps && b.withSteps)}>
      <div className={b.row}>
        <Link href="/" className={b.mark} aria-label="Nine Lives home">
          <AnimatedMark variant="still" size={26} />
        </Link>
        <ToolSwitch current={tool} />
        <nav className={b.views} aria-label="View">
          <Link href={routes.create} className={b.view} aria-current={view === "create" ? "page" : undefined}>
            Create
          </Link>
          <Link href={routes.library} className={b.view} aria-current={view === "library" ? "page" : undefined}>
            Library
          </Link>
        </nav>
        {title && <span className={b.title}>{title}</span>}
      </div>
      {steps && <Steps steps={steps} current={current} />}
      {action && (
        <div className={b.action} data-app-dock="">
          {action}
        </div>
      )}
    </header>
  );
}

function Steps({ steps, current }: { steps: AppStep[]; current?: string }) {
  return (
    <nav className={b.steps} aria-label="Steps">
      <ol className={b.stepList}>
        {steps.map((s, i) => {
          const state: StepState = s.key === current ? "current" : s.state;
          const body = (
            <>
              <span className={b.num} aria-hidden="true">
                {i + 1}
              </span>
              <span className={b.stepLabel}>{s.label}</span>
            </>
          );
          return (
            <li key={s.key} className={b.stepItem}>
              {s.href && state !== "todo" ? (
                <Link href={s.href} className={b.step} data-state={state} aria-current={state === "current" ? "step" : undefined}>
                  {body}
                </Link>
              ) : (
                <span className={b.step} data-state={state} aria-current={state === "current" ? "step" : undefined} aria-disabled={state === "todo" || undefined}>
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
