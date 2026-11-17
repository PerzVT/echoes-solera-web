# Nine Lives Labs site

The staging website for Nine Lives Labs: the shows, cards, stories and services the studio makes, and the creator tool they are made with. The original *Echoes of Solera* login portal still lives at `/login` (live at 9livesinnovation.com/login).

## Stack

- Next.js 16 (App Router, React 19), CSS modules, no UI library.
- Images go through the Next image optimiser. Video is H.264, loaded on play.
- Sign-in is Google's authorization-code flow with a signed session cookie. No auth library.

## Where things are

| Path | What it holds |
| --- | --- |
| `app/(labs)/` | Every page of the Nine Lives site. `labs.css` has the design tokens. |
| `app/(labs)/app/` | The creator: series, cast, script, screenplay, references, results, styles. |
| `app/api/auth/` | Sign-in, callback, session and sign-out routes. |
| `components/labs/` | Shared components. `app/` holds the creator's, `styles/` and `pipeline/` their own. |
| `lib/labs/` | The site's data: projects, series, the story catalogue, recipes, cards, shop, pipeline. |
| `public/labs/` | Site media, grouped by project. |
| `proxy.ts` | Sends anyone without a session from `/app` to `/sign-in`. |
| `app/login`, `components/dive`, `app/studio/*-<hash>` | The older portal and internal preview pages. Unchanged. |

## Routes

| Path | Page |
| --- | --- |
| `/` | Home. `?p=<project>` picks the project shown. |
| `/anime/echoes-of-solera`, `/watch` | Show page and its shorts. |
| `/mini-series`, `/mini-series/<slug>` | The catalogue and the vertical player. |
| `/cooking/shoujo-supper`, `/watch` | Show page and its episodes. |
| `/worlds/tidebell-cove` | The virtual world. |
| `/cards`, `/cards/packs` | The binder and the pack opening. |
| `/manga/golden-ticket` | The reader. |
| `/visual-novel/after-hours` | The visual novel player. |
| `/game-ads` | The service page for studios. |
| `/shop`, `/shop/<slug>` | Concept objects. |
| `/studio`, `/lab`, `/pipeline`, `/pipeline/<function>` | What the studio makes and how. |
| `/app/**` | The creator. Needs sign-in. |
| `/sign-in` | Google sign-in for team accounts. |
| `/login` | The *Echoes of Solera* portal. |

## Development

```bash
npm install
npm run dev
```

With no sign-in settings, the creator opens freely in development and stays closed in a production build.

## Sign-in settings

| Variable | Value |
| --- | --- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | A Google OAuth web client whose redirect URI is `https://<host>/api/auth/callback`. |
| `AUTH_SECRET` | A long random string. It signs the session cookie. |
| `AUTH_ALLOWED_DOMAINS` | Optional. Comma-separated email domains. Defaults to `highstreet.market`. |

## What is a mock

The creator runs on fixed data for one episode and generates nothing. The two request forms send nothing. The shop has no prices. Each of these says so on the page.

## Deployment

Vercel deploys the `staging` branch. `master` deployments are switched off in `vercel.json`. Domain DNS (Squarespace) points the A record to `76.76.21.21` and the www CNAME to `cname.vercel-dns.com`.

## License

Proprietary. 9lives Innovation / Highstreet Studio.
