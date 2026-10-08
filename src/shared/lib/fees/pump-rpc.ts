import { Connection, PublicKey } from "@solana/web3.js";
import {
  PUMP_PROGRAM_ID,
  bondingCurvePda,
  fetchPumpBondingCurve,
} from "@/features/launch/server/verify";
import { getRpc } from "@/shared/lib/solana/escrow";

export type FeeHint = { signature: string; lamports: bigint };

/** Pump creator vault PDA: ["creator-vault", creator]. */
export function creatorVaultPda(creator: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("creator-vault"), creator.toBuffer()],
    PUMP_PROGRAM_ID,
  );
}

/** Positive lamport delta into the creator vault (fee credit). */
export function creatorVaultFeeDelta(preLamports: number, postLamports: number): bigint {
  const delta = BigInt(postLamports) - BigInt(preLamports);
  return delta > 0n ? delta : 0n;
}

/**
 * Scan recent bonding-curve txs and credit creator-vault lamport increases.
 * Mint-scoped via bonding-curve signature history (vault PDA is per-creator).
 */
export async function fetchOnchainPumpFeeHints(
  mint: string,
  opts?: { limit?: number; connection?: Connection },
): Promise<FeeHint[]> {
  const limit = opts?.limit ?? 25;
  const connection = opts?.connection ?? new Connection(getRpc(), "confirmed");

  let mintKey: PublicKey;
  try {
    mintKey = new PublicKey(mint);
  } catch {
    return [];
  }

  const curve = await fetchPumpBondingCurve(mint);
  if (!curve) return [];

  const [curvePda] = bondingCurvePda(mintKey);
  const [vaultPda] = creatorVaultPda(new PublicKey(curve.creator));

  let signatures: { signature: string; err: unknown }[];
  try {
    signatures = await connection.getSignaturesForAddress(curvePda, { limit });
  } catch {
    return [];
  }

  const hints: FeeHint[] = [];

  for (const entry of signatures) {
    if (entry.err) continue;
    try {
      const tx = await connection.getTransaction(entry.signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });
      if (!tx?.meta) continue;

      const keys = tx.transaction.message.getAccountKeys({
        accountKeysFromLookups: tx.meta.loadedAddresses,
      });
      let vaultIndex = -1;
      for (let i = 0; i < keys.length; i += 1) {
        if (keys.get(i)?.equals(vaultPda)) {
          vaultIndex = i;
          break;
        }
      }
      if (vaultIndex < 0) continue;

      const pre = tx.meta.preBalances[vaultIndex];
      const post = tx.meta.postBalances[vaultIndex];
      if (pre == null || post == null) continue;

      const lamports = creatorVaultFeeDelta(pre, post);
      if (lamports === 0n) continue;

      hints.push({ signature: entry.signature, lamports });
    } catch {
      // skip bad / pruned txs
    }
  }

  return hints;
}
