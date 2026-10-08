# Earnings Arena

Memecoins duel on penny-stock earnings. Bigger absolute move takes the pot.

## Docs

- [Product](docs/PRODUCT.md)
- [Launch readiness](docs/LAUNCH.md)
- [Vercel staging deploy](docs/VERCEL.md)
- [Fee indexing](docs/FEES.md)
- [Escrow program](docs/ESCROW.md)

## Stack

Next.js · Prisma/Postgres · Privy · Solana escrow (`programs/arena_escrow`) · Finnhub · Vitest

## Setup

```bash
cp .env.example .env
# Privy + DATABASE_URL + CRON_SECRET required for full auth/API

npm install --legacy-peer-deps
npx prisma migrate deploy
npm run db:seed
npm run dev
```

## Escrow / fees

```bash
npm run escrow:deploy-devnet   # prints Anchor deploy steps
npm run fees:index             # credit fees for active duels
```

## Scripts

```bash
npm test
npm run build
npm run simulate:settle
```
