/**
 * Manual verification path:
 * seed → mark printed → resolve with price overrides → print winner treasury
 */
import { PrismaClient } from "@prisma/client";
import { markEarningsPrinted, resolveDuel } from "../src/shared/lib/fees/pot";

const prisma = new PrismaClient();

async function main() {
  const duel = await prisma.duel.findFirst({
    where: { status: { in: ["awaiting_print", "settling", "locked"] } },
    include: { sideA: true, sideB: true },
    orderBy: { createdAt: "desc" },
  });
  if (!duel || !duel.sideB) {
    throw new Error("No duel to settle — run npm run db:seed first");
  }

  if (duel.status === "awaiting_print" || duel.status === "locked") {
    if (duel.status === "locked") {
      await prisma.duel.update({
        where: { id: duel.id },
        data: { status: "awaiting_print" },
      });
    }
    await markEarningsPrinted(duel.id, new Date());
  }

  const result = await resolveDuel({
    duelId: duel.id,
    priceA0: 2.0,
    priceB0: 3.0,
    priceA1: 2.5, // +25%
    priceB1: 3.15, // +5%
  });

  const refreshed = await prisma.duel.findUniqueOrThrow({
    where: { id: duel.id },
    include: { sideA: true, sideB: true, winner: true, logs: true },
  });

  console.log("Outcome:", result.outcome);
  console.log("Winner:", refreshed.winner?.symbol ?? "tie/void");
  console.log(
    "Treasury A:",
    refreshed.sideA.treasuryBalance.toString(),
    "Treasury B:",
    refreshed.sideB?.treasuryBalance.toString(),
  );
  console.log("Settlement logs:", refreshed.logs.length);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
