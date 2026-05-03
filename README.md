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

## Vercel

In the Vercel project, add the same variables as `.env.example` (**Production** and **Preview** as needed). If the site returns **401** and you are not prompted for your app—only Vercel login—open **Project → Settings → Deployment Protection** and turn protection **off** for Production (or use “Only Preview”), so visitors can load hedwig without a Vercel account. The global hostname `hedwig.vercel.app` may belong to another project; use the domain shown under your deployment’s **Domains**.

## About this repository

Maintained by **[Your Name](https://github.com/iamujjwalsinha** — replace with your name and profile link.  
PRs and issues welcome; describe security-sensitive findings responsibly (private disclosure if appropriate).

## Scripts

- `npm run build` / `npm start` — production
- `npm run lint` — ESLint
- `npm run verify:burn` — burn-after-read concurrency smoke test (see script header)
