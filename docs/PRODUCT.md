# Earnings Arena — Product

## One-liner

Memecoins on Pump.fun, pinned to sub-$5 stocks with upcoming earnings. Rivals duel; the stock with the bigger absolute move after the report wins the pot.

## Why it exists

Earnings nights move penny names hard. Memecoins already trade narrative and attention. Earnings Arena turns that into a structured fight: pin a coin to a ticker, get matched to a rival, accumulate fees into a duel pot, settle on market reaction — not vibes.

## Core loop

1. **Pin** — Creator pastes a Pump mint. Server verifies on-chain bonding-curve creator matches their Privy Solana wallet, then pins a stock under $5 with earnings in the next 14 days. Treasury wallet = that address.
2. **Open duel** — Side A opens a lobby; an escrow vault PDA is derived/created for the duel.
3. **Challenge / lock** — Side B challenges; Side A locks. Duel becomes `awaiting_print`.
4. **Accumulate** — Fee indexer credits Pump (or stub) fees into the **vault** (pot of record when escrow is live; otherwise DB ledger).
5. **Settle** — Report → open snapshot; T+4h → close. Winner = larger absolute % move. Tie within 0.1% → split. Missing quotes → void + refund.
6. **Payout** — Vault pays winner treasury on-chain (or ledger update in pre-escrow mode). KO feed shows the bout.

## Identity

**Privy**: Solana wallet or email (embedded Solana wallet). API ownership = Solana address after access-token verify.

## Pot of record

- **Escrow mode** (`NEXT_PUBLIC_ARENA_PROGRAM_ID` + `KEEPER_SECRET_KEY`): on-chain `DuelVault` (see [ESCROW.md](./ESCROW.md)).
- **Ledger mode** (default until deploy): DB `potLamports` with UI badge “Ledger pot — escrow coming”.

## Mint gate

- Pump.fun bonding-curve PDA must exist for the mint (`6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`).
- On-chain `creator` must equal the session wallet (not mere token balance).
- Local/seed only: `ALLOW_UNVERIFIED_MINTS=true` lets demo mints (`MintA…`) skip RPC; real Pump addresses still require creator match (disabled on production / Vercel).

## Money-launch non-negotiables

- Escrow program deployed + wired
- Pump mint + creator verification (live)
- Pump fee ingest (or documented replay)
- Legal/risk pages, monitoring, CI
- Real Finnhub + hosted Postgres + cron/worker
