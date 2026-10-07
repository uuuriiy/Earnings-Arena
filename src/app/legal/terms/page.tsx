import Link from "next/link";
import { Button } from "@/shared/ui/button";

const SECTIONS = [
  {
    code: "01",
    title: "The service",
    body: "Earnings Arena lets users pin Pump.fun memecoins to sub-$5 equities and run earnings duels. Pots may be held in an on-chain escrow vault once enabled; until then pots may be tracked as an arena ledger only.",
  },
  {
    code: "02",
    title: "Eligibility",
    body: "You must be able to lawfully use Solana wallets and access US equity market data in your jurisdiction. The Arena may geoblock or refuse service at its discretion.",
  },
  {
    code: "03",
    title: "Risks",
    body: "Memecoins and earnings volatility can result in total loss. Smart contracts and keepers can fail. See also",
    link: { href: "/legal/risk", label: "Risk disclosure" },
  },
  {
    code: "04",
    title: "No advice",
    body: "Nothing on this site is investment, legal, or tax advice. Settlements use third-party market data and automated rules; they are not a brokerage or exchange listing.",
  },
];

export default function TermsPage() {
  return (
    <div className="pb-16">
      <header className="border border-border bg-[var(--bg-1)]/70">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-5 md:px-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Legal
            </p>
            <h1 className="mt-2 font-display text-[clamp(2.75rem,8vw,4.5rem)] leading-none tracking-[0.05em]">
              TERMS OF USE
            </h1>
          </div>
          <span className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Template
          </span>
        </div>
        <p className="px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground md:px-8">
          Last updated 7 Oct 2026 · Counsel review before mainnet
        </p>
      </header>

      <section className="mt-3 grid gap-px border border-border bg-border">
        {SECTIONS.map((section) => (
          <div
            key={section.code}
            className="grid gap-3 border-l-2 border-l-border bg-[var(--bg-0)] px-5 py-5 md:grid-cols-[4rem_1fr] md:px-8"
          >
            <div className="font-mono text-xs text-muted-foreground">{section.code}</div>
            <div>
              <h2 className="font-display text-2xl tracking-[0.06em]">{section.title}</h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {section.body}
                {"link" in section && section.link ? (
                  <>
                    {" "}
                    <Link
                      href={section.link.href}
                      className="text-primary underline underline-offset-2"
                    >
                      {section.link.label}
                    </Link>
                    .
                  </>
                ) : null}
              </p>
            </div>
          </div>
        ))}
      </section>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="max-w-md font-mono text-xs text-muted-foreground">
          This page is a launch template. Replace with counsel-approved terms before mainnet
          capital.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/legal/risk">Risk disclosure</Link>
          </Button>
          <Button asChild variant="arenaGhost" size="sm">
            <Link href="/">Back to Arena</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
