This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Live prices (scraper)

Store prices are refreshed by a scraper and read by the site from `data/prices.json`.

```bash
npm run prices:refresh [-- --store amazon]   # fetch prices, write data/prices.json + data/price-health.json
npm run prices:check   [-- --store amazon]   # same, but writes nothing (dry run) — shows store health
npm run prices:inspect -- <linkId | url>     # show what each strategy finds on one page
npm run prices:test                          # offline tests, incl. every store's saved sample pages
```

- **Where it looks:** each affiliate link's `affiliate_url` (or `url` in `data/price-sources.json`). Links whose
  URL still contains `mock` are skipped — put real product URLs on your links to switch scraping on.
- **How it reads a price:** per-store rules live in `config/price-scrapers/<store>.json` and are tried in order:
  official API (if configured) → schema.org JSON-LD → meta tags → CSS selectors → embedded-state regex.
  JSON-LD/meta survive most redesigns. Stores without a file use `generic.json`.
- **Safety:** a price outside 0.5×–1.6× of the last known one is rejected (wrong element, e.g. an EMI figure);
  a failed link keeps its previous price; out-of-stock pages with no price are recorded as out of stock.
- **Schedule:** `.github/workflows/refresh-prices.yml` runs **every day at 04:00 IST** (cron `30 22 * * *`, UTC)
  and can be started by hand (Actions → Refresh prices → Run workflow, optionally for one store). Changed prices are
  committed automatically. Scheduled workflows only run from the default branch, so the workflow must be on `main`.
- **When a store changes its layout — automatic repair:** the run finds the store "broken", then
  `scripts/prices/ci-repair.sh` starts a headless Claude Code agent that follows the `update-scraper` skill. Its
  change is only published if **all** gates pass: `prices:guard` (it may only edit that store's config + add a
  trimmed sample page; hosts, `api`, headers, price bounds and existing samples must be unchanged), `prices:test`,
  and a live refresh that reads real prices again. Then it commits and pushes (or opens a PR if the branch is
  protected). If anything fails, the change is discarded and a **GitHub issue** is opened; the run fails so you get
  the usual email. To repair by hand instead: **`/update-scraper <store>`** in Claude Code.
- **One-time setup for auto-repair:** add the repository secret `ANTHROPIC_API_KEY` (Settings → Secrets and variables →
  Actions). Optional: variable `CLAUDE_MODEL`; secret `STORE_API_TOKEN` for a store API. Allow Actions to create pull
  requests (Settings → Actions → General) if you want the protected-branch fallback. Without the key, a broken store
  still raises an issue — it just isn't repaired automatically.
- **Blocked ≠ broken:** HTTP 403/429, CAPTCHAs and network errors are reported as `blocked`; selectors can't fix
  those. Prefer the store's official affiliate API for stores that block scraping (`api` block in the config,
  credentials as environment variables / GitHub secrets).
- **Note:** the Amazon and Flipkart rules were written without access to the live sites and are unverified —
  run `npm run prices:check` once from a machine that can reach them and fix with `/update-scraper` if needed.
