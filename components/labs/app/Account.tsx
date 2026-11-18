"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/labs/Icon";
import { useDismiss } from "@/components/labs/chat/hooks";
import type { NotionStatus } from "@/lib/labs/ai/contract";
import { api } from "./api";
import styles from "./Account.module.css";

type Me = { signedIn: boolean; email?: string; name?: string };

/** The answer is kept for the visit: the header then shows the account at once on every screen, and in a route skeleton. */
let known: Me | null = null;

/** The signed-in account in the creator header: a menu with the account, the Notion connection when there is one, and sign out. Shows nothing when no one is signed in. */
export function Account() {
  const [me, setMe] = useState<Me | null>(null);
  const [notion, setNotion] = useState<NotionStatus | null>(null);
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  useDismiss(open, panel, () => setOpen(false), button);

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

  useEffect(() => {
    if (!open || notion) return;
    api.notionStatus().then(setNotion, () => {});
  }, [open, notion]);

  if (!me?.signedIn) return null;
  const who = me.name ?? me.email ?? "";

  return (
    <div className={styles.account}>
      <button ref={button} type="button" className={styles.trigger} aria-expanded={open} aria-controls={open ? id : undefined} aria-label={`Account, ${who}`} onClick={() => setOpen(!open)}>
        <Icon name="user" size={18} />
        <span className={styles.who}>{who}</span>
      </button>
      {open && (
        <div ref={panel} id={id} className={styles.panel}>
          <div className={styles.me}>
            <span className={styles.name}>{me.name ?? me.email}</span>
            {me.name && me.email && <span className={styles.email}>{me.email}</span>}
          </div>
          {notion?.linked && (
            <p className={styles.notion}>
              <Icon name="notion" size={18} />
              <span>{notion.workspace ?? "Notion"}</span>
            </p>
          )}
          <form action="/api/auth/sign-out" method="post">
            <button type="submit" className={styles.item}>
              <Icon name="signout" size={18} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
