import { apiGet } from "@/shared/lib/api/http";

export type Quote = {
  ticker: string;
  price: number;
  changePct: number;
  source: string;
};

export const quoteKeys = {
  ticker: (ticker: string) => ["quotes", ticker] as const,
};

export async function getQuote(ticker: string) {
  const data = await apiGet<{ quotes: Quote[] }>("/api/quotes", {
    params: { tickers: ticker },
  });
  return data.quotes?.[0] ?? null;
}
