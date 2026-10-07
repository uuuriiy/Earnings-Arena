import { describe, expect, it } from "vitest";
import type { User } from "@privy-io/node";
import { extractSolanaAddress } from "./privy";

describe("extractSolanaAddress", () => {
  it("returns the first Solana wallet address", () => {
    const user = {
      id: "did:privy:test",
      linked_accounts: [
        { type: "email", address: "a@b.com" },
        {
          type: "wallet",
          chain_type: "solana",
          address: "So11111111111111111111111111111111111111112",
        },
      ],
    } as unknown as User;

    expect(extractSolanaAddress(user)).toBe(
      "So11111111111111111111111111111111111111112",
    );
  });

  it("returns null when no Solana wallet is linked", () => {
    const user = {
      id: "did:privy:test",
      linked_accounts: [{ type: "email", address: "a@b.com" }],
    } as unknown as User;

    expect(extractSolanaAddress(user)).toBeNull();
  });
});
