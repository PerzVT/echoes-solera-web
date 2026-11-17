import Link from "next/link";
import type { ReactNode } from "react";
import { GestureIcon } from "./fx/AnimatedIcon";

/**
 * Back to where the page was reached from. The arrow leans back when the link is hovered or focused.
 * `row` puts it on its own line between the nav and the content column (labs.css, .nl-back-row).
 */
export function BackLink({ href, children, row, className }: { href: string; children: ReactNode; row?: boolean; className?: string }) {
  const link = (
    <Link href={href} className={["nl-back", className].filter(Boolean).join(" ")}>
      <GestureIcon name="back" />
      <span>{children}</span>
    </Link>
  );
  return row ? <div className="nl-back-row">{link}</div> : link;
}
