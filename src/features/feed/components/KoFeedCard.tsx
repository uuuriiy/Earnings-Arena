import Link from "next/link";
import type { FeedLog } from "@/features/feed/server/service";
import { SettlementKO } from "@/features/duel/components/SettlementKO";

export function KoFeedCard({ log }: { log: FeedLog }) {
  const potSol = Number(log.duel.potLamports) / 1e9;

  return (
    <article className="border border-border bg-[var(--bg-1)]/70 p-5">
      <div className="font-mono text-xs text-muted-foreground">
        {new Date(log.createdAt).toUTCString()}
      </div>
      <Link
        href={`/duel/${log.duel.id}`}
        className="mt-1 block font-display text-[1.75rem] tracking-[0.05em] hover:text-primary"
      >
        ${log.duel.sideA.symbol} vs{" "}
        {log.duel.sideB ? `$${log.duel.sideB.symbol}` : "?"}
      </Link>
      <SettlementKO
        winnerSymbol={log.duel.winner?.symbol}
        moveA={log.duel.moveAPct}
        moveB={log.duel.moveBPct}
      />
      <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs text-muted-foreground">
        <span>pot {potSol.toFixed(4)} SOL</span>
        {log.duel.settleTxSig && (
          <a
            className="text-primary underline"
            href={`https://explorer.solana.com/tx/${log.duel.settleTxSig}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
          >
            settle tx
          </a>
        )}
      </div>
    </article>
  );
}
