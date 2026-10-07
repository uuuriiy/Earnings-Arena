import { describe, expect, it } from "vitest";
import {
  ACTIVE_DUEL_STATUSES,
  filterCoinsNotInActiveDuels,
  isActiveDuelStatus,
} from "./active";

describe("isActiveDuelStatus", () => {
  it("treats in-progress statuses as active", () => {
    for (const status of ACTIVE_DUEL_STATUSES) {
      expect(isActiveDuelStatus(status)).toBe(true);
    }
  });

  it("treats terminal statuses as inactive", () => {
    expect(isActiveDuelStatus("resolved")).toBe(false);
    expect(isActiveDuelStatus("voided")).toBe(false);
  });
});

describe("filterCoinsNotInActiveDuels", () => {
  it("drops coins already on either side of an active duel", () => {
    const available = filterCoinsNotInActiveDuels(
      ["a", "b", "c", "d"],
      [
        { sideACoinId: "a", sideBCoinId: "b", status: "awaiting_print" },
        { sideACoinId: "c", sideBCoinId: null, status: "open" },
      ],
    );
    expect(available).toEqual(["d"]);
  });

  it("ignores resolved/voided duels", () => {
    const available = filterCoinsNotInActiveDuels(
      ["a", "b"],
      [
        { sideACoinId: "a", sideBCoinId: "b", status: "resolved" },
        { sideACoinId: "a", sideBCoinId: null, status: "voided" },
      ],
    );
    expect(available).toEqual(["a", "b"]);
  });

  it("can ignore one duel id (the bout being challenged)", () => {
    const available = filterCoinsNotInActiveDuels(
      ["a", "b", "c"],
      [
        { id: "duel-1", sideACoinId: "a", sideBCoinId: null, status: "open" },
        { id: "duel-2", sideACoinId: "b", sideBCoinId: "c", status: "locked" },
      ],
      { excludeDuelId: "duel-1" },
    );
    expect(available).toEqual(["a"]);
  });
});
