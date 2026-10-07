/**
 * Fee indexer — credits duel pots for active arenas.
 *
 * Modes:
 * - Without PUMP_API: stub credits (dev) for awaiting_print duels missing recent pump events
 * - With PUMP_API: fetch fee signatures per mint (adapter stub — plug real Pump indexer URL)
 *
 * Env: DATABASE_URL, CRON_SECRET unused, KEEPER_SECRET_KEY optional, PUMP_API optional
 */
import { PrismaClient } from "@prisma/client";
import { recordFeeEvent } from "../src/shared/lib/fees/pot";

const prisma = new PrismaClient();

async function fetchPumpFeeHints(
  mint: string,
): Promise<{ signature: string; lamports: bigint }[]> {
  const base = process.env.PUMP_API;
  if (!base) return [];

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/fees?mint=${mint}`);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      fees?: { signature: string; lamports: string | number }[];
    };
    return (data.fees ?? []).map((f) => ({
      signature: f.signature,
      lamports: BigInt(f.lamports),
    }));
  } catch {
    return [];
  }
}

async function main() {
  const duels = await prisma.duel.findMany({
    where: { status: { in: ["awaiting_print", "settling"] } },
    include: { sideA: true, sideB: true },
    take: 50,
  });

  let credited = 0;

  for (const duel of duels) {
    if (!duel.sideB) continue;

    for (const coin of [duel.sideA, duel.sideB]) {
      let hints = await fetchPumpFeeHints(coin.mint);

      if (hints.length === 0 && process.env.FEE_INDEXER_STUB === "true") {
        hints = [
          {
            signature: `stub:${duel.id}:${coin.id}:${Date.now()}`,
            lamports: 10_000_000n, // 0.01 SOL
          },
        ];
      }

      for (const hint of hints) {
        try {
          await recordFeeEvent({
            duelId: duel.id,
            coinId: coin.id,
            lamports: hint.lamports,
            source: process.env.PUMP_API ? "pump" : "stub",
            txSignature: hint.signature,
          });
          credited += 1;
          console.log(`credited ${hint.lamports} to ${duel.id} via ${hint.signature}`);
        } catch (err) {
          console.warn(`skip ${hint.signature}:`, err instanceof Error ? err.message : err);
        }
      }
    }
  }

  console.log(`Done. Credited ${credited} fee event(s) across ${duels.length} duel(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
