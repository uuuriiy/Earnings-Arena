import { describe, expect, it } from "vitest";
import { suggestCoinFields } from "./eligible";

describe("suggestCoinFields", () => {
  it("builds meme ticker and arena name", () => {
    expect(suggestCoinFields("TLRY")).toEqual({
      suggestedSymbol: "TLRYMEME",
      suggestedName: "TLRY Arena",
    });
  });

  it("truncates long tickers for symbol max 16", () => {
    const { suggestedSymbol } = suggestCoinFields("ABCDEFGH");
    expect(suggestedSymbol.length).toBeLessThanOrEqual(16);
    expect(suggestedSymbol.endsWith("MEME") || suggestedSymbol.includes("MEME")).toBe(
      true,
    );
  });
});
