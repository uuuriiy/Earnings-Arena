import { describe, expect, it } from "vitest";
import { createCoinSchema } from "@/features/launch/validation/coins";
import { challengeDuelSchema, createDuelSchema } from "./duels";

describe("validation schemas", () => {
  it("accepts a valid create coin payload", () => {
    const parsed = createCoinSchema.parse({
      mint: "MintA1111111111111111111111111111111111111",
      symbol: "TEST",
      name: "Test Coin",
      stockTicker: "SNDL",
      autoMarket: true,
    });
    expect(parsed.symbol).toBe("TEST");
  });

  it("rejects short mint", () => {
    expect(() =>
      createCoinSchema.parse({
        mint: "short",
        symbol: "TEST",
        name: "Test",
        stockTicker: "SNDL",
      }),
    ).toThrow();
  });

  it("requires cuid for duel ids", () => {
    expect(() => createDuelSchema.parse({ sideACoinId: "not-a-cuid" })).toThrow();
    expect(() =>
      challengeDuelSchema.parse({ sideBCoinId: "also-bad" }),
    ).toThrow();
  });
});
