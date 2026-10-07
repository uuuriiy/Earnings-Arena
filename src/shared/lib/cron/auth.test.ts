import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { authorizeCron, isProductionLike } from "./auth";

const env = process.env as Record<string, string | undefined>;
const prevSecret = env.CRON_SECRET;
const prevNodeEnv = env.NODE_ENV;
const prevVercel = env.VERCEL;

beforeEach(() => {
  env.NODE_ENV = "test";
  delete env.VERCEL;
  env.CRON_SECRET = "test-secret";
});

afterEach(() => {
  if (prevSecret === undefined) delete env.CRON_SECRET;
  else env.CRON_SECRET = prevSecret;
  if (prevNodeEnv === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = prevNodeEnv;
  if (prevVercel === undefined) delete env.VERCEL;
  else env.VERCEL = prevVercel;
});

function req(auth?: string) {
  return new Request("http://localhost/api/cron/settle", {
    headers: auth ? { authorization: auth } : {},
  });
}

describe("isProductionLike", () => {
  it("is true when VERCEL=1", () => {
    env.VERCEL = "1";
    expect(isProductionLike()).toBe(true);
  });
});

describe("authorizeCron", () => {
  it("accepts matching bearer secret", () => {
    expect(authorizeCron(req("Bearer test-secret"))).toEqual({ ok: true });
  });

  it("rejects missing or wrong bearer", () => {
    expect(authorizeCron(req()).ok).toBe(false);
    expect(authorizeCron(req("Bearer wrong")).ok).toBe(false);
  });

  it("rejects when secret unset", () => {
    delete env.CRON_SECRET;
    const result = authorizeCron(req("Bearer x"));
    expect(result).toEqual({
      ok: false,
      status: 401,
      error: "CRON_SECRET is not configured",
    });
  });

  it("requires secret on production-like hosts", () => {
    env.VERCEL = "1";
    delete env.CRON_SECRET;
    const result = authorizeCron(req("Bearer x"));
    expect(result).toEqual({
      ok: false,
      status: 500,
      error: "CRON_SECRET is required in production",
    });
  });
});
