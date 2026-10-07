import { NextResponse } from "next/server";
import { listEligiblePins } from "@/features/market/server/eligible";
import { clientIp, rateLimit } from "@/shared/lib/rate-limit";
import { captureException } from "@/shared/lib/monitoring/sentry";

export async function GET(req: Request) {
  const limited = rateLimit({
    key: `stocks-eligible:${clientIp(req)}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  try {
    const pins = await listEligiblePins();
    return NextResponse.json(
      { pins, asOf: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    captureException(err, { route: "/api/stocks/eligible" });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load eligible stocks" },
      { status: 502 },
    );
  }
}
