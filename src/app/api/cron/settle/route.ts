import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/db";
import { markEarningsPrinted, resolveDuel } from "@/shared/lib/fees/pot";
import { snapshotPrice } from "@/features/market/server/finnhub";
import { captureException } from "@/shared/lib/monitoring/sentry";
import { serialize } from "@/shared/lib/serialize";
import { settleCronSchema } from "@/features/duel/validation/duels";
import { zodIssues } from "@/shared/lib/validation/parse";

function isProductionLike() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

function overridesAllowed() {
  return process.env.ALLOW_SETTLE_OVERRIDES === "true" && !isProductionLike();
}

function authorized(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  const secret = process.env.CRON_SECRET;
  if (isProductionLike() && !secret) {
    return { ok: false, status: 500, error: "CRON_SECRET is required in production" };
  }
  if (!secret) {
    return { ok: false, status: 401, error: "CRON_SECRET is not configured" };
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true };
}

export async function POST(req: Request) {
  const auth = authorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: {
    duelId?: string;
    forceReportAt?: string;
    priceOverrides?: Record<string, number>;
  };

  try {
    const raw = await req.json().catch(() => ({}));
    body = settleCronSchema.parse(raw);
  } catch (err) {
    const issues = zodIssues(err);
    if (issues) return NextResponse.json(issues, { status: 400 });
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const allowOverrides = overridesAllowed();
  const forceReportAt = allowOverrides ? body.forceReportAt : undefined;
  const priceOverrides = allowOverrides ? body.priceOverrides : undefined;

  const now = new Date();
  const results: unknown[] = [];

  const awaiting = await prisma.duel.findMany({
    where: {
      status: "awaiting_print",
      ...(body.duelId ? { id: body.duelId } : {}),
    },
    include: { sideA: true, sideB: true },
  });

  for (const duel of awaiting) {
    const reportAt = forceReportAt ? new Date(forceReportAt) : duel.sideA.earningsAt;
    if (reportAt.getTime() <= now.getTime() || forceReportAt) {
      const updated = await markEarningsPrinted(duel.id, reportAt);
      results.push({ action: "printed", duelId: duel.id, settleAt: updated.settleAt });
    }
  }

  const settling = await prisma.duel.findMany({
    where: {
      status: "settling",
      ...(body.duelId ? { id: body.duelId } : {}),
    },
    include: { sideA: true, sideB: true },
  });

  for (const duel of settling) {
    if (!duel.sideB || !duel.settleAt) continue;

    const due = duel.settleAt.getTime() <= now.getTime();
    const forced = Boolean(priceOverrides);
    if (!due && !forced) continue;

    const tickerA = duel.sideA.stockTicker;
    const tickerB = duel.sideB.stockTicker;

    const priceA0 =
      priceOverrides?.[`${tickerA}:0`] ??
      duel.priceA0 ??
      (await snapshotPrice(tickerA));
    const priceB0 =
      priceOverrides?.[`${tickerB}:0`] ??
      duel.priceB0 ??
      (await snapshotPrice(tickerB));
    const priceA1 =
      priceOverrides?.[`${tickerA}:1`] ?? (await snapshotPrice(tickerA));
    const priceB1 =
      priceOverrides?.[`${tickerB}:1`] ?? (await snapshotPrice(tickerB));

    if (duel.priceA0 == null || duel.priceB0 == null) {
      await prisma.duel.update({
        where: { id: duel.id },
        data: { priceA0: priceA0 ?? undefined, priceB0: priceB0 ?? undefined },
      });
    }

    try {
      const resolved = await resolveDuel({
        duelId: duel.id,
        priceA0,
        priceB0,
        priceA1,
        priceB1,
      });
      results.push({
        action: "resolved",
        duelId: duel.id,
        result: serialize(resolved),
      });
    } catch (err) {
      captureException(err, { duelId: duel.id, action: "resolve" });
      results.push({
        action: "error",
        duelId: duel.id,
        error: err instanceof Error ? err.message : "resolve failed",
      });
    }
  }

  return NextResponse.json({ ok: true, results: serialize(results) });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "Use POST with Authorization: Bearer $CRON_SECRET",
  });
}

