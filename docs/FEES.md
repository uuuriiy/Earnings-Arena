# Fee indexing (production)

Arena pots grow when the fee indexer credits Pump creator fees for both duel mints while status is `awaiting_print` or `settling`.

## Resolution order

For each mint, [`indexActiveDuelFees`](../src/shared/lib/fees/indexer.ts):

1. **`PUMP_API`** (optional) — `GET $PUMP_API/fees?mint=…` → `{ fees: [{ signature, lamports }] }`
2. **On-chain RPC** (default) — scan recent bonding-curve txs; if the Pump `creator-vault` PDA lamports increase in that tx, credit the delta (`source: pump_rpc`)
3. **`FEE_INDEXER_STUB=true`** — demo only: ~0.01 SOL per side per run (`source: stub`)

Trading on Pump alone does nothing until this indexer runs.

## Env

| Var | Prod | Staging demo |
|-----|------|----------------|
| `SOLANA_RPC` | Paid/private mainnet RPC (Alchemy) | same |
| `NEXT_PUBLIC_SOLANA_RPC` | Public mainnet for browser/Privy | public OK |
| `PUMP_API` | optional override | empty |
| `FEE_INDEXER_STUB` | **false / unset** | `true` OK for demos |
| `CRON_SECRET` | required | required |

## Scheduling

| Path | Trigger |
|------|---------|
| `GET /api/cron/fees` | Vercel daily (Hobby) **or** GitHub Action every 15m |
| `GET /api/cron/settle` | same |
| `npm run fees:index` | local / ops |

GitHub Action: [`.github/workflows/arena-crons.yml`](../.github/workflows/arena-crons.yml).  
Repo secrets: `ARENA_URL` (`https://….vercel.app`), `CRON_SECRET` (same as Vercel).

## On-chain attribution

Creator vault seeds: `["creator-vault", creator]` under Pump program `6EF8…`.  
We attribute via **bonding-curve signature history** so multi-coin creators do not mix mints.

Duplicates are skipped via unique `FeeEvent.txSignature`.

## Escrow

Ledger mode increments DB `potLamports`. When keeper + program id are set, `recordFeeEvent` also attempts on-chain `credit_fees` (see [ESCROW.md](./ESCROW.md)).
