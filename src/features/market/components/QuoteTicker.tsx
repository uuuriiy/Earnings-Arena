"use client";

import { cn } from "@/shared/lib/utils";
import { useQuoteTicker } from "@/features/market/hooks/useQuoteTicker";

export function QuoteTicker({ ticker }: { ticker: string }) {
  const { quote, dataUpdatedAt, isLoading, up } = useQuoteTicker(ticker);

  if (isLoading || !quote) {
    return <span className="font-mono text-muted-foreground">loading…</span>;
  }

  return (
    <div key={dataUpdatedAt} className="quote-tick font-mono">
      <div className="text-xs text-muted-foreground">{quote.ticker}</div>
      <div className="text-[1.35rem] font-semibold">${quote.price.toFixed(2)}</div>
      <div className={cn("text-sm", up ? "text-ok" : "text-danger")}>
        {up ? "+" : ""}
        {quote.changePct.toFixed(2)}%
        <span className="ml-2 text-muted-foreground">{quote.source}</span>
      </div>
    </div>
  );
}
