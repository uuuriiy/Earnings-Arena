/**
 * Heuristic: real Solana base58 pubkeys are typically 32–44 chars
 * and don't use our seed placeholders (MintA… / MintB…).
 */
export function isDemoMint(mint: string): boolean {
  if (!mint) return true;
  if (/^Mint[A-Z]/i.test(mint)) return true;
  if (mint.includes("11111111111111111111111111111111") && mint.startsWith("Mint")) {
    return true;
  }
  return !isLikelyOnchainMint(mint);
}

export function isLikelyOnchainMint(mint: string): boolean {
  if (mint.length < 32 || mint.length > 44) return false;
  // base58 alphabet (no 0, O, I, l)
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(mint);
}
