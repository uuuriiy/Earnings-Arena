import { Connection, PublicKey } from "@solana/web3.js";
import { getRpc } from "@/shared/lib/solana/escrow";
import { isDemoMint, isLikelyOnchainMint } from "@/shared/lib/solana/mint";

/** Pump.fun program (mainnet / canonical). */
export const PUMP_PROGRAM_ID = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
);

/** Core bonding-curve layout: disc(8) + 5×u64 + complete(1) + creator(32) = 81 */
export const BONDING_CURVE_MIN_LEN = 81;
export const CREATOR_OFFSET = 49;

export type PumpBondingCurve = {
  creator: string;
  complete: boolean;
  virtualTokenReserves: bigint;
  virtualSolReserves: bigint;
  realTokenReserves: bigint;
  realSolReserves: bigint;
  tokenTotalSupply: bigint;
  bondingCurve: string;
};

export type VerifyFailCode =
  | "invalid_mint"
  | "not_pump"
  | "not_creator"
  | "rpc_error";

export type VerifyPumpMintResult =
  | {
      ok: true;
      creator: string;
      complete: boolean;
      bondingCurve: string;
      bypassed?: boolean;
    }
  | {
      ok: false;
      code: VerifyFailCode;
      message: string;
    };

export type AccountInfoLike = {
  owner: PublicKey;
  data: Buffer | Uint8Array;
} | null;

export type AccountFetcher = (pubkey: PublicKey) => Promise<AccountInfoLike>;

export function bondingCurvePda(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), mint.toBuffer()],
    PUMP_PROGRAM_ID,
  );
}

export function parseBondingCurveData(
  data: Buffer | Uint8Array,
): Omit<PumpBondingCurve, "bondingCurve"> | null {
  if (data.length < BONDING_CURVE_MIN_LEN) return null;
  const buf = Buffer.from(data);
  const readU64 = (offset: number) => buf.readBigUInt64LE(offset);
  const creatorBytes = buf.subarray(CREATOR_OFFSET, CREATOR_OFFSET + 32);
  return {
    virtualTokenReserves: readU64(8),
    virtualSolReserves: readU64(16),
    realTokenReserves: readU64(24),
    realSolReserves: readU64(32),
    tokenTotalSupply: readU64(40),
    complete: buf[48] === 1,
    creator: new PublicKey(creatorBytes).toBase58(),
  };
}

export function isProductionLike() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

/** Seed/demo bypass — never in production-like hosts. */
export function unverifiedMintsAllowed() {
  return process.env.ALLOW_UNVERIFIED_MINTS === "true" && !isProductionLike();
}

function defaultFetcher(): AccountFetcher {
  const connection = new Connection(getRpc(), "confirmed");
  return async (pubkey) => {
    const info = await connection.getAccountInfo(pubkey, "confirmed");
    if (!info) return null;
    return { owner: info.owner, data: info.data };
  };
}

export async function fetchPumpBondingCurve(
  mint: string,
  fetchAccount: AccountFetcher = defaultFetcher(),
): Promise<PumpBondingCurve | null> {
  let mintKey: PublicKey;
  try {
    mintKey = new PublicKey(mint);
  } catch {
    return null;
  }

  const [curve] = bondingCurvePda(mintKey);
  const info = await fetchAccount(curve);
  if (!info) return null;
  if (!info.owner.equals(PUMP_PROGRAM_ID)) return null;

  const parsed = parseBondingCurveData(info.data);
  if (!parsed) return null;

  return { ...parsed, bondingCurve: curve.toBase58() };
}

export async function verifyPumpMintForWallet(
  mint: string,
  wallet: string,
  fetchAccount: AccountFetcher = defaultFetcher(),
): Promise<VerifyPumpMintResult> {
  const trimmed = mint.trim();
  if (!isLikelyOnchainMint(trimmed)) {
    return {
      ok: false,
      code: "invalid_mint",
      message: "Mint must be a valid Solana base58 address (32–44 chars)",
    };
  }

  if (!wallet || !isLikelyOnchainMint(wallet)) {
    return {
      ok: false,
      code: "not_creator",
      message: "Connect a Solana wallet to verify mint ownership",
    };
  }

  // Local/seed only: demo placeholders may skip RPC. Real addresses always
  // run full Pump + creator checks (even when ALLOW_UNVERIFIED_MINTS=true).
  if (unverifiedMintsAllowed() && isDemoMint(trimmed)) {
    return {
      ok: true,
      creator: wallet,
      complete: false,
      bondingCurve: "",
      bypassed: true,
    };
  }

  try {
    new PublicKey(trimmed);
  } catch {
    return {
      ok: false,
      code: "invalid_mint",
      message: "Mint is not a valid public key",
    };
  }

  let curve: PumpBondingCurve | null;
  try {
    curve = await fetchPumpBondingCurve(trimmed, fetchAccount);
  } catch {
    return {
      ok: false,
      code: "rpc_error",
      message: "Could not reach Solana RPC to verify Pump mint",
    };
  }

  if (!curve) {
    return {
      ok: false,
      code: "not_pump",
      message: "Mint is not a Pump.fun coin (no bonding curve found)",
    };
  }

  if (curve.creator !== wallet) {
    return {
      ok: false,
      code: "not_creator",
      message: `Wallet is not the Pump creator (on-chain creator ${curve.creator.slice(0, 4)}…${curve.creator.slice(-4)})`,
    };
  }

  return {
    ok: true,
    creator: curve.creator,
    complete: curve.complete,
    bondingCurve: curve.bondingCurve,
  };
}
