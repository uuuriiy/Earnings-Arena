import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const RISKS = [
  {
    code: "01",
    title: "Market risk",
    body: "Pinned stocks and memecoins can gap; absolute-% rules can produce unexpected winners or voids when quotes are missing.",
    tone: "danger" as const,
  },
  {
    code: "02",
    title: "Smart contract / escrow risk",
    body: "Vault programs, keeper keys, and fee indexers may be buggy, paused, or exploited.",
    tone: "danger" as const,
  },
  {
    code: "03",
    title: "Oracle / data risk",
    body: "Finnhub (or other) prints may lag or disagree with your broker tape.",
    tone: "muted" as const,
  },
  {
    code: "04",
    title: "Fee ingest risk",
    body: "Pump fee indexing can miss trades; pots may under-credit until replayed.",
    tone: "muted" as const,
  },
  {
    code: "05",
    title: "Regulatory risk",
    body: "Products that combine crypto and securities narratives may be restricted where you live.",
    tone: "danger" as const,
  },
];

export default function RiskPage() {
  return (
    <div className="pb-16">
      <header className="border border-border bg-[var(--bg-1)]/70">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-danger/40 px-5 py-5 md:px-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-danger">
              Read before you lock
            </p>
            <h1 className="mt-2 font-display text-[clamp(2.75rem,8vw,4.5rem)] leading-none tracking-[0.05em]">
              RISK DISCLOSURE
            </h1>
          </div>
          <span className="border border-danger/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-danger">
            Capital at risk
          </span>
        </div>
        <p className="px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground md:px-8">
          Not financial advice · Mainnet capital at risk
        </p>
      </header>

      <section className="mt-3 grid gap-px border border-border bg-border">
        {RISKS.map((risk) => (
          <div
            key={risk.code}
            className={cn(
              "grid gap-3 bg-[var(--bg-0)] px-5 py-5 md:grid-cols-[4rem_1fr] md:px-8",
              risk.tone === "danger"
                ? "border-l-2 border-l-danger/70"
                : "border-l-2 border-l-border",
            )}
          >
            <div className="font-mono text-xs text-muted-foreground">{risk.code}</div>
            <div>
              <h2 className="font-display text-2xl tracking-[0.06em] text-foreground">
                {risk.title}
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {risk.body}
              </p>
            </div>
          </div>
        ))}
      </section>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="max-w-md font-mono text-xs text-muted-foreground">
          By locking a bout you accept settlement rules, data lag, and possible total loss of
          staked capital.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/how-it-works">How it works</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/legal/terms">Terms of Use</Link>
          </Button>
          <Button asChild variant="arenaGhost" size="sm">
            <Link href="/">Back to Arena</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
