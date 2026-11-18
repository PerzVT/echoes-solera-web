import type { ReactNode } from "react";
import { GestureIcon, Skeleton, SkeletonGroup, SkeletonText } from "@/components/labs/fx";
import { AppBar, type AppStep, type AppView } from "@/components/labs/chat/AppBar";
import { Btn } from "@/components/labs/chat/ui";
import { Icon } from "@/components/labs/Icon";
import { FLOW_STEPS, PROFILES, type FlowStep, type FlowTool } from "../tools";
import shell from "../AppShell.module.css";
import l from "./loading.module.css";

/*
 * What each mini-series route shows while it is on its way (the skeleton.tsx beside each page; RouteSkeleton
 * lays it over the page being left when a navigation takes longer than 180 ms). Each is the real top bar over
 * the screen's main blocks, edge to edge. It is drawn outside the creator's state, so the step bar marks every
 * step before the one loading as reached.
 */

/** The step's action carries the same icon here as on the screen it stands in for. */
const actionIcon = (action: string) =>
  action === "Next" || action === "Read"
    ? { iconAfter: <Icon name="arrow" size={16} /> }
    : action === "Generate"
      ? { icon: <Icon name="generate" size={16} /> }
      : action === "Finish"
        ? { icon: <Icon name="save" size={16} /> }
        : action === "Done"
          ? { icon: <Icon name="check" size={16} /> }
          : action === "New"
            ? { icon: <GestureIcon name="plus" size={18} /> }
            : {};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

type Tool = { tool?: FlowTool };

function Frame({ step, view, action, tool = "mini-series", children }: { step?: FlowStep; view?: AppView; action?: string; children: ReactNode } & Tool) {
  const at = step ? FLOW_STEPS.findIndex((s) => s.key === step) : -1;
  const steps: AppStep[] | undefined = step ? FLOW_STEPS.map((s, i) => ({ key: s.key, label: s.label, href: PROFILES[tool].steps[s.key], state: i === at ? "current" : i < at ? "done" : "todo" })) : undefined;
  return (
    <div className={shell.shell} data-fit="">
      <AppBar
        tool={tool}
        view={view ?? (step ? "create" : "library")}
        steps={steps}
        current={step}
        action={
          action && (
            <Btn kind="primary" disabled {...actionIcon(action)}>
              {action}
            </Btn>
          )
        }
      />
      <SkeletonGroup label="Loading" className={shell.work}>
        {children}
      </SkeletonGroup>
    </div>
  );
}

export function StartLoading({ tool }: Tool = {}) {
  return (
    <Frame tool={tool} step="script">
      <div className={l.start}>
        <Skeleton width="60%" height={44} radius={8} style={{ margin: "0 auto" }} />
        <Skeleton height={320} radius={20} />
      </div>
    </Frame>
  );
}

export function ScreenplayLoading({ tool }: Tool = {}) {
  return (
    <Frame tool={tool} step="screenplay" action="Next">
      <div className={l.doc}>
        <Skeleton width={160} height={32} radius={8} />
        <SkeletonText lines={14} />
      </div>
    </Frame>
  );
}

export function CastLoading({ tool }: Tool = {}) {
  return (
    <Frame tool={tool} step="cast" action="Next">
      <div className={l.wide}>
        <Skeleton width={120} height={36} radius={8} />
        <div className={l.cards}>
          {range(5).map((i) => (
            <Skeleton key={i} index={i} ratio="3 / 4.6" radius={16} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function StyleLoading({ tool }: Tool = {}) {
  return (
    <Frame tool={tool} step="style" action="Generate">
      <div className={l.split}>
        <div className={l.tiles}>
          {range(12).map((i) => (
            <Skeleton key={i} index={i} ratio="9 / 16" radius={12} />
          ))}
        </div>
        <Skeleton className={l.side} radius={20} />
      </div>
    </Frame>
  );
}

export function ResultsLoading({ tool }: Tool = {}) {
  return (
    <Frame tool={tool} step="results" action="Finish">
      <div className={l.results}>
        <div className={l.rows}>
          {range(6).map((i) => (
            <Skeleton key={i} index={i} height={72} radius={12} />
          ))}
        </div>
        <Skeleton className={l.player} radius={16} />
      </div>
    </Frame>
  );
}

export function LibraryLoading({ tool }: Tool = {}) {
  return (
    <Frame tool={tool} action="New">
      <div className={l.wide}>
        <Skeleton width={160} height={36} radius={8} />
        <div className={l.series}>
          {range(3).map((i) => (
            <Skeleton key={i} index={i} height={200} radius={20} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function SeriesLoading({ tool }: Tool = {}) {
  return (
    <Frame tool={tool} action="New">
      <div className={l.wide}>
        <Skeleton width={320} height={44} radius={8} />
        <div className={l.cards}>
          {range(3).map((i) => (
            <Skeleton key={i} index={i} ratio="9 / 17" radius={16} />
          ))}
        </div>
      </div>
    </Frame>
  );
}
