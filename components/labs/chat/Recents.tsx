import Image from "next/image";
import Link from "next/link";
import { chatGroups } from "./data";
import r from "./rail.module.css";

const statusName = { working: "Working", "needs-you": "Needs you", done: "Done" } as const;

/** The rail of a new chat: every chat, newest series first, each with its cover, its stage and a status dot. */
export function Recents() {
  return (
    <nav className={r.recents} aria-labelledby="recent-title">
      <h2 id="recent-title" className={r.recentTitle}>
        Recent
      </h2>
      <ul className={r.recentList}>
        {chatGroups.flatMap((g) =>
          g.chats.map((c) => (
            <li key={c.id}>
              <Link href={`/app/c/${c.id}`} className={r.recent}>
                <span className={r.recentArt}>
                  <Image src={g.cover} alt="" fill sizes="80px" />
                </span>
                <span className={r.recentText}>
                  <span className={r.recentName}>{c.label}</span>
                  <span className={r.recentMeta}>
                    {g.series}, {c.stage.toLowerCase()}
                  </span>
                </span>
                <span className={r.dot} data-status={c.status} role="img" aria-label={statusName[c.status]} />
              </Link>
            </li>
          )),
        )}
      </ul>
    </nav>
  );
}
