import type { Metadata } from "next";
import { Nav } from "@/components/labs/Nav";
import { authConfigured, authUrl, authUrlProblem, openInDevelopment, safeNext } from "@/lib/labs/auth";
import { AnimatedMark, LIGHT_MATERIALS } from "@/components/labs/fx";
import { Continue } from "./Continue";
import styles from "./sign-in.module.css";

export const metadata: Metadata = { title: "Sign in" };

const messages: Record<string, string> = {
  domain: "That Google account is not on the team's domain. Use your work account.",
  cancelled: "Sign-in was cancelled.",
  state: "The sign-in took too long or was opened in another browser. Start again.",
  google: "Google did not confirm the account. Try again.",
  setup: "Sign-in is not set up on this site yet.",
};

/** A sign-in begun on a host other than AUTH_URL's: Google returns only there, so this names the address to use. */
const hostMessage = (origin: string) => `Sign-in works only at ${origin}. Open the creator there and sign in again.`;

export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string | string[]; error?: string | string[] }> }) {
  const params = await searchParams;
  // A repeated parameter arrives as an array; only a single plain value counts.
  const next = typeof params.next === "string" ? params.next : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;
  const ready = authConfigured();
  const local = openInDevelopment();
  // Only known codes map to a message; anything else in the address is ignored.
  const home = authUrl();
  const known = error === "host" && home ? hostMessage(home.origin) : error && Object.hasOwn(messages, error) ? messages[error] : undefined;
  // A mistyped AUTH_URL is ignored; on a developer machine the page says so, so the mistake is seen before staging.
  const urlProblem = process.env.NODE_ENV !== "production" ? authUrlProblem() : undefined;
  const problem = local ? urlProblem : (known ?? (!ready ? messages.setup : undefined));

  return (
    <div className={styles.page} data-backdrop="high">
      <Nav />
      <main id="main" tabIndex={-1} className={styles.main}>
        <div className={styles.panel}>
          <AnimatedMark variant="cycle" material={LIGHT_MATERIALS} size={48} />
          <h1 className="h1">Sign in to Nine Lives</h1>
          {problem && (
            <p className={styles.problem} role="alert">
              {problem}
            </p>
          )}
          {local && <Continue href={safeNext(next)}>Open the creator</Continue>}
          {ready && <Continue href={`/api/auth/google?next=${encodeURIComponent(safeNext(next))}`}>Continue with Google</Continue>}
        </div>
      </main>
    </div>
  );
}
