-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Coin" (
    "id" TEXT NOT NULL,
    "mint" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "treasuryWallet" TEXT NOT NULL,
    "treasuryBalance" BIGINT NOT NULL DEFAULT 0,
    "stockTicker" TEXT NOT NULL,
    "stockPinnedPrice" DOUBLE PRECISION NOT NULL,
    "earningsAt" TIMESTAMP(3) NOT NULL,
    "sector" TEXT,
    "creatorWallet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Duel" (
    "id" TEXT NOT NULL,
    "sideACoinId" TEXT NOT NULL,
    "sideBCoinId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "potLamports" BIGINT NOT NULL DEFAULT 0,
    "reportAt" TIMESTAMP(3),
    "settleAt" TIMESTAMP(3),
    "priceA0" DOUBLE PRECISION,
    "priceB0" DOUBLE PRECISION,
    "priceA1" DOUBLE PRECISION,
    "priceB1" DOUBLE PRECISION,
    "moveAPct" DOUBLE PRECISION,
    "moveBPct" DOUBLE PRECISION,
    "winnerCoinId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Duel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeEvent" (
    "id" TEXT NOT NULL,
    "duelId" TEXT NOT NULL,
    "coinId" TEXT NOT NULL,
    "lamports" BIGINT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'stub',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementLog" (
    "id" TEXT NOT NULL,
    "duelId" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coin_mint_key" ON "Coin"("mint");

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_sideACoinId_fkey" FOREIGN KEY ("sideACoinId") REFERENCES "Coin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_sideBCoinId_fkey" FOREIGN KEY ("sideBCoinId") REFERENCES "Coin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_winnerCoinId_fkey" FOREIGN KEY ("winnerCoinId") REFERENCES "Coin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeEvent" ADD CONSTRAINT "FeeEvent_duelId_fkey" FOREIGN KEY ("duelId") REFERENCES "Duel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeEvent" ADD CONSTRAINT "FeeEvent_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLog" ADD CONSTRAINT "SettlementLog_duelId_fkey" FOREIGN KEY ("duelId") REFERENCES "Duel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

