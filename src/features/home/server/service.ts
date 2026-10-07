import { unstable_cache } from "next/cache";
import { prisma } from "@/shared/lib/db";
import { serialize } from "@/shared/lib/serialize";
import type { DuelCardData } from "@/features/home/components/DuelCard";

export type HomeDuel = DuelCardData & {
  sideA: DuelCardData["sideA"] & { earningsAt: string };
  vaultPubkey?: string | null;
};

async function fetchOpenDuels(): Promise<HomeDuel[]> {
  const rows = await prisma.duel.findMany({
    where: { status: { notIn: ["resolved", "voided"] } },
    include: { sideA: true, sideB: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return serialize<HomeDuel[]>(rows);
}

/** Cached board for soft navigation / ISR. */
export const listOpenDuels = unstable_cache(fetchOpenDuels, ["home-open-duels"], {
  revalidate: 15,
  tags: ["duels"],
});
