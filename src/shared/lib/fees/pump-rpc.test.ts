import { describe, expect, it } from "vitest";
import { Keypair, PublicKey } from "@solana/web3.js";
import { PUMP_PROGRAM_ID } from "@/features/launch/server/verify";
import { creatorVaultFeeDelta, creatorVaultPda } from "./pump-rpc";

describe("creatorVaultFeeDelta", () => {
  it("returns positive vault growth only", () => {
    expect(creatorVaultFeeDelta(1_000_000, 1_500_000)).toBe(500_000n);
    expect(creatorVaultFeeDelta(2_000_000, 1_000_000)).toBe(0n);
    expect(creatorVaultFeeDelta(100, 100)).toBe(0n);
  });
});

describe("creatorVaultPda", () => {
  it("derives a stable PDA under the Pump program", () => {
    const creator = Keypair.generate().publicKey;
    const [pda, bump] = creatorVaultPda(creator);
    expect(pda).toBeInstanceOf(PublicKey);
    expect(bump).toBeGreaterThanOrEqual(0);
    const [again] = creatorVaultPda(creator);
    expect(again.equals(pda)).toBe(true);

    const [expected] = PublicKey.findProgramAddressSync(
      [Buffer.from("creator-vault"), creator.toBuffer()],
      PUMP_PROGRAM_ID,
    );
    expect(pda.equals(expected)).toBe(true);
  });
});
