import { describe, expect, it } from "vitest";
import { checkEligibility } from "./eligibility";

describe("checkEligibility", () => {
  const now = new Date("2026-10-07T12:00:00Z");

  it("accepts sub-$5 stock with earnings within 14 days", () => {
    const result = checkEligibility({
      stockPrice: 4.99,
      earningsAt: new Date("2026-10-14T12:00:00Z"),
      now,
    });
    expect(result).toEqual({ ok: true });
  });

  it("rejects stock at or above $5", () => {
    const result = checkEligibility({
      stockPrice: 5,
      earningsAt: new Date("2026-10-14T12:00:00Z"),
      now,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects earnings beyond 14 days", () => {
    const result = checkEligibility({
      stockPrice: 2,
      earningsAt: new Date("2026-10-30T12:00:00Z"),
      now,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects past earnings", () => {
    const result = checkEligibility({
      stockPrice: 2,
      earningsAt: new Date("2026-10-01T12:00:00Z"),
      now,
    });
    expect(result.ok).toBe(false);
  });
});
