# Arena Escrow Program

On-chain pot of record for Earnings Arena duels.

## Program

- Path: [`programs/arena_escrow`](../programs/arena_escrow)
- Seeds: `["duel", duel_id]` → `DuelVault` PDA
- Default program id (replace after deploy): `ArenAEScrow1111111111111111111111111111111`

## Instructions

| Instruction | Who | Effect |
|-------------|-----|--------|
| `create_duel` | payer + keeper | Init vault, side A mint/treasury, status Open |
| `join_duel` | authority | Set side B, status Challenged |
| `lock_duel` | side A treasury | Status AwaitingPrint |
| `credit_fees` | keeper + payer | Transfer SOL into vault, bump `pot_lamports` |
| `mark_settling` | keeper | Status Settling |
| `settle_payout` | keeper | Pay full pot to winner treasury |
| `void_refund` | keeper | Split pot 50/50 |

## Deploy (devnet)

```bash
# Requires Solana CLI + Anchor 0.30.x
solana config set --url devnet
anchor build
anchor deploy --provider.cluster devnet
# Copy program id into NEXT_PUBLIC_ARENA_PROGRAM_ID and programs section of Anchor.toml
```

Helper script (updates env hint):

```bash
npm run escrow:deploy-devnet
```

## App wiring

- Env: `NEXT_PUBLIC_ARENA_PROGRAM_ID`, `KEEPER_SECRET_KEY` (base58), `NEXT_PUBLIC_SOLANA_RPC`
- When `KEEPER_SECRET_KEY` is missing, the app stays in **ledger mode** (DB `potLamports` only) and UI shows “Ledger pot — escrow coming”.
- When configured, create/lock/settle/credit call the program; DB stores `vaultPubkey` + tx signatures.

## Fee indexer

```bash
npm run fees:index
# or secured cron: GET /api/cron/fees (see docs/VERCEL.md)
```

Polls active duels and credits Pump fee events (RPC / API / stub) via keeper `credit_fees` when configured (see [FEES.md](./FEES.md)).
