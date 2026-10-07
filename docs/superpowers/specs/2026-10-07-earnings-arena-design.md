# Earnings Arena — Design Spec

**Date:** 2026-10-07  
**Status:** Approved (brainstorming)

## Product

Earnings Arena is a Solana web arena where Pump.fun memecoins duel on upcoming earnings. Each coin is pinned to a real sub-$5 stock. Live stock quotes sit beside the coin. Trading fees tracked by the arena pool into a duel pot; after earnings, the bigger stock reaction wins the pot into the winner’s treasury.

Pump.fun remains the launch and trade rail. This product is the matchmaking, quote, countdown, and settlement layer.

## Core loop

1. Creator launches or imports a Pump coin and pins an eligible stock.
2. Platform suggests rivals; creator accepts or challenges another coin.
3. Both sides confirm → duel locks; arena-tracked fees pool into the duel pot.
4. Earnings report drops → T+4h settlement clock starts.
5. Compare absolute stock % moves; bigger move wins.
6. Loser’s share of the pot routes to the winner’s coin treasury.
7. Settle feed shows the KO.

## Locked rules

| Rule | Value |
|------|--------|
| Stock price at pin | Under $5 |
| Earnings window | Within 14 days of pin |
| Pairing | Hybrid: auto-suggest + accept/challenge |
| Win condition | Higher absolute % move (report → T+4h) |
| Tie | Within 0.1% → pot splits 50/50 |
| Fees | 100% of arena-tracked duel fees → pot → winner treasury; no creator skim |
| Delayed earnings | Stay `awaiting_print` until print detected, then start 4h |
| Missing/halted quote | Void duel; refund pot to both treasuries |

## Non-goals (v1)

- Custom bonding curve / launchpad
- EPS beat/miss scoring
- Buying real stock or stock proxies
- LP or circulating-supply drain
- Fully trustless on-chain pot

## Architecture

Three layers:

1. **Pump.fun** — mint, trade, liquidity
2. **Arena app (Next.js)** — UI, registry, matchmaking, duel state, settlement UX
3. **Data services** — Finnhub quotes + earnings calendar; oracle snapshots at report and T+4h

### Duel states

`open` → `locked` → `awaiting_print` → `settling` → `resolved`  
Alternate terminal: `voided`

### Components

- **Coin registry** — Pump mint ↔ ticker, earnings datetime, treasury wallet
- **Matchmaker** — same earnings week + optional sector; accept/challenge
- **Duel engine** — state machine + settle math
- **Fee collector** — `FeeEvent`s accumulate into `potLamports`
- **Oracle / cron** — detect print, snapshot prices, resolve, route pot
- **Feed** — settlement announcements

## Tech stack

- Next.js App Router, TypeScript
- Prisma + SQLite (local MVP)
- Solana wallet-adapter (connect for launch/pin identity)
- Finnhub API (`FINNHUB_API_KEY`)
- Vitest for domain logic

## Data model

- **Coin** — mint, symbol, name, treasuryWallet, stockTicker, stockPinnedPrice, earningsAt, sector?, creatorWallet
- **Duel** — sideA/sideB, status, potLamports, reportAt, settleAt, price snapshots, moves, winnerCoinId
- **FeeEvent** — duelId, coinId, lamports, source
- **SettlementLog** — duelId, payloadJson

## UX surfaces

- **Home** — live arena: active duels, countdowns
- **Duel** — side-by-side coins + live quotes + pot + timer + challenge/accept
- **Coin** — Pump link + stock quote + earnings + duel history
- **Launch / Pin** — wallet connect, mint, eligible ticker, rival suggestions
- **Feed** — recent KOs / treasury drains

Aesthetic: fight-night arena scoreboard, not a finance dashboard. Motions: countdown pulse, quote tick, settlement KO.

## Fees (v1 honesty)

Pot is platform-tracked in the DB. Fee events are recorded via API (admin/stub/volume hook). Settlement credits the winner treasury ledger and writes an auditable `SettlementLog`. On-chain SOL transfer from a platform pot key is optional and not required for MVP UI.

## Success criteria

- Create → lock → settle at T+4h → pot shown routed to winner treasury
- Live stock quote beside each coin on duel and coin pages
- Edge cases (delay, tie, missing quote) follow documented rules
- Vitest covers eligibility, settle math, and state transitions
