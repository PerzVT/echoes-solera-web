import type { Metadata } from "next";
import Image from "next/image";
import { Nav } from "@/components/labs/Nav";
import { Icon, type IconName } from "@/components/labs/Icon";
import {
  allowedDomains,
  authConfigured,
  authUrl,
  authUrlProblem,
  openInDevelopment,
  safeNext,
} from "@/lib/labs/auth";
import { AnimatedMark, LIGHT_MATERIALS } from "@/components/labs/fx";
import { Continue } from "./Continue";
import styles from "./sign-in.module.css";

export const metadata: Metadata = { title: "Sign in" };

const domainMessage = () => {
  const [first] = allowedDomains();
  return first
    ? `That Google account is not on ${first}. Use your ${first} account.`
    : "That Google account is not on the team's domain. Use your work account.";
};

const messages: Record<string, string> = {
  cancelled: "Sign-in was cancelled.",
  state:
    "The sign-in took too long or was opened in another browser. Start again.",
  google: "Google did not confirm the account. Try again.",
  setup: "Sign-in is not set up on this site yet.",
};

/** A sign-in begun on a host other than AUTH_URL's: Google returns only there, so this names the address to use. */
const hostMessage = (origin: string) =>
  `Sign-in works only at ${origin}. Open the creator there and sign in again.`;

/** What is behind the door: the creator's tools, each with art made in it. */
const inside: {
  name: string;
  icon: IconName;
  art: string[];
  tall?: boolean;
}[] = [
  {
    name: "Mini-series",
    icon: "series",
    art: ["/labs/mini-series/covers/moonflower.webp"],
    tall: true,
  },
  {
    name: "Anime",
    icon: "anime",
    art: ["/labs/anime/places/market-overlook.webp"],
  },
  {
    name: "Cooking videos",
    icon: "cooking",
    art: ["/labs/cooking/dishes/gamjajeon.webp"],
  },
  {
    name: "Storyboard",
    icon: "storyboard",
    art: ["ep-01", "ep-02", "ep-03", "ep-04"].map(
      (e) => `/labs/mini-series/second-chance/episodes/${e}.webp`,
    ),
  },
  {
    name: "Manga",
    icon: "manga",
    art: ["/labs/manga/golden-ticket/page-1-v2.webp"],
  },
];

type Params = {
  next?: string | string[];
  error?: string | string[];
};

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  // A repeated parameter arrives as an array; only a single plain value counts.
  const next = typeof params.next === "string" ? params.next : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;
  const ready = authConfigured();
  const local = openInDevelopment();
  // Only known codes map to a message; anything else in the address is ignored.
  const home = authUrl();
  const known =
    error === "host" && home
      ? hostMessage(home.origin)
      : error === "domain"
        ? domainMessage()
        : error && Object.hasOwn(messages, error)
          ? messages[error]
          : undefined;
  // A mistyped AUTH_URL is ignored; on a developer machine the page says so, so the mistake is seen before staging.
  const urlProblem =
    process.env.NODE_ENV !== "production" ? authUrlProblem() : undefined;
  const problem = local
    ? urlProblem
    : (known ?? (!ready ? messages.setup : undefined));
  const notSetUp = !local && !ready;

  const safe = safeNext(next);
  // A first sign-in with a team account is what makes the account.
  const google = `/api/auth/google?next=${encodeURIComponent(safe)}`;

  return (
    <div className={styles.page} data-backdrop="high">
      <Nav />
      <main id="main" tabIndex={-1} className={styles.main}>
        <section className={styles.door} aria-labelledby="door-title">
          <AnimatedMark variant="cycle" material={LIGHT_MATERIALS} size={44} />
          <h1 id="door-title" className={styles.title}>
            Sign in to Nine Lives
          </h1>
          {problem && (
            <p
              className={styles.problem}
              role="alert"
              data-kind={notSetUp ? "setup" : undefined}
            >
              <Icon name={notSetUp ? "settings" : "lock"} size={18} />
              <span>{problem}</span>
            </p>
          )}
          <div className={styles.actions}>
            {ready ? (
              <Continue provider="google" href={google}>
                Sign in with Google
              </Continue>
            ) : (
              local && <Continue href={safe}>Open the creator</Continue>
            )}
          </div>
        </section>

        <section className={styles.inside} aria-label="Inside the creator">
          <ul className={styles.tools}>
            {inside.map((t) => (
              <li
                key={t.name}
                className={styles.tool}
                data-tall={t.tall || undefined}
              >
                <span className={styles.art} data-count={t.art.length}>
                  {t.art.map((src) => (
                    <Image
                      key={src}
                      src={src}
                      alt=""
                      fill={t.art.length === 1}
                      width={t.art.length > 1 ? 320 : undefined}
                      height={t.art.length > 1 ? 180 : undefined}
                      sizes="(max-width: 767px) 60vw, 30vw"
                    />
                  ))}
                </span>
                <span className={styles.toolName}>
                  <Icon name={t.icon} size={18} />
                  {t.name}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
