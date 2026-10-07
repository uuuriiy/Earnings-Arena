import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/db";
import { serialize } from "@/shared/lib/serialize";
import { QuoteTicker } from "@/features/market/components/QuoteTicker";
import { Card, CardContent } from "@/shared/ui/card";

export const revalidate = 30;

interface CoinPageProps {
  params: Promise<{ mint: string }>;
}

type CoinView = {
  mint: string;
  symbol: string;
  name: string;
  stockTicker: string;
  stockPinnedPrice: number;
  earningsAt: string;
  treasuryBalance: string;
};

type HistoryDuel = {
  id: string;
  status: string;
  sideA: { symbol: string };
  sideB?: { symbol: string } | null;
};

export default async function CoinPage({ params }: CoinPageProps) {
  const { mint } = await params;
  const coin = await prisma.coin.findUnique({ where: { mint } });
  if (!coin) notFound();


  const c = serialize<CoinView>(coin);


  const duels = serialize<HistoryDuel[]>(
    await prisma.duel.findMany({
      where: {
        OR: [{ sideACoinId: coin.id }, { sideBCoinId: coin.id }],
      },
      include: { sideA: true, sideB: true, winner: true },
      orderBy: { createdAt: "desc" },
    }),
  );

  return (
    <>
      <h1 className="m-0 font-[family-name:var(--font-display)] text-[clamp(2.5rem,8vw,4.5rem)] tracking-[0.04em]">
        ${c.symbol}
      </h1>
      <p className="text-muted-foreground">{c.name}</p>

      <Card className="mt-6 p-5">
        <CardContent className="grid gap-6 p-0 sm:grid-cols-2">
          <QuoteTicker ticker={c.stockTicker} />
          <div className="font-mono text-sm">
            <div className="text-muted-foreground">Pinned at</div>
            <div>${c.stockPinnedPrice.toFixed(2)}</div>
            <div className="mt-3 text-muted-foreground">Earnings</div>
            <div>{new Date(c.earningsAt).toUTCString()}</div>
            <div className="mt-3 text-muted-foreground">Treasury</div>
            <div>{(Number(c.treasuryBalance) / 1e9).toFixed(4)} SOL</div>
          </div>
        </CardContent>
      </Card>

      <a
        href={`https://pump.fun/coin/${c.mint}`}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-block text-primary hover:underline"
      >
        Open on Pump.fun →
      </a>

      <h2 className="mt-10 font-[family-name:var(--font-display)] text-[1.8rem] tracking-[0.05em]">
        DUEL HISTORY
      </h2>
      <ul className="grid list-none gap-3 p-0">
        {duels.map((d) => (
          <li key={d.id}>
            <Link
              href={`/duel/${d.id}`}
              className="block border-b border-border py-2 hover:text-primary"
            >
              ${d.sideA.symbol} vs {d.sideB ? `$${d.sideB.symbol}` : "OPEN"} · {d.status}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
