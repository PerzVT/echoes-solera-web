"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { ButtonInner, buttonClass } from "@/components/labs/Button";
import { GoogleMark, Icon } from "@/components/labs/Icon";
import styles from "./sign-in.module.css";

/**
 * The way in. It is a plain link, because the route handler redirects to Google and a client-side
 * navigation cannot follow that. Once pressed it shows it is at work (a second press does nothing)
 * until the browser leaves the page.
 *
 * provider "google" draws Google's own button: the light treatment from Google's sign-in branding
 * (white fill, #747775 edge, #1F1F1F text, the full-colour G on the left) in Google's pill shape. Without it,
 * the site's shouldered button: on this screen it is the one main action.
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
      <a className={buttonClass("secondary", "default", styles.google)} href={href} data-state={going ? "loading" : undefined} aria-busy={going || undefined} onClick={go}>
        <span className={styles.googleMark}><GoogleMark size={18} /></span>
        <span className={styles.googleLabel}>{children}</span>
      </a>
    );

  return (
    <a className={buttonClass("primary")} href={href} data-state={going ? "loading" : undefined} aria-busy={going || undefined} onClick={go}>
      <ButtonInner shoulder icon={<Icon name="signin" size={18} />}>
        {children}
      </ButtonInner>
    </a>
  );
}
