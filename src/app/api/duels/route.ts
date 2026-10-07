import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/db";
import { jsonError, requireCoinOwner } from "@/features/auth/server/authorize";
import { requireSession } from "@/features/auth/server/session";
import { revalidateDuelCaches } from "@/shared/lib/cache/revalidate";
import { createOpenDuel, getSuggestionsForCoin } from "@/features/duel/server/service";
import { serialize } from "@/shared/lib/serialize";
import { createDuelSchema } from "@/features/duel/validation/duels";
import { zodIssues } from "@/shared/lib/validation/parse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const coinId = searchParams.get("suggestFor");
  const duelId = searchParams.get("duelId") ?? undefined;

  if (coinId) {
    try {
      // Challenger must be logged in — only their coins are valid side-B picks.
      const { walletAddress } = await requireSession();
      const suggestions = await getSuggestionsForCoin(
        coinId,
        5,
        walletAddress,
        duelId,
      );
      return NextResponse.json(serialize(suggestions));
    } catch (err) {
      const { body, status: code } = jsonError(err, "Failed to suggest rivals");
      return NextResponse.json(body, { status: code });
    }
  }

  const duels = await prisma.duel.findMany({
    where: status ? { status } : undefined,
    include: { sideA: true, sideB: true, winner: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(serialize(duels));
}

export async function POST(req: Request) {
  try {
    const { walletAddress } = await requireSession();
    const body = createDuelSchema.parse(await req.json());
    
    await requireCoinOwner(body.sideACoinId, walletAddress);
    
    const duel = await createOpenDuel(body.sideACoinId);
    
    revalidateDuelCaches(duel.id);
    
    return NextResponse.json(serialize(duel), { status: 201 });
  } catch (err) {
    const issues = zodIssues(err);
    
    if (issues) return NextResponse.json(issues, { status: 400 });
    
    const { body, status } = jsonError(err, "Failed to create duel");
    
    return NextResponse.json(body, { status });
  }
}
