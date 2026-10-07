import { apiPost } from "@/shared/lib/api/http";

export type CreateCoinInput = {
  mint: string;
  symbol: string;
  name: string;
  stockTicker: string;
  sector?: string;
  autoMarket?: boolean;
};

export type Coin = {
  id: string;
  mint: string;
  symbol: string;
  name: string;
};

export type VerifyMintResult = {
  ok: true;
  creator: string;
  complete: boolean;
  bondingCurve: string;
  bypassed: boolean;
};

export function createCoin(input: CreateCoinInput) {
  return apiPost<Coin>("/api/coins", input);
}

export function verifyMint(mint: string) {
  return apiPost<VerifyMintResult>("/api/coins/verify", { mint });
}
