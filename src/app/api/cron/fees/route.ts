import { NextResponse } from "next/server";
import { authorizeCron } from "@/shared/lib/cron/auth";
import { indexActiveDuelFees } from "@/shared/lib/fees/indexer";
import { captureException } from "@/shared/lib/monitoring/sentry";

async function runFees() {
  const result = await indexActiveDuelFees();
  return { ok: true as const, ...result };
}

/** Vercel Cron: GET with Authorization: Bearer $CRON_SECRET */
export async function GET(req: Request) {
  const auth = authorizeCron(req);
  
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  
  try {
    return NextResponse.json(await runFees());
  } catch (err) {
    captureException(err, { action: "fee-index" });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fee index failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
