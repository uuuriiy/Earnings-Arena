import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/db";
import { jsonError } from "@/features/auth/server/authorize";
import { requireSession } from "@/features/auth/server/session";
import { createCoin } from "@/features/duel/server/service";
import {
  earningsDateToDateTime,
  fetchQuote,
  fetchUpcomingEarnings,
} from "@/features/market/server/finnhub";
import { verifyPumpMintForWallet } from "@/features/launch/server/verify";
import { clientIp, rateLimit } from "@/shared/lib/rate-limit";
import { serialize } from "@/shared/lib/serialize";
import { createCoinSchema } from "@/features/launch/validation/coins";
import { zodIssues } from "@/shared/lib/validation/parse";

export async function GET() {
  const coins = await prisma.coin.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(serialize(coins));
}

export async function POST(req: Request) {
  const limited = rateLimit({
    key: `coins:${clientIp(req)}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  try {
    const { walletAddress } = await requireSession();
    const body = createCoinSchema.parse(await req.json());

    const mintCheck = await verifyPumpMintForWallet(body.mint, walletAddress);
    if (!mintCheck.ok) {
      return NextResponse.json(
        { error: mintCheck.message, code: mintCheck.code },
        { status: 400 },
      );
    }

    let price = body.stockPinnedPrice;
    let earnings = body.earningsAt ? new Date(body.earningsAt) : undefined;

    if (body.autoMarket || price == null || !earnings) {
      const quote = await fetchQuote(body.stockTicker);
      price = price ?? quote.price;
      if (!earnings) {
        const from = new Date();
        const to = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const events = await fetchUpcomingEarnings(body.stockTicker, from, to);
        if (!events[0]) {
          return NextResponse.json(
            { error: "No upcoming earnings found within 14 days" },
            { status: 400 },
          );
        }
        earnings = earningsDateToDateTime(events[0].date, events[0].hour);
      }
    }

    const coin = await createCoin({
      mint: body.mint,
      symbol: body.symbol,
      name: body.name,
      treasuryWallet: walletAddress,
      stockTicker: body.stockTicker,
      stockPinnedPrice: price!,
      earningsAt: earnings!,
      sector: body.sector,
      creatorWallet: walletAddress,
      pumpCreator: mintCheck.bypassed ? null : mintCheck.creator,
      pumpVerifiedAt: mintCheck.bypassed ? null : new Date(),
    });

    return NextResponse.json(serialize(coin), { status: 201 });
  } catch (err) {
    const issues = zodIssues(err);
    if (issues) return NextResponse.json(issues, { status: 400 });
    const { body, status } = jsonError(err, "Failed to create coin");
    return NextResponse.json(body, { status });
  }
}
