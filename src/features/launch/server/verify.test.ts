import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  BONDING_CURVE_MIN_LEN,
  CREATOR_OFFSET,
  PUMP_PROGRAM_ID,
  bondingCurvePda,
  parseBondingCurveData,
  verifyPumpMintForWallet,
  type AccountFetcher,
} from "./verify";

const env = process.env as Record<string, string | undefined>;
const prevBypass = env.ALLOW_UNVERIFIED_MINTS;
const prevNodeEnv = env.NODE_ENV;
const prevVercel = env.VERCEL;

beforeEach(() => {
  env.ALLOW_UNVERIFIED_MINTS = "false";
  env.NODE_ENV = "test";
  delete env.VERCEL;
});

afterEach(() => {
  if (prevBypass === undefined) delete env.ALLOW_UNVERIFIED_MINTS;
  else env.ALLOW_UNVERIFIED_MINTS = prevBypass;
  if (prevNodeEnv === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = prevNodeEnv;
  if (prevVercel === undefined) delete env.VERCEL;
  else env.VERCEL = prevVercel;
});

function buildCurveAccount(creator: PublicKey, complete = false): Buffer {
  const data = Buffer.alloc(BONDING_CURVE_MIN_LEN);
  // discriminator leftover zeros ok for parser tests
  data.writeBigUInt64LE(1n, 8);
  data.writeBigUInt64LE(2n, 16);
  data.writeBigUInt64LE(3n, 24);
  data.writeBigUInt64LE(4n, 32);
  data.writeBigUInt64LE(5n, 40);
  data[48] = complete ? 1 : 0;
  creator.toBuffer().copy(data, CREATOR_OFFSET);
  return data;
}

describe("parseBondingCurveData", () => {
  it("reads creator and complete flag", () => {
    const creator = Keypair.generate().publicKey;
    const data = buildCurveAccount(creator, true);
    const parsed = parseBondingCurveData(data);
    expect(parsed).not.toBeNull();
    expect(parsed!.creator).toBe(creator.toBase58());
    expect(parsed!.complete).toBe(true);
    expect(parsed!.virtualTokenReserves).toBe(1n);
  });

  it("returns null for short buffers", () => {
    expect(parseBondingCurveData(Buffer.alloc(40))).toBeNull();
  });
});

describe("bondingCurvePda", () => {
  it("derives a PDA owned by the pump program seed", () => {
    const mint = Keypair.generate().publicKey;
    const [pda, bump] = bondingCurvePda(mint);
    expect(pda).toBeInstanceOf(PublicKey);
    expect(bump).toBeGreaterThanOrEqual(0);
    const [again] = bondingCurvePda(mint);
    expect(again.equals(pda)).toBe(true);
  });
});

describe("verifyPumpMintForWallet", () => {
  const creator = Keypair.generate();
  const mint = Keypair.generate();
  const [curvePda] = bondingCurvePda(mint.publicKey);

  const pumpFetcher: AccountFetcher = async (pubkey) => {
    if (!pubkey.equals(curvePda)) return null;
    return {
      owner: PUMP_PROGRAM_ID,
      data: buildCurveAccount(creator.publicKey),
    };
  };

  it("rejects invalid mint shape", async () => {
    const result = await verifyPumpMintForWallet("short", creator.publicKey.toBase58());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_mint");
  });

  it("rejects when bonding curve missing", async () => {
    const result = await verifyPumpMintForWallet(
      mint.publicKey.toBase58(),
      creator.publicKey.toBase58(),
      async () => null,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("not_pump");
  });

  it("rejects wrong wallet", async () => {
    const other = Keypair.generate().publicKey.toBase58();
    const result = await verifyPumpMintForWallet(
      mint.publicKey.toBase58(),
      other,
      pumpFetcher,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("not_creator");
  });

  it("accepts when creator matches", async () => {
    const result = await verifyPumpMintForWallet(
      mint.publicKey.toBase58(),
      creator.publicKey.toBase58(),
      pumpFetcher,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.creator).toBe(creator.publicKey.toBase58());
      expect(result.bondingCurve).toBe(curvePda.toBase58());
    }
  });

  it("bypasses demo mints when ALLOW_UNVERIFIED_MINTS in non-prod", async () => {
    process.env.ALLOW_UNVERIFIED_MINTS = "true";
    const result = await verifyPumpMintForWallet(
      "MintA1111111111111111111111111111111111111",
      creator.publicKey.toBase58(),
      async () => null,
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.bypassed).toBe(true);
  });

  it("still runs full checks for real mints when bypass is enabled", async () => {
    process.env.ALLOW_UNVERIFIED_MINTS = "true";
    const result = await verifyPumpMintForWallet(
      mint.publicKey.toBase58(),
      creator.publicKey.toBase58(),
      async () => null,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("not_pump");
  });

  it("accepts real mints with full checks even when bypass is enabled", async () => {
    process.env.ALLOW_UNVERIFIED_MINTS = "true";
    const result = await verifyPumpMintForWallet(
      mint.publicKey.toBase58(),
      creator.publicKey.toBase58(),
      pumpFetcher,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.bypassed).toBeFalsy();
      expect(result.bondingCurve).toBe(curvePda.toBase58());
    }
  });
});
