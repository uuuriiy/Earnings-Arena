import { ChallengePanel } from "@/features/duel/components/ChallengePanel";

export function DuelActionRail({
  duelId,
  sideACoinId,
  status,
  hasSideB,
}: {
  duelId: string;
  sideACoinId: string;
  status: string;
  hasSideB: boolean;
}) {
  return (
    <section className="mt-6 border border-border bg-[var(--bg-2)]/40 p-4 sm:p-5">
      <h2 className="font-display text-2xl tracking-[0.06em]">ACTIONS</h2>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        Challenge with your coin or lock the bout when you are side A.
      </p>
      <ChallengePanel
        duelId={duelId}
        sideACoinId={sideACoinId}
        canChallenge={status === "open" && !hasSideB}
        canAccept={status === "open" && hasSideB}
      />
      {status !== "open" && (
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          This bout is past open matching — watch the clock and KO feed.
        </p>
      )}
    </section>
  );
}
