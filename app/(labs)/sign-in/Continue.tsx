"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import buttons from "@/components/labs/Button.module.css";
import { GoogleMark, Icon } from "@/components/labs/Icon";
import styles from "./sign-in.module.css";

/**
 * The way in. It is a plain link, because the route handler redirects to Google and a client-side
 * navigation cannot follow that. Once pressed it shows it is at work (a second press does nothing)
 * until the browser leaves the page.
 *
 * provider "google" draws Google's own button: the light treatment from Google's sign-in branding
 * (white fill, #747775 edge, #1F1F1F text, the full-colour G on the left). Without it, the site's shouldered button.
 */
export function Continue({ href, children, provider }: { href: string; children: ReactNode; provider?: "google" }) {
  const [going, setGoing] = useState(false);

  // Coming back with the browser's Back button restores the page as it was left: put the button back to rest.
  useEffect(() => {
    const rest = () => setGoing(false);
    window.addEventListener("pageshow", rest);
    return () => window.removeEventListener("pageshow", rest);
  }, []);

  const go = (e: MouseEvent) => {
    if (going) e.preventDefault();
    setGoing(true);
  };

  if (provider === "google")
    return (
      <a className={`${buttons.btn} ${styles.google}`} href={href} data-state={going ? "loading" : undefined} aria-busy={going || undefined} onClick={go}>
        <span className={styles.googleMark}><GoogleMark size={18} /></span>
        <span className={styles.googleLabel}>{children}</span>
      </a>
    );

  return (
    <a className={`${buttons.btn} ${buttons.primary}`} href={href} data-state={going ? "loading" : undefined} aria-busy={going || undefined} onClick={go}>
      <span className={buttons.wash} aria-hidden="true" />
      <span className={buttons.icon}>
        <Icon name="signin" size={18} />
      </span>
      <span className={buttons.label}>{children}</span>
    </a>
  );
}
