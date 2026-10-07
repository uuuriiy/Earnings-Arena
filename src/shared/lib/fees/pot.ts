import { prisma } from "@/shared/lib/db";
import {
  assertTransition,
  routePot,
  settleAtFromReport,
  settleDuel,
} from "@/features/duel/server/engine";
import type { DuelStatus } from "@/shared/lib/types";

export async function recordFeeEvent(input: {
  duelId: string;
  coinId: string;
  lamports: bigint;
  source?: string;
  txSignature?: string;
}) {
  const duel = await prisma.duel.findUniqueOrThrow({ where: { id: input.duelId } });
  if (!["locked", "awaiting_print", "settling"].includes(duel.status)) {
    throw new Error(`Cannot add fees while duel is ${duel.status}`);
  }

  if (input.txSignature) {
    const existing = await prisma.feeEvent.findUnique({
      where: { txSignature: input.txSignature },
    });
    if (existing) return existing;
  }

  const { creditVaultFees } = await import("@/shared/lib/solana/escrow");
  const onchain = await creditVaultFees({
    duelId: input.duelId,
    lamports: input.lamports,
  });

  const event = await prisma.feeEvent.create({
    data: {
      duelId: input.duelId,
      coinId: input.coinId,
      lamports: input.lamports,
      source: input.source ?? "stub",
      txSignature: input.txSignature ?? onchain.signature,
    },
  });

  await prisma.duel.update({
    where: { id: input.duelId },
    data: { potLamports: { increment: input.lamports } },
  });

  return event;
}

export async function markEarningsPrinted(duelId: string, reportAt: Date) {
  const duel = await prisma.duel.findUniqueOrThrow({ where: { id: duelId } });
  const from = duel.status as DuelStatus;
  assertTransition(from, "settling");

  return prisma.duel.update({
    where: { id: duelId },
    data: {
      status: "settling",
      reportAt,
      settleAt: settleAtFromReport(reportAt),
    },
  });
}

export async function resolveDuel(input: {
  duelId: string;
  priceA0: number | null;
  priceB0: number | null;
  priceA1: number | null;
  priceB1: number | null;
}) {
  const duel = await prisma.duel.findUniqueOrThrow({
    where: { id: input.duelId },
    include: { sideA: true, sideB: true },
  });

  if (!duel.sideB) {
    throw new Error("Duel missing side B");
  }

  const from = duel.status as DuelStatus;
  const outcome = settleDuel(input);
  const routing = routePot({ potLamports: duel.potLamports, outcome });

  if (outcome.outcome === "void") {
    assertTransition(from, "voided");
    await prisma.$transaction([
      prisma.coin.update({
        where: { id: duel.sideACoinId },
        data: { treasuryBalance: { increment: routing.sideA } },
      }),
      prisma.coin.update({
        where: { id: duel.sideBCoinId! },
        data: { treasuryBalance: { increment: routing.sideB } },
      }),
      prisma.duel.update({
        where: { id: duel.id },
        data: {
          status: "voided",
          priceA0: input.priceA0 ?? undefined,
          priceB0: input.priceB0 ?? undefined,
          priceA1: input.priceA1 ?? undefined,
          priceB1: input.priceB1 ?? undefined,
          resolvedAt: new Date(),
          potLamports: 0n,
          settleTxSig: duel.settleTxSig ?? `void:${duel.id}`,
        },
      }),
      prisma.settlementLog.create({
        data: {
          duelId: duel.id,
          payloadJson: JSON.stringify({ outcome, routing: serializeRouting(routing) }),
        },
      }),
    ]);
    return { outcome, routing };
  }

  assertTransition(from, "resolved");

  const moveAPct = outcome.moveAPct;
  const moveBPct = outcome.moveBPct;
  let winnerCoinId: string | null = null;
  if (outcome.outcome === "winner") {
    winnerCoinId =
      outcome.winnerSide === "A" ? duel.sideACoinId : duel.sideBCoinId;
  }

  await prisma.$transaction([
    prisma.coin.update({
      where: { id: duel.sideACoinId },
      data: { treasuryBalance: { increment: routing.sideA } },
    }),
    prisma.coin.update({
      where: { id: duel.sideBCoinId! },
      data: { treasuryBalance: { increment: routing.sideB } },
    }),
    prisma.duel.update({
      where: { id: duel.id },
      data: {
        status: "resolved",
        priceA0: input.priceA0,
        priceB0: input.priceB0,
        priceA1: input.priceA1,
        priceB1: input.priceB1,
        moveAPct,
        moveBPct,
        winnerCoinId,
        resolvedAt: new Date(),
        potLamports: 0n,
        settleTxSig: duel.settleTxSig ?? `settle:${duel.id}`,
      },
    }),
    prisma.settlementLog.create({
      data: {
        duelId: duel.id,
        payloadJson: JSON.stringify({
          outcome,
          routing: serializeRouting(routing),
          winnerCoinId,
        }),
      },
    }),
  ]);

  return { outcome, routing, winnerCoinId };
}

function serializeRouting(routing: { sideA: bigint; sideB: bigint }) {
  return {
    sideA: routing.sideA.toString(),
    sideB: routing.sideB.toString(),
  };
}
