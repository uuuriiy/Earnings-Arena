import { headers } from "next/headers";
import { extractSolanaAddress, getPrivyClient } from "@/features/auth/server/privy";

export type SessionActor = {
  walletAddress: string;
  privyUserId: string;
};

export async function requireSession(): Promise<SessionActor> {
  const headerStore = await headers();
  const authorization = headerStore.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }

  const accessToken = authorization.slice("Bearer ".length).trim();
  if (!accessToken) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }

  try {
    const privy = getPrivyClient();
    const claims = await privy.utils().auth().verifyAccessToken(accessToken);
    const user = await privy.users()._get(claims.user_id);
    const walletAddress = extractSolanaAddress(user);
    if (!walletAddress) {
      const err = new Error("No Solana wallet linked");
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    return { walletAddress, privyUserId: claims.user_id };
  } catch (err) {
    if (err instanceof Error && "status" in err) throw err;
    const unauthorized = new Error("Unauthorized");
    (unauthorized as Error & { status: number }).status = 401;
    throw unauthorized;
  }
}

export function isAuthError(err: unknown): err is Error & { status: number } {
  return (
    err instanceof Error &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  );
}
