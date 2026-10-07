import { cn } from "@/shared/lib/utils";

export function SettlementKO({
  winnerSymbol,
  moveA,
  moveB,
}: {
  winnerSymbol?: string | null;
  moveA?: number | null;
  moveB?: number | null;
}) {
  return (
    <div
      className={cn(
        "ko-reveal mt-6 border border-danger bg-danger/10 p-5 text-center",
      )}
    >
      <div className="font-[family-name:var(--font-display)] text-5xl tracking-[0.08em] text-danger">
        {winnerSymbol ? "KO" : "DRAW"}
      </div>
      <div className="font-mono text-muted-foreground">
        {winnerSymbol ? `Winner $${winnerSymbol}` : "Pot split 50/50"}
        {moveA != null && moveB != null && (
          <span>
            {" "}
            · {moveA.toFixed(2)}% vs {moveB.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}
