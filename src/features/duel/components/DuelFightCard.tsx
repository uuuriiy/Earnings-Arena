import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { isDemoMint, isLikelyOnchainMint } from "@/shared/lib/solana/mint";
import type { DuelPageModel, DuelSideView } from "@/features/duel/server/view";
import { QuoteTicker } from "@/features/market/components/QuoteTicker";
import { Countdown } from "@/shared/ui/Countdown";

export function DuelFightCard({ model }: { model: DuelPageModel }) {
  const {
    duel,
    potSol,
    feeSol,
    feeEventCount,
    timerTarget,
    escrow,
    reportLabel,
    settleLabel,
  } = model;
  const { sideA, sideB, moveAPct, moveBPct, status, vaultPubkey } = duel;

  return (
    <>
      <section className="mt-5 border border-border bg-[var(--bg-1)]/70 p-5 md:p-8">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_auto_1fr]">
          <Side
            side={sideA}
            move={moveAPct}
            pumpVerified={Boolean(sideA.pumpVerifiedAt)}
          />

          <div className="flex flex-col items-center text-center">
            <div className="font-display text-4xl text-danger md:text-5xl">VS</div>
            <div className="mt-5">
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {status === "settling" ? "Settles in" : "Earnings in"}
              </div>
              <Countdown target={timerTarget ?? null} />
            </div>
            <div
              className={cn(
                "mt-6 border px-4 py-3 font-mono",
                escrow ? "border-ok/50 text-ok" : "border-primary/50 text-primary",
              )}
            >
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Pot
              </div>
              <div className="text-2xl font-semibold tracking-tight">
                {potSol.toFixed(4)}{" "}
                <span className="text-sm text-muted-foreground">SOL</span>
              </div>
            </div>
            {vaultPubkey && escrow && (
              <a
                className="mt-2 font-mono text-[10px] text-primary underline"
                href={`https://explorer.solana.com/address/${vaultPubkey}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
              >
                vault {vaultPubkey.slice(0, 4)}…{vaultPubkey.slice(-4)}
              </a>
            )}
          </div>

          {sideB ? (
            <Side
              side={sideB}
              fallbackEarningsAt={sideA.earningsAt}
              move={moveBPct}
              align="right"
              pumpVerified={Boolean(sideB.pumpVerifiedAt)}
            />
          ) : (
            <div className="border border-dashed border-border p-6 text-right">
              <p className="font-display text-3xl tracking-[0.05em] text-muted-foreground">
                OPEN
              </p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Awaiting rival
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-3 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <TapeCell label="Report" value={reportLabel} />
        <TapeCell label="Settle" value={settleLabel} />
        <TapeCell
          label="Fees credited"
          value={`${feeSol.toFixed(4)} SOL (${feeEventCount} evt)`}
        />
        <TapeCell
          label="Pot mode"
          value={escrow ? "On-chain vault" : "Arena ledger"}
        />
      </section>
    </>
  );
}

function TapeCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-0)] px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-xs text-foreground/90">{value}</div>
    </div>
  );
}

function Side({
  side,
  fallbackEarningsAt,
  move,
  align = "left",
  pumpVerified = false,
}: {
  side: DuelSideView;
  fallbackEarningsAt?: string;
  move?: number | null;
  align?: "left" | "right";
  pumpVerified?: boolean;
}) {
  const { mint, symbol, stockTicker: ticker } = side;
  const earningsAt = side.earningsAt ?? fallbackEarningsAt ?? "";
  const demo = !pumpVerified && isDemoMint(mint);
  const onPump = pumpVerified || (!demo && isLikelyOnchainMint(mint));

  return (
    <div className={cn(align === "right" ? "text-right" : "text-left")}>
      <Link
        href={`/coin/${mint}`}
        className="font-display text-[clamp(2rem,5vw,2.75rem)] tracking-[0.04em] hover:text-primary"
      >
        ${symbol}
      </Link>
      <div className="mt-1 font-mono text-xs text-muted-foreground">
        {ticker} · earnings {earningsAt ? new Date(earningsAt).toLocaleString() : "—"}
      </div>
      <div
        className={cn(
          "mt-3 flex",
          align === "right" ? "justify-end" : "justify-start",
        )}
      >
        <QuoteTicker ticker={ticker} />
      </div>
      {move != null && (
        <div className="mt-2 font-mono text-sm text-muted-foreground">
          settled move {move.toFixed(2)}%
        </div>
      )}
      {pumpVerified && (
        <div
          className={cn(
            "mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ok",
            align === "right" && "text-right",
          )}
        >
          Verified Pump creator
        </div>
      )}
      {onPump ? (
        <a
          href={`https://pump.fun/coin/${mint}`}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "mt-4 inline-flex border border-primary/50 px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-primary hover:bg-primary hover:text-[#111]",
            align === "right" && "ml-auto",
          )}
        >
          Trade on Pump
        </a>
      ) : (
        <div
          className={cn(
            "mt-4 inline-block border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground",
            align === "right" && "float-right",
          )}
        >
          Not on Pump.fun
        </div>
      )}
    </div>
  );
}
