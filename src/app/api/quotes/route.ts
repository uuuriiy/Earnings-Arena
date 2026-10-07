import { NextResponse } from "next/server";
import { fetchQuote } from "@/features/market/server/finnhub";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tickers = (searchParams.get("tickers") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (tickers.length === 0) {
    return NextResponse.json({ error: "tickers query required" }, { status: 400 });
  }

  try {
    const quotes = await Promise.all(tickers.map((t) => fetchQuote(t)));
    return NextResponse.json({ quotes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quote fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
