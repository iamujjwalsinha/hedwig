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

**Production:** [hedwig-phi.vercel.app](https://hedwig-phi.vercel.app) (from the [hedwig](https://github.com/iamujjwalsinha/hedwig) project on Vercel).

In the Vercel project, add the same variables as `.env.example` (**Production** and **Preview** as needed). Set **`NEXT_PUBLIC_SITE_URL`** to your public origin (e.g. `https://hedwig-phi.vercel.app`) so Open Graph / canonical URLs resolve correctly.

If the site returns **401** and you only see a Vercel sign-in—open **Project → Settings → Deployment Protection** and turn protection **off** for Production (or protect **Preview** only). The hostname `hedwig.vercel.app` can point at a different project; always use the domain under your deployment’s **Domains**.

## About this repository

Maintained by **[iamujjwalsinha](https://github.com/iamujjwalsinha)**.  
PRs and issues welcome; describe security-sensitive findings responsibly (private disclosure if appropriate).

## Scripts

- `npm run build` / `npm start` — production
- `npm run lint` — ESLint
- `npm run verify:burn` — burn-after-read concurrency smoke test (see script header)
