import { NextResponse } from "next/server";
import { z } from "zod";
import { recordFeeEvent } from "@/shared/lib/fees/pot";
import { serialize } from "@/shared/lib/serialize";
import { zodIssues } from "@/shared/lib/validation/parse";

/**
 * Server/admin only — requires CRON_SECRET bearer.
 * Public fee injection is disabled.
 */
const feeSchema = z.object({
  coinId: z.string().cuid(),
  lamports: z.union([z.string(), z.number()]),
  source: z.string().max(64).optional(),
});

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const body = feeSchema.parse(await req.json());
    const event = await recordFeeEvent({
      duelId: id,
      coinId: body.coinId,
      lamports: BigInt(body.lamports),
      source: body.source ?? "server",
    });
    return NextResponse.json(serialize(event), { status: 201 });
  } catch (err) {
    const issues = zodIssues(err);
    if (issues) return NextResponse.json(issues, { status: 400 });
    const message = err instanceof Error ? err.message : "Fee record failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
