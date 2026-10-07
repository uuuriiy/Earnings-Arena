import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/db";
import { serialize } from "@/shared/lib/serialize";

export async function GET() {
  const logs = await prisma.settlementLog.findMany({
    include: {
      duel: { include: { sideA: true, sideB: true, winner: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json(serialize(logs));
}
