import Link from "next/link";
import { Button } from "@/shared/ui/button";

const STEPS = [
  {
    code: "01",
    title: "Connect",
    body: "Sign in with Privy (Solana wallet or email). Your Solana address is the treasury that can receive pot payouts.",
  },
  {
    code: "02",
    title: "Pin",
    body: "Launch a coin on Pump.fun with the same wallet you connected here, then paste its mint. Arena checks on-chain that it is a Pump coin and that you are the bonding-curve creator — buying or holding someone else’s token does not qualify. After verify, pin a sub-$5 stock with earnings within 14 days.",
  },
  {
    code: "03",
    title: "Open bout",
    body: "Side A opens a duel lobby. The pot starts at 0 SOL — it is not a buy-in. Rivals can find the bout on the Arena board.",
  },
  {
    code: "04",
    title: "Challenge",
    body: "Side B connects and challenges with a Pump coin they created and pinned (Suggest my rivals only lists their verified pins). Side A then locks the bout.",
  },
  {
    code: "05",
    title: "Pot fills",
    body: "While the bout is locked / awaiting print / settling, Pump trading fees on both coins are credited into the pot (ledger today; on-chain vault when escrow is live).",
  },
  {
    code: "06",
    title: "Settle",
    body: "At the earnings report we snapshot prices; T+4h we snapshot again. Larger absolute % move wins. Tie within 0.1% splits. Missing quotes void and refund.",
  },
  {
    code: "07",
    title: "Payout",
    body: "The pot goes to the winner’s treasury. The KO feed shows the result. Watch Risk before you lock real capital.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="pb-16">
      <header className="border border-border bg-[var(--bg-1)]/70">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-primary/40 px-5 py-5 md:px-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              Playbook
            </p>
            <h1 className="mt-2 font-display text-[clamp(2.75rem,8vw,4.5rem)] leading-none tracking-[0.05em]">
              HOW IT WORKS
            </h1>
          </div>
          <span className="border border-primary/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
            7 steps
          </span>
        </div>
        <p className="px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground md:px-8">
          Pin → duel → fees → settle → payout
        </p>
      </header>

      <section className="mt-3 grid gap-px border border-border bg-border">
        {STEPS.map((step) => (
          <div
            key={step.code}
            className="grid gap-3 border-l-2 border-l-primary/40 bg-[var(--bg-0)] px-5 py-5 md:grid-cols-[4rem_1fr] md:px-8"
          >
            <div className="font-mono text-xs text-muted-foreground">{step.code}</div>
            <div>
              <h2 className="font-display text-2xl tracking-[0.06em]">{step.title}</h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </section>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="max-w-md font-mono text-xs text-muted-foreground">
          Two creators, two Pump coins, one earnings window. Bigger absolute stock move takes the
          pot.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="arena" size="sm">
            <Link href="/launch">Enter a coin</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/legal/risk">Risk</Link>
          </Button>
          <Button asChild variant="arenaGhost" size="sm">
            <Link href="/">Arena</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
