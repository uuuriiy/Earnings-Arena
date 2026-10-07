import { PrismaClient } from "@prisma/client";
import { settleAtFromReport } from "../src/features/duel/server/engine";

const prisma = new PrismaClient();

async function main() {
  await prisma.settlementLog.deleteMany();
  await prisma.feeEvent.deleteMany();
  await prisma.duel.deleteMany();
  await prisma.coin.deleteMany();

  const earningsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const coinA = await prisma.coin.create({
    data: {
      mint: "MintA1111111111111111111111111111111111111",
      symbol: "SNDLDEGEN",
      name: "SNDL Degen",
      treasuryWallet: "TreasuryA111111111111111111111111111111",
      stockTicker: "SNDL",
      stockPinnedPrice: 2.15,
      earningsAt,
      sector: "Cannabis",
      creatorWallet: "CreatorA111111111111111111111111111111",
    },
  });

  const coinB = await prisma.coin.create({
    data: {
      mint: "MintB2222222222222222222222222222222222222",
      symbol: "CGCCHAOS",
      name: "CGC Chaos",
      treasuryWallet: "TreasuryB222222222222222222222222222222",
      stockTicker: "CGC",
      stockPinnedPrice: 3.4,
      earningsAt: new Date(earningsAt.getTime() + 6 * 60 * 60 * 1000),
      sector: "Cannabis",
      creatorWallet: "CreatorB222222222222222222222222222222",
    },
  });

  const duel = await prisma.duel.create({
    data: {
      sideACoinId: coinA.id,
      sideBCoinId: coinB.id,
      status: "awaiting_print",
      potLamports: 0n,
    },
  });

  await prisma.feeEvent.createMany({
    data: [
      { duelId: duel.id, coinId: coinA.id, lamports: 500_000_000n, source: "seed" },
      { duelId: duel.id, coinId: coinB.id, lamports: 300_000_000n, source: "seed" },
    ],
  });

  await prisma.duel.update({
    where: { id: duel.id },
    data: { potLamports: 800_000_000n },
  });

  console.log("Seeded coins:", coinA.symbol, coinB.symbol);
  console.log("Seeded duel:", duel.id);
  console.log("Example settleAt from now:", settleAtFromReport(new Date()).toISOString());
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
