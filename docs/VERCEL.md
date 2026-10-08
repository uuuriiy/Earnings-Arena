# Vercel staging deploy

Target: **staging** on Vercel with ledger pot, Privy auth, Pump mint verify, and working settle/fee crons. Escrow/mainnet money launch is separate ([LAUNCH.md](./LAUNCH.md)).

## Project settings

| Setting | Value |
|---------|--------|
| Framework | Next.js |
| Install Command | `npm ci --legacy-peer-deps` (also set in `vercel.json` + `.npmrc`) |
| Build Command | `npx prisma migrate deploy && next build` (also set in `vercel.json`) |
| Output | default Next.js |

Do **not** put `prisma migrate deploy` into local `package.json` `build` — CI uses a dummy `DATABASE_URL`.

DB-backed pages (`/`, `/feed`, `/duel/[id]`, `/coin/[mint]`) use `force-dynamic` so `next build` does not require a reachable Postgres at build time. Runtime still needs `DATABASE_URL`.

[`vercel.json`](../vercel.json) uses **daily** cron schedules so Hobby plans can deploy. For every-few-minutes settle/fees (needed for live earnings nights), upgrade to Pro and change schedules back to `*/5` / `*/10`, or hit the cron URLs manually / from an external scheduler.

## Environment variables

### Required

| Var | Notes |
|-----|--------|
| `DATABASE_URL` | Postgres pooler URL (`?pgbouncer=true` if Supabase `:6543`) |
| `DIRECT_URL` | Session/direct URL for migrations |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy app |
| `PRIVY_APP_SECRET` | Privy server secret |
| `PRIVY_JWT_VERIFICATION_KEY` | If required by your Privy setup |
| `CRON_SECRET` | Required on Vercel; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` |
| `FINNHUB_API_KEY` | Quotes + earnings |
| `SOLANA_RPC` | **Secret** — Alchemy/mainnet RPC for server (mint verify + fee indexer) |
| `NEXT_PUBLIC_SOLANA_RPC` | **Config** — public mainnet RPC for Privy/browser (no Alchemy key) |

### Staging-safe

| Var | Staging value |
|-----|----------------|
| `NEXT_PUBLIC_ARENA_PROGRAM_ID` | empty → ledger pot |
| `KEEPER_SECRET_KEY` | empty |
| `FEE_INDEXER_STUB` | `true` for demo pot growth; **off in prod** (use RPC / `PUMP_API`) |
| `PUMP_API` | optional HTTP fee feed; if empty, indexer uses Solana RPC |
| `ALLOW_UNVERIFIED_MINTS` | ignored when `VERCEL=1` |
| `ALLOW_SETTLE_OVERRIDES` | ignored when `VERCEL=1` |
| `NEXT_PUBLIC_SENTRY_DSN` | optional |
| `NEXT_PUBLIC_APP_NAME` | optional |

## Privy

In the Privy dashboard, allowlist:

- `https://<project>.vercel.app`
- Preview URLs if you use them
- Custom staging domain when ready

Solana login must be enabled (same as local).

## Crons

Configured in [`vercel.json`](../vercel.json):

| Path | Schedule (Hobby) | Role |
|------|------------------|------|
| `/api/cron/settle` | `0 12 * * *` (12:00 UTC daily) | Print → settle → resolve |
| `/api/cron/fees` | `0 13 * * *` (13:00 UTC daily) | Credit fees into active pots |

Both require `Authorization: Bearer $CRON_SECRET`. Manual check anytime (recommended on Hobby):

```bash
curl -sS -H "Authorization: Bearer $CRON_SECRET" "https://<host>/api/cron/settle"
curl -sS -H "Authorization: Bearer $CRON_SECRET" "https://<host>/api/cron/fees"
```

Local CLI still works: `npm run fees:index`.

For live pots on Hobby, add GitHub repo secrets `ARENA_URL` + `CRON_SECRET` so [arena-crons.yml](../.github/workflows/arena-crons.yml) hits fees/settle every 15 minutes. Full fee path: [FEES.md](./FEES.md).

## Smoke checklist

1. Deploy succeeds; migrations apply
2. Connect wallet (Privy)
3. Paste a Pump mint **you created** → verify OK
4. Pin sub-$5 ticker with earnings in 14 days → open duel
5. Second wallet challenges with its own pinned coin → side A locks
6. With `FEE_INDEXER_STUB=true`, wait for fees cron (or hit `/api/cron/fees`) → pot > 0
7. After earnings / settle window, settle cron moves bout toward KO feed

## After staging is green

See [LAUNCH.md](./LAUNCH.md) for escrow deploy, keeper key, real `PUMP_API`, production Privy, and legal.
