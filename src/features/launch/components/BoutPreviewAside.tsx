export function BoutPreviewAside({
  symbol,
  stockTicker,
}: {
  symbol?: string;
  stockTicker?: string;
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 border border-dashed border-border/80 bg-[var(--bg-1)]/40 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Bout preview
        </p>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 font-display text-3xl tracking-[0.05em]">
          <div>
            {symbol ? `$${symbol.toUpperCase()}` : "$COIN"}
            <div className="font-mono text-xs font-normal tracking-normal text-muted-foreground">
              {stockTicker ? stockTicker.toUpperCase() : "TICKER"}
            </div>
          </div>
          <div className="text-danger">VS</div>
          <div className="text-right text-muted-foreground">
            OPEN
            <div className="font-mono text-xs font-normal tracking-normal">
              awaiting rival
            </div>
          </div>
        </div>
        <p className="mt-6 font-mono text-xs text-muted-foreground">
          After connect you’ll pin a mint, lock a stock under $5, and open the floor.
        </p>
      </div>
    </aside>
  );
}
