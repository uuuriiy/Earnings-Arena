import { prisma } from "@/shared/lib/db";

export class AuthzError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

export async function requireCoinOwner(coinId: string, walletAddress: string) {
  const coin = await prisma.coin.findUnique({ where: { id: coinId } });
  if (!coin) throw new AuthzError("Coin not found", 404);
  if (coin.creatorWallet !== walletAddress) {
    throw new AuthzError("Not the coin owner");
  }
  return coin;
}

export function assertSameWallet(expected: string, actual: string) {
  if (expected !== actual) {
    throw new AuthzError("Wallet mismatch");
  }
}

export function jsonError(err: unknown, fallback = "Request failed") {
  if (err instanceof AuthzError) {
    return { body: { error: err.message }, status: err.status };
  }
  if (err instanceof Error && "status" in err) {
    const status = (err as Error & { status: number }).status;
    return { body: { error: err.message }, status };
  }
  const message = err instanceof Error ? err.message : fallback;
  return { body: { error: message }, status: 400 };
}
