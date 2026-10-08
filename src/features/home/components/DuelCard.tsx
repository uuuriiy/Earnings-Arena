import Link from "next/link";
import { Countdown } from "@/shared/ui/Countdown";
import { Badge } from "@/shared/ui/badge";

export type DuelCardData = {
  id: string;
  status: string;
  potLamports: string | number;
  settleAt?: string | null;
  vaultPubkey?: string | null;
  sideA: { symbol: string; stockTicker: string; earningsAt?: string };
  sideB?: { symbol: string; stockTicker: string } | null;
};

export function DuelCard({ duel }: { duel: DuelCardData }) {
  const potSol = Number(duel.potLamports) / 1e9;
  const timerTarget =
    duel.status === "settling" ? duel.settleAt : duel.sideA.earningsAt ?? null;

  return (
    <Link
      href={`/duel/${duel.id}`}
      className="grid grid-cols-1 gap-3 border border-border bg-[var(--bg-2)]/40 px-4 py-3 transition-colors hover:border-primary/40 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:gap-4"
    >
      <div className="flex items-center justify-between gap-3 sm:contents">
        <Badge className="min-w-[7.5rem] justify-center">{duel.status}</Badge>
        <div className="font-display text-xl tracking-[0.05em] sm:hidden">
          ${duel.sideA.symbol}
          <span className="mx-2 text-danger">VS</span>
          {duel.sideB ? `$${duel.sideB.symbol}` : "OPEN"}
        </div>
      </div>

      <div className="hidden font-display text-xl tracking-[0.05em] sm:block">
        ${duel.sideA.symbol}
        <span className="mx-2 text-danger">VS</span>
        {duel.sideB ? `$${duel.sideB.symbol}` : "OPEN"}
        <div className="font-mono text-[10px] font-normal tracking-normal text-muted-foreground">
          {duel.sideA.stockTicker}
          {duel.sideB ? ` · ${duel.sideB.stockTicker}` : " · waiting"}
        </div>
      </div>

      <div className="font-mono text-[10px] text-muted-foreground sm:hidden">
        {duel.sideA.stockTicker}
        {duel.sideB ? ` · ${duel.sideB.stockTicker}` : " · waiting"}
      </div>

      <div className="flex items-center justify-between gap-3 sm:contents">
        <div className="font-mono text-sm sm:text-right">
          {potSol.toFixed(4)}
          <span className="text-muted-foreground"> SOL</span>
        </div>
        <div className="min-w-[5.5rem] text-right">
          {timerTarget ? (
            <Countdown target={timerTarget} />
          ) : (
            <span className="font-mono text-xs text-muted-foreground">—</span>
          )}
        </div>
      </div>
    </Link>
  );
}
