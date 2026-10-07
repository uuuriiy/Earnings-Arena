import { describe, expect, it } from "vitest";
import { stubFeeSignature } from "./indexer";

describe("stubFeeSignature", () => {
  it("includes duel, coin, and timestamp", () => {
    expect(stubFeeSignature("d1", "c1", 1000)).toBe("stub:d1:c1:1000");
    expect(stubFeeSignature("d1", "c1", 1001)).not.toBe(
      stubFeeSignature("d1", "c1", 1000),
    );
  });
});
