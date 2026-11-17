"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { projects } from "@/lib/labs/projects";

/**
 * The Projects menu. A native <details>, so it opens without JavaScript; with it, the menu also
 * closes on Escape (focus goes back to its button), on a press outside it, when Tab moves focus out of
 * it and when an item is chosen.
 */
export function ProjectsMenu({ className, current }: { className?: string; current?: boolean }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !d.open) return;
      d.open = false;
      d.querySelector("summary")?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (d.open && !d.contains(e.target as Node)) d.open = false;
    };
    // Focus leaving for somewhere outside the menu (Tab past the last item, Shift+Tab off the button).
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (d.open && next && !d.contains(next)) d.open = false;
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    d.addEventListener("focusout", onFocusOut);
    return () => {
      d.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const close = () => {
    if (ref.current) ref.current.open = false;
  };

  return (
    <details ref={ref} className={className}>
      <summary aria-current={current ? "page" : undefined}>
        Projects
        <Icon name="down" size={16} />
      </summary>
      <ul>
        {projects.map((p) => (
          <li key={p.slug}>
            <Link href={p.slug === projects[0].slug ? "/" : `/?p=${p.slug}`} onClick={close}>
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
