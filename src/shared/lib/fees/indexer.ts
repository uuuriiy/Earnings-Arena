import { prisma } from "@/shared/lib/db";
import { recordFeeEvent } from "@/shared/lib/fees/pot";
import { fetchOnchainPumpFeeHints, type FeeHint } from "@/shared/lib/fees/pump-rpc";

export type FeeIndexResult = {
  credited: number;
  duels: number;
};

export type FeeSource = "pump_api" | "pump_rpc" | "stub";

/** Unique per run so FeeEvent.txSignature uniqueness does not block stubs. */
export function stubFeeSignature(duelId: string, coinId: string, now = Date.now()) {
  return `stub:${duelId}:${coinId}:${now}`;
}

async function fetchHttpPumpFeeHints(mint: string): Promise<FeeHint[]> {
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

/**
 * Resolve fee hints for a mint:
 * 1) external PUMP_API if set
 * 2) else on-chain creator-vault deltas via Solana RPC
 * 3) caller may fall back to FEE_INDEXER_STUB
 */
export async function resolveFeeHints(mint: string): Promise<{
  hints: FeeHint[];
  source: FeeSource;
}> {
  if (process.env.PUMP_API) {
    const hints = await fetchHttpPumpFeeHints(mint);
    if (hints.length > 0) return { hints, source: "pump_api" };
  }

  const onchain = await fetchOnchainPumpFeeHints(mint);
  if (onchain.length > 0) return { hints: onchain, source: "pump_rpc" };

  if (process.env.PUMP_API) {
    // API configured but empty this round — do not stub-override real mode.
    return { hints: [], source: "pump_api" };
  }

  return { hints: [], source: "pump_rpc" };
}

/** Credit Pump (API / RPC) or stub fee events into active duel pots. */
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
      let { hints, source } = await resolveFeeHints(coin.mint);

      if (hints.length === 0 && process.env.FEE_INDEXER_STUB === "true") {
        hints = [
          {
            signature: stubFeeSignature(duel.id, coin.id),
            lamports: 10_000_000n, // 0.01 SOL
          },
        ];
        source = "stub";
      }

      for (const hint of hints) {
        try {
          await recordFeeEvent({
            duelId: duel.id,
            coinId: coin.id,
            lamports: hint.lamports,
            source,
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
