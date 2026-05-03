# hedwig

Zero-knowledge secret sharing: encrypt in the browser, store only ciphertext (Supabase), optional burn-after-read and TTL.

## Quick start

Copy [`.env.example`](.env.example) to `.env`, set Supabase URL + **service role** key, run migrations under `supabase/migrations/`. Optional: Upstash for rate limits.

```bash
npm install
npm run dev:5050   # use if port 5000 is taken (e.g. macOS AirPlay)
# or: npm run dev
```

Production: set `NEXT_PUBLIC_SITE_URL` for canonical/OG metadata (see `.env.example`).

## About this repository

Maintained by **[Your Name](https://github.com/YOUR_USERNAME)** — replace with your name and profile link.  
PRs and issues welcome; describe security-sensitive findings responsibly (private disclosure if appropriate).

## Scripts

- `npm run build` / `npm start` — production
- `npm run lint` — ESLint
- `npm run verify:burn` — burn-after-read concurrency smoke test (see script header)
