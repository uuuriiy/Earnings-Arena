import { NextResponse } from "next/server";
import { authorizeCron } from "@/shared/lib/cron/auth";
import { revalidateDuelCaches } from "@/shared/lib/cache/revalidate";

/** Bust home board + duel page Data Cache (e.g. after manual DB cleanup). */
export async function POST(req: Request) {
  const auth = authorizeCron(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let duelId: string | undefined;
  try {
    const body = (await req.json()) as { duelId?: string };
    duelId = body.duelId;
  } catch {
    // empty body is fine
  }

  revalidateDuelCaches(duelId);

  return NextResponse.json({
    ok: true,
    revalidated: ["duels", ...(duelId ? [`duel:${duelId}`] : [])],
  });
}

export async function GET(req: Request) {
  const auth = authorizeCron(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const duelId = new URL(req.url).searchParams.get("duelId") ?? undefined;
  revalidateDuelCaches(duelId || undefined);

  return NextResponse.json({
    ok: true,
    revalidated: ["duels", ...(duelId ? [`duel:${duelId}`] : [])],
  });
}
