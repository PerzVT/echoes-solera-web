"use client";

import { GestureIcon, Skeleton } from "@/components/labs/fx";
import { Btn } from "@/components/labs/chat/ui";
import { LibraryGridSkeleton, type CardShape } from "../LibraryGrid";
import { AppBar, type AppStep } from "@/components/labs/chat/AppBar";
import { Composer, ComposerTool } from "@/components/labs/chat/Composer";
import { Icon } from "@/components/labs/Icon";
import { StartScreen, type CreatorTool } from "../StartScreen";
import shell from "../AppShell.module.css";
import l from "./loading.module.css";

type Props = {
  tool: CreatorTool;
  /** The tool's steps, the first one current. */
  steps: { key: string; label: string; href?: string }[];
  label: string;
  placeholder: string;
};

/**
 * A start screen on its way, built from the real parts: the same bar, the same heading and tool row, and the same
 * prompt box out of use, so nothing moves when the page itself arrives. Only the foot's picker is a block.
 */
export function StartSkeleton({ tool, steps, label, placeholder }: Props) {
  const bar: AppStep[] = steps.map((s, i) => ({ ...s, state: i === 0 ? "current" : "todo" }));
  return (
    <div className={shell.shell} aria-busy="true">
      <AppBar tool={tool} view="create" steps={bar} current={steps[0].key} />
      <main className={shell.work}>
        <StartScreen tool={tool}>
          <Composer
            value=""
            onChange={() => {}}
            onSubmit={() => {}}
            label={label}
            placeholder={placeholder}
            submitLabel={tool === "cooking" ? "Generate" : undefined}
            attachment={{ accept: "", onAttach: () => {}, onRemove: () => {} }}
            tools={
              <ComposerTool icon={<Icon name="notion" size={18} />} disabled>
                Import from Notion
              </ComposerTool>
            }
            leading={<Skeleton radius={10} className={l.picker} />}
            disabled
          />
        </StartScreen>
      </main>
    </div>
  );
}

/** A tool's Library on its way: the same bar with New, the same heading and the grid's cards as blocks. */
export function LibrarySkeleton({ tool, shape }: { tool: CreatorTool; shape: CardShape }) {
  return (
    <div className={shell.shell} aria-busy="true">
      <AppBar
        tool={tool}
        view="library"
        action={
          <Btn kind="primary" disabled icon={<GestureIcon name="plus" size={18} />}>
            New
          </Btn>
        }
      />
      <main className={shell.work}>
        <LibraryGridSkeleton shape={shape} />
      </main>
    </div>
  );
}
