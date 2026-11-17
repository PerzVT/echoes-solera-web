"use client";

import { useEffect, useState, type ReactNode } from "react";
import buttons from "@/components/labs/Button.module.css";

/**
 * The way in. It is a plain link, because the route handler redirects to Google and a client-side
 * navigation cannot follow that. Once pressed it takes the shared button's loading state (the label
 * stays, the band keeps crossing, a second press does nothing) until the browser leaves the page.
 */
export function Continue({ href, children }: { href: string; children: ReactNode }) {
  const [going, setGoing] = useState(false);

  // Coming back with the browser's Back button restores the page as it was left: put the button back to rest.
  useEffect(() => {
    const rest = () => setGoing(false);
    window.addEventListener("pageshow", rest);
    return () => window.removeEventListener("pageshow", rest);
  }, []);

  return (
    <a className={`${buttons.btn} ${buttons.primary}`} href={href} data-state={going ? "loading" : undefined} aria-busy={going || undefined} onClick={() => setGoing(true)}>
      <span className={buttons.wash} aria-hidden="true" />
      <span className={buttons.label}>{children}</span>
    </a>
  );
}
