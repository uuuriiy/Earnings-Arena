import Link from "next/link";
import { DuelCard, type DuelCardData } from "@/features/home/components/DuelCard";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type Bout = DuelCardData & {
  sideA: DuelCardData["sideA"] & { earningsAt?: string };
};

function countByStatus(duels: Bout[]) {
  const counts = { open: 0, locked: 0, settling: 0, other: 0 };
  for (const d of duels) {
    if (d.status === "open") counts.open += 1;
    else if (d.status === "locked" || d.status === "awaiting_print") counts.locked += 1;
    else if (d.status === "settling") counts.settling += 1;
    else counts.other += 1;
  }
  return counts;
}

export function BoutBoard({
  board,
  featuredId,
}: {
  board: Bout[];
  featuredId?: string | null;
}) {
  const allForCounts = board;
  const counts = countByStatus(allForCounts);
  const total = board.length;
  const onlyFeatured = total === 0 && Boolean(featuredId);

  return (
    <section className="pb-16">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl tracking-[0.06em]">BOUT BOARD</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {onlyFeatured ? (
              <>1 featured · board clear</>
            ) : (
              <>
                {total} listed · {counts.open} open · {counts.locked} locked ·{" "}
                {counts.settling} settling
              </>
            )}
          </p>
        </div>
        {!onlyFeatured && total > 0 && (
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["open", counts.open],
                ["locked", counts.locked],
                ["settling", counts.settling],
              ] as const
            ).map(([label, n]) => (
              <span
                key={label}
                className={cn(
                  "border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                  label === "open" && "border-primary/40 text-primary",
                  label === "locked" && "border-border text-muted-foreground",
                  label === "settling" && "border-danger/40 text-danger",
                )}
              >
                {label} {n}
              </span>
            ))}
          </div>
        )}
      </div>

      {onlyFeatured && (
        <div className="border border-border/80 bg-[var(--bg-2)]/30 px-4 py-3 font-mono text-sm text-muted-foreground">
          You’re looking at the only live bout ↑ — open another to fill the board.
          <div className="mt-3">
            <Button asChild variant="arenaGhost" size="sm">
              <Link href="/launch">Enter a coin</Link>
            </Button>
          </div>
        </div>
      )}

      {!featuredId && total === 0 && (
        <div className="border border-dashed border-primary/35 bg-[var(--bg-1)]/50 px-6 py-12 text-center">
          <p className="font-display text-4xl tracking-[0.08em] text-primary">FLOOR IS OPEN</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            Pin a ticker. Open a bout. Get matched on earnings night.
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            0 open · 0 locked · 0 settling
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="arena" size="xl">
              <Link href="/launch">Enter a coin</Link>
            </Button>
            <Button asChild variant="arenaGhost" size="xl">
              <Link href="/feed">Watch KOs</Link>
            </Button>
          </div>
        </div>
      )}

      {total > 0 && (
        <div className="grid gap-2">
          {board.map((d) => (
            <DuelCard key={d.id} duel={d} />
          ))}
        </div>
      )}
    </section>
  );
}
