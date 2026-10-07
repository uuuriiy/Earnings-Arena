import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/db";
import { AuthzError, jsonError } from "@/features/auth/server/authorize";
import { requireSession } from "@/features/auth/server/session";
import { revalidateDuelCaches } from "@/shared/lib/cache/revalidate";
import { acceptDuel, advanceToAwaitingPrint } from "@/features/duel/server/service";
import { serialize } from "@/shared/lib/serialize";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { walletAddress } = await requireSession();
    const { id } = await ctx.params;

    const existing = await prisma.duel.findUnique({
      where: { id },
      include: { sideA: true },
    });
    if (!existing) throw new AuthzError("Duel not found", 404);
    if (existing.sideA.creatorWallet !== walletAddress) {
      throw new AuthzError("Only side A creator can lock the duel");
    }

    await acceptDuel(id);
    const duel = await advanceToAwaitingPrint(id);
    revalidateDuelCaches(id);
    return NextResponse.json(serialize(duel));
  } catch (err) {
    const { body, status } = jsonError(err, "Accept failed");
    return NextResponse.json(body, { status });
  }
}
