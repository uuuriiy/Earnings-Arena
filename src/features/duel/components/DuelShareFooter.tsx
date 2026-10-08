import Link from "next/link";
import { CopyDuelLink } from "@/features/duel/components/CopyDuelLink";
import { Button } from "@/shared/ui/button";

export function DuelShareFooter({ duelId }: { duelId: string }) {
  return (
    <footer className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="max-w-md font-mono text-xs text-muted-foreground">
        Winner = larger absolute % move from report → T+4h. Tie within 0.1% splits the pot.
        Missing quotes void and refund.
      </p>
      <div className="flex flex-wrap gap-2">
        <CopyDuelLink duelId={duelId} />
        <Button asChild variant="ghost" size="sm">
          <Link href="/">Bouts</Link>
        </Button>
      </div>
    </footer>
  );
}
