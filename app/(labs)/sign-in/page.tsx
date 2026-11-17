import type { Metadata } from "next";
import { Nav } from "@/components/labs/Nav";
import { allowedDomains, authConfigured, authUrl, authUrlProblem, openInDevelopment, safeNext } from "@/lib/labs/auth";
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

export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const ready = authConfigured();
  const domains = allowedDomains().map((d) => `@${d}`);
  const local = openInDevelopment();
  // Only known codes map to a message; anything else in the address is ignored.
  const home = authUrl();
  const known = error === "host" && home ? hostMessage(home.origin) : error && Object.hasOwn(messages, error) ? messages[error] : undefined;
  // A mistyped AUTH_URL is ignored; in development the page says so.
  const urlProblem = process.env.NODE_ENV === "development" ? authUrlProblem() : undefined;
  const problem = local ? undefined : (known ?? (!ready ? messages.setup : undefined));

  return (
    // The creator's front door carries more of the pigment field than a reading page does (see SiteBackdrop).
    <div className={styles.page} data-backdrop="high">
      <Nav />
      <main id="main" tabIndex={-1} className={styles.main}>
        {/* The panel settles in, the mark is drawn, and the lines follow one after another. A problem is in the
            page from its first frame, so it comes in with them and the panel never changes size. */}
        <div className={styles.panel}>
          <AnimatedMark variant="cycle" material={LIGHT_MATERIALS} size={48} />
          <h1 className="h1">Sign in to the creator</h1>
          <p className={styles.note}>For team accounts ending in {domains.join(" or ")}.</p>
          {problem && (
            <p className={styles.problem} role="alert">
              {problem}
            </p>
          )}
          {urlProblem && <p className={styles.note}>{urlProblem}</p>}
          {local && (
            <>
              <p className={styles.note}>Sign-in is not set up on this machine, so the creator opens without it here.</p>
              <Continue href={safeNext(next)}>Open the creator</Continue>
            </>
          )}
          {ready && <Continue href={`/api/auth/google?next=${encodeURIComponent(safeNext(next))}`}>Continue with Google</Continue>}
        </div>
      </main>
    </div>
  );
}
