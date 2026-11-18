"use client";

import { useEffect, useState } from "react";
import styles from "./Account.module.css";

type Me = { signedIn: boolean; email?: string; name?: string };

/** The answer is kept for the visit: the header then shows the account at once on every screen, and in a route skeleton. */
let known: Me | null = null;

/** The signed-in account in the creator header, with sign out. Shows nothing when no one is signed in. */
export function Account() {
  const [me, setMe] = useState<Me | null>(null);
  // Read after mount, not in the first render, so the first render matches the server.

  useEffect(() => {
    if (known) return setMe(known);
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: Me) => {
        known = d;
        if (alive) setMe(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!me?.signedIn) return null;

  return (
    <form className={styles.account} action="/api/auth/sign-out" method="post">
      <span className={styles.who} title={me.email}>
        {me.name ?? me.email}
      </span>
      <button type="submit">Sign out</button>
    </form>
  );
}
