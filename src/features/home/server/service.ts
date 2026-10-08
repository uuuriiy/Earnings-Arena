import { prisma } from "@/shared/lib/db";
import { serialize } from "@/shared/lib/serialize";
import type { DuelCardData } from "@/features/home/components/DuelCard";

export type HomeDuel = DuelCardData & {
  sideA: DuelCardData["sideA"] & { earningsAt: string };
  vaultPubkey?: string | null;
};

/** Live board — no Data Cache so deleted duels cannot ghost after manual DB cleanup. */
export async function listOpenDuels(): Promise<HomeDuel[]> {
  const rows = await prisma.duel.findMany({
    where: { status: { notIn: ["resolved", "voided"] } },
    include: { sideA: true, sideB: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return serialize<HomeDuel[]>(rows);
}
