import Link from "next/link";
import { QuoteTicker } from "@/features/market/components/QuoteTicker";
import { Countdown } from "@/shared/ui/Countdown";
import { LedgerBadge } from "@/shared/ui/LedgerBadge";
import { Badge } from "@/shared/ui/badge";
import type { DuelCardData } from "@/features/home/components/DuelCard";

export function FeaturedBout({
  duel,
  escrow,
}: {
  duel: DuelCardData & {
    sideA: DuelCardData["sideA"] & { earningsAt?: string };
    vaultPubkey?: string | null;
  };
  escrow?: boolean;
}) {
  const potSol = Number(duel.potLamports) / 1e9;
  const timerTarget =
    duel.status === "settling" ? duel.settleAt : duel.sideA.earningsAt ?? null;

  return (
    <Link
      href={`/duel/${duel.id}`}
      className="block border border-border bg-[var(--bg-1)]/80 p-6 backdrop-blur-sm transition-colors hover:border-primary/50"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge>{duel.status}</Badge>
          <LedgerBadge escrow={escrow ?? Boolean(duel.vaultPubkey)} />
        </div>
        <div className="font-mono text-sm">
          pot <span className="text-primary">{potSol.toFixed(4)} SOL</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div>
          <div className="font-display text-[clamp(2rem,6vw,3.5rem)] tracking-[0.04em]">
            ${duel.sideA.symbol}
          </div>
          <div className="mt-2">
            <QuoteTicker ticker={duel.sideA.stockTicker} />
          </div>
        </div>
        <div className="text-center">
          <div className="font-display text-3xl text-danger">VS</div>
          {timerTarget && (
            <div className="mt-3">
              <div className="mb-1 font-mono text-[10px] text-muted-foreground">
                {duel.status === "settling" ? "SETTLES" : "EARNINGS"}
              </div>
              <Countdown target={timerTarget} />
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="font-display text-[clamp(2rem,6vw,3.5rem)] tracking-[0.04em]">
            {duel.sideB ? `$${duel.sideB.symbol}` : "OPEN"}
          </div>
          <div className="mt-2 flex justify-end">
            {duel.sideB ? (
              <QuoteTicker ticker={duel.sideB.stockTicker} />
            ) : (
              <span className="font-mono text-xs text-muted-foreground">
                awaiting rival
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
