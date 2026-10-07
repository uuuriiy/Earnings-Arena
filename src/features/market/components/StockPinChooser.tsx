"use client";

import type { EligiblePin } from "@/features/market/api/stocks";
import { useStockPinChooser } from "@/features/market/hooks/useStockPinChooser";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

export function StockPinChooser({
  selectedTicker,
  onPick,
}: {
  selectedTicker: string;
  onPick: (pin: EligiblePin) => void;
}) {
  const {
    filter,
    setFilter,
    pins,
    isLoading,
    isError,
    errorMessage,
  } = useStockPinChooser(selectedTicker);

  return (
    <div className="grid gap-3">
      <div>
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Eligible stocks
        </p>
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter ticker…"
          aria-label="Filter eligible stocks"
        />
      </div>

      {isLoading && (
        <p className="font-mono text-xs text-muted-foreground">Loading under-$5 earnings…</p>
      )}
      {isError && (
        <p className="font-mono text-xs text-danger">{errorMessage}</p>
      )}

      {!isLoading && !isError && pins.length === 0 && (
        <p className="border border-dashed border-border px-4 py-6 text-center font-mono text-xs text-muted-foreground">
          No sub-$5 names with earnings in 14 days right now.
        </p>
      )}

      <ul className="max-h-64 overflow-y-auto border border-border">
        {pins.map((pin) => {
          const selected = selectedTicker.toUpperCase() === pin.ticker;
          return (
            <li key={`${pin.ticker}-${pin.earningsDate}`}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onPick(pin)}
                className={cn(
                  "h-auto w-full items-center justify-between gap-3 rounded-none border-0 border-b border-border px-3 py-2.5 text-left last:border-b-0",
                  selected
                    ? "bg-primary text-[#111] hover:bg-primary hover:text-[#111]"
                    : "hover:bg-[var(--bg-2)] hover:text-foreground",
                )}
              >
                <span>
                  <span className="font-display text-xl tracking-[0.06em]">
                    {pin.ticker}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block font-mono text-[10px] uppercase tracking-widest",
                      selected ? "text-[#111]/80" : "text-muted-foreground",
                    )}
                  >
                    ${pin.price.toFixed(2)} · {pin.earningsDate} {pin.earningsHour}
                  </span>
                </span>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-widest",
                    selected ? "text-[#111]/80" : "text-muted-foreground",
                  )}
                >
                  → {pin.suggestedSymbol}
                </span>
              </Button>
            </li>
          );
        })}
      </ul>
      <p className="font-mono text-[10px] text-muted-foreground">
        Pick fills stock + suggests coin ticker/name. You can still edit below.
      </p>
    </div>
  );
}
