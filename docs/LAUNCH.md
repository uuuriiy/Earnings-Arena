# Launch readiness

Target: **money launch** (escrow pot of record). UI fight-night + program scaffolding ship in-repo; mainnet still needs deploy keys and counsel.

## What works in-repo now

| Area | Status |
|------|--------|
| Fight-night home / bout board / launch wizard / KO feed | Yes |
| Privy auth + Bearer API authz | Yes (needs prod App ID) |
| Pump mint + creator verify (on-chain) | Yes (`/api/coins/verify`) |
| Settlement engine + cron guards + Zod | Yes |
| Postgres vault fields migration | Yes |
| Anchor `arena_escrow` program source | Yes (needs `anchor deploy`) |
| TS escrow client (sim until deploy) | Yes |
| Fee indexer script | Yes (`npm run fees:index`) |
| Legal/risk pages | Yes (templates) |
| CI workflow | Yes |
| Sentry hook | Stub (set DSN) |

## Remaining for money launch

| Gap | Action |
|-----|--------|
| Deploy escrow to devnet/mainnet | `anchor build && anchor deploy`; set `NEXT_PUBLIC_ARENA_PROGRAM_ID` |
| Keeper key | Funded keypair → `KEEPER_SECRET_KEY` |
| Full Anchor CPI client | Replace discriminator stubs with IDL-generated client after first deploy |
| Real Pump fee API | Set `PUMP_API` or run stub only in staging |
| Production Privy | Dashboard domains + secrets |
| Hosted Postgres + Finnhub | Env on Vercel |
| Cron + fee worker | Vercel cron settle; host `fees:index` on a schedule |
| Counsel on ToS/risk | Replace templates |
| Install `@sentry/nextjs` | Optional upgrade from stub |

## Env knobs (mint)

| Var | Role |
|-----|------|
| `NEXT_PUBLIC_SOLANA_RPC` | RPC used to fetch Pump bonding curve |
| `ALLOW_UNVERIFIED_MINTS` | Local/seed only: demo mints (`MintA…`) may skip RPC; real addresses always get Pump + creator checks. Ignored when `NODE_ENV=production` or `VERCEL=1` |

## Smoke (devnet)

1. Privy login → paste a mint you created on Pump → verify succeeds → pin → duel has `vaultPubkey`
2. Paste someone else’s mint → 400 `not_creator`
3. Challenge + lock → `awaiting_print`
4. `FEE_INDEXER_STUB=true npm run fees:index` → pot grows
5. Settle cron with Finnhub/overrides (staging only) → KO feed + `settleTxSig`

## Definition of money launch

- Program on mainnet; vault payouts visible on explorer
- Fee ingest live or ops runbook for replay
- Legal live; Sentry + CI green; cron/worker healthy
