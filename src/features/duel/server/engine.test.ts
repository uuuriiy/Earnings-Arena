import { describe, expect, it } from "vitest";
import {
  acceptAdvancePlan,
  assertTransition,
  canTransition,
  percentMove,
  routePot,
  settleAtFromReport,
  settleDuel,
} from "./engine";

describe("percentMove", () => {
  it("computes percent change", () => {
    expect(percentMove(100, 110)).toBeCloseTo(10);
    expect(percentMove(100, 90)).toBeCloseTo(-10);
  });

  it("returns null for invalid base", () => {
    expect(percentMove(0, 10)).toBeNull();
  });
});

describe("settleDuel", () => {
  it("picks the larger absolute move as winner", () => {
    const result = settleDuel({
      priceA0: 1,
      priceA1: 1.2,
      priceB0: 2,
      priceB1: 2.1,
    });
    expect(result).toMatchObject({ outcome: "winner", winnerSide: "A" });
  });

  it("lets downside win on absolute move", () => {
    const result = settleDuel({
      priceA0: 1,
      priceA1: 0.7,
      priceB0: 2,
      priceB1: 2.05,
    });
    expect(result).toMatchObject({ outcome: "winner", winnerSide: "A" });
  });

  it("ties within 0.1% absolute difference", () => {
    const result = settleDuel({
      priceA0: 100,
      priceA1: 110,
      priceB0: 100,
      priceB1: 110.05,
    });
    expect(result.outcome).toBe("tie");
  });

  it("voids on missing quotes", () => {
    const result = settleDuel({
      priceA0: 1,
      priceA1: null,
      priceB0: 2,
      priceB1: 2.1,
    });
    expect(result.outcome).toBe("void");
  });
});

describe("settleAtFromReport", () => {
  it("adds 4 hours", () => {
    const report = new Date("2026-10-07T20:00:00Z");
    expect(settleAtFromReport(report).toISOString()).toBe("2026-10-08T00:00:00.000Z");
  });
});

describe("transitions", () => {
  it("allows open → locked → awaiting_print → settling → resolved", () => {
    expect(canTransition("open", "locked")).toBe(true);
    expect(canTransition("locked", "awaiting_print")).toBe(true);
    expect(canTransition("awaiting_print", "settling")).toBe(true);
    expect(canTransition("settling", "resolved")).toBe(true);
  });

  it("rejects illegal jumps", () => {
    expect(canTransition("open", "resolved")).toBe(false);
    expect(() => assertTransition("resolved", "open")).toThrow();
  });
});

describe("acceptAdvancePlan", () => {
  it("locks then advances from open", () => {
    expect(acceptAdvancePlan("open")).toEqual({
      lock: true,
      advance: true,
    });
  });

  it("is idempotent once past open", () => {
    expect(acceptAdvancePlan("locked")).toEqual({
      lock: false,
      advance: true,
    });
    expect(acceptAdvancePlan("awaiting_print")).toEqual({
      lock: false,
      advance: false,
    });
    expect(acceptAdvancePlan("settling")).toEqual({
      lock: false,
      advance: false,
    });
  });

  it("rejects voided", () => {
    expect(() => acceptAdvancePlan("voided")).toThrow(/voided/);
  });
});

describe("routePot", () => {
  it("sends full pot to winner A", () => {
    expect(
      routePot({
        potLamports: 100n,
        outcome: {
          outcome: "winner",
          winnerSide: "A",
          moveAPct: 10,
          moveBPct: 1,
        },
      }),
    ).toEqual({ sideA: 100n, sideB: 0n });
  });

  it("splits on tie", () => {
    expect(
      routePot({
        potLamports: 101n,
        outcome: { outcome: "tie", moveAPct: 5, moveBPct: 5 },
      }),
    ).toEqual({ sideA: 50n, sideB: 51n });
  });
});
