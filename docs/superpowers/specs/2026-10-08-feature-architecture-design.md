# Feature-based architecture refactor

Date: 2026-10-08

## Goals

1. Move client state/effects/mutations out of `"use client"` components into hooks (stateful components only).
2. Move providers out of `src/components/` into `src/context/`; keep `useArenaAuth` under `features/auth/hooks`.
3. Replace remaining native `<button>` / `<input>` / `<label>` with `@/shared/ui/*`.
4. Reorganize into full vertical feature slices.

## Target layout

```
src/
  app/                 # routes + API handlers only
  context/             # QueryProvider, PrivyProvider, ArenaAuthProvider
  features/
    auth/
    duel/
    launch/
    feed/
    home/
    market/
  shared/
    ui/
    hooks/             # cross-feature hooks (e.g. useCountdown)
    lib/               # db, utils, fonts, serialize, http, types, solana, fees, cache, monitoring, rate-limit, validation/parse
```

Each feature may contain: `components/`, `hooks/`, `api/`, `server/`, `validation/`.

## Feature map

| Feature | Owns |
|---------|------|
| auth | session/authorize/privy, auth validation, useArenaAuth |
| duel | duel UI, ChallengePanel/CopyDuelLink/SettlementKO, duel api client, duel server domain, duel validation |
| launch | launch wizard UI + useLaunchWizard, coins api client, pump verify, coin validation |
| feed | KoFeedCard, feed server service |
| home | FeaturedBout, BoutBoard, DuelCard, SiteHeader, home service |
| market | StockPinChooser, QuoteTicker, stocks/quotes api, eligible/finnhub |
| shared | UI primitives, infra libs |

## Hook extraction

- `useChallengePanel`, `useCopyDuelLink` → duel
- `useStockPinChooser`, `useQuoteTicker` → market
- `useSiteHeader` → home
- `useCountdown` → shared/hooks
- `useLaunchWizard` → launch (existing)
- `useArenaAuth` → auth

## Constraints

- No intentional behavior changes.
- `src/app` stays the Next.js route layer.
- Features import `shared` + `context`; cross-feature imports allowed when needed (launch→market, duel→auth, feed→duel SettlementKO).
- Delete empty `src/components`, `src/hooks`, `src/lib` after migration.

## Migration order

1. shared + context
2. auth
3. market → duel → launch → feed → home
4. Extract hooks + UI primitive swaps during feature moves
5. Update imports; verify typecheck/tests
