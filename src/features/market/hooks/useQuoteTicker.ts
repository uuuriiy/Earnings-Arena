"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuote, quoteKeys } from "@/features/market/api/quotes";

export function useQuoteTicker(ticker: string) {
  const { data: quote, dataUpdatedAt, isLoading } = useQuery({
    queryKey: quoteKeys.ticker(ticker),
    queryFn: () => getQuote(ticker),
    refetchInterval: 15_000,
  });

  return {
    quote,
    dataUpdatedAt,
    isLoading,
    up: quote ? quote.changePct >= 0 : false,
  };
}
