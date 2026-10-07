import { NextResponse } from "next/server";
import { jsonError } from "@/features/auth/server/authorize";
import { requireSession } from "@/features/auth/server/session";
import { verifyPumpMintForWallet } from "@/features/launch/server/verify";
import { verifyMintSchema } from "@/features/launch/validation/coins";
import { zodIssues } from "@/shared/lib/validation/parse";

export async function POST(req: Request) {
  try {
    const { walletAddress } = await requireSession();
    const body = verifyMintSchema.parse(await req.json());
    const result = await verifyPumpMintForWallet(body.mint, walletAddress);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, code: result.code, error: result.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      creator: result.creator,
      complete: result.complete,
      bondingCurve: result.bondingCurve,
      bypassed: Boolean(result.bypassed),
    });
  } catch (err) {
    const issues = zodIssues(err);
    if (issues) return NextResponse.json(issues, { status: 400 });
    const { body, status } = jsonError(err, "Mint verification failed");
    return NextResponse.json(body, { status });
  }
}
