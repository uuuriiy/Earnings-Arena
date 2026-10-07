import { prisma } from "@/shared/lib/db";
import {
  ACTIVE_DUEL_STATUSES,
  coinBusyInActiveDuelMessage,
  filterCoinsNotInActiveDuels,
} from "@/features/duel/server/active";
import { checkEligibility } from "@/features/duel/server/eligibility";
import { acceptAdvancePlan, assertTransition } from "@/features/duel/server/engine";
import { suggestRivals } from "@/features/duel/server/matchmaker";
import type { DuelStatus } from "@/shared/lib/types";

async function assertCoinFreeForDuel(
  coinId: string,
  excludeDuelId?: string,
) {
  const existing = await prisma.duel.findFirst({
    where: {
      status: { in: [...ACTIVE_DUEL_STATUSES] },
      ...(excludeDuelId ? { id: { not: excludeDuelId } } : {}),
      OR: [{ sideACoinId: coinId }, { sideBCoinId: coinId }],
    },
    select: { id: true, status: true },
  });
  if (existing) {
    throw new Error(coinBusyInActiveDuelMessage(existing.status));
  }
}

export async function createCoin(input: {
  mint: string;
  symbol: string;
  name: string;
  treasuryWallet: string;
  stockTicker: string;
  stockPinnedPrice: number;
  earningsAt: Date;
  sector?: string;
  creatorWallet: string;
  pumpCreator?: string | null;
  pumpVerifiedAt?: Date | null;
}) {
  const eligibility = checkEligibility({
    stockPrice: input.stockPinnedPrice,
    earningsAt: input.earningsAt,
  });
  if (!eligibility.ok) {
    throw new Error(eligibility.reason);
  }

  return prisma.coin.create({
    data: {
      mint: input.mint,
      symbol: input.symbol.toUpperCase(),
      name: input.name,
      treasuryWallet: input.treasuryWallet,
      stockTicker: input.stockTicker.toUpperCase(),
      stockPinnedPrice: input.stockPinnedPrice,
      earningsAt: input.earningsAt,
      sector: input.sector ?? null,
      creatorWallet: input.creatorWallet,
      pumpCreator: input.pumpCreator ?? null,
      pumpVerifiedAt: input.pumpVerifiedAt ?? null,
    },
  });
}

export async function createOpenDuel(sideACoinId: string) {
  await assertCoinFreeForDuel(sideACoinId);
  const { createDuelVault } = await import("@/shared/lib/solana/escrow");

  const duel = await prisma.duel.create({
    data: {
      sideACoinId,
      status: "open",
    },
    include: { sideA: true, sideB: true },
  });

  const vault = await createDuelVault({
    duelId: duel.id,
    sideAMint: duel.sideA.mint,
    sideATreasury: duel.sideA.treasuryWallet,
  });

  return prisma.duel.update({
    where: { id: duel.id },
    data: {
      vaultPubkey: vault.vaultPubkey,
      createTxSig: vault.signature,
    },
    include: { sideA: true, sideB: true },
  });
}

export async function getSuggestionsForCoin(
  coinId: string,
  limit = 5,
  /** Only suggest coins this wallet can actually challenge with. */
  ownerWallet?: string,
  /** Ignore this bout when marking coins busy (so its current side B can still be suggested). */
  excludeDuelId?: string,
) {
  const anchor = await prisma.coin.findUniqueOrThrow({ where: { id: coinId } });
  const [pool, activeDuels] = await Promise.all([
    prisma.coin.findMany({
      where: {
        id: { not: coinId },
        ...(ownerWallet ? { creatorWallet: ownerWallet } : {}),
      },
    }),
    prisma.duel.findMany({
      where: { status: { in: [...ACTIVE_DUEL_STATUSES] } },
      select: {
        id: true,
        sideACoinId: true,
        sideBCoinId: true,
        status: true,
      },
    }),
  ]);

  const freeIds = new Set(
    filterCoinsNotInActiveDuels(
      pool.map((c) => c.id),
      activeDuels,
      { excludeDuelId },
    ),
  );
  const freePool = pool.filter((c) => freeIds.has(c.id));

  const scored = suggestRivals(
    {
      id: anchor.id,
      stockTicker: anchor.stockTicker,
      earningsAt: anchor.earningsAt,
      sector: anchor.sector,
    },
    freePool.map((c) => ({
      id: c.id,
      stockTicker: c.stockTicker,
      earningsAt: c.earningsAt,
      sector: c.sector,
    })),
    limit,
  );

  const byId = new Map(freePool.map((c) => [c.id, c]));
  return scored.map((s) => ({
    ...s,
    coin: byId.get(s.coinId)!,
  }));
}

export async function challengeDuel(duelId: string, sideBCoinId: string) {
  const duel = await prisma.duel.findUniqueOrThrow({ where: { id: duelId } });
  if (duel.status !== "open") {
    throw new Error("Duel is not open for challenge");
  }
  if (duel.sideACoinId === sideBCoinId) {
    throw new Error("Cannot challenge with the same coin");
  }
  await assertCoinFreeForDuel(sideBCoinId, duelId);

  return prisma.duel.update({
    where: { id: duelId },
    data: { sideBCoinId },
    include: { sideA: true, sideB: true },
  });
}

export async function acceptDuel(duelId: string) {
  const duel = await prisma.duel.findUniqueOrThrow({ where: { id: duelId } });
  if (!duel.sideBCoinId) {
    throw new Error("No challenger to accept");
  }
  const plan = acceptAdvancePlan(duel.status as DuelStatus);
  if (!plan.lock) {
    return prisma.duel.findUniqueOrThrow({
      where: { id: duelId },
      include: { sideA: true, sideB: true },
    });
  }
  assertTransition(duel.status as DuelStatus, "locked");

  return prisma.duel.update({
    where: { id: duelId },
    data: { status: "locked" },
    include: { sideA: true, sideB: true },
  });
}

export async function advanceToAwaitingPrint(duelId: string) {
  const duel = await prisma.duel.findUniqueOrThrow({ where: { id: duelId } });
  const status = duel.status as DuelStatus;
  if (
    status === "awaiting_print" ||
    status === "settling" ||
    status === "resolved"
  ) {
    return prisma.duel.findUniqueOrThrow({
      where: { id: duelId },
      include: { sideA: true, sideB: true },
    });
  }
  assertTransition(status, "awaiting_print");
  return prisma.duel.update({
    where: { id: duelId },
    data: {
      status: "awaiting_print",
      lockTxSig: duel.lockTxSig ?? `lock:${duelId}:${Date.now()}`,
    },
    include: { sideA: true, sideB: true },
  });
}
