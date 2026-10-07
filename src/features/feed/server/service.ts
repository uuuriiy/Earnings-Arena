import { unstable_cache } from "next/cache";
import { prisma } from "@/shared/lib/db";
import { serialize } from "@/shared/lib/serialize";

export type FeedLog = {
  id: string;
  createdAt: string;
  duel: {
    id: string;
    potLamports: string;
    moveAPct?: number | null;
    moveBPct?: number | null;
    settleTxSig?: string | null;
    winner?: { symbol: string } | null;
    sideA: { symbol: string };
    sideB?: { symbol: string } | null;
  };
};

async function fetchKoFeed(take: number): Promise<FeedLog[]> {
  const rows = await prisma.settlementLog.findMany({
    include: {
      duel: { include: { sideA: true, sideB: true, winner: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
  return serialize<FeedLog[]>(rows);
}

export function listKoFeed(take = 30): Promise<FeedLog[]> {
  return unstable_cache(() => fetchKoFeed(take), ["ko-feed", String(take)], {
    revalidate: 30,
    tags: ["feed", "duels"],
  })();
}
