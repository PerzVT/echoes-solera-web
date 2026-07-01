# Echoes of Solera — Authentication Portal

Diegetic ARG entry point for *Echoes of Solera*. A cinematic boot sequence simulates a failed login to the S.I.M.U LINK device, landing on an AUTHENTICATION ERROR screen with CRT glitch effects and tarot-inspired iconography.

Live at **9livesinnovation.com/login**

## Stack

- Next.js 16 (App Router, React 19)
- SVG line-art portal frame with rAF-driven stroke-draw + dissolve entrance
- CRT glitch overlay (SubtleCrtGlitch — scanlines, chromatic aberration, cursor-reactive)
- Canvas starfield particles

## Routes

| Path | Description |
|------|-------------|
| `/` | Redirects to `/login` |
| `/login` | The full dive sequence |

## Development

```bash
npm install
npm run dev
```

## Deployment

Deployed via Vercel. Domain DNS (Squarespace) points A record to `76.76.21.21`, www CNAME to `cname.vercel-dns.com`.

## License

Proprietary — 9lives Innovation / Highstreet Studio
