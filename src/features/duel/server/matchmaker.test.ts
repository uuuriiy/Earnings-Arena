import { describe, expect, it } from "vitest";
import { scoreRival, suggestRivals } from "./matchmaker";

const anchor = {
  id: "a",
  stockTicker: "SNDL",
  earningsAt: new Date("2026-10-10T20:00:00Z"),
  sector: "Cannabis",
};

describe("matchmaker", () => {
  it("scores same week + sector higher", () => {
    const same = scoreRival(anchor, {
      id: "b",
      stockTicker: "CGC",
      earningsAt: new Date("2026-10-09T20:00:00Z"),
      sector: "Cannabis",
    });
    const far = scoreRival(anchor, {
      id: "c",
      stockTicker: "FCEL",
      earningsAt: new Date("2026-10-20T20:00:00Z"),
      sector: "Energy",
    });
    expect(same.score).toBeGreaterThan(far.score);
  });

  it("excludes same ticker and same coin", () => {
    expect(
      scoreRival(anchor, { ...anchor, id: "x", stockTicker: "SNDL" }).score,
    ).toBe(-Infinity);
    expect(scoreRival(anchor, { ...anchor }).score).toBe(-Infinity);
  });

  it("returns top suggestions", () => {
    const pool = [
      {
        id: "b",
        stockTicker: "CGC",
        earningsAt: new Date("2026-10-10T21:00:00Z"),
        sector: "Cannabis",
      },
      {
        id: "c",
        stockTicker: "XYZ",
        earningsAt: new Date("2026-11-01T20:00:00Z"),
        sector: "Tech",
      },
    ];
    const suggestions = suggestRivals(anchor, pool, 5);
    expect(suggestions[0]?.coinId).toBe("b");
    expect(suggestions.every((s) => s.coinId !== "c" || s.score > 0)).toBe(true);
  });
});
