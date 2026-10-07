"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEligiblePins, stockKeys } from "@/features/market/api/stocks";

export function useStockPinChooser(selectedTicker: string) {
  const [filter, setFilter] = useState("");
  const query = useQuery({
    queryKey: stockKeys.eligible,
    queryFn: getEligiblePins,
    staleTime: 5 * 60_000,
  });

  const pins = useMemo(() => {
    const list = query.data?.pins ?? [];
    const q = filter.trim().toUpperCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.ticker.includes(q) ||
        p.suggestedSymbol.includes(q) ||
        p.suggestedName.toUpperCase().includes(q),
    );
  }, [query.data?.pins, filter]);

  return {
    filter,
    setFilter,
    pins,
    selectedTicker,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error
        ? query.error.message
        : "Could not load eligible stocks",
  };
}
