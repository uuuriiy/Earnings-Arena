import { NextResponse } from "next/server";
import { jsonError, requireCoinOwner } from "@/features/auth/server/authorize";
import { requireSession } from "@/features/auth/server/session";
import { revalidateDuelCaches } from "@/shared/lib/cache/revalidate";
import { challengeDuel } from "@/features/duel/server/service";
import { serialize } from "@/shared/lib/serialize";
import { challengeDuelSchema } from "@/features/duel/validation/duels";
import { zodIssues } from "@/shared/lib/validation/parse";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { walletAddress } = await requireSession();
    const { id } = await ctx.params;
    const body = challengeDuelSchema.parse(await req.json());
    await requireCoinOwner(body.sideBCoinId, walletAddress);
    const duel = await challengeDuel(id, body.sideBCoinId);
    revalidateDuelCaches(id);
    return NextResponse.json(serialize(duel));
  } catch (err) {
    const issues = zodIssues(err);
    if (issues) return NextResponse.json(issues, { status: 400 });
    const { body, status } = jsonError(err, "Challenge failed");
    return NextResponse.json(body, { status });
  }
}
