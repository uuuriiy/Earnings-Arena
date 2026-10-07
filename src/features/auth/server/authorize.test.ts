import { describe, expect, it } from "vitest";
import { AuthzError, assertSameWallet, jsonError } from "./authorize";

describe("authorize helpers", () => {
  it("assertSameWallet throws 403 on mismatch", () => {
    expect(() => assertSameWallet("A", "B")).toThrow(AuthzError);
    try {
      assertSameWallet("A", "B");
    } catch (e) {
      expect(e).toBeInstanceOf(AuthzError);
      expect((e as AuthzError).status).toBe(403);
    }
  });

  it("jsonError maps AuthzError status", () => {
    const { body, status } = jsonError(new AuthzError("Nope", 403));
    expect(status).toBe(403);
    expect(body).toEqual({ error: "Nope" });
  });

  it("jsonError maps session 401", () => {
    const err = new Error("Unauthorized") as Error & { status: number };
    err.status = 401;
    const { body, status } = jsonError(err);
    expect(status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });
});
