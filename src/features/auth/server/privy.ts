import { PrivyClient, type User } from "@privy-io/node";

let client: PrivyClient | null = null;

export function getPrivyClient() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("Privy is not configured (NEXT_PUBLIC_PRIVY_APP_ID / PRIVY_APP_SECRET)");
  }
  if (!client) {
    client = new PrivyClient({
      appId,
      appSecret,
      jwtVerificationKey: process.env.PRIVY_JWT_VERIFICATION_KEY,
    });
  }
  return client;
}

export function extractSolanaAddress(user: User): string | null {
  const account = user.linked_accounts.find(
    (a) =>
      (a.type === "wallet" || a.type === "smart_wallet") &&
      "chain_type" in a &&
      a.chain_type === "solana" &&
      "address" in a &&
      typeof a.address === "string",
  );
  return account && "address" in account ? account.address : null;
}
