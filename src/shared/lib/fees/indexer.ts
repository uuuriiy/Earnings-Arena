import { prisma } from "@/shared/lib/db";
import { recordFeeEvent } from "@/shared/lib/fees/pot";

export type FeeIndexResult = {
  credited: number;
  duels: number;
};

/** Unique per run so FeeEvent.txSignature uniqueness does not block stubs. */
export function stubFeeSignature(duelId: string, coinId: string, now = Date.now()) {
  return `stub:${duelId}:${coinId}:${now}`;
}

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

/** Credit Pump (or stub) fee events into active duel pots. */
export async function indexActiveDuelFees(): Promise<FeeIndexResult> {
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
            signature: stubFeeSignature(duel.id, coin.id),
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
        } catch {
          // skip duplicates / status races
        }
      }
    }
  }

  return { credited, duels: duels.length };
}
